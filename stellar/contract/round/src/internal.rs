use soroban_sdk::{
    self, contract, contractimpl, panic_with_error, token::TokenClient, Address, BytesN, Env, Map, String, Vec
};

use crate::{
    admin_writer::{read_admins, write_admins}, application_writer::{
        find_applications, get_application_by_applicant, read_application, update_application,
        write_application,
    }, approval_writer::{is_project_approved, read_approved_projects, read_flagged_projects, write_approved_projects, write_flagged_projects}, calculation::calculate_voting_results, config_writer::{read_config, write_config}, core::IsRound, data_type::{
        ApplicationStatus, Config, CreateRoundParams, Deposit, FlagDetail, Pair, Payout, PayoutInput, PayoutsChallenge, PickResult, PickedPair, ProjectVotingResult, RoundApplication, RoundDetail, UpdateRoundParams, VotingResult
        // ApplicationStatus, Config, CreateRoundParams, Deposit, Pair, Payout, PayoutInput, PayoutsChallenge, PickResult, PickedPair, ProjectVotingResult, RoundApplication, RoundDetail, UpdateRoundParams, VotingResult
    }, deposit_writer::{
        increment_deposit_id, read_deposit, read_deposit_from_round, write_deposit,
        write_deposit_id_to_round,
    }, error::{ApplicationError, Error, RoundError, VoteError}, events::{
        log_create_app, log_create_deposit, log_create_payout, log_create_round, log_create_vote, log_delete_app, log_update_admin, log_update_app, log_update_approved_projects, log_update_payout, log_update_round, log_update_user_flag
    }, external::{ListsClient, ProjectRegistryClient, RegistrationStatus}, factory::RoundCreator, pair::{get_all_pairs, get_all_rounds, get_pair_by_index, get_random_pairs}, payout_writer::{
        add_payout_id_to_project_payout_ids, clear_payouts, clear_project_payout_ids, has_paid, increment_payout_id, read_payout_challenge, read_payout_challenges, read_payout_info, read_payouts, read_project_payout_ids_for_project, remove_payout_challenge, remove_payout_info, write_payout_challenge, write_payout_challenges, write_payout_info, write_payouts
    }, round_writer::{increment_round_number, is_initialized, read_round_info, write_round_info}, storage::{clear_round, extend_instance, extend_round}, utils::{calculate_protocol_fee, count_total_available_pairs, get_ledger_second_as_millis}, validation::{
        validate_application_period, validate_application_whitelist, validate_approved_projects, validate_blacklist, validate_can_payout, validate_has_voted, validate_max_participant, validate_max_participants, validate_not_blacklist, validate_number_of_votes, validate_owner_or_admin, validate_pick_per_votes, validate_project_to_approve, validate_review_notes, validate_round_detail, validate_round_detail_update, validate_specify_applicant, validate_vault_fund, validate_voting_not_started, validate_voting_period, validate_voting_whitelist
    }, voter_writer::{
        add_to_blacklist, add_voted_round, get_voted_rounds_for_voter, is_blacklisted, read_all_blacklist, remove_from_blacklist
    }, voting_writer::{
        find_voting_result, get_voting_state, get_voting_state_done, read_voting_count, read_voting_results, read_voting_state, set_voting_state, write_voting_count, write_voting_results
    }
};

const MAX_PROTOCOL_FEE_BASIS_POINTS: u32 = 1_000; // 10% max protocol fee
const MAX_REFERRER_FEE_BASIS_POINTS: u32 = 500; // 5% max referrer fee

#[contract]
pub struct RoundContract;

const MAX_REFERRER_FEE_BASIS_POINTS: u32 = 500;

#[contractimpl]
impl RoundCreator for RoundContract {
    fn initialize(
        env: &Env,
        caller: Address,
        token_address: Address,
        registry_address: Address,
        list_address: Address,
        voting_wl_list_id: Option<u128>, // list for whitelisted/eligible voted
        application_wl_list_id: Option<u128>, // list for whitelisted/eligible projects
        protocol_fee_basis_points: Option<u32>,
        protocol_fee_recipient: Option<Address>,
        default_page_size: Option<u64>,
    ) {
        caller.require_auth();

        if is_initialized(env){
            panic_with_error!(env, Error::AlreadyInitialized);
        }

        if voting_wl_list_id.is_some() {
            let list_client = ListsClient::new(env, &list_address);
            let valid_list = list_client.get_list(&voting_wl_list_id.unwrap());
            assert!(valid_list.id == voting_wl_list_id.unwrap(), "Invalid voting whitelist list id");
        }

        if application_wl_list_id.is_some() {
            let list_client = ListsClient::new(env, &list_address);
            let valid_list = list_client.get_list(&application_wl_list_id.unwrap());
            assert!(valid_list.id == application_wl_list_id.unwrap(), "Invalid application whitelist list id");
        }
        
        // Validate protocol fee
        if let Some(fee) = protocol_fee_basis_points {
            if fee > MAX_PROTOCOL_FEE_BASIS_POINTS {
                panic_with_error!(env, Error::ProtocolFeeTooHigh);
            }
        }

        let config = Config {
            owner: caller.clone(),
            pending_owner: None,
            protocol_fee_basis_points: protocol_fee_basis_points.unwrap_or(0),
            protocol_fee_recipient: protocol_fee_recipient.unwrap_or(caller),
            default_page_size: default_page_size.unwrap_or(10),
            token_contract: token_address,
            project_contract: registry_address,
            list_contract: list_address,
            voting_wl_list_id,
            application_wl_list_id,
        };

        write_config(env, &config);
    }

