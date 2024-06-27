#![cfg(test)]

use loam_sdk::soroban_sdk::token::{StellarAssetClient, TokenClient};
use loam_sdk::soroban_sdk::{Map, Vec};

use crate::data_type::{ApplicationStatus, CreateRoundParams, Pair, PickedPair};
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::{internal::Round, internal::RoundClient};

loam_sdk::import_contract!(project_registry);

fn deploy_contract<'a>(env: &Env, _admin: &Address) -> RoundClient<'a> {
    let contract = RoundClient::new(env, &env.register_contract(None, Round {}));

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

fn generate_fake_project(env: &Env, owner: &Address, project_contract: &project_registry::Client) {
    let admin = Address::generate(&env);
    let mut project_contracts: Vec<project_registry::ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<project_registry::ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<project_registry::ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<project_registry::ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(project_registry::ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(project_registry::ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(project_registry::ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(project_registry::ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(admin.clone());

    for _i in 0..15 {
        let project_params = &project_registry::ProjectParams {
            image_url: String::from_str(&env, "image_url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: owner.clone(),
            contacts: project_contacts.clone(),
            contracts: project_contracts.clone(),
            team_members: project_team_members.clone(),
            repositories: project_repositories.clone(),
            admins: project_admins.clone(),
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
fn test_round_init() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let round_info = round.round_info();
    assert_eq!(round_info.expected_amount, 5);
    assert_eq!(round_info.admins, admins);
    assert_eq!(round_info.owner, admin);
    assert_eq!(round_info.is_completed, false);
    assert_eq!(round_info.use_whitelist, false);
    assert_eq!(round_info.num_picks_per_voter, 2);
}

#[test]
fn test_apply_applications() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let applicant = Address::generate(&env);
    let application_id = round.apply_project(&project_id, &applicant);

    let application = round.get_all_applications(&None, &None).get(0).unwrap();
    assert_eq!(application.application_id, application_id);
    assert_eq!(application.project_id, project_id);
    assert_eq!(application.applicant, applicant);
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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let applicant = Address::generate(&env);
    let application_id = round.apply_project(&project_id, &applicant);

    let review_note = String::from_str(&env, "review_note");
    round.review_application(
        &admin,
        &application_id,
        &ApplicationStatus::Approved,
        &Some(review_note.clone()),
    );

    let application = round.get_all_applications(&None, &None).get(0).unwrap();
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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(true),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let applicant = Address::generate(&env);
    round.apply_project(&project_id, &applicant);
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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp(),
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(true),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let applicant = Address::generate(&env);

    round.add_white_list(&admin, &applicant);

    let application_id = round.apply_project(&project_id, &applicant);

    round.review_application(&admin, &application_id, &ApplicationStatus::Approved, &None);

    let voter = Address::generate(&env);
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: 0,
        voted_project_id: project_id,
    });
    round.vote(&voter, &picks);
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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let applicant = Address::generate(&env);
    round.flag_voter(&admin, &applicant);
    round.apply_project(&project_id, &applicant);
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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp(),
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let project_id = 1;
    let project_id2 = 2;
    let project_id3 = 3;
    let project_id4 = 4;
    let applicant = Address::generate(&env);

    let application_id = round.apply_project(&project_id, &applicant);
    let application_id2 = round.apply_project(&project_id2, &applicant);
    let application_id3 = round.apply_project(&project_id3, &applicant);
    let application_id4 = round.apply_project(&project_id4, &applicant);

    round.review_application(&admin, &application_id, &ApplicationStatus::Approved, &None);
    round.review_application(
        &admin,
        &application_id2,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &admin,
        &application_id3,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &admin,
        &application_id4,
        &ApplicationStatus::Approved,
        &None,
    );

    let voter = Address::generate(&env);
    let pair_to_vote = round.get_pair_to_vote();
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(0).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(0).unwrap().projects.get(0).unwrap(),
    });

    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(1).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(1).unwrap().projects.get(0).unwrap(),
    });

    round.vote(&voter, &picks);

    let results = round.calculate_results();

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
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: env.ledger().timestamp() + 10000,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: env.ledger().timestamp(),
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let new_admin = Address::generate(&env);
    round.add_admin(&admin, &new_admin);

    let round_info = round.round_info();
    assert_eq!(round_info.admins.len(), 2);

    round.remove_admin(&admin, &new_admin);

    // let round_info = round.round_info();
    // assert_eq!(round_info.admins.len(), 1);
}

#[test]
fn test_voting_deposit_and_payout() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let deposit = 100 * 10u128.pow(7);

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: 0,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: 0,
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 10 * deposit,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..10 {
        project_ids.push_back(i + 1);
    }
    round.add_approved_project(&admin, &project_ids);

    let voter = Address::generate(&env);
    let voter2 = Address::generate(&env);
    let cindy = Address::generate(&env);

    let voter_pairs = round.get_pair_to_vote();
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

    round.deposit(&cindy, &(deposit / 2));

    round.vote(&voter, &picks);

    let voter_pairs2 = round.get_pair_to_vote();
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

    round.vote(&voter2, &picks2);

    let results = round.calculate_results();
    assert_eq!(results.len(), 10);

    let admin_balance = token_contract.balance(&admin);
    round.trigger_payouts(&admin);
    let new_admin_balance = token_contract.balance(&admin);

    assert!(new_admin_balance > admin_balance);
}

#[test]
fn test_get_all_pairs() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    generate_fake_project(&env, &admin, &project_contract);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        id: 1,
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        image_url: String::from_str(&env, "image_url"),
        contact: Vec::new(&env),
        start_time: 0,
        end_time: env.ledger().timestamp() + 30000,
        application_start_time: 0,
        application_end_time: env.ledger().timestamp() + 10000,
        amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        num_picks_per_voter: Some(2),
    };

    round.init(
        &admin,
        &token_contract.address,
        &project_contract.address,
        round_detail,
    );

    let num_of_projects: u128 = 10;
    let num_of_project_per_pair: u128 = 2;
    let posibilities = num_of_projects * (num_of_projects - 1);
    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..num_of_projects {
        project_ids.push_back(i + 1);
    }
    round.add_approved_project(&admin, &project_ids);

    let pairs = round.get_pairs();
    assert_eq!(pairs.len(), posibilities as u32);

    let mut correctness_test: Map<u128, u128> = Map::new(&env);
    let mut generated_pairs: Map<u128, Vec<Pair>> = Map::new(&env);
    for i in 0..posibilities {
        let pair = round.get_pair_by_index(&(i as u64));
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

    let mut unique_count: u128 = 0;
    correctness_test.iter().for_each(|(_project_id, count)| {
        unique_count += count;
    });

    assert_eq!(unique_count / num_of_project_per_pair, posibilities);

    correctness_test.iter().for_each(|(project_id, _count)| {
        let expected_generated_pairs = (num_of_projects - 1) * num_of_project_per_pair;
        let pairs = generated_pairs.get(project_id).unwrap();
        assert_eq!(pairs.len(), expected_generated_pairs as u32);
    });
}
