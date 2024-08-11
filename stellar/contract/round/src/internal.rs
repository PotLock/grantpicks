use core::fmt::write;

use soroban_sdk::{
    self, contract, contractimpl, panic_with_error, token::TokenClient, Address, BytesN, Env, Map,
    String, Vec,
};

use crate::{
    admin_writer::{read_admins, remove_all_admins, write_admins},
    application_writer::{
        find_applications, get_application_by_applicant, read_application, update_application,
        write_application,
    },
    approval_writer::{is_project_approved, read_approved_projects, write_approved_projects},
    calculation::calculate_voting_results,
    core::IsRound,
    data_type::{
        ApplicationStatus, Config, CreateRoundParams, Deposit, Pair, Payout, PayoutInput,
        PayoutsChallenge, PickResult, PickedPair, ProjectVotingResult, RoundApplication,
        RoundDetail, UpdateRoundParams, VotingResult,
    },
    deposit_writer::{
        increment_deposit_id, read_deposit, read_deposit_from_round, write_deposit,
        write_deposit_id_to_round,
    },
    error::{ApplicationError, Error, RoundError, VoteError},
    events::{
        log_create_app, log_create_deposit, log_create_payout, log_create_round, log_create_vote,
        log_delete_app, log_update_app, log_update_approved_projects, log_update_round,
        log_update_user_flag, log_update_whitelist,
    },
    external::ProjectRegistryClient,
    factory::RoundCreator,
    fee_writer::{
        read_fee_address, read_fee_basis_points, write_fee_address, write_fee_basis_points,
    },
    owner_writer::{read_factory_owner, write_factory_owner},
    page_writer::{read_default_page_size, write_default_page_size},
    pair::{get_all_pairs, get_all_rounds, get_pair_by_index, get_random_pairs},
    payout_writer::{
        add_payout_id_to_project_payout_ids, clear_payouts, clear_project_payout_ids, has_paid,
        increment_payout_id, read_all_payouts, read_payout_challenge, read_payout_challenges,
        read_payout_info, read_payouts, read_project_payout_ids_for_project,
        remove_payout_challenge, remove_payout_info, write_payout_challenge,
        write_payout_challenges, write_payout_info, write_payouts,
    },
    project_registry_writer::{read_project_contract, write_project_contract},
    round_writer::{increment_round_number, is_initialized, read_round_info, write_round_info},
    storage::{clear_round, extend_instance, extend_round},
    token_writer::{read_token_address, write_token_address},
    utils::{calculate_protocol_fee, count_total_available_pairs, get_ledger_second_as_millis},
    validation::{
        validate_application_period, validate_approved_projects, validate_blacklist,
        validate_blacklist_already, validate_can_payout, validate_has_voted,
        validate_max_participant, validate_max_participants, validate_not_blacklist,
        validate_number_of_votes, validate_owner_or_admin, validate_pick_per_votes,
        validate_project_to_approve, validate_review_notes, validate_round_detail,
        validate_round_detail_update, validate_specify_applicant, validate_vault_fund,
        validate_voting_not_started, validate_voting_period, validate_whitelist,
    },
    voter_writer::{
        add_to_blacklist, add_to_whitelist, is_blacklisted, is_whitelisted, read_all_blacklist,
        read_all_whitelist, remove_from_blacklist, remove_from_whitelist,
    },
    voting_writer::{
        find_voting_result, get_voting_state, get_voting_state_done, read_voting_count, read_voting_results, read_voting_state, set_voting_state, write_voting_count, write_voting_results
    },
};

#[contract]
pub struct RoundContract;

#[contractimpl]
impl RoundCreator for RoundContract {
    fn initialize(
        env: &Env,
        caller: Address,
        token_address: Address,
        registry_address: Address,
        protocol_fee_basis_points: Option<u32>,
        protocol_fee_recipient: Option<Address>,
        default_page_size: Option<u64>,
    ) {
        caller.require_auth();

        write_factory_owner(env, &caller);
        write_token_address(env, &token_address);
        write_project_contract(env, &registry_address);

        if protocol_fee_basis_points.is_some() && protocol_fee_recipient.is_some() {
            let fee_basis_points = protocol_fee_basis_points.unwrap();
            let fee_address = protocol_fee_recipient.unwrap();

            write_fee_basis_points(env, fee_basis_points);
            write_fee_address(env, &fee_address);
        } else {
            write_fee_basis_points(env, 0);
            write_fee_address(env, &caller);
        }

        if default_page_size.is_some() {
            let page_size = default_page_size.unwrap();
            write_default_page_size(env, page_size);
        } else {
            write_default_page_size(env, 10);
        }
    }