    fn create_round(env: &Env, caller: Address, round_detail: CreateRoundParams) -> RoundDetail {
        caller.require_auth();

        let round_init = is_initialized(env);

        if !round_init {
            panic_with_error!(env, Error::ContractNotInitialized);
        }

        validate_round_detail(env, &round_detail);

        // Validate referrer fee
        if let Some(fee) = round_detail.referrer_fee_basis_points {
            if fee > MAX_REFERRER_FEE_BASIS_POINTS {
                panic_with_error!(env, Error::ReferrerFeeTooHigh);
            }
        }

        let mut num_picks_per_voter = 2;

        if round_detail.num_picks_per_voter.is_some() {
            num_picks_per_voter = round_detail.num_picks_per_voter.unwrap();
            validate_pick_per_votes(env, num_picks_per_voter);
        }

        let round_id = increment_round_number(env);

        let round_info = RoundDetail {
            id: round_id,
            name: round_detail.name,
            description: round_detail.description,
            voting_start_ms: round_detail.voting_start_ms,
            voting_end_ms: round_detail.voting_end_ms,
            is_video_required: round_detail.is_video_required,
            contacts: round_detail.contacts,
            owner: round_detail.owner.clone(),
            application_start_ms: round_detail.application_start_ms,
            application_end_ms: round_detail.application_end_ms,
            expected_amount: round_detail.expected_amount,
            use_whitelist_voting: round_detail.use_whitelist_voting.unwrap_or(false),
            use_whitelist_application: round_detail.use_whitelist_application.unwrap_or(false),
            voting_wl_list_id: round_detail.voting_wl_list_id,
            application_wl_list_id: round_detail.application_wl_list_id,
            num_picks_per_voter,
            max_participants: round_detail.max_participants.unwrap_or(10),
            current_vault_balance: 0,
            vault_total_deposits: 0,
            allow_applications: round_detail.allow_applications,
            cooldown_period_ms: round_detail.cooldown_period_ms,
            cooldown_end_ms: None,
            compliance_req_desc: round_detail.compliance_req_desc,
            compliance_period_ms: round_detail.compliance_period_ms,
            compliance_end_ms: None,
            allow_remaining_dist: Some(round_detail.allow_remaining_dist),
            remaining_dist_address: round_detail.remaining_dist_address,
            remaining_dist_at_ms: None,
            remaining_dist_memo: String::from_str(env, ""),
            remaining_dist_by: round_detail.owner.clone(),
            referrer_fee_basis_points: round_detail.referrer_fee_basis_points,
            round_complete_ms: None,
            use_vault: round_detail.use_vault,
        };

        write_round_info(env, round_id, &round_info);
        write_admins(env, round_id, &round_detail.admins);
        extend_instance(env);
        log_create_round(env, round_info.clone());

        round_info.clone()
    }

    fn get_rounds(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail> {
        let results = get_all_rounds(env, from_index, limit);

        results
    }

    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>) {
        let config = read_config(env);

        config.owner.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance(env);
    }

    fn transfer_ownership(env: &Env, new_owner: Address) {
        let config = read_config(env);

        config.owner.require_auth();

        let mut updated_config = config.clone();
        updated_config.pending_owner = Some(new_owner);

        write_config(env, &updated_config);
        extend_instance(env);
    }

    fn accept_ownership(env: &Env) {
        let config = read_config(env);
        
        if config.pending_owner.is_none() {
            panic_with_error!(env, Error::NoPendingOwnershipTransfer);
        }

        let mut updated_config = config.clone();
        
        let pending_owner = config.pending_owner.unwrap();
        pending_owner.require_auth();
        
        
        updated_config.owner = pending_owner;
        updated_config.pending_owner = None;
        
        write_config(env, &updated_config);
        extend_instance(env);
    }

    fn cancel_ownership_transfer(env: &Env) {
        let config = read_config(env);
        
        config.owner.require_auth();
        
        if config.pending_owner.is_none() {
            panic_with_error!(env, Error::NoPendingOwnershipTransfer);
        }
        
        let mut updated_config = config.clone();
        updated_config.pending_owner = None;
        
        write_config(env, &updated_config);
        extend_instance(env);
    }

    fn get_config(env: &Env) -> Config {
        read_config(env)
    }

    fn owner_set_default_page_size(env: &Env, default_page_size: u64) {
        let config = read_config(env);

        config.owner.require_auth();

        let mut updated_config = config.clone();
        updated_config.default_page_size = default_page_size;

        write_config(env, &updated_config);
    }

    fn owner_set_protocol_fee_config(
        env: &Env,
        protocol_fee_recipient: Option<Address>,
        protocol_fee_basis_points: Option<u32>,
    ) {
        let config = read_config(env);

        config.owner.require_auth();

        let mut updated_config = config.clone();

        if let Some(fee) = protocol_fee_basis_points {
            if fee > MAX_PROTOCOL_FEE_BASIS_POINTS {
                panic_with_error!(env, Error::ProtocolFeeTooHigh);
            }
            updated_config.protocol_fee_basis_points = fee;
        }

        if protocol_fee_recipient.is_some() {
            updated_config.protocol_fee_recipient = protocol_fee_recipient.unwrap();
        }

        write_config(env, &updated_config);
    }

    fn change_voting_wl_list_id(env: &Env, list_id: u128){
        let config = read_config(env);

        config.owner.require_auth();

        let mut updated_config = config.clone();
        updated_config.voting_wl_list_id = Some(list_id);

        write_config(env, &updated_config);
    }

    fn change_application_wl_list_id(env: &Env, list_id: u128){
        let config = read_config(env);

        config.owner.require_auth();

        let mut updated_config = config.clone();
        updated_config.application_wl_list_id = Some(list_id);

        write_config(env, &updated_config);
    }
}

