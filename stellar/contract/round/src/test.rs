#![cfg(test)]

use loam_sdk::soroban_sdk::token::{StellarAssetClient, TokenClient};
use loam_sdk::soroban_sdk::{Map, Vec};

use crate::data_type::{ApplicationStatus, CreateRoundParams, Pair, PickedPair};
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::utils::get_ledger_second_as_millis;
use crate::{internal::RoundContract, internal::RoundContractClient};

loam_sdk::import_contract!(project_registry);

fn deploy_contract<'a>(env: &Env, _admin: &Address) -> RoundContractClient<'a> {
    let contract = RoundContractClient::new(env, &env.register_contract(None, RoundContract {}));

    contract
}

fn deploy_registry_contract<'a>(env: &Env, admin: &Address) -> project_registry::Client<'a> {
    let contract = project_registry::Client::new(
        env,
        &env.register_contract_wasm(None, project_registry::WASM),
    );

    contract.initialize(&admin);

    contract
}

fn generate_fake_project(
    env: &Env,
    owner: &Address,
    project_contract: &project_registry::Client,
    total: u64,
) {
    let admin = Address::generate(&env);
    let mut project_contracts: Vec<project_registry::ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<project_registry::ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<project_registry::ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<project_registry::ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);
    let mut funding_histories: Vec<project_registry::ProjectFundingHistory> = Vec::new(&env);

    project_contracts.push_back(project_registry::ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: String::from_str(&env, "contract address"),
    });

    project_contacts.push_back(project_registry::ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(project_registry::ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        value: String::from_str(&env, "root.near"),
    });

    project_repositories.push_back(project_registry::ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    funding_histories.push_back(project_registry::ProjectFundingHistory {
        amount: 100,
        source: String::from_str(&env, "source"),
        funded_ms: 100,
        description: String::from_str(&env, "description"),
        denomiation: String::from_str(&env, "USD"),
    });

    project_admins.push_back(admin.clone());

    for _i in 0..total {
        let project_params = &project_registry::ProjectParams {
            image_url: String::from_str(&env, "video_url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: owner.clone(),
            contacts: project_contacts.clone(),
            contracts: project_contracts.clone(),
            team_members: project_team_members.clone(),
            repositories: project_repositories.clone(),
            admins: project_admins.clone(),
            fundings: funding_histories.clone(),
        };

        project_contract.apply(&owner, project_params);
    }
}

fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract(admin.clone());

    (
        TokenClient::new(env, &contract_address),
        StellarAssetClient::new(env, &contract_address),
    )
}

#[test]
fn test_round_create() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);

    let round_info = round.round_info(&created_round.id);
    let admins = round.admins(&created_round.id);
    assert_eq!(round_info.expected_amount, 5);
    assert_eq!(admins, admins);
    assert_eq!(round_info.owner, admin);
    assert_eq!(round_info.use_whitelist, false);
    assert_eq!(round_info.num_picks_per_voter, 2);

    let all_rounds = round.get_rounds(&None, &None);
    assert_eq!(all_rounds.len(), 1);

    let factory_round = all_rounds.get(0).unwrap();
    assert_eq!(factory_round, round_info);
}

#[test]
fn test_apply_applications() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin,
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);

    let project_id = 1;
    let applicant = Address::generate(&env);
    let application_id = round.apply_project(&created_round.id, &project_id, &applicant);

    let application = round
        .get_all_applications(&created_round.id, &None, &None)
        .get(0)
        .unwrap();
    assert_eq!(application.project_id, project_id);
    assert_eq!(application.applicant_id, applicant);
    assert_eq!(application.status, ApplicationStatus::Pending);
}

#[test]
fn test_review_application() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let applicant = Address::generate(&env);
    let application_id = round.apply_project(&created_round.id, &project_id, &applicant);

    let review_note = String::from_str(&env, "review_note");
    round.review_application(
        &created_round.id,
        &admin,
        &application_id,
        &ApplicationStatus::Approved,
        &Some(review_note.clone()),
    );

    let application = round
        .get_all_applications(&created_round.id, &None, &None)
        .get(0)
        .unwrap();
    assert_eq!(application.status, ApplicationStatus::Approved);
    assert_eq!(application.review_note, review_note);
}

#[test]
#[should_panic]
fn test_whitelist_applicant() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let applicant = Address::generate(&env);
    round.apply_project(&created_round.id, &project_id, &applicant);
}

