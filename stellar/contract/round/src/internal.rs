use crate::{
    application_writer::{
        add_application, find_applications, get_application, get_application_by_id,
        increment_application_number, update_application,
    },
    approval_writer::{
        add_approved_project, is_project_approved, read_approved_projects, remove_approved_project,
    },
    calculation::calculate_voting_results,
    data_type::{
        ApplicationStatus, CreateRoundParams, Pair, PickResult, PickedPair, ProjectApplication,
        ProjectVotingResult, RoundDetail, VotingResult,
    },
    events::{
        log_create_round, log_deposit, log_payout, log_project_application,
        log_project_application_update, log_update_approved_projects, log_update_round,
        log_update_user_flag, log_update_white_list, log_vote,
    },
    funding_writer::{add_total_funding, read_total_funding},
    methods::RoundTrait,
    pair::{get_all_pairs, get_pair_by_index, get_random_pairs},
    project_registry_writer::{read_project_contract, write_project_contract},
    round_writer::{is_initialized, read_round_info, write_round_info},
    storage::extend_instance,
    token_writer::{read_token_address, write_token_address},
    voter_writer::{
        add_to_black_list, add_to_white_list, is_black_listed, is_white_listed,
        remove_from_black_list, remove_from_white_list,
    },
    voting_writer::{
        add_voting_result, find_voting_result, get_voting_state, increment_voting_count, read_voting_state, set_voting_state
    },
};
use loam_sdk::soroban_sdk::{self, contract, contractimpl, token::TokenClient, String, Vec};
use loam_sdk::soroban_sdk::{Address, Env};
loam_sdk::import_contract!(project_registry);

#[contract]
pub struct Round;

#[contractimpl]
impl RoundTrait for Round {
    fn init(
        env: &Env,
        owner: Address,
        token_address: Address,
        registry_address: Address,
        round_detail: CreateRoundParams,
    ) {
        owner.require_auth();

        assert!(
            round_detail.start_time < round_detail.end_time,
            "Round start time must be less than round end time"
        );

        assert!(
            round_detail.application_start_time <= round_detail.application_end_time,
            "Round application start time must be less than equal round application end time"
        );

        assert!(
            round_detail.start_time >= round_detail.application_end_time,
            "Round start time must be greater than or equal round application end time"
        );

        assert!(round_detail.amount > 0, "Amount must be greater than 0");
        assert!(
            !round_detail.admins.is_empty(),
            "Round admins must not empty"
        );
        assert!(
            round_detail.admins.len() < 5,
            "Round admins must be less than 5"
        );

        let round_init = is_initialized(env);

        assert!(!round_init, "Round already initialized");

        let mut num_picks_per_voter = 2;

        if round_detail.num_picks_per_voter.is_some() {
            num_picks_per_voter = round_detail.num_picks_per_voter.unwrap();
            assert!(
                num_picks_per_voter > 0,
                "Number of picks per voter must be greater than 0"
            );
            assert!(
                num_picks_per_voter <= 10,
                "Number of picks per voter must be less than or equal 10"
            );
        }

        assert!(
            round_detail.contact.len() <= 10,
            "Contact must be less than 10"
        );
        assert!(
            round_detail.image_url.len() <= 200,
            "Image URL must be less than 200 characters. Use IPFS Hash Only"
        );

        let round_info = RoundDetail {
            id: round_detail.id,
            name: round_detail.name,
            description: round_detail.description,
            start_time: round_detail.start_time,
            end_time: round_detail.end_time,
            image_url: round_detail.image_url,
            contact: round_detail.contact,
            owner,
            admins: round_detail.admins,
            application_start_time: round_detail.application_start_time,
            application_end_time: round_detail.application_end_time,
            expected_amount: round_detail.amount,
            is_completed: false,
            use_whitelist: round_detail.use_whitelist.unwrap_or(false),
            num_picks_per_voter,
            max_participants: round_detail.max_participants.unwrap_or(10),
        };

        write_round_info(env, &round_info);
        write_token_address(env, &token_address);
        write_project_contract(env, &registry_address);
        log_create_round(env, round_info);
    }