    fn create_round(env: &Env, caller: Address, round_detail: CreateRoundParams) -> RoundDetail {
        caller.require_auth();

        let round_init = is_initialized(env);

        if !round_init {
            panic_with_error!(env, Error::ContractNotInitialized);
        }

        validate_round_detail(env, &round_detail);

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
            use_whitelist: round_detail.use_whitelist.unwrap_or(false),
            num_picks_per_voter,
            max_participants: round_detail.max_participants.unwrap_or(10),
            current_vault_balance: 0,
            vault_total_deposits: 0,
            allow_applications: round_detail.allow_applications,
            cooldown_period_ms: round_detail.cooldown_period_ms,
            cooldown_end_ms: round_detail.cooldown_end_ms,
            compliance_req_desc: round_detail.compliance_req_desc,
            compliance_period_ms: round_detail.compliance_period_ms,
            compliance_end_ms: round_detail.compliance_end_ms,
            allow_remaining_dist: Some(round_detail.allow_remaining_dist),
            remaining_dist_address: round_detail.remaining_dist_address,
            remaining_dist_at_ms: None,
            remaining_dist_memo: String::from_str(env, ""),
            remaining_dist_by: round_detail.owner.clone(),
            referrer_fee_basis_points: round_detail.referrer_fee_basis_points,
            round_complete_ms: None,
        };

        write_round_info(env, round_id, &round_info);
        write_admins(env, round_id, &round_detail.admins);
        extend_instance(env);
        log_create_round(env, round_info.clone());

        round_info.clone()
    }

    fn get_rounds(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail> {
        let results = get_all_rounds(env, from_index, limit);
        extend_instance(env);

        results
    }

    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>) {
        let owner = read_factory_owner(env);

        owner.require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance(env);
    }

    fn transfer_ownership(env: &Env, new_owner: Address) {
        let owner = read_factory_owner(env);

        owner.require_auth();

        write_factory_owner(env, &new_owner);

        extend_instance(env);
    }

    fn get_config(env: &Env) -> Config {
        let owner = read_factory_owner(env);
        let fee_basis_points = read_fee_basis_points(env);
        let fee_address = read_fee_address(env);
        let default_page_size = read_default_page_size(env);

        Config {
            owner: owner.clone(),
            protocol_fee_basis_points: fee_basis_points.unwrap_or_default(),
            protocol_fee_recipient: fee_address.unwrap_or(owner),
            default_page_size,
        }
    }

    fn owner_set_default_page_size(env: &Env, default_page_size: u64) {
        let owner = read_factory_owner(env);

        owner.require_auth();

        write_default_page_size(env, default_page_size);
    }

    fn owner_set_protocol_fee_config(
        env: &Env,
        protocol_fee_recipient: Option<Address>,
        protocol_fee_basis_points: Option<u32>,
    ) {
        let owner = read_factory_owner(env);

        owner.require_auth();

        if protocol_fee_basis_points.is_some() {
            let fee_basis_points = protocol_fee_basis_points.unwrap();
            write_fee_basis_points(env, fee_basis_points);
        }

        if protocol_fee_recipient.is_some() {
            let fee_address = protocol_fee_recipient.unwrap();
            write_fee_address(env, &fee_address);
        }
    }
}