#[test]
#[should_panic]
fn test_whitelist_voters() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env),
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(true),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let applicant = Address::generate(&env);

    round.add_white_list(&created_round.id, &admin, &applicant);

    let application_id = round.apply_project(&created_round.id, &project_id, &applicant);

    round.review_application(
        &created_round.id,
        &admin,
        &application_id,
        &ApplicationStatus::Approved,
        &None,
    );

    let voter = Address::generate(&env);
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: 0,
        voted_project_id: project_id,
    });
    round.vote(&created_round.id, &voter, &picks);
}

#[test]
#[should_panic]
fn test_blacklist() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let applicant = Address::generate(&env);
    round.flag_voter(&created_round.id, &admin, &applicant);
    round.apply_project(&created_round.id, &project_id, &applicant);
    // round.apply_project(&project_id, &applicant);
}

#[test]
fn test_voting() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env),
        voting_end_ms: get_ledger_second_as_millis(&env) + 30,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env)),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let project_id2 = 2;
    let project_id3 = 3;
    let project_id4 = 4;
    let applicant = Address::generate(&env);

    let application_id = round.apply_project(&created_round.id, &project_id, &applicant);
    let application_id2 = round.apply_project(&created_round.id, &project_id2, &applicant);
    let application_id3 = round.apply_project(&created_round.id, &project_id3, &applicant);
    let application_id4 = round.apply_project(&created_round.id, &project_id4, &applicant);

    round.review_application(
        &created_round.id,
        &admin,
        &application_id,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &application_id2,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &application_id3,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &application_id4,
        &ApplicationStatus::Approved,
        &None,
    );

    let voter = Address::generate(&env);
    let pair_to_vote = round.get_pair_to_vote(&created_round.id);
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(0).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(0).unwrap().projects.get(0).unwrap(),
    });

    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(1).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(1).unwrap().projects.get(0).unwrap(),
    });

    round.vote(&created_round.id, &voter, &picks);

    let results = round.calculate_results(&created_round.id);

    assert_eq!(results.len(), 4);

    results.iter().for_each(|result| {
        if result.project_id == pair_to_vote.get(0).unwrap().projects.get(0).unwrap()
            || result.project_id == pair_to_vote.get(1).unwrap().projects.get(0).unwrap()
        {
            assert!(result.voting_count > 0);
        } else {
            assert_eq!(result.voting_count, 0);
        }
    });
}

#[test]
fn test_add_remove_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let new_admin = Address::generate(&env);
    round.add_admin(&created_round.id, &admin, &new_admin);

    let mut admins = round.admins(&created_round.id);
    assert_eq!(admins.len(), 2);

    round.remove_admin(&created_round.id, &admin, &new_admin);

    admins = round.admins(&created_round.id);

    let round_info = round.round_info(&created_round.id);
    assert_eq!(admins.len(), 1);
}

#[test]
fn test_voting_deposit_and_payout() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let deposit = 100 * 10u128.pow(7);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env),
        voting_end_ms: get_ledger_second_as_millis(&env) + 30,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env)),
        expected_amount: 10 * deposit,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..10 {
        project_ids.push_back(i + 1);
    }
    round.add_approved_project(&created_round.id, &admin, &project_ids);

    let voter = Address::generate(&env);
    let voter2 = Address::generate(&env);
    let cindy = Address::generate(&env);

    let voter_pairs = round.get_pair_to_vote(&created_round.id);
    assert!(!voter_pairs.is_empty());

    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: voter_pairs.get(0).unwrap().pair_id,
        voted_project_id: voter_pairs.get(0).unwrap().projects.get(0).unwrap(),
    });

    picks.push_back(PickedPair {
        pair_id: voter_pairs.get(1).unwrap().pair_id,
        voted_project_id: voter_pairs.get(1).unwrap().projects.get(0).unwrap(),
    });

    let deposit_i128: i128 = deposit.try_into().expect("Conversion Fail");

    token_admin.mint(&cindy, &deposit_i128);

    round.deposit(&created_round.id, &cindy, &(deposit / 2));

    round.vote(&created_round.id, &voter, &picks);

    let voter_pairs2 = round.get_pair_to_vote(&created_round.id);
    assert!(!voter_pairs2.is_empty());

    let mut picks2: Vec<PickedPair> = Vec::new(&env);
    picks2.push_back(PickedPair {
        pair_id: voter_pairs2.get(1).unwrap().pair_id,
        voted_project_id: voter_pairs2.get(1).unwrap().projects.get(0).unwrap(),
    });

    picks2.push_back(PickedPair {
        pair_id: voter_pairs2.get(0).unwrap().pair_id,
        voted_project_id: voter_pairs2.get(0).unwrap().projects.get(0).unwrap(),
    });

    round.vote(&created_round.id, &voter2, &picks2);

    let results = round.calculate_results(&created_round.id);
    assert_eq!(results.len(), 10);

    round.complete_vote(&created_round.id, &admin);

    let admin_balance = token_contract.balance(&admin);
    round.trigger_payouts(&created_round.id, &admin);
    let new_admin_balance = token_contract.balance(&admin);

    assert!(new_admin_balance > admin_balance);
}