    fn change_voting_period(env: &Env, admin: Address, round_start_time: u64, round_end_time: u64) {
        admin.require_auth();

        assert!(
            round_start_time < round_end_time,
            "Round start time must be less than round end time"
        );

        let mut round = read_round_info(env);

        if round.owner != admin {
            let admin_index = round.admins.first_index_of(admin.clone());
            assert!(admin_index.is_some(), "Only round owner or round admin can change voting period");
        }

        round.start_time = round_start_time;
        round.end_time = round_end_time;

        write_round_info(env, &round);
        extend_instance(env);
        log_update_round(env, round);
    }

    fn change_application_period(
        env: &Env,
        admin: Address,
        round_application_start_time: u64,
        round_application_end_time: u64,
    ) {
        admin.require_auth();

        assert!(
            round_application_start_time < round_application_end_time,
            "Round application start time must be less than round application end time"
        );

        let mut round = read_round_info(env);

        if round.owner != admin {
          let admin_index = round.admins.first_index_of(admin.clone());
          assert!(admin_index.is_some(), "Only round owner or round admin can change application period");
        }

        round.application_start_time = round_application_start_time;
        round.application_end_time = round_application_end_time;

        write_round_info(env, &round);
        extend_instance(env);
        log_update_round(env, round);
    }

    fn change_amount(env: &Env, admin: Address, amount: u128) {
        admin.require_auth();

        let mut round = read_round_info(env);

        if round.owner != admin {
           let admin_index = round.admins.first_index_of(admin.clone());
            assert!(admin_index.is_some(), "Only round owner or round admin can change amount");
        }

        round.expected_amount = amount;

        write_round_info(env, &round);
        extend_instance(env);
    }

    fn complete_vote(env: &Env, admin: Address){
      admin.require_auth();

      let mut round = read_round_info(env);

      if round.owner != admin {
         let admin_index = round.admins.first_index_of(admin.clone());
          assert!(admin_index.is_some(), "Only round owner or round admin can change amount");
      }

      round.end_time = env.ledger().timestamp();

      write_round_info(env, &round);
      extend_instance(env);
    }

    fn add_admin(env: &Env, admin: Address, round_admin: Address) {
        admin.require_auth();
        assert!(admin != round_admin, "Admin and round admin cannot be same");

        let mut round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner can add admin");
        }

        round.admins.push_back(round_admin);