#[contractimpl]
impl IsRound for RoundContract {
    fn change_voting_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        start_ms: u64,
        end_ms: u64,
    ) {
        caller.require_auth();

        if start_ms >= end_ms {
            panic_with_error!(env, RoundError::VotingStartGreaterThanVotingEnd);
        }

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        round.voting_start_ms = start_ms;
        round.voting_end_ms = end_ms;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());
    }

    fn change_application_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        start_ms: u64,
        end_ms: u64,
    ) {
        caller.require_auth();

        if start_ms >= end_ms {
            panic_with_error!(env, RoundError::ApplicationStartGreaterThanApplicationEnd);
        }

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        round.application_start_ms = Some(start_ms);
        round.application_end_ms = Some(end_ms);

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());
    }

    fn change_expected_amount(env: &Env, round_id: u128, caller: Address, amount: u128) {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        if round.round_complete_ms.is_some() {
            panic_with_error!(env, RoundError::RoundAlreadyCompleted);
        }

        round.expected_amount = amount;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());
    }

    fn close_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        round.voting_end_ms = get_ledger_second_as_millis(env);

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());

        round.clone()
    }

    fn start_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail {
        caller.require_auth();

        let mut round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &caller, &round);

        round.voting_start_ms = get_ledger_second_as_millis(env);

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round.clone());

        round.clone()
    }

    fn add_admins(env: &Env, round_id: u128, round_admin: Vec<Address>) {
        let round = read_round_info(env, round_id);

        round.owner.require_auth();

        let mut admins = read_admins(env, round_id);

        round_admin.iter().for_each(|admin| {
            assert!(!admins.contains(admin.clone()), "Admin already exists");
            assert!(admin != round.owner, "Owner cannot be admin");
            admins.push_back(admin.clone());
        });

        write_admins(env, round_id, &admins);
        extend_instance(env);
        extend_round(env, round_id);

        log_update_round(env, round.clone());
    }

    fn remove_admins(env: &Env, round_id: u128, round_admin: Vec<Address>) {
        let round = read_round_info(env, round_id);

        round.owner.require_auth();

        let mut admins = read_admins(env, round_id);

        round_admin.iter().for_each(|admin| {
            if !admins.contains(admin.clone()) {
                panic_with_error!(env, RoundError::AdminNotFound);
            }

            let index = admins.first_index_of(admin).unwrap();
            admins.remove(index);
        });

        write_admins(env, round_id, &admins);
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
        log_update_round(env, round.clone());
    }

    fn clear_admins(env: &Env, round_id: u128) {
        let round = read_round_info(env, round_id);

        round.owner.require_auth();

        remove_all_admins(env, round_id);

        extend_instance(env);
        extend_round(env, round_id);
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

            if round.use_whitelist {
                validate_whitelist(env, round_id, &caller);
            }

            validate_blacklist(env, round_id, &caller);
        }

        let applicant = if let Some(applicant) = applicant {
            validate_specify_applicant(env, is_owner_or_admin);
            applicant
        } else {
            caller
        };

        let project_contract = read_project_contract(env);
        let project_client = ProjectRegistryClient::new(env, &project_contract);
        let project = project_client.get_project_from_applicant(&applicant);

        if project.is_none() {
            panic_with_error!(env, ApplicationError::ProjectNotFoundInRegistry);
        }

        let uwrap_project = project.unwrap();

        if round.is_video_required {
            if uwrap_project.video_url.is_empty() {
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
            project_id: uwrap_project.id,
            applicant_id: applicant,
            status: ApplicationStatus::Pending,
            submited_ms: current_ms,
            review_note: review_note_internal,
            applicant_note: applicant_note_internal,
            updated_ms: None,
        };

        applications.set(application.applicant_id.clone(), application.clone());
        write_application(env, round_id, &applications);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_app(env, application.clone());

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
        validate_application_period(env, &round);

        let application = get_application_by_applicant(env, round_id, &applicant);

        if application.is_none() {
            panic_with_error!(env, ApplicationError::ApplicationNotFound);
        }

        let mut updated_application = application.unwrap();
        updated_application.status = status;

        if note.is_some() {
            let review_note = note.unwrap();
            validate_review_notes(env, &review_note);

            updated_application.review_note = review_note;
        }

        updated_application.updated_ms = Some(get_ledger_second_as_millis(env));

        let mut approved_projects = read_approved_projects(env, round_id);
        if updated_application.status == ApplicationStatus::Approved {
            validate_max_participant(env, &round);

            approved_projects.push_back(updated_application.project_id);
        } else {
            let is_approved = is_project_approved(env, round_id, updated_application.project_id);

            if is_approved {
                let index = approved_projects
                    .first_index_of(updated_application.project_id)
                    .unwrap();
                approved_projects.remove(index);
            }
        }

        update_application(env, round_id, &updated_application);
        write_approved_projects(env, round_id, &approved_projects);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_app(env, updated_application.clone());

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
        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);

        let balance = token_client.balance(&caller);
        let amount_i128: i128 = amount.try_into().expect("Conversion failed");
        let internal_memo = memo.unwrap_or(String::from_str(env, ""));

        if balance < amount_i128 {
            panic_with_error!(env, Error::InsufficientBalance);
        }

        let protocol_fee = calculate_protocol_fee(env, amount).unwrap_or(0);
        let referrer_fee = round.calculate_referrer_fee(amount).unwrap_or(0);

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

        let nett_amount = deposit.total_amount - deposit.protocol_fee - deposit.referrer_fee;
        deposit.net_amount = nett_amount.try_into().unwrap();

        token_client.transfer(
            &caller,
            &env.current_contract_address(),
            &deposit.total_amount,
        );

        let fee_address = read_fee_address(env);
        if deposit.protocol_fee > 0 && fee_address.is_some() {
            token_client.transfer(
                &env.current_contract_address(),
                &fee_address.unwrap(),
                &deposit.protocol_fee,
            );
        }

        if referrer_id.is_some() {
            let referrer = referrer_id.unwrap();
            token_client.transfer(
                &env.current_contract_address(),
                &referrer,
                &deposit.referrer_fee,
            );
        }

        let mut updated_round = round.clone();

        updated_round.current_vault_balance += amount;
        updated_round.vault_total_deposits += amount;

        write_deposit(env, deposit_id, &deposit);
        write_deposit_id_to_round(env, round_id, deposit_id);
        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_deposit(env, round.id, caller, amount);
    }

    fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>) {
        voter.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);

        validate_voting_period(env, &round);
        validate_number_of_votes(env, round.num_picks_per_voter, picks.len());

        if round.use_whitelist {
            validate_whitelist(env, round_id, &voter);
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
        set_voting_state(env, round_id, voter, voting_results.len()-1);
        extend_instance(env);
        extend_round(env, round_id);
        log_create_vote(env, round.id, voting_result);
    }

    fn get_pairs_to_vote(env: &Env, round_id: u128) -> Vec<Pair> {
        let round = read_round_info(env, round_id);
        let pairs = get_random_pairs(env, round_id, round.num_picks_per_voter);
        extend_instance(env);
        extend_round(env, round_id);
        pairs
    }

    fn flag_voters(env: &Env, round_id: u128, admin: Address, voters: Vec<Address>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);
        validate_owner_or_admin(env, &admin, &round);

        voters.iter().for_each(|voter| {
            validate_not_blacklist(env, round_id, &voter);
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
        extend_instance(env);
        extend_round(env, round_id);

        results
    }

    fn process_payouts(env: &Env, round_id: u128, caller: Address) {
        caller.require_auth();

        let round = read_round_info(env, round_id);

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

        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);

        let mut updated_round = round.clone();
        let mut total_amount_paid: i128 = 0;
        let round_payouts = read_payouts(env, round_id);

        approved_projects.iter().for_each(|project_id| {
            let project_payout_ids = read_project_payout_ids_for_project(env, project_id);

            project_payout_ids.iter().for_each(|payout_id| {
                let payout_exist_on_round = round_payouts.contains(payout_id);

                if !payout_exist_on_round {
                    return;
                }

                let mut payout = read_payout_info(env, payout_id).unwrap();

                if payout.paid_at_ms.is_some() {
                    return;
                }

                token_client.transfer(
                    &env.current_contract_address(),
                    &payout.recipient_id,
                    &payout.amount,
                );

                payout.paid_at_ms = Some(get_ledger_second_as_millis(env));

                let payout_amount_u128: u128 = payout.amount.try_into().unwrap();
                updated_round.current_vault_balance -= payout_amount_u128;
                total_amount_paid += payout.amount;
                log_create_payout(env, round.id, payout.recipient_id.clone(), payout.amount);
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
        extend_instance(env);
        extend_round(env, round_id);

        results
    }

    fn can_vote(env: &Env, round_id: u128, voter: Address) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);
        extend_instance(env);
        extend_round(env, round_id);

        if round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms {
            if round.use_whitelist {
                let is_whitelisted = is_whitelisted(env, round_id, voter.clone());
                return is_whitelisted;
            }

            let is_blacklisted = is_blacklisted(env, round_id, voter.clone());
            if is_blacklisted {
                return false;
            }

            return true;
        }

        false
    }

    fn get_round(env: &Env, round_id: u128) -> RoundDetail {
        let round = read_round_info(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        round.clone()
    }

    fn is_voting_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);
        extend_instance(env);

        round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms
    }

    fn is_application_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = get_ledger_second_as_millis(env);
        extend_instance(env);
        extend_round(env, round_id);

        round.application_start_ms.unwrap() <= current_ms
            && current_ms <= round.application_end_ms.unwrap()
    }

    fn get_applications_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundApplication> {
        // implementation goes here
        let applications = find_applications(env, round_id, from_index, limit);
        extend_instance(env);
        extend_round(env, round_id);

        applications
    }

    fn get_application(env: &Env, round_id: u128, applicant: Address) -> RoundApplication {
        let application = get_application_by_applicant(env, round_id, &applicant);

        extend_instance(env);
        extend_round(env, round_id);

        if application.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        application.unwrap()
    }

    fn is_payout_done(env: &Env, round_id: u128) -> bool {
        extend_instance(env);
        extend_round(env, round_id);

        has_paid(env, round_id)
    }

    fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool {
        let state = get_voting_state_done(env, round_id, voter);
        extend_instance(env);

        state
    }

    fn total_funding(env: &Env, round_id: u128) -> u128 {
        let round = read_round_info(env, round_id);
        let total_funding = round.current_vault_balance;
        extend_instance(env);
        extend_round(env, round_id);

        total_funding
    }

    fn add_approved_project(env: &Env, round_id: u128, admin: Address, project_ids: Vec<u128>) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

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

    fn add_whitelists(env: &Env, round_id: u128, caller: Address, users: Vec<Address>) {
        caller.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        users.iter().for_each(|user| {
            let is_blacklisted = is_blacklisted(env, round_id, user.clone());
            if is_blacklisted {
                panic_with_error!(env, RoundError::UserBlacklisted);
            }

            add_to_whitelist(env, round_id, user.clone());
            log_update_whitelist(env, round.id, user.clone(), true);
        });

        extend_round(env, round_id);
    }

    fn remove_from_whitelists(env: &Env, round_id: u128, caller: Address, users: Vec<Address>) {
        caller.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &caller, &round);

        users.iter().for_each(|user| {
            remove_from_whitelist(env, round_id, user.clone());
            log_update_whitelist(env, round.id, user.clone(), false);
        });

        extend_instance(env);
        extend_round(env, round_id);
    }

    fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool {
        extend_instance(env);
        extend_round(env, round_id);
        is_whitelisted(env, round_id, address)
    }

    fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool {
        extend_instance(env);
        extend_round(env, round_id);
        is_blacklisted(env, round_id, address)
    }

    // get_pairs is test only & protected and check correctness of pairs generated. use get_pair_to_vote for users
    fn get_all_pairs_for_round(env: &Env, round_id: u128) -> Vec<Pair> {
        let pairs = get_all_pairs(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        pairs
    }

    fn get_pair_by_index(env: &Env, round_id: u128, index: u32) -> Pair {
        let approved_project = read_approved_projects(env, round_id);
        let total_available_pairs = count_total_available_pairs(approved_project.len());
        let pair = get_pair_by_index(env, total_available_pairs, index, &approved_project);
        extend_instance(env);
        extend_round(env, round_id);

        pair
    }

    fn change_number_of_votes(env: &Env, round_id: u128, admin: Address, num_picks_per_voter: u32) {
        admin.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        if num_picks_per_voter < 1 {
            panic_with_error!(env, VoteError::EmptyVote);
        }

        let states = read_voting_state(env, round_id);
        let votes = states.len();

        if votes > 0 {
            panic_with_error!(env, RoundError::VotesAlreadyCast);
        }

        round.num_picks_per_voter = num_picks_per_voter;

        write_round_info(env, round_id, &round);
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
        extend_instance(env);
        extend_round(env, round_id);
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
        log_delete_app(env, application_internal.clone());

        application_internal.clone()
    }

    fn update_applicant_note(
        env: &Env,
        round_id: u128,
        caller: Address,
        note: String,
    ) -> RoundApplication {
        caller.require_auth();

        let applicant = caller;
        let application = get_application_by_applicant(env, round_id, &applicant);

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
        log_update_app(env, application_internal.clone());

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

        validate_owner_or_admin(env, &caller, &round);
        validate_round_detail_update(env, &round_detail);

        round.allow_applications = round_detail.allow_applications;
        round.application_end_ms = round_detail.application_end_ms;
        round.application_start_ms = round_detail.application_start_ms;
        round.contacts = round_detail.contacts;
        round.expected_amount = round_detail.expected_amount;
        round.description = round_detail.description;
        round.max_participants = round_detail.max_participants.unwrap_or(10);
        round.name = round_detail.name;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        log_create_round(env, round.clone());

        round.clone()
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

        let project_contract = read_project_contract(env);
        let project_client = ProjectRegistryClient::new(env, &project_contract);
        let mut applications: Vec<RoundApplication> = Vec::new(env);

        let mut index = 0;

        let mut internal_applications = read_application(env, round_id);
        applicants.iter().for_each(|applicant| {
            let project = project_client.get_project_from_applicant(&applicant);

            if project.is_none() {
                panic_with_error!(env, ApplicationError::ProjectNotFoundInRegistry);
            }

            let uwrap_project = project.unwrap();

            if round.is_video_required {
                if uwrap_project.video_url.is_empty() {
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
                project_id: uwrap_project.id,
                applicant_id: applicant.clone(),
                status: ApplicationStatus::Pending,
                submited_ms: current_ms,
                review_note: review_note_internal,
                applicant_note: applicant_note_internal,
                updated_ms: None,
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
        let default_page_size = read_default_page_size(env);
        let limit_internal: usize = limit
            .unwrap_or(default_page_size)
            .try_into()
            .expect("Conversion failed");
        let from_index_internal: usize = from_index
            .unwrap_or(0)
            .try_into()
            .expect("Conversion failed");
        let payouts = read_payouts(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

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
                let payout_ids = read_project_payout_ids_for_project(env, project_id);

                payout_ids.iter().for_each(|payout_id| {
                    remove_payout_info(env, payout_id);
                });

                clear_project_payout_ids(env, project_id);
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
                recipient_id: payout_input.recipient_id,
                paid_at_ms: None,
                memo: payout_input.memo,
            };

            write_payout_info(env, payout_id, &payout);
            payouts_internal.push_back(payout_id);
            add_payout_id_to_project_payout_ids(env, project_id, payout_id);
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

        round.round_complete_ms = Some(get_ledger_second_as_millis(env));

        write_round_info(env, round_id, &round);
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
        let challenger_id = caller.clone();

        let challenges = PayoutsChallenge {
            round_id,
            challenger_id: challenger_id.clone(),
            admin_notes: String::from_str(env, ""),
            reason,
            resolved: false,
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

            if challenge.resolved {
                challenges_internal.remove(challenger_id);
            }
        });

        write_payout_challenges(env, round_id, &challenges_internal);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_payouts(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<Payout> {
        let default_page_size = read_default_page_size(env);
        let limit_internal: u64 = limit.unwrap_or(default_page_size);
        let from_index_internal: u64 = from_index.unwrap_or(0);
        let payouts = read_all_payouts(env);
        extend_instance(env);

        let mut payouts_external: Vec<Payout> = Vec::new(env);

        payouts
            .keys()
            .iter()
            .skip(from_index_internal as usize)
            .take(limit_internal as usize)
            .for_each(|payout_id| {
                let internal = payouts.get(payout_id).unwrap();
                payouts_external.push_back(internal.clone());
            });

        payouts_external
    }

    fn get_payout(env: &Env, payout_id: u32) -> Payout {
        let payout = read_payout_info(env, payout_id);

        if payout.is_none() {
            panic_with_error!(env, RoundError::PayoutNotFound);
        }

        extend_instance(env);
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

        round.assert_cooldown_period_complete(env);
        round.assert_compliance_period_complete(env);

        round.assert_all_payouts_challenges_resolved(env);

        let mut updated_round = round.clone();
        let amount: i128 = round
            .current_vault_balance
            .try_into()
            .expect("Conversion failed");
        let redistribute_to = round.remaining_dist_address;

        let token_contract = read_token_address(env);
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
        let default_page_size = read_default_page_size(env);
        let limit_internal: u64 = limit.unwrap_or(default_page_size);
        let from_index_internal: u64 = from_index.unwrap_or(0);
        let deposits = read_deposit_from_round(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

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

        round.cooldown_period_ms = cooldown_period_ms;

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

        round.compliance_req_desc = compliance_req_desc.unwrap_or(String::from_str(env, ""));
        round.compliance_period_ms = compliance_period_ms;

        write_round_info(env, round_id, &round);
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
    fn whitelisted_voters(env: &Env, round_id: u128) -> Vec<Address> {
        let whitelisted_voters = read_all_whitelist(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        let mut result: Vec<Address> = Vec::new(env);
        whitelisted_voters.keys().iter().for_each(|voter| {
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

      extend_instance(env);
      extend_round(env, round_id);

      result.unwrap()
    }
}