/**
 * Note:
 * Don't change this test, it's a critical test for pairs
 * posibilities = (num_of_projects * (num_of_projects - 1))/num_of_project_per_pair
 * expected_generated_pairs_per_project = num_of_projects - 1
 * to allow duplicate pairs eg. A B and B A, we need to change the logic of the test
 */
#[test]
fn test_get_all_pairs() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 10);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let num_of_projects: u32 = 10;
    let num_of_project_per_pair: u32 = 2;
    let posibilities: u32 = (num_of_projects * (num_of_projects - 1)) / num_of_project_per_pair;
    let expected_generated_pairs_per_project = num_of_projects - 1;
    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..num_of_projects {
        let project_id: u128 = (i + 1).try_into().unwrap();
        project_ids.push_back(project_id);
    }
    round.add_approved_project(&created_round.id, &admin, &project_ids);

    let pairs = round.get_pairs(&created_round.id, &admin);
    assert_eq!(pairs.len(), posibilities as u32);

    let mut correctness_test: Map<u128, u32> = Map::new(&env);
    let mut generated_pairs: Map<u128, Vec<Pair>> = Map::new(&env);
    for i in 0..posibilities {
        let pair = round.get_pair_by_index(&created_round.id, &i);
        pair.projects.iter().for_each(|project_id| {
            if correctness_test.contains_key(project_id) {
                correctness_test.set(project_id, correctness_test.get(project_id).unwrap() + 1);
                let mut old_pairs = generated_pairs.get(project_id).unwrap();
                old_pairs.push_back(pair.clone());
                generated_pairs.set(project_id, old_pairs);
            } else {
                correctness_test.set(project_id, 1);
                let mut new_pairs = Vec::new(&env);
                new_pairs.push_back(pair.clone());
                generated_pairs.set(project_id, new_pairs);
            }
        });
    }

    let mut unique_count: u32 = 0;
    correctness_test.iter().for_each(|(_project_id, count)| {
        unique_count += count;
    });

    assert_eq!(unique_count / num_of_project_per_pair, posibilities);

    correctness_test.iter().for_each(|(project_id, _count)| {
        let pairs = generated_pairs.get(project_id).unwrap();
        assert_eq!(pairs.len(), expected_generated_pairs_per_project as u32);
    });
}

#[test]
fn test_change_number_of_votes() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let new_num_picks_per_voter = 3;
    round.change_number_of_votes(&created_round.id, &admin, &new_num_picks_per_voter);

    let round_info = round.round_info(&created_round.id);
    assert_eq!(round_info.num_picks_per_voter, new_num_picks_per_voter);
}

#[test]
fn test_change_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let new_amount = 10;
    round.change_amount(&created_round.id, &admin, &new_amount);

    let round_info = round.round_info(&created_round.id);
    assert_eq!(round_info.expected_amount, new_amount);
}

#[test]
fn test_change_voting_period() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let new_start_ms = get_ledger_second_as_millis(&env) + 1000;
    let new_end_ms = get_ledger_second_as_millis(&env) + 2000;
    round.change_voting_period(&created_round.id, &admin, &new_start_ms, &new_end_ms);

    let round_info = round.round_info(&created_round.id);
    assert_eq!(round_info.voting_start_ms, new_start_ms);
    assert_eq!(round_info.voting_end_ms, new_end_ms);
}

#[test]
fn test_application_period() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract, 15);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
    };

    round.initialize(&admin, &token_contract.address, &project_contract.address);

    let created_round = round.create_round(&admin, &round_detail);
    let new_application_start_ms = get_ledger_second_as_millis(&env) + 1000;
    let new_application_end_ms = get_ledger_second_as_millis(&env) + 2000;
    round.change_application_period(
        &created_round.id,
        &admin,
        &new_application_start_ms,
        &new_application_end_ms,
    );

    let round_info = round.round_info(&created_round.id);
    assert_eq!(
        round_info.application_start_ms.unwrap(),
        new_application_start_ms
    );
    assert_eq!(
        round_info.application_end_ms.unwrap(),
        new_application_end_ms
    );
}