        write_round_info(env, &round);
        extend_instance(env);
        log_update_round(env, round);
    }

    fn remove_admin(env: &Env, admin: Address, round_admin: Address) {
        admin.require_auth();
        assert!(admin != round_admin, "Admin and round admin cannot be same");

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner can remove admin");
        }

        let index = round
            .admins
            .first_index_of(&round_admin)
            .expect("Round admin not found");
        let index_u32: u32 = index.try_into().expect("Conversion failed");

        let mut updated_round = round.clone();
        updated_round.admins.remove(index_u32);

        write_round_info(env, &updated_round);
        extend_instance(env);
        log_update_round(env, updated_round);
    }

    fn apply_project(env: &Env, project_id: u128, applicant: Address) -> u128 {
        applicant.require_auth();

        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();

        assert!(
            round.application_start_time <= current_time
                && current_time <= round.application_end_time,
            "Application period is not live"
        );
        assert!(!round.is_completed, "Round is completed");

        if round.use_whitelist {
            let is_white_listed = is_white_listed(env, applicant.clone());
            assert!(is_white_listed, "Applicant is not white listed");
        }

        let blacklist = is_black_listed(env, applicant.clone());
        assert!(!blacklist, "Applicant is black listed");

        let project_contract = read_project_contract(env);
        let project_client = project_registry::Client::new(env, &project_contract);
        let project = project_client.get_project_by_id(&project_id);
        assert!(
            project.is_some(),
            "Project not found. Please register project first using project registry"
        );

        let existing_application = get_application(env, project_id);

        assert!(existing_application.is_none(), "Application already exists");

        let application_id = increment_application_number(env);
        let review_note = String::from_str(env, "");
        let application = ProjectApplication {
            application_id,
            project_id,
            applicant,
            status: ApplicationStatus::Pending,
            submited_at: current_time,
            review_note,
            updated_at: None,
        };

        add_application(env, application.clone());
        extend_instance(env);
        log_project_application(env, application);

        application_id
    }

    fn review_application(
        env: &Env,
        admin: Address,
        application_id: u128,
        status: ApplicationStatus,
        note: Option<String>,
    ) {
        admin.require_auth();

        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();

        assert!(
            round.application_start_time <= current_time
                && current_time <= round.application_end_time,
            "Application period is not live"
        );
        assert!(!round.is_completed, "Round is completed");

        let application = get_application_by_id(env, application_id);

        assert!(application.is_some(), "Application not found");

        let mut updated_application = application.unwrap();
        updated_application.status = status;

        if note.is_some() {
            let review_note = note.unwrap();
            assert!(
                review_note.len() <= 300,
                "Review note must be less than 300 characters"
            );
            updated_application.review_note = review_note;
        }

        updated_application.updated_at = Some(current_time);

        if updated_application.status == ApplicationStatus::Approved {
            let approved_project = read_approved_projects(env);
            assert!(
                approved_project.len() < round.max_participants,
                "Maximum project participants {}",
                round.max_participants
            );

            add_approved_project(env, updated_application.project_id);
        } else {
            let is_approved = is_project_approved(env, updated_application.project_id);

            if is_approved {
                remove_approved_project(env, updated_application.project_id);
            }
        }

        update_application(env, updated_application.clone());
        extend_instance(env);
        log_project_application_update(env, updated_application);
    }

    fn deposit(env: &Env, actor: Address, amount: u128) {
        actor.require_auth();

        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);

        let balance = token_client.balance(&actor);
        let amount_i128: i128 = amount.try_into().expect("Conversion failed");

        assert!(balance > amount_i128, "Insufficient balance");

        token_client.transfer(&actor, &env.current_contract_address(), &amount_i128);
        let round = read_round_info(env);

        add_total_funding(env, amount);
        extend_instance(env);
        log_deposit(env, round.id, actor, amount);
    }

    fn vote(env: &Env, voter: Address, picks: Vec<PickedPair>) {
        voter.require_auth();

        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();

        assert!(
            round.start_time <= current_time && current_time <= round.end_time,
            "Voting period is not live"
        );
        assert!(!round.is_completed, "Round is completed");

        if round.use_whitelist {
            let is_white_listed = is_white_listed(env, voter.clone());
            assert!(is_white_listed, "Voter is not white listed");
        }

        let is_black_listed = is_black_listed(env, voter.clone());
        assert!(!is_black_listed, "Voter is black listed");

        assert!(
            picks.len() == round.num_picks_per_voter,
            "Number of picks must be equal to number of picks per voter"
        );

        let state = get_voting_state(env, voter.clone());
        assert!(
            !state,
            "Voter already voted. Can not vote again in same round");

        let mut picked_pairs: Vec<PickResult> = Vec::new(env);

        let projects = read_approved_projects(env);
        let total_available_pairs: u64 = (projects.len() * (projects.len() - 1)).into();
        picks.iter().for_each(|picked_pair| {
            let picked_index: u64 = picked_pair.pair_id.into();
            assert!(
                picked_index < total_available_pairs,
                "Picked pair is greater than total available pairs"
            );

            let pair = get_pair_by_index(env, total_available_pairs, picked_index);
            let is_project_in_pair = pair
                .projects
                .iter()
                .find(|project_id| project_id == &picked_pair.voted_project_id);
            assert!(is_project_in_pair.is_some(), "Project not in pair");

            let pick_result = PickResult {
                pair_id: picked_pair.pair_id,
                project_id: picked_pair.voted_project_id,
            };

            increment_voting_count(env, picked_pair.voted_project_id);
            picked_pairs.push_back(pick_result);
        });

        let voting_result = VotingResult {
            voter: voter.clone(),
            picks: picked_pairs,
            voting_time: current_time,
        };

        add_voting_result(env, voting_result.clone());
        set_voting_state(env, voter, true);
        extend_instance(env);
        log_vote(env, round.id, voting_result);
    }

    fn get_pair_to_vote(env: &Env) -> Vec<Pair> {
        let round = read_round_info(env);
        let pairs = get_random_pairs(env, round.num_picks_per_voter.into());
        extend_instance(env);
        pairs
    }

    fn flag_voter(env: &Env, admin: Address, voter: Address) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can flag voter");
        }

        let is_white_listed = is_white_listed(env, voter.clone());
        assert!(!is_white_listed, "Voter is white listed");

        let is_black_listed = is_black_listed(env, voter.clone());
        assert!(!is_black_listed, "Voter already black listed");

        add_to_black_list(env, voter.clone());
        extend_instance(env);
        log_update_user_flag(env, round.id, voter, true);
    }

    fn unflag_voter(env: &Env, admin: Address, voter: Address) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can flag voter");
        }

        let is_black_listed = is_black_listed(env, voter.clone());
        assert!(is_black_listed, "Voter is not black listed");

        remove_from_black_list(env, voter.clone());
        extend_instance(env);
        log_update_user_flag(env, round.id, voter, false);
    }

    fn calculate_results(env: &Env) -> Vec<ProjectVotingResult> {
        let results = calculate_voting_results(env);
        extend_instance(env);

        results
    }

    fn trigger_payouts(env: &Env, admin: Address) {
        admin.require_auth();

        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();

        assert!(
            round.start_time <= current_time,
            "Voting period is not started"
        );

        assert!(
            current_time >= round.end_time,
            "Voting period is not ended"
        );

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can trigger payouts");
        }

        let total_funding = read_total_funding(env);
        assert!(total_funding > 0, "Total funding is 0");

        let token_contract = read_token_address(env);
        let token_client = TokenClient::new(env, &token_contract);
        let project_registry_contract = read_project_contract(env);
        let project_registry_client =
            project_registry::Client::new(env, &project_registry_contract);
        let results = calculate_voting_results(env);

        results.iter().for_each(|result| {
            if result.allocation > 0 {
                let payout_amount = (total_funding * result.allocation) / 10000;
                let payout_amount_i128: i128 = payout_amount.try_into().expect("Conversion failed");

                let detail_project = project_registry_client
                    .get_project_by_id(&result.project_id)
                    .unwrap();

                token_client.transfer(
                    &env.current_contract_address(),
                    &detail_project.payout_address,
                    &payout_amount_i128,
                );

                log_payout(env, round.id, detail_project.payout_address, payout_amount);
            }
        });

        let mut updated_round = round.clone();
        updated_round.is_completed = true;
        write_round_info(env, &updated_round);
        extend_instance(env);
    }

    fn get_all_voters(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<VotingResult> {
        let results = find_voting_result(env, skip, limit);
        extend_instance(env);

        results
    }

    fn can_vote(env: &Env, voter: Address) -> bool {
        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();
        extend_instance(env);

        if round.start_time <= current_time && current_time <= round.end_time {
            if round.is_completed {
                return false;
            }

            if round.use_whitelist {
                let is_white_listed = is_white_listed(env, voter.clone());
                return is_white_listed;
            }

            let is_black_listed = is_black_listed(env, voter.clone());
            if is_black_listed {
                return false;
            }

            return true;
        }

        false
    }

    fn round_info(env: &Env) -> RoundDetail {
        let round = read_round_info(env);
        extend_instance(env);

        round
    }

    fn is_voting_live(env: &Env) -> bool {
        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();
        extend_instance(env);

        round.start_time <= current_time && current_time <= round.end_time
    }

    fn is_application_live(env: &Env) -> bool {
        let round = read_round_info(env);
        let current_time = env.ledger().timestamp();
        extend_instance(env);

        round.application_start_time <= current_time && current_time <= round.application_end_time
    }

    fn get_all_applications(
        env: &Env,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ProjectApplication> {
        // implementation goes here
        let applications = find_applications(env, skip, limit);
        extend_instance(env);

        applications
    }

    fn is_payout_done(env: &Env) -> bool {
        let round = read_round_info(env);
        extend_instance(env);

        round.is_completed
    }

    fn user_has_vote(env: &Env, voter: Address) -> bool {
        let state = get_voting_state(env, voter);
        extend_instance(env);

        state
    }

    fn total_funding(env: &Env) -> u128 {
        let total_funding = read_total_funding(env);
        extend_instance(env);

        total_funding
    }

    fn add_approved_project(env: &Env, admin: Address, project_ids: Vec<u128>) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can add approved project");
        }

        let approved_project = read_approved_projects(env);
        assert!(
            approved_project.len() + project_ids.len() <= round.max_participants,
            "Maximum project participants {}",
            round.max_participants
        );

        let project_contract = read_project_contract(env);
        let project_client = project_registry::Client::new(env, &project_contract);
        let total_projects: u128 = project_client.get_total_projects().into();

        project_ids.iter().for_each(|project_id| {
            assert!(
                project_id <= total_projects,
                "Project not found in registry"
            );

            let already_approved = is_project_approved(env, project_id);
            assert!(!already_approved, "Project already approved");
        });

        project_ids.iter().for_each(|project_id| {
            add_approved_project(env, project_id);
        });

        let new_approved_project = read_approved_projects(env);
        log_update_approved_projects(env, round.id, new_approved_project);
        extend_instance(env);
    }

    fn remove_approved_project(env: &Env, admin: Address, project_ids: Vec<u128>) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can remove approved project");
        }

        let approved_project = read_approved_projects(env);
        assert!(
            project_ids.len() >= approved_project.len(),
            "Can not remove (Out of bound)"
        );

        project_ids.iter().for_each(|project_id| {
            let already_approved = is_project_approved(env, project_id);
            assert!(already_approved, "Project not approved");
        });

        project_ids.iter().for_each(|project_id| {
            remove_approved_project(env, project_id);
        });

        let new_approved_project = read_approved_projects(env);
        log_update_approved_projects(env, round.id, new_approved_project);
        extend_instance(env);
    }

    fn add_white_list(env: &Env, admin: Address, address: Address) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can add white list");
        }

        let is_black_listed = is_black_listed(env, address.clone());
        assert!(!is_black_listed, "Address is black listed");

        let is_white_listed = is_white_listed(env, address.clone());
        assert!(!is_white_listed, "Address already white listed");

        add_to_white_list(env, address.clone());
        extend_instance(env);
        log_update_white_list(env, round.id, address, true);
    }

    fn remove_from_white_list(env: &Env, admin: Address, address: Address) {
        admin.require_auth();

        let round = read_round_info(env);

        if round.owner != admin {
            round
                .admins
                .iter()
                .find(|round_admin| round_admin == &admin)
                .expect("Only round owner or round admin can remove white list");
        }

        let is_white_listed = is_white_listed(env, address.clone());
        assert!(is_white_listed, "Address is not white listed");

        let is_black_listed = is_black_listed(env, address.clone());
        assert!(!is_black_listed, "Address is black listed");

        remove_from_white_list(env, address.clone());
        extend_instance(env);
        log_update_white_list(env, round.id, address, false);
    }

    fn whitelist_status(env: &Env, address: Address) -> bool {
        is_white_listed(env, address)
    }

    fn blacklist_status(env: &Env, address: Address) -> bool {
        is_black_listed(env, address)
    }

    fn get_round_info(env: &Env) -> RoundDetail {
        let round = read_round_info(env);
        extend_instance(env);

        round
    }

    fn get_pairs(env: &Env) -> Vec<Pair> {
        let pairs = get_all_pairs(env);
        extend_instance(env);

        pairs
    }

    fn get_pair_by_index(env: &Env, index: u64) -> Pair {
        let approved_project = read_approved_projects(env);
        let total_available_pairs: u64 =
            (approved_project.len() * (approved_project.len() - 1)).into();
        let pair = get_pair_by_index(env, total_available_pairs, index);
        extend_instance(env);

        pair
    }

    fn  change_number_of_votes(env: &Env, admin: Address, num_picks_per_voter: u32){
      admin.require_auth();

      let mut round = read_round_info(env);

      if round.owner != admin {
         let admin_index = round.admins.first_index_of(admin.clone());
          assert!(admin_index.is_some(), "Only round owner or round admin can change number of votes");
      }

      assert!(
          num_picks_per_voter > 0,
          "Number of picks per voter must be greater than 0"
      );

      let states = read_voting_state(env);
      let votes = states.len();

      assert!(votes == 0, "Votes already casted. Can not change number of votes");

      round.num_picks_per_voter = num_picks_per_voter;

      write_round_info(env, &round);
      extend_instance(env);
    }
}