#[contractimpl]
impl IsRound for RoundContract {
    fn set_voting_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        start_ms: u64,
        end_ms: u64,
    ) {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        validate_owner_or_admin(env, &caller, &round);

        // Check if voting period is in the future
        if start_ms <= current_ms {
            panic_with_error!(env, RoundError::VotingStartInPast);
        }

        if start_ms >= end_ms {
            panic_with_error!(env, RoundError::VotingStartGreaterThanVotingEnd);
        }
        const MIN_VOTING_DURATION: u64 = 24 * 60 * 60 * 1000;
        if end_ms - start_ms < MIN_VOTING_DURATION {
            panic_with_error!(env, RoundError::VotingPeriodTooShort);
        }

        // Check compatibility with application period if it exists
        if round.allow_applications && round.application_end_ms.is_some() {
            let app_end = round.application_end_ms.unwrap();
            if start_ms < app_end {
                panic_with_error!(env, RoundError::VotingStartLessThanApplicationEnd);
            }
        }

        round.voting_start_ms = start_ms;
        round.voting_end_ms = end_ms;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());
    }

    fn set_expected_amount(env: &Env, round_id: u128, caller: Address, amount: u128) {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_voting_not_started(env, &round);

        validate_owner_or_admin(env, &caller, &round);


        round.expected_amount = amount;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());
    }

    fn set_admins(env: &Env, round_id: u128, round_admin: Vec<Address>) {
        let round = read_round_info(env, round_id);

        round.owner.require_auth();

        round_admin.iter().for_each(|admin| {
            if admin == round.owner {
                panic_with_error!(env, RoundError::OwnerCannotBeAdmin);
            }
        });

        write_admins(env, round_id, &round_admin);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_admin(env, round_id, round_admin);
    }

    fn apply_to_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
        note: Option<String>,
        review_note: Option<String>,
    ) -> RoundApplication {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);
        let is_owner_or_admin = round.is_caller_owner_or_admin(env, &caller);

        if is_owner_or_admin {
            validate_voting_not_started(env, &round);
        } else {
            validate_application_period(env, &round);
            
            validate_blacklist(env, round_id, &caller);
        }

        let applicant = if let Some(applicant) = applicant {
            validate_specify_applicant(env, is_owner_or_admin);
            applicant
        } else {
            caller
        };

        if round.use_whitelist_application {
            validate_application_whitelist(env, round_id, &applicant);
        }

        let project_contract = read_config(env).project_contract;
        let project_client = ProjectRegistryClient::new(env, &project_contract);
        let project = project_client.get_precheck(&applicant);

        if project.is_none() {
            panic_with_error!(env, ApplicationError::ProjectNotFoundInRegistry);
        }

        let uproject = project.unwrap();

        if round.is_video_required {
            if !uproject.has_video {
                panic_with_error!(env, ApplicationError::VideoUrlNotValid);
            }
        }

        let existing_application = get_application_by_applicant(env, round_id, &applicant);

        if existing_application.is_some() {
            panic_with_error!(env, ApplicationError::ProjectAlreadyApplied);
        }

        let mut review_note_internal = String::from_str(env, "");
        let mut applicant_note_internal = String::from_str(env, "");

        if review_note.is_some() {
            review_note_internal = review_note.unwrap();
        }

        if note.is_some() {
            applicant_note_internal = note.unwrap();
        }

        let mut applications = read_application(env, round_id);
        let application = RoundApplication {
            project_id: uproject.project_id,
            applicant_id: applicant,
            status: ApplicationStatus::Pending,
            submited_ms: current_ms,
            review_note: review_note_internal,
            applicant_note: applicant_note_internal,
            updated_ms: Some(current_ms),
        };

        applications.set(application.applicant_id.clone(), application.clone());
        write_application(env, round_id, &applications);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_app(env, round_id, application.clone());

        application.clone()
    }

    fn review_application(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Address,
        status: ApplicationStatus,
        note: Option<String>,
    ) -> RoundApplication {
        caller.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);
        validate_voting_not_started(env, &round);

        let application = get_application_by_applicant(env, round_id, &applicant);

        if application.is_none() {
            panic_with_error!(env, ApplicationError::ApplicationNotFound);
        }

        let mut updated_application = application.unwrap();
        let status_changing = updated_application.status != status;
        if status_changing {
            updated_application.status = status;
        }
        

        if note.is_some() {
            let review_note = note.unwrap();
            validate_review_notes(env, &review_note);

            updated_application.review_note = review_note;
        }

        updated_application.updated_ms = Some(get_ledger_second_as_millis(env));

        let mut approved_projects = read_approved_projects(env, round_id);
        let is_already_approved = is_project_approved(env, round_id, updated_application.project_id);
        
        if status_changing {
            if updated_application.status == ApplicationStatus::Approved {
                
                if !is_already_approved {
                    validate_max_participant(env, &round);
                    approved_projects.push_back(updated_application.project_id);
                }
    
            } else {
    
                if is_already_approved {
                    let index = approved_projects
                        .first_index_of(updated_application.project_id)
                        .unwrap();
                    approved_projects.remove(index);
                }
            }
        }

        update_application(env, round_id, &updated_application);
        write_approved_projects(env, round_id, &approved_projects);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_app(env, round_id, updated_application.clone(), caller);

        updated_application.clone()
    }

    fn deposit_to_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        amount: u128,
        memo: Option<String>,
        referrer_id: Option<Address>,
    ) {
        caller.require_auth();

        let round = read_round_info(env, round_id);

        if round.use_vault.is_none() {
            panic_with_error!(env, RoundError::RoundDoesNotUseVault);
        }else{
            if !round.use_vault.unwrap() {
                panic_with_error!(env, RoundError::RoundDoesNotUseVault);
            }
        }

        let config = read_config(env);
        let token_client = TokenClient::new(env, &config.token_contract);

        let balance = token_client.balance(&caller);
        let amount_i128: i128 = amount.try_into().expect("Conversion failed");
        let internal_memo = memo.unwrap_or(String::from_str(env, ""));

        if balance < amount_i128 {
            panic_with_error!(env, Error::InsufficientBalance);
        }

        let protocol_fee = calculate_protocol_fee(env, amount).unwrap_or(0);

        let referrer_fee = if referrer_id.is_some() {
            round.calculate_referrer_fee(env, amount).unwrap_or(0)
        } else {
            0
        };

        let deposit_id = increment_deposit_id(env);

        let mut deposit = Deposit {
            deposit_id,
            round_id,
            depositor_id: caller.clone(),
            total_amount: amount_i128,
            protocol_fee: protocol_fee.try_into().unwrap(),
            referrer_fee: referrer_fee.try_into().unwrap(),
            net_amount: 0, // will be updated in a moment after storage has been calculated
            deposited_at: get_ledger_second_as_millis(env),
            memo: internal_memo,
        };

        deposit.net_amount = deposit.total_amount - deposit.protocol_fee - deposit.referrer_fee;

        token_client.transfer(
            &caller,
            &env.current_contract_address(),
            &deposit.total_amount,
        );

        let fee_address = config.protocol_fee_recipient;
        if deposit.protocol_fee > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &fee_address,
                &deposit.protocol_fee,
            );
        }

        if referrer_id.is_some() {
            if deposit.referrer_fee > 0 {
                let referrer = referrer_id.unwrap();
                token_client.transfer(
                    &env.current_contract_address(),
                    &referrer,
                    &deposit.referrer_fee,
                );
            }
        }

        let mut updated_round = round.clone();
        let net_amount_u128: u128 = deposit.net_amount.try_into().unwrap();

        updated_round.current_vault_balance += net_amount_u128;
        updated_round.vault_total_deposits += net_amount_u128;

        write_deposit(env, deposit_id, &deposit);
        write_deposit_id_to_round(env, round_id, deposit_id);
        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_deposit(env, round.id, &deposit);
    }

    fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>) {
        voter.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        validate_voting_period(env, &round);
        validate_number_of_votes(env, round.num_picks_per_voter, picks.len());

        if round.use_whitelist_voting {
            validate_voting_whitelist(env, round_id, &voter);
        }

        validate_blacklist(env, round_id, &voter);
        validate_has_voted(env, round_id, &voter);

        let mut picked_pairs: Vec<PickResult> = Vec::new(env);

        let projects = read_approved_projects(env, round_id);
        let total_available_pairs = count_total_available_pairs(projects.len());
        let projects = read_approved_projects(env, round_id);
        let mut voting_count = read_voting_count(env, round_id);
        let mut voting_results = read_voting_results(env, round_id);
  
        picks.iter().for_each(|picked_pair| {
            let picked_index = picked_pair.pair_id;

            if picked_index >= total_available_pairs {
                panic_with_error!(env, Error::IndexOutOfBound);
            }

            let pair = get_pair_by_index(env, total_available_pairs, picked_index, &projects);
            let is_project_in_pair = pair.projects.contains(picked_pair.voted_project_id);

            if !is_project_in_pair {
                panic_with_error!(env, VoteError::ProjectNotInPair);
            }

            let pick_result = PickResult {
                pair_id: picked_pair.pair_id,
                project_id: picked_pair.voted_project_id,
            };

            let count = voting_count.get(picked_pair.voted_project_id).unwrap_or(0);
            voting_count.set(picked_pair.voted_project_id, count + 1);
            picked_pairs.push_back(pick_result);
        });

        let voting_result = VotingResult {
            voter: voter.clone(),
            picks: picked_pairs,
            voted_ms: current_ms,
        };

        voting_results.push_back(voting_result.clone());

        write_voting_count(env, round_id, &voting_count);
        write_voting_results(env, round_id, &voting_results);
        set_voting_state(env, round_id, voter.clone(), voting_results.len()-1);
        add_voted_round(env, voter, round_id);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_vote(env, round.id, voting_result);
    }

    fn get_pairs_to_vote(env: &Env, round_id: u128) -> Vec<Pair> {
        let round = read_round_info(env, round_id);
        let pairs = get_random_pairs(env, round_id, round.num_picks_per_voter);
        pairs
    }

    fn flag_voters(env: &Env, round_id: u128, admin: Address, voters: Vec<Address>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &admin, &round);

        voters.iter().for_each(|voter| {
            validate_blacklist(env, round_id, &voter); // validate that user is not already blacklisted
            add_to_blacklist(env, round_id, voter.clone());
            log_update_user_flag(env, round.id, voter.clone(), true);
        });

        extend_instance(env);
        extend_round(env, round_id);
    }

    fn unflag_voters(env: &Env, round_id: u128, admin: Address, voters: Vec<Address>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        voters.iter().for_each(|voter| {
            validate_not_blacklist(env, round_id, &voter);
            remove_from_blacklist(env, round_id, voter.clone());
            log_update_user_flag(env, round.id, voter.clone(), false);
        });

        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_voting_results_for_round(env: &Env, round_id: u128) -> Vec<ProjectVotingResult> {
        let results = calculate_voting_results(env, round_id);

        results
    }

    fn process_payouts(env: &Env, round_id: u128, caller: Address) {
        caller.require_auth();

        let round = read_round_info(env, round_id);

        if round.use_vault.is_none() {
            panic_with_error!(env, RoundError::RoundDoesNotUseVault);
        } else {
            if !round.use_vault.unwrap() {
                panic_with_error!(env, RoundError::RoundDoesNotUseVault);
            }
        }

        validate_owner_or_admin(env, &caller, &round);
        validate_can_payout(env, &round);
        validate_vault_fund(env, &round);

        if round.round_complete_ms.is_some() {
            panic_with_error!(env, RoundError::AlreadyPaidOut);
        }

        round.assert_cooldown_period_complete(env);
        round.assert_all_payouts_challenges_resolved(env);

        let approved_projects = read_approved_projects(env, round_id);

        if approved_projects.is_empty() {
            panic_with_error!(env, RoundError::NoApprovedProjects);
        }

        let config = read_config(env);
        let token_contract = config.token_contract;
        let token_client = TokenClient::new(env, &token_contract);
        let list_contract = config.list_contract;
        let list_client = ListsClient::new(env, &list_contract);
        let project_contract = config.project_contract;
        let project_client = ProjectRegistryClient::new(env, &project_contract);

        let mut updated_round = round.clone();
        let mut total_amount_paid: i128 = 0;
        let round_payouts = read_payouts(env, round_id);

        approved_projects.iter().for_each(|project_id| {
            let project_payout_ids = read_project_payout_ids_for_project(env, round_id, project_id);

            project_payout_ids.iter().for_each(|payout_id| {
                let payout_exist_on_round = round_payouts.contains(payout_id);

                if !payout_exist_on_round {
                    return;
                }

                let mut payout = read_payout_info(env, payout_id).unwrap();

                if payout.paid_at_ms.is_some() {
                    return;
                }

                if round.compliance_period_ms.is_some() {
                    let project = project_client.get_precheck_by_id(&project_id);
                    
                    if project.is_none() {
                        payout.paid_at_ms = Some(get_ledger_second_as_millis(env));
                        write_payout_info(env, payout_id, &payout);
                        return;
                    }
                    
                    let project_owner = project.unwrap().applicant;
                    
                    // Check KYC on project owner instead of recipient
                    let is_kyc_passed = list_client.is_registered(
                        &config.voting_wl_list_id, 
                        &project_owner, 
                        &Some(RegistrationStatus::Approved)
                    );
                    
                    if !is_kyc_passed {
                        if round.compliance_end_ms.unwrap_or(0) < get_ledger_second_as_millis(env) {
                            payout.paid_at_ms = Some(get_ledger_second_as_millis(env));
                            write_payout_info(env, payout_id, &payout);
                        }
                        return;
                    }
                }

                token_client.transfer(
                    &env.current_contract_address(),
                    &payout.recipient_id,
                    &payout.amount,
                );

                payout.paid_at_ms = Some(get_ledger_second_as_millis(env));
                payout.paid_amount = payout.amount;

                let payout_amount_u128: u128 = payout.amount.try_into().unwrap();
                updated_round.current_vault_balance -= payout_amount_u128;
                total_amount_paid += payout.amount;
                write_payout_info(env, payout_id, &payout);
                log_update_payout(env, round.id, &payout);
            });
        });

        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_votes_for_round(
        env: &Env,
        round_id: u128,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<VotingResult> {
        let results = find_voting_result(env, round_id, skip, limit);

        results
    }

    fn can_vote(env: &Env, round_id: u128, voter: Address) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        if round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms {
            let is_blacklisted = is_blacklisted(env, round_id, voter.clone());
            if is_blacklisted {
                return false;
            }
            if round.use_whitelist_voting {
                if round.voting_wl_list_id.is_none() {
                    return false;
                }
                let list_id = round.voting_wl_list_id.unwrap();
                let list_contract = read_config(env).list_contract;
                let list_client = ListsClient::new(env, &list_contract);
                let is_whitelisted = list_client.is_registered(&Some(list_id), &voter, &Some(RegistrationStatus::Approved));
                return is_whitelisted;
            }

            return true;
        }

        false
    }

    fn get_round(env: &Env, round_id: u128) -> RoundDetail {
        let round = read_round_info(env, round_id);

        round.clone()
    }

    fn is_voting_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms
    }

    fn is_application_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        round.application_start_ms.unwrap() <= current_ms
            && current_ms <= round.application_end_ms.unwrap()
    }

    fn get_applications_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundApplication> {
        let applications = find_applications(env, round_id, from_index, limit);

        applications
    }

    fn get_application(env: &Env, round_id: u128, applicant: Address) -> RoundApplication {
        let application = get_application_by_applicant(env, round_id, &applicant);

        if application.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        application.unwrap()
    }

    fn is_payout_done(env: &Env, round_id: u128) -> bool {
        has_paid(env, round_id)
    }

    fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool {
        let state = get_voting_state_done(env, round_id, voter);

        state
    }

    fn add_approved_project(env: &Env, round_id: u128, admin: Address, project_ids: Vec<u128>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_voting_not_started(env, &round);

        validate_owner_or_admin(env, &admin, &round);
        validate_max_participants(env, &round, &project_ids);
        validate_project_to_approve(env, round_id, &project_ids);

        let mut approved_project = read_approved_projects(env, round_id);

        project_ids.iter().for_each(|project_id| {
            approved_project.push_back(project_id.clone());
        });

        write_approved_projects(env, round_id, &approved_project);
        log_update_approved_projects(env, round.id, approved_project);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn remove_approved_project(env: &Env, round_id: u128, admin: Address, project_ids: Vec<u128>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_voting_not_started(env, &round);

        validate_owner_or_admin(env, &admin, &round);

        project_ids.iter().for_each(|project_id| {
            validate_approved_projects(env, round_id, project_id);
        });

        let mut approved_project = read_approved_projects(env, round_id);
        project_ids.iter().for_each(|project_id| {
            let index = approved_project.first_index_of(project_id).unwrap();
            approved_project.remove(index);
        });

        write_approved_projects(env, round_id, &approved_project);
        log_update_approved_projects(env, round.id, approved_project);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool {
        let round = read_round_info(env, round_id);
        let list_id = round.voting_wl_list_id.unwrap();
        let list_contract = read_config(env).list_contract;
        let list_client = ListsClient::new(env, &list_contract);
        let is_whitelisted = list_client.is_registered(&Some(list_id), &address, &Some(RegistrationStatus::Approved));
      
        is_whitelisted
    }

    fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool {
        is_blacklisted(env, round_id, address)
    }

    fn get_all_pairs_for_round(env: &Env, round_id: u128) -> Vec<Pair> {
        let pairs = get_all_pairs(env, round_id);

        pairs
    }

    fn get_pair_by_index(env: &Env, round_id: u128, index: u32) -> Pair {
        let approved_project = read_approved_projects(env, round_id);
        let total_available_pairs = count_total_available_pairs(approved_project.len());
        let pair = get_pair_by_index(env, total_available_pairs, index, &approved_project);

        pair
    }

    fn set_number_of_votes(env: &Env, round_id: u128, admin: Address, num_picks_per_voter: u32) {
        admin.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &admin, &round);

        validate_pick_per_votes(env, num_picks_per_voter);

        let states = read_voting_state(env, round_id);
        let votes = states.len();
        if votes > 0 {
            panic_with_error!(env, RoundError::VotesAlreadyCast);
        }

        // Validate against number of possible pairs
        let approved_projects = read_approved_projects(env, round_id);
        let total_available_pairs = count_total_available_pairs(approved_projects.len());
        if num_picks_per_voter > total_available_pairs {
            panic_with_error!(env, VoteError::TooManyVotesForAvailablePairs);
        }

        round.num_picks_per_voter = num_picks_per_voter;

        write_round_info(env, round_id, &round);
        log_update_round(env, round.clone());
        extend_round(env, round_id);
        extend_instance(env);
    }

    fn transfer_round_ownership(env: &Env, round_id: u128, new_owner: Address) {
        let mut round = read_round_info(env, round_id);

        if round.owner == new_owner {
            panic_with_error!(env, Error::SameOwner);
        }

        round.owner.require_auth();

        round.owner = new_owner;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn admins(env: &Env, round_id: u128) -> Vec<Address> {
        let admins = read_admins(env, round_id);
        admins
    }

    fn unapply_from_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
    ) -> RoundApplication {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        let is_owner_or_admin = round.is_caller_owner_or_admin(env, &caller);

        let applicant = if let Some(applicant) = applicant {
            validate_specify_applicant(env, is_owner_or_admin);
            applicant
        } else {
            caller
        };

        validate_voting_not_started(env, &round);

        let mut applications = read_application(env, round_id);
        let application = get_application_by_applicant(env, round_id, &applicant);

        if application.is_none() {
            panic_with_error!(env, ApplicationError::ApplicationNotFound);
        }

        let application_internal = application.unwrap();

        applications.remove(applicant);
        write_application(env, round_id, &applications);
        extend_round(env, round_id);
        extend_instance(env);
        log_delete_app(env, round_id, application_internal.clone());

        application_internal.clone()
    }

    fn update_applicant_note(
        env: &Env,
        round_id: u128,
        caller: Address,
        note: String,
    ) -> RoundApplication {
        caller.require_auth();

        let applicant = &caller;
        let application = get_application_by_applicant(env, round_id, applicant);

        if application.is_none() {
            panic_with_error!(env, ApplicationError::ApplicationNotFound);
        }

        let mut applications = read_application(env, round_id);
        let mut application_internal = application.unwrap();
        application_internal.applicant_note = note;

        applications.set(applicant.clone(), application_internal.clone());
        write_application(env, round_id, &applications);
        extend_round(env, round_id);
        extend_instance(env);
        log_update_app(env, round_id, application_internal.clone(), caller);

        application_internal.clone()
    }

    fn set_applications_config(
        env: &Env,
        round_id: u128,
        caller: Address,
        allow_applications: bool,
        start_ms: Option<u64>,
        end_ms: Option<u64>,
    ) -> RoundDetail {
        caller.require_auth();

        if allow_applications && (start_ms.is_none() || end_ms.is_none()) {
            panic_with_error!(env, RoundError::ApplicationPeriodMustBeSet);
        }

        if start_ms.is_some() && end_ms.is_some() {
            if start_ms.unwrap() >= end_ms.unwrap() {
                panic_with_error!(env, RoundError::ApplicationStartGreaterThanApplicationEnd);
            }
        }

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        if !allow_applications && (start_ms.is_some() || end_ms.is_some()) {
            round.application_start_ms = None;
            round.application_end_ms = None;
        } else {
            round.application_start_ms = start_ms;
            round.application_end_ms = end_ms;
        }

        round.allow_applications = allow_applications;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());

        round.clone()
    }

    fn update_round(
        env: &Env,
        caller: Address,
        round_id: u128,
        round_detail: UpdateRoundParams,
    ) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_voting_not_started(env, &round);

        validate_owner_or_admin(env, &caller, &round);
        validate_round_detail_update(env, &round_detail);

        // Validate referrer fee if present and set
        if let Some(fee) = round_detail.referrer_fee_basis_points {
            if fee > MAX_REFERRER_FEE_BASIS_POINTS {
                panic_with_error!(env, Error::ReferrerFeeTooHigh);
            }
            round.referrer_fee_basis_points = Some(fee);
        }

        round.name = round_detail.name;
        round.description = round_detail.description;
        round.contacts = round_detail.contacts;
        round.is_video_required = round_detail.is_video_required;
        
        round.voting_start_ms = round_detail.voting_start_ms;
        round.voting_end_ms = round_detail.voting_end_ms;
        round.application_start_ms = round_detail.application_start_ms;
        round.application_end_ms = round_detail.application_end_ms;

        if let Some(use_vault) = round_detail.use_vault {
            // Only allow updating use_vault if no deposits have been made
            if round.vault_total_deposits > 0 {
                panic_with_error!(env, RoundError::CannotUpdateVaultAfterDeposits);
            }
            round.use_vault = Some(use_vault);
        }

        if let Some(max_participants) = round_detail.max_participants {
            round.max_participants = max_participants;
        }

        if let Some(num_picks) = round_detail.num_picks_per_voter {
            validate_pick_per_votes(env, num_picks);
            round.num_picks_per_voter = num_picks;
        }

        if let Some(use_whitelist) = round_detail.use_whitelist_voting {
            round.use_whitelist_voting = use_whitelist;
        }

        if let Some(voting_wl_list_id) = round_detail.voting_wl_list_id {
            let list_client = ListsClient::new(env, &read_config(env).list_contract);
            let valid_list = list_client.get_list(&voting_wl_list_id);
            assert!(valid_list.id == voting_wl_list_id, "Invalid voting whitelist list id");
            round.voting_wl_list_id = Some(voting_wl_list_id);
        }

        if let Some(application_wl_list_id) = round_detail.application_wl_list_id {
            let list_client = ListsClient::new(env, &read_config(env).list_contract);
            let valid_list = list_client.get_list(&application_wl_list_id);
            assert!(valid_list.id == application_wl_list_id, "Invalid application whitelist list id");
            round.application_wl_list_id = Some(application_wl_list_id);
        }

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());

        round
    }

    fn delete_round(env: &Env, round_id: u128) -> RoundDetail {
        let round = read_round_info(env, round_id);
        round.owner.require_auth();

        if round.current_vault_balance > 0 {
            panic_with_error!(env, RoundError::BalanceNotEmpty);
        }

        clear_round(env, round_id);
        round.clone()
    }

    fn apply_to_round_batch(
        env: &Env,
        caller: Address,
        round_id: u128,
        review_notes: Vec<Option<String>>,
        applicants: Vec<Address>,
    ) -> Vec<RoundApplication> {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        validate_owner_or_admin(env, &caller, &round);
        validate_voting_not_started(env, &round);

        let project_contract = read_config(env).project_contract;
        let project_client = ProjectRegistryClient::new(env, &project_contract);
        let mut applications: Vec<RoundApplication> = Vec::new(env);

        let mut index = 0;

        let mut internal_applications = read_application(env, round_id);
        applicants.iter().for_each(|applicant| {
            validate_blacklist(env, round_id, &applicant);

            if round.use_whitelist_application {
                validate_application_whitelist(env, round_id, &applicant);
            }

            let project = project_client.get_precheck(&applicant);
            
            if project.is_none() {
                panic_with_error!(env, ApplicationError::ProjectNotFoundInRegistry);
            }
            
            let uproject = project.unwrap();

            if round.is_video_required {
                if !uproject.has_video {
                    panic_with_error!(env, ApplicationError::VideoUrlNotValid);
                }
            }

            let existing_application = get_application_by_applicant(env, round_id, &applicant);

            if existing_application.is_some() {
                panic_with_error!(env, ApplicationError::ProjectAlreadyApplied);
            }

            let mut review_note_internal = String::from_str(env, "");
            let applicant_note_internal = String::from_str(env, "");

            if review_notes.get(index).is_some() {
                review_note_internal = review_notes.get(index).unwrap().unwrap();
            }

            let application = RoundApplication {
                project_id: uproject.project_id,
                applicant_id: applicant.clone(),
                status: ApplicationStatus::Pending,
                submited_ms: current_ms,
                review_note: review_note_internal,
                applicant_note: applicant_note_internal,
                updated_ms: Some(current_ms),
            };

            internal_applications.set(application.applicant_id.clone(), application.clone());
            applications.push_back(application.clone());
            index += 1;
        });

        write_application(env, round_id, &internal_applications);
        extend_instance(env);
        extend_round(env, round_id);

        applications
    }

    fn get_payouts_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Payout> {
        let default_page_size = read_config(env).default_page_size;
        let limit_internal: usize = limit
            .unwrap_or(default_page_size)
            .try_into()
            .expect("Conversion failed");
        let from_index_internal: usize = from_index
            .unwrap_or(0)
            .try_into()
            .expect("Conversion failed");
        let payouts = read_payouts(env, round_id);

        let mut payouts_external: Vec<Payout> = Vec::new(env);

        payouts
            .iter()
            .skip(from_index_internal)
            .take(limit_internal)
            .for_each(|payout_id| {
                let internal = read_payout_info(env, payout_id).unwrap();
                payouts_external.push_back(internal.clone());
            });

        payouts_external
    }

    fn set_payouts(
        env: &Env,
        round_id: u128,
        caller: Address,
        payouts: Vec<PayoutInput>,
        clear_existing: bool,
    ) -> Vec<Payout> {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        let approved_project = read_approved_projects(env, round_id);

        if clear_existing {
            clear_payouts(env, round_id);

            approved_project.iter().for_each(|project_id| {
                let payout_ids = read_project_payout_ids_for_project(env, round_id, project_id);

                payout_ids.iter().for_each(|payout_id| {
                    remove_payout_info(env, payout_id);
                });

                clear_project_payout_ids(env, round_id, project_id);
            });
        }

        let mut payouts_internal: Vec<u32> = read_payouts(env, round_id);
        let mut payouts_external: Vec<Payout> = Vec::new(env);

        let mut running_total: i128 = 0;
        let mut updated_round = round.clone();

        payouts.iter().for_each(|payout_input| {
            if round.cooldown_period_ms.is_some() {
                updated_round.cooldown_end_ms =
                    Some(get_ledger_second_as_millis(env) + round.cooldown_period_ms.unwrap());
            }

            if round.compliance_period_ms.is_some() {
                updated_round.compliance_end_ms =
                    Some(get_ledger_second_as_millis(env) + round.compliance_period_ms.unwrap());
            }

            let payout_id = increment_payout_id(env);
            let application =
                get_application_by_applicant(env, round_id, &payout_input.recipient_id);

            if application.is_none() {
                panic_with_error!(env, ApplicationError::ApplicationNotFound);
            }

            let project_id = application.unwrap().project_id;

            if !approved_project.contains(project_id) {
                panic_with_error!(env, ApplicationError::ProjectNotApproved);
            }

            let payout = Payout {
                round_id,
                id: payout_id,
                amount: payout_input.amount,
                paid_amount: 0,
                recipient_id: payout_input.recipient_id,
                paid_at_ms: None,
                memo: payout_input.memo,
            };

            write_payout_info(env, payout_id, &payout);
            log_create_payout(env, round.id, &payout);
            payouts_internal.push_back(payout_id);
            add_payout_id_to_project_payout_ids(env, round_id, project_id, payout_id);
            payouts_external.push_back(payout.clone());

            running_total += payout_input.amount;
        });

        let vault_balance: i128 = round
            .current_vault_balance
            .try_into()
            .expect("Conversion failed");

        if running_total > vault_balance {
            panic_with_error!(env, RoundError::InsufficientFunds);
        }

        write_payouts(env, round_id, &payouts_internal);
        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);

        payouts_external
    }

    fn set_round_complete(env: &Env, round_id: u128, caller: Address) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        if round.round_complete_ms.is_some() { // check if round has not being set to "complete"
            panic_with_error!(env, RoundError::RoundAlreadyCompleted);
        }

        round.round_complete_ms = Some(get_ledger_second_as_millis(env));

        write_round_info(env, round_id, &round);
        log_update_round(env, round.clone());
        extend_instance(env);
        extend_round(env, round_id);

        round.clone()
    }

    fn challenge_payouts(
        env: &Env,
        round_id: u128,
        caller: Address,
        reason: String,
    ) -> PayoutsChallenge {
        caller.require_auth();
        
        let round = read_round_info(env, round_id);
        round.assert_cooldown_period_in_process(env);

        let application = get_application_by_applicant(env, round_id, &caller);
        if application.is_none() {
            panic_with_error!(env, RoundError::NotProjectParticipant);
        }

        // Verify caller is an approved applicant
        let application = application.unwrap();
        if application.status != ApplicationStatus::Approved {
            panic_with_error!(env, RoundError::NotApprovedParticipant);
        }

        let challenger_id = caller.clone();

        let challenges = PayoutsChallenge {
            round_id,
            challenger_id: challenger_id.clone(),
            admin_notes: String::from_str(env, ""),
            reason,
            resolved: false,
            resolved_by: String::from_str(env, ""),
            created_at: get_ledger_second_as_millis(env),
        };

        write_payout_challenge(env, round_id, &challenger_id, &challenges);
        extend_instance(env);
        extend_round(env, round_id);

        challenges.clone()
    }

    fn remove_payouts_challenge(env: &Env, round_id: u128, caller: Address) {
        caller.require_auth();

        let challenger_id = caller.clone();

        remove_payout_challenge(env, round_id, &challenger_id);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn update_payouts_challenge(
        env: &Env,
        round_id: u128,
        caller: Address,
        challenger_id: Address,
        notes: Option<String>,
        resolve_challenge: Option<bool>,
    ) -> PayoutsChallenge {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        let challenge = read_payout_challenge(env, round_id, &challenger_id);

        if challenge.is_none() {
            panic_with_error!(env, RoundError::ChallengeNotFound);
        }

        let mut challenge_internal = challenge.unwrap();
        let internal_notes = notes.unwrap_or(String::from_str(env, ""));
        if resolve_challenge.is_some() {
            challenge_internal.resolved = resolve_challenge.unwrap();
            challenge_internal.resolved_by = caller.to_string();
        }

        challenge_internal.admin_notes = internal_notes;

        write_payout_challenge(env, round_id, &challenger_id, &challenge_internal);
        extend_instance(env);
        extend_round(env, round_id);
        challenge_internal.clone()
    }

    fn remove_resolved_challenges(env: &Env, round_id: u128, caller: Address) {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        let challenges = read_payout_challenges(env, round_id);
        let mut challenges_internal: Map<Address, PayoutsChallenge> = Map::new(env);

        challenges.keys().iter().for_each(|challenger_id| {
            let challenge = challenges.get(challenger_id.clone()).unwrap();

            if !challenge.resolved {
                challenges_internal.set(challenger_id, challenge);
            }
        });

        write_payout_challenges(env, round_id, &challenges_internal);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_payouts(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<Payout> {
        let default_page_size = read_config(env).default_page_size;
        let limit_internal: u64 = limit.unwrap_or(default_page_size);
        let from_index_internal: u64 = from_index.unwrap_or(0);

        let mut payouts_external: Vec<Payout> = Vec::new(env);

        for i in from_index_internal..limit_internal {
            let payout = read_payout_info(env, i as u32);

            if payout.is_none() {
                break;
            }
          
            payouts_external.push_back(payout.unwrap().clone());
        }

        payouts_external
    }

    fn get_payout(env: &Env, payout_id: u32) -> Payout {
        let payout = read_payout_info(env, payout_id);

        if payout.is_none() {
            panic_with_error!(env, RoundError::PayoutNotFound);
        }

        payout.unwrap().clone()
    }

    fn redistribute_vault(env: &Env, round_id: u128, caller: Address, memo: Option<String>) {
        caller.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        if round.current_vault_balance == 0 {
            panic_with_error!(env, RoundError::InsufficientFunds);
        }

        if round.allow_remaining_dist.is_some() && !round.allow_remaining_dist.unwrap() {
            panic_with_error!(env, RoundError::RedistributionNotAllowed);
        }

        if round.remaining_dist_at_ms.is_some() {
            panic_with_error!(env, RoundError::RedistributionAlreadyDone);
        }

        let current_ms = get_ledger_second_as_millis(env);
        if current_ms <= round.voting_end_ms {
            panic_with_error!(env, VoteError::VotingPeriodNotEnded);
        }

        round.assert_cooldown_period_complete(env);
        round.assert_compliance_period_complete(env);
        round.assert_all_payouts_challenges_resolved(env);

        let mut updated_round = round.clone();
        let amount: i128 = round
            .current_vault_balance
            .try_into()
            .expect("Conversion failed");
        let redistribute_to = round.remaining_dist_address;

        let token_contract = read_config(env).token_contract;
        let token_client = TokenClient::new(env, &token_contract);

        token_client.transfer(&env.current_contract_address(), &redistribute_to, &amount);

        updated_round.remaining_dist_at_ms = Some(get_ledger_second_as_millis(env));
        updated_round.current_vault_balance = 0;
        updated_round.remaining_dist_by = caller.clone();

        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_deposits_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Deposit> {
        let default_page_size = read_config(env).default_page_size;
        let limit_internal: u64 = limit.unwrap_or(default_page_size);
        let from_index_internal: u64 = from_index.unwrap_or(0);
        let deposits = read_deposit_from_round(env, round_id);

        let mut deposits_external: Vec<Deposit> = Vec::new(env);

        deposits
            .iter()
            .skip(from_index_internal as usize)
            .take(limit_internal as usize)
            .for_each(|deposit_id| {
                let internal = read_deposit(env, deposit_id).unwrap();
                deposits_external.push_back(internal.clone());
            });

        deposits_external
    }

    fn set_cooldown_config(
        env: &Env,
        round_id: u128,
        caller: Address,
        cooldown_period_ms: Option<u64>,
    ) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);
        validate_voting_not_started(env, &round);

        round.cooldown_period_ms = cooldown_period_ms;
        log_update_round(env, round.clone());
        write_round_info(env, round_id, &round);
        
        extend_instance(env);
        extend_round(env, round_id);

        round.clone()
    }

    fn set_compliance_config(
        env: &Env,
        round_id: u128,
        caller: Address,
        compliance_req_desc: Option<String>,
        compliance_period_ms: Option<u64>,
    ) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);
        validate_voting_not_started(env, &round);

        round.compliance_req_desc = compliance_req_desc.unwrap_or(String::from_str(env, ""));
        round.compliance_period_ms = compliance_period_ms;

        write_round_info(env, round_id, &round);
        log_update_round(env, round.clone());
        extend_instance(env);
        extend_round(env, round_id);

        round.clone()
    }

    fn blacklisted_voters(env: &Env, round_id: u128) -> Vec<Address> {
        let blacklisted_voters = read_all_blacklist(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        let mut result: Vec<Address> = Vec::new(env);
        blacklisted_voters.keys().iter().for_each(|voter| {
            result.push_back(voter.clone());
        });

        result
    }

    fn set_redistribution_config(env: &Env, round_id: u128, caller: Address, allow_remaining_dist: bool, remaining_dist_address: Option<Address>) -> RoundDetail{
      caller.require_auth();

      let mut round = read_round_info(env, round_id);
      validate_owner_or_admin(env, &caller, &round);

      round.allow_remaining_dist = Some(allow_remaining_dist);
      round.remaining_dist_address = remaining_dist_address.unwrap_or(round.clone().owner);

      write_round_info(env, round_id, &round);
      log_update_round(env, round.clone());
      extend_instance(env);

      round.clone()
    }

    fn get_my_vote_for_round(env: &Env, round_id: u128, voter: Address) -> VotingResult{
      let voting_results = read_voting_results(env, round_id);
      let index = get_voting_state(env, round_id, voter);

      if index.is_none() {
        panic_with_error!(env, Error::DataNotFound);
      }

      let result = voting_results.get(index.unwrap());

      if result.is_none() {
        panic_with_error!(env, Error::DataNotFound);
      }

      result.unwrap()
    }

    fn get_voted_rounds(env: &Env, voter: Address, from_index: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail>{
      let default_page_size = read_config(env).default_page_size;
      let limit_internal: u64 = limit.unwrap_or(default_page_size);
      let from_index_internal: u64 = from_index.unwrap_or(0);
      let rounds = get_voted_rounds_for_voter(env, voter);
      let mut rounds_external: Vec<RoundDetail> = Vec::new(env);

      rounds
        .iter()
        .skip(from_index_internal as usize)
        .take(limit_internal as usize)
        .for_each(|round_id| {
          let round = read_round_info(env, round_id);
          rounds_external.push_back(round.clone());
        });

      rounds_external
    }

    fn get_challenges_payout(env: &Env, round_id: u128, from_index: Option<u64>, limit: Option<u64>) -> Vec<PayoutsChallenge>{
      let default_page_size = read_config(env).default_page_size;
      let limit_internal: u64 = limit.unwrap_or(default_page_size);
      let from_index_internal: u64 = from_index.unwrap_or(0);
      let challenges = read_payout_challenges(env, round_id);

      let mut challenges_external: Vec<PayoutsChallenge> = Vec::new(env);

      challenges
        .keys()
        .iter()
        .skip(from_index_internal as usize)
        .take(limit_internal as usize)
        .for_each(|challenger_id| {
          let challenge = challenges.get(challenger_id.clone()).unwrap();
          challenges_external.push_back(challenge.clone());
        });

      challenges_external
    }


    fn flag_project(env: &Env, round_id: u128, caller: Address, project_id: u128, reason: String)->FlagDetail{
      caller.require_auth();

      let round = read_round_info(env, round_id);
      validate_owner_or_admin(env, &caller, &round);
      let mut flagged_projects = read_flagged_projects(env, round_id);

      let project_contract = read_config(env).project_contract;
      let project_client = ProjectRegistryClient::new(env, &project_contract);
      let project = project_client.get_precheck_by_id(&project_id);

      if project.is_none() {
        panic_with_error!(env, Error::DataNotFound);
      }

      let uproject = project.unwrap();

      let flag = FlagDetail{
        project_id: uproject.project_id,
        applicant_id: uproject.applicant,
        reason,
        flagged_by: caller.clone(),
        flagged_ms: get_ledger_second_as_millis(env),
      };

      flagged_projects.set(project_id, flag.clone());

      write_flagged_projects(env, round_id, &flagged_projects);
      extend_instance(env);
      extend_round(env, round_id);

      flag
    }

    fn unflag_project(env: &Env, round_id: u128, caller: Address, project_id: u128){
      caller.require_auth();

      let round = read_round_info(env, round_id);
      validate_owner_or_admin(env, &caller, &round);
      let mut flagged_projects = read_flagged_projects(env, round_id);

      if !flagged_projects.contains_key(project_id) {
        panic_with_error!(env, Error::DataNotFound);
      }

      flagged_projects.remove(project_id);

      write_flagged_projects(env, round_id, &flagged_projects);
      extend_instance(env);
      extend_round(env, round_id);
    }

    fn get_approved_projects(env: &Env, round_id: u128) -> Vec<u128>{
      let approved_projects = read_approved_projects(env, round_id);
      approved_projects
    }
}
