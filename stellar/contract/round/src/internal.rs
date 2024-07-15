use core::result;

use loam_sdk::soroban_sdk::{
    self, contract, contractimpl, token::TokenClient, Address, BytesN, Env, String, Vec,
};

use crate::{
    admin_writer::{add_admin, read_admins, remove_admin, write_admins},
    application_writer::{
        add_application, find_applications, get_application, get_application_by_id,
        increment_application_number, update_application,
    },
    approval_writer::{
        add_approved_project, is_project_approved, read_approved_projects, remove_approved_project,
    },
    calculation::calculate_voting_results,
    core::IsRound,
    data_type::{
        ApplicationStatus, CreateRoundParams, Pair, PickResult, PickedPair, ProjectApplication,
        ProjectVotingResult, RoundDetail, VotingResult,
    },
    events::{
        log_create_round, log_deposit, log_payout, log_project_application,
        log_project_application_update, log_update_approved_projects, log_update_round,
        log_update_user_flag, log_update_white_list, log_vote,
    },
    external::ProjectRegistryClient,
    factory::{self, RoundFactory},
    owner_writer::{read_factory_owner, write_factory_owner},
    pair::{get_all_pairs, get_all_rounds, get_pair_by_index, get_random_pairs},
    project_registry_writer::{read_project_contract, write_project_contract},
    round_writer::{increment_round_number, is_initialized, read_round_info, write_round_info},
    storage::{extend_instance, extend_round},
    token_writer::{read_token_address, write_token_address},
    utils::{count_total_available_pairs, get_ledger_second_as_millis},
    validation::{
        validate_application_period, validate_approved_projects, validate_blacklist,
        validate_blacklist_already, validate_can_payout, validate_contract_owner,
        validate_has_voted, validate_max_participant, validate_max_participants,
        validate_not_blacklist, validate_number_of_votes, validate_owner, validate_owner_or_admin,
        validate_pick_per_votes, validate_project_to_apply, validate_project_to_approve,
        validate_review_notes, validate_round_detail, validate_vault_fund, validate_voting_period,
        validate_whitelist,
    },
    voter_writer::{
        add_to_black_list, add_to_white_list, is_black_listed, is_white_listed,
        remove_from_black_list, remove_from_white_list,
    },
    voting_writer::{
        add_voting_result, find_voting_result, get_voting_state, increment_voting_count,
        read_voting_state, set_voting_state,
    },
};

#[contract]
pub struct RoundContract;

#[contractimpl]
impl RoundFactory for RoundContract {
    fn initialize(env: &Env, owner: Address, token_address: Address, registry_address: Address) {
        write_factory_owner(env, &owner);
        write_token_address(env, &token_address);
        write_project_contract(env, &registry_address);
    }

    fn create_round(env: &Env, owner: Address, round_detail: CreateRoundParams) -> RoundDetail {
        owner.require_auth();

        let round_init = is_initialized(env);
        assert!(!round_init, "Round already initialized");

        validate_round_detail(&round_detail);

        let mut num_picks_per_voter = 2;

        if round_detail.num_picks_per_voter.is_some() {
            num_picks_per_voter = round_detail.num_picks_per_voter.unwrap();
            validate_pick_per_votes(num_picks_per_voter);
        }

        let round_id = increment_round_number(env);

        let round_info = RoundDetail {
            id: round_id,
            name: round_detail.name,
            description: round_detail.description,
            voting_start_ms: round_detail.voting_start_ms,
            voting_end_ms: round_detail.voting_end_ms,
            video_url: round_detail.video_url,
            contacts: round_detail.contacts,
            owner,
            application_start_ms: round_detail.application_start_ms,
            application_end_ms: round_detail.application_end_ms,
            expected_amount: round_detail.expected_amount,
            is_completed: false,
            use_whitelist: round_detail.use_whitelist.unwrap_or(false),
            num_picks_per_voter,
            max_participants: round_detail.max_participants.unwrap_or(10),
            vault_balance: 0,
        };

        write_round_info(env, round_id, &round_info);
        write_admins(env, round_id, &round_detail.admins);
        extend_instance(env);
        log_create_round(env, round_info.clone());

        round_info
    }

    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail> {
        let results = get_all_rounds(env, skip, limit);
        extend_instance(env);

        results
    }

    fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>) {
        owner.require_auth();

        validate_contract_owner(env, &owner);

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance(env);
    }

    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address) {
        owner.require_auth();

        validate_contract_owner(env, &owner);
        write_factory_owner(env, &new_owner);

        extend_instance(env);
    }
}

#[contractimpl]
impl IsRound for RoundContract {
    fn change_voting_period(
        env: &Env,
        round_id: u128,
        admin: Address,
        round_start_ms: u64,
        round_end_ms: u64,
    ) {
        admin.require_auth();

        assert!(
            round_start_ms < round_end_ms,
            "Round start time must be less than round end time"
        );

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        round.voting_start_ms = round_start_ms;
        round.voting_end_ms = round_end_ms;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round);
    }

    fn change_application_period(
        env: &Env,
        round_id: u128,
        admin: Address,
        round_application_start_ms: u64,
        round_application_end_ms: u64,
    ) {
        admin.require_auth();

        assert!(
            round_application_start_ms < round_application_end_ms,
            "Round application start time must be less than round application end time"
        );

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        round.application_start_ms = round_application_start_ms;
        round.application_end_ms = round_application_end_ms;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round);
    }

    fn change_amount(env: &Env, round_id: u128, admin: Address, amount: u128) {
        admin.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        round.expected_amount = amount;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn complete_vote(env: &Env, round_id: u128, admin: Address) {
        admin.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        round.voting_end_ms = env.ledger().timestamp() * 1000;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn add_admin(env: &Env, round_id: u128, admin: Address, round_admin: Address) {
        admin.require_auth();
        assert!(admin != round_admin, "Admin and round admin cannot be same");

        let round = read_round_info(env, round_id);
        validate_owner(&admin, &round);

        add_admin(env, round_id, round_admin);

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round);
    }

    fn remove_admin(env: &Env, round_id: u128, admin: Address, round_admin: Address) {
        admin.require_auth();
        assert!(admin != round_admin, "Admin and round admin cannot be same");

        let round = read_round_info(env, round_id);

        validate_owner(&admin, &round);

        remove_admin(env, round_id, &round_admin);

        extend_instance(env);
        extend_round(env, round_id);
        log_update_round(env, round);
    }

    fn apply_project(env: &Env, round_id: u128, project_id: u128, applicant: Address) -> u128 {
        applicant.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = env.ledger().timestamp() * 1000;

        validate_application_period(env, &round);

        if round.use_whitelist {
            validate_whitelist(env, round_id, &applicant);
        }

        validate_blacklist(env, round_id, &applicant);
        validate_project_to_apply(env, project_id);

        let existing_application = get_application(env, round_id, project_id);

        assert!(existing_application.is_none(), "Application already exists");

        let application_id = increment_application_number(env, round_id);
        let review_note = String::from_str(env, "");
        let application = ProjectApplication {
            application_id,
            project_id,
            applicant,
            status: ApplicationStatus::Pending,
            submited_ms: current_ms,
            review_note,
            updated_ms: None,
        };

        add_application(env, round_id, application.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_project_application(env, application);

        application_id
    }

    fn review_application(
        env: &Env,
        round_id: u128,
        admin: Address,
        application_id: u128,
        status: ApplicationStatus,
        note: Option<String>,
    ) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);
        validate_application_period(env, &round);

        let application = get_application_by_id(env, round_id, application_id);

        assert!(application.is_some(), "Application not found");

        let mut updated_application = application.unwrap();
        updated_application.status = status;

        if note.is_some() {
            let review_note = note.unwrap();
            validate_review_notes(&review_note);

            updated_application.review_note = review_note;
        }

        updated_application.updated_ms = Some(get_ledger_second_as_millis(env));

        if updated_application.status == ApplicationStatus::Approved {
            validate_max_participant(env, &round);

            add_approved_project(env, round_id, updated_application.project_id);
        } else {
            let is_approved = is_project_approved(env, round_id, updated_application.project_id);

            if is_approved {
                remove_approved_project(env, round_id, updated_application.project_id);
            }
        }

        update_application(env, round_id, updated_application.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_project_application_update(env, updated_application);
    }

    fn deposit(env: &Env, round_id: u128, actor: Address, amount: u128) {
        actor.require_auth();

        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);

        let balance = token_client.balance(&actor);
        let amount_i128: i128 = amount.try_into().expect("Conversion failed");

        assert!(balance > amount_i128, "Insufficient balance");

        token_client.transfer(&actor, &env.current_contract_address(), &amount_i128);
        let mut round = read_round_info(env, round_id);

        round.vault_balance += amount;

        write_round_info(env, round_id, &round);
        extend_instance(env);
        extend_round(env, round_id);
        log_deposit(env, round.id, actor, amount);
    }

    fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>) {
        voter.require_auth();

        let round = read_round_info(env, round_id);
        let current_ms = env.ledger().timestamp() * 1000;

        validate_voting_period(env, &round);
        validate_number_of_votes(round.num_picks_per_voter, picks.len());

        if round.use_whitelist {
            validate_whitelist(env, round_id, &voter);
        }

        validate_blacklist(env, round_id, &voter);
        validate_has_voted(env, round_id, &voter);

        let mut picked_pairs: Vec<PickResult> = Vec::new(env);

        let projects = read_approved_projects(env, round_id);
        let total_available_pairs = count_total_available_pairs(projects.len());
        let projects = read_approved_projects(env, round_id);
        picks.iter().for_each(|picked_pair| {
            let picked_index = picked_pair.pair_id;
            assert!(
                picked_index < total_available_pairs,
                "Picked pair is greater than total available pairs"
            );

            let pair = get_pair_by_index(env, total_available_pairs, picked_index, &projects);
            let is_project_in_pair = pair.projects.contains(picked_pair.voted_project_id);
            assert!(is_project_in_pair, "Project not in pair");

            let pick_result = PickResult {
                pair_id: picked_pair.pair_id,
                project_id: picked_pair.voted_project_id,
            };

            increment_voting_count(env, round_id, picked_pair.voted_project_id);
            picked_pairs.push_back(pick_result);
        });

        let voting_result = VotingResult {
            voter: voter.clone(),
            picks: picked_pairs,
            voted_ms: current_ms,
        };

        add_voting_result(env, round_id, voting_result.clone());
        set_voting_state(env, round_id, voter, true);
        extend_instance(env);
        extend_round(env, round_id);
        log_vote(env, round.id, voting_result);
    }

    fn get_pair_to_vote(env: &Env, round_id: u128) -> Vec<Pair> {
        let round = read_round_info(env, round_id);
        let pairs = get_random_pairs(env, round_id, round.num_picks_per_voter.into());
        extend_instance(env);
        extend_round(env, round_id);
        pairs
    }

    fn flag_voter(env: &Env, round_id: u128, admin: Address, voter: Address) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        let is_white_listed = is_white_listed(env, round_id, voter.clone());
        assert!(!is_white_listed, "Voter is white listed");

        validate_blacklist_already(env, round_id, &voter);

        add_to_black_list(env, round_id, voter.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_update_user_flag(env, round.id, voter, true);
    }

    fn unflag_voter(env: &Env, round_id: u128, admin: Address, voter: Address) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);
        validate_not_blacklist(env, round_id, &voter);

        remove_from_black_list(env, round_id, voter.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_update_user_flag(env, round.id, voter, false);
    }

    fn calculate_results(env: &Env, round_id: u128) -> Vec<ProjectVotingResult> {
        let results = calculate_voting_results(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        results
    }

    fn trigger_payouts(env: &Env, round_id: u128, admin: Address) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);
        validate_can_payout(env, &round);
        validate_vault_fund(&round);

        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);
        let project_registry_contract = read_project_contract(env);
        let project_registry_client = ProjectRegistryClient::new(env, &project_registry_contract);
        let results = calculate_voting_results(env, round_id);

        let mut updated_round = round.clone();

        results.iter().for_each(|result| {
            if result.allocation > 0 {
                let payout_amount = (round.vault_balance * result.allocation) / 10000;
                let payout_amount_i128: i128 = payout_amount.try_into().expect("Conversion failed");

                let detail_project = project_registry_client
                    .get_project_by_id(&result.project_id)
                    .unwrap();

                token_client.transfer(
                    &env.current_contract_address(),
                    &detail_project.payout_address,
                    &payout_amount_i128,
                );

                updated_round.vault_balance -= payout_amount;
                log_payout(env, round.id, detail_project.payout_address, payout_amount);
            }
        });

        updated_round.is_completed = true;
        write_round_info(env, round_id, &updated_round);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn get_all_voters(
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
        let current_ms = env.ledger().timestamp() * 1000;
        extend_instance(env);
        extend_round(env, round_id);

        if round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms {
            if round.is_completed {
                return false;
            }

            if round.use_whitelist {
                let is_white_listed = is_white_listed(env, round_id, voter.clone());
                return is_white_listed;
            }

            let is_black_listed = is_black_listed(env, round_id, voter.clone());
            if is_black_listed {
                return false;
            }

            return true;
        }

        false
    }

    fn round_info(env: &Env, round_id: u128) -> RoundDetail {
        let round = read_round_info(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        round
    }

    fn is_voting_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = env.ledger().timestamp() * 1000;
        extend_instance(env);

        round.voting_start_ms <= current_ms && current_ms <= round.voting_end_ms
    }

    fn is_application_live(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        let current_ms = env.ledger().timestamp() * 1000;
        extend_instance(env);
        extend_round(env, round_id);

        round.application_start_ms <= current_ms && current_ms <= round.application_end_ms
    }

    fn get_all_applications(
        env: &Env,
        round_id: u128,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ProjectApplication> {
        // implementation goes here
        let applications = find_applications(env, round_id, skip, limit);
        extend_instance(env);
        extend_round(env, round_id);

        applications
    }

    fn is_payout_done(env: &Env, round_id: u128) -> bool {
        let round = read_round_info(env, round_id);
        extend_instance(env);
        extend_round(env, round_id);

        round.is_completed
    }

    fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool {
        let state = get_voting_state(env, round_id, voter);
        extend_instance(env);

        state
    }

    fn total_funding(env: &Env, round_id: u128) -> u128 {
        let round = read_round_info(env, round_id);
        let total_funding = round.vault_balance;
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

        project_ids.iter().for_each(|project_id| {
            add_approved_project(env, round_id, project_id);
        });

        let new_approved_project = read_approved_projects(env, round_id);
        log_update_approved_projects(env, round.id, new_approved_project);
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

        project_ids.iter().for_each(|project_id| {
            remove_approved_project(env, round_id, project_id);
        });

        let new_approved_project = read_approved_projects(env, round_id);
        log_update_approved_projects(env, round.id, new_approved_project);
        extend_instance(env);
        extend_round(env, round_id);
    }

    fn add_white_list(env: &Env, round_id: u128, admin: Address, address: Address) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        let is_black_listed = is_black_listed(env, round_id, address.clone());
        assert!(!is_black_listed, "Address is black listed");

        let is_white_listed = is_white_listed(env, round_id, address.clone());
        assert!(!is_white_listed, "Address already white listed");

        add_to_white_list(env, round_id, address.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_update_white_list(env, round.id, address, true);
    }

    fn remove_from_white_list(env: &Env, round_id: u128, admin: Address, address: Address) {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

        let is_white_listed = is_white_listed(env, round_id, address.clone());
        assert!(is_white_listed, "Address is not white listed");

        let is_black_listed = is_black_listed(env, round_id, address.clone());
        assert!(!is_black_listed, "Address is black listed");

        remove_from_white_list(env, round_id, address.clone());
        extend_instance(env);
        extend_round(env, round_id);
        log_update_white_list(env, round.id, address, false);
    }

    fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool {
        extend_instance(env);
        extend_round(env, round_id);
        is_white_listed(env, round_id, address)
    }

    fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool {
        extend_instance(env);
        extend_round(env, round_id);
        is_black_listed(env, round_id, address)
    }

    // get_pairs is test only & protected and check correctness of pairs generated. use get_pair_to_vote for users
    fn get_pairs(env: &Env, round_id: u128, admin: Address) -> Vec<Pair> {
        admin.require_auth();

        let round = read_round_info(env, round_id);

        validate_owner_or_admin(env, &admin, &round);

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

        assert!(
            num_picks_per_voter > 0,
            "Number of picks per voter must be greater than 0"
        );

        let states = read_voting_state(env, round_id);
        let votes = states.len();

        assert!(
            votes == 0,
            "Votes already casted. Can not change number of votes"
        );

        round.num_picks_per_voter = num_picks_per_voter;

        write_round_info(env, round_id, &round);
        extend_round(env, round_id);
        extend_instance(env);
    }

    fn transfer_round_ownership(env: &Env, round_id: u128, owner: Address, new_owner: Address) {
        owner.require_auth();

        let mut round = read_round_info(env, round_id);

        validate_owner(&owner, &round);

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
}
