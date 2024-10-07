#![cfg(test)]

use list_contract::ListExternal;
use soroban_sdk::token::{StellarAssetClient, TokenClient};
use soroban_sdk::{self, contracttype, Map, Vec};

use crate::data_type::{
    ApplicationStatus, CreateRoundParams, Pair, PayoutInput, PickedPair, UpdateRoundParams,
};
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::utils::get_ledger_second_as_millis;
use crate::{internal::RoundContract, internal::RoundContractClient};

mod project_registry {
    soroban_sdk::contractimport!(
        file = "../build/project_registry.wasm",
    );
}

mod list_contract {
    soroban_sdk::contractimport!(
        file = "../build/lists.wasm",
    );
}

#[contracttype]
pub struct FakeProject {
    owner: Address,
    project: project_registry::Project,
}

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

fn deploy_list_contract<'a>(env: &Env, admin: &Address) -> list_contract::Client<'a> {
    let contract = list_contract::Client::new(
        env,
        &env.register_contract_wasm(None, list_contract::WASM),
    );

    contract.initialize(&admin);
    create_kyc_list(env, &admin, &contract);

    contract
}

fn create_kyc_list(env: &Env, owner: &Address, list_contract: &list_contract::Client)->ListExternal {
    /*
    for test used default value Approved
     */
    let kyc_list = list_contract.create_list(
        owner,
        &String::from_str(&env, "kyc_list"),
        &list_contract::RegistrationStatus::Approved,
        &None,
        &None,
        &None,
        &None
    );

    kyc_list
}
/*
Generate fake projects for testing
*/
fn generate_fake_project(
    env: &Env,
    project_contract: &project_registry::Client,
    total: u64,
) -> Vec<FakeProject> {
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
        value: String::from_str(&env, "root"),
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

    let mut results: Vec<FakeProject> = Vec::new(env);
    for _i in 0..total {
        let owner = Address::generate(env);
        let project_params = &project_registry::CreateProjectParams {
            image_url: String::from_str(&env, "image_url"),
            video_url: String::from_str(&env, "video_url"),
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

        let project = project_contract.apply(&owner, project_params);
        results.push_back(FakeProject { owner, project })
    }

    results
}

fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract(admin.clone());

    (
        TokenClient::new(env, &contract_address),
        StellarAssetClient::new(env, &contract_address),
    )
}
/*
Test case:
1. Create a round
2. Get the round and admins
*/
#[test]
fn test_round_create() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);

    let round_info = round.get_round(&created_round.id);
    let admins = round.admins(&created_round.id);
    assert_eq!(round_info.expected_amount, 5);
    assert_eq!(admins, admins);
    assert_eq!(round_info.owner, admin);
    assert_eq!(round_info.use_whitelist, false);
    assert_eq!(round_info.num_picks_per_voter, 2);

    let all_rounds = round.get_rounds(&None, &None);
    assert_eq!(all_rounds.len(), 1);

    let factory_round = all_rounds.get(0).unwrap();
    assert_eq!(factory_round.id, round_info.id);
}

/*
Test case:
1. Create a round
2. Apply to the round
*/
#[test]
fn test_apply_applications() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);

    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );

    let application = round
        .get_applications_for_round(&created_round.id, &None, &None)
        .get(0)
        .unwrap();
    assert_eq!(application.project_id, projects.get(0).unwrap().project.id);
    assert_eq!(application.applicant_id, projects.get(0).unwrap().owner);
    assert_eq!(application.status, ApplicationStatus::Pending);
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
*/
#[test]
fn test_review_application() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );

    let review_note = String::from_str(&env, "review_note");
    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(0).unwrap().owner,
        &ApplicationStatus::Approved,
        &Some(review_note.clone()),
    );

    let application = round
        .get_applications_for_round(&created_round.id, &None, &None)
        .get(0)
        .unwrap();
    assert_eq!(application.status, ApplicationStatus::Approved);
    assert_eq!(application.review_note, review_note);
}

/*
Test case:
1. Create a round
2. Apply to the round using whitelist
*/
#[test]
#[should_panic]
fn test_whitelist_applicant() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);

    let wl_list = list_contract.create_list(&admin, &String::from_str(&env, "wl"), &list_contract::RegistrationStatus::Approved, &None, &None, &None, &None);

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
        use_whitelist: Some(true),
        wl_list_id: Some(wl_list.id),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
4. Vote for the project using whitelist
*/
#[test]
#[should_panic]
fn test_whitelist_voters() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let wl_list = list_contract.create_list(&admin, &String::from_str(&env, "wl"), &list_contract::RegistrationStatus::Approved, &None, &None, &None, &None);

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
        wl_list_id: Some(wl_list.id),
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let project_id = 1;
    let applicant = Address::generate(&env);

    list_contract.register_batch(&applicant, &wl_list.id, &None, &None);

    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );

    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(0).unwrap().owner,
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

    let whitelisted = list_contract.is_registered(&Some(wl_list.id), &applicant, &Some(list_contract::RegistrationStatus::Approved));

    assert_eq!(whitelisted, true);
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
4. Vote for the project using blacklist
*/
#[test]
#[should_panic]
fn test_blacklist() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );

    round.apply_to_round(
        &created_round.id,
        &projects.get(1).unwrap().owner,
        &None,
        &None,
        &None,
    );

    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(0).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );

    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(1).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );

    let voter = Address::generate(&env);
    let pairs_to_vote = round.get_pairs_to_vote(&created_round.id);
    let mut picks: Vec<PickedPair> = Vec::new(&env);

    pairs_to_vote.iter().for_each(|pair| {
        picks.push_back(PickedPair {
            pair_id: pair.pair_id,
            voted_project_id: pair.projects.get(0).unwrap(),
        });
    });

    let mut blacklist_voters: Vec<Address> = Vec::new(&env);
    blacklist_voters.push_back(voter.clone());
    round.flag_voters(&created_round.id, &admin, &blacklist_voters);

    round.vote(&created_round.id, &voter, &picks);
}
/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
4. Vote for the project
*/
#[test]
fn test_voting() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 4);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);

    round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );
    round.apply_to_round(
        &created_round.id,
        &projects.get(1).unwrap().owner,
        &None,
        &None,
        &None,
    );
    round.apply_to_round(
        &created_round.id,
        &projects.get(2).unwrap().owner,
        &None,
        &None,
        &None,
    );
    round.apply_to_round(
        &created_round.id,
        &projects.get(3).unwrap().owner,
        &None,
        &None,
        &None,
    );

    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(0).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(1).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &projects.get(2).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );
    round.review_application(
        &created_round.id,
        &admin,
        &&projects.get(3).unwrap().owner,
        &ApplicationStatus::Approved,
        &None,
    );


    let voter = Address::generate(&env);
    let pair_to_vote = round.get_pairs_to_vote(&created_round.id);
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

    let results = round.get_voting_results_for_round(&created_round.id);

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

    round.get_my_vote_for_round(&created_round.id, &voter);

    let all_votes = round.get_votes_for_round(&created_round.id, &None, &None);
    assert_eq!(all_votes.len(), 1);

    let my_voted_rounds = round.get_voted_rounds(&voter, &None, &None);
    assert_eq!(my_voted_rounds.len(), 1);
}

/*
Test case:
1. Create a round
2. Add and remove admins
*/
#[test]
fn test_add_remove_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let roby = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(roby.clone());

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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_admin = Address::generate(&env);

    admins.push_back(new_admin.clone());
    round.set_admins(&created_round.id, &admins);

    let mut new_admins: Vec<Address> = round.admins(&created_round.id);
    assert_eq!(new_admins.len(), 2);

    admins.pop_back();
    round.set_admins(&created_round.id, &admins);

    new_admins = round.admins(&created_round.id);

    round.get_round(&created_round.id);
    assert_eq!(new_admins.len(), 1);
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
4. Vote for the project
5. Deposit to the round
6. Payout to the project owner
*/
#[test]
fn test_voting_deposit_and_payout() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 4);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let deposit = 100 * 10u128.pow(7);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 1000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 1000),
        expected_amount: 10 * deposit,
        admins: admins.clone(),
        use_whitelist: Some(false),
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: Some(0),
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: Some(true),
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);

    round.apply_to_round(
        &created_round.id,
        &admin,
        &Some(projects.get(0).unwrap().owner),
        &None,
        &None,
    );

    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..4 {
        project_ids.push_back(i + 1);
    }
    round.add_approved_project(&created_round.id, &admin, &project_ids);

    round.set_voting_period(&created_round.id, &admin, &get_ledger_second_as_millis(&env), &(get_ledger_second_as_millis(&env)+1000));

    let voter = Address::generate(&env);
    let voter2 = Address::generate(&env);
    let cindy = Address::generate(&env);

    let voter_pairs = round.get_pairs_to_vote(&created_round.id);
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

    round.deposit_to_round(&created_round.id, &cindy, &(deposit / 2), &None, &None);

    round.vote(&created_round.id, &voter, &picks);

    let voter_pairs2 = round.get_pairs_to_vote(&created_round.id);
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

    let results = round.get_voting_results_for_round(&created_round.id);
    assert_eq!(results.len(), 4);

    round.set_voting_period(&created_round.id, &admin, &0, &0);

    let mut payouts: Vec<PayoutInput> = Vec::new(&env);

    payouts.push_back(PayoutInput {
        recipient_id: projects.get(0).unwrap().owner,
        amount: (deposit / 2).try_into().unwrap(),
        memo: String::from_str(&env, "payout"),
    });

    round.set_payouts(&created_round.id, &admin, &payouts, &false);

    for payout in payouts.iter() {
       list_contract.register_batch(&payout.recipient_id, &1, &Some(String::from_str(&env, "Test")), &None);
    }

    let payout_balance = token_contract.balance(&projects.get(0).unwrap().owner);
    round.process_payouts(&created_round.id, &admin);
    let new_payout_balance = token_contract.balance(&projects.get(0).unwrap().owner);

    assert!(new_payout_balance > payout_balance);

    let payouts = round.get_payouts_for_round(&created_round.id, &None, &None);
    assert_eq!(payouts.is_empty(), false);
}

/**
 * Note:
 * Don't change this test, it's a critical test for pairs
 * posibilities = (num_of_projects * (num_of_projects - 1))/num_of_project_per_pair
 * expected_generated_pairs_per_project = num_of_projects - 1
 * to allow duplicate pairs eg. A B and B A, we need to change the logic of the test
 *
 * Test case:
 * 1. Create a round
 * 2. Add approved projects
 * 3. Get all pairs
 * 4. Check the correctness of the pairs
 * 5. Check the uniqueness of the pairs
 */
#[test]
fn test_get_all_pairs() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    generate_fake_project(&env, &project_contract, 10);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: None,
        application_end_ms: None,
        expected_amount: 5,
        admins: admins.clone(),
        use_whitelist: Some(false),
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: false,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

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

    let pairs = round.get_all_pairs_for_round(&created_round.id);
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

/*
Test case:
1. Create a round
2. Change the number of votes
*/
#[test]
fn test_change_number_of_votes() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_num_picks_per_voter = 3;
    round.set_number_of_votes(&created_round.id, &admin, &new_num_picks_per_voter);

    let round_info = round.get_round(&created_round.id);
    assert_eq!(round_info.num_picks_per_voter, new_num_picks_per_voter);
}

/*
Test case:
1. Create a round
2. Change amount of expected amount
*/
#[test]
fn test_change_amount() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_amount = 10;
    round.set_expected_amount(&created_round.id, &admin, &new_amount);

    let round_info = round.get_round(&created_round.id);
    assert_eq!(round_info.expected_amount, new_amount);
}

/*
Test case:
1. Create a round
2. Change the voting period
*/
#[test]
fn test_set_voting_period() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_start_ms = get_ledger_second_as_millis(&env) + 1000;
    let new_end_ms = get_ledger_second_as_millis(&env) + 2000;
    round.set_voting_period(&created_round.id, &admin, &new_start_ms, &new_end_ms);

    let round_info = round.get_round(&created_round.id);
    assert_eq!(round_info.voting_start_ms, new_start_ms);
    assert_eq!(round_info.voting_end_ms, new_end_ms);
}

/*
Test case:
1. Create a round
2. Change application period
*/
#[test]
fn test_application_period() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_application_start_ms = get_ledger_second_as_millis(&env) + 1000;
    let new_application_end_ms = get_ledger_second_as_millis(&env) + 2000;
    round.set_applications_config(
        &created_round.id,
        &admin,
        &true,
        &Some(new_application_start_ms),
        &Some(new_application_end_ms),
    );

    let round_info = round.get_round(&created_round.id);
    assert_eq!(
        round_info.application_start_ms.unwrap(),
        new_application_start_ms
    );
    assert_eq!(
        round_info.application_end_ms.unwrap(),
        new_application_end_ms
    );
}

/*
Test case:
1. Create a round
2. Update the round
*/
#[test]
fn test_update_round() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_round_detail = UpdateRoundParams {
        name: String::from_str(&env, "new_name"),
        description: String::from_str(&env, "new_description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 30000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env) + 9000),
        expected_amount: 1000000,
        use_whitelist: Some(false),
        wl_list_id: None,
        use_vault: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(100),
        allow_applications: true,
    };

    let updated_round = round.update_round(&admin, &created_round.id, &new_round_detail);
    assert!(created_round.name != updated_round.name);
    assert!(created_round.description != updated_round.description);
    assert!(created_round.max_participants != updated_round.max_participants);
    assert!(created_round.expected_amount != updated_round.expected_amount);
}

/*
Test case:
1. Create a round
2. Change allow applications
*/
#[test]
fn test_change_allow_applications() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
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
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_allow_applications = false;
    round.set_applications_config(
        &created_round.id,
        &admin,
        &new_allow_applications,
        &None,
        &None,
    );

    let round_info = round.get_round(&created_round.id);
    assert_eq!(round_info.allow_applications, new_allow_applications);
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Get applications for the round
4. Unapply from the round
*/
#[test]
fn test_unapply_from_round() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        name: String::from_str(&env, "name"),
        description: String::from_str(&env, "description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 300000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env)),
        expected_amount: 10 * 10u128.pow(7),
        admins: admins.clone(),
        use_whitelist: Some(false),
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let new_application = round.apply_to_round(
        &created_round.id,
        &projects.get(0).unwrap().owner,
        &None,
        &None,
        &None,
    );
    let check_applications = round.get_applications_for_round(&created_round.id, &None, &None);
    assert!(new_application.applicant_id == check_applications.get(0).unwrap().applicant_id);
    round.unapply_from_round(&created_round.id, &projects.get(0).unwrap().owner, &None);
    let post_check_applications = round.get_applications_for_round(&created_round.id, &None, &None);
    assert!(post_check_applications.is_empty());
}

/*
Test case:
1. Create a round
2. Apply to the round in batch
*/
#[test]
fn test_apply_to_round_batch() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let round_detail = &CreateRoundParams {
        name: String::from_str(&env, "name"),
        description: String::from_str(&env, "description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: get_ledger_second_as_millis(&env) + 10000,
        voting_end_ms: get_ledger_second_as_millis(&env) + 300000,
        application_start_ms: Some(get_ledger_second_as_millis(&env)),
        application_end_ms: Some(get_ledger_second_as_millis(&env)),
        expected_amount: 10 * 10u128.pow(7),
        admins: admins.clone(),
        use_whitelist: Some(false),
        wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: None,
        use_vault: None,
    };

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, &round_detail);
    let mut applicants: Vec<Address> = Vec::new(&env);
    for i in 0..5 {
        applicants.push_back(projects.get(i).unwrap().owner);
    }
    let new_applications =
        round.apply_to_round_batch(&admin, &created_round.id, &Vec::new(&env), &applicants);
    let check_applications = round.get_applications_for_round(&created_round.id, &None, &None);
    assert_eq!(new_applications.len(), check_applications.len());
}

/*
Test case:
1. Create contract
2. Change round contract config
*/
#[test]
fn test_change_round_contract_config() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &1,
        &None,
        &None,
        &None,
    );

    let prev_config = round.get_config();

    round.owner_set_default_page_size(&5);
    round.owner_set_protocol_fee_config(&Some(treasury.clone()), &Some(2000));

    let new_config = round.get_config();

    assert_eq!(prev_config.default_page_size, 10);
    assert_eq!(prev_config.protocol_fee_basis_points, 0);
    assert_eq!(prev_config.protocol_fee_recipient, admin);

    assert_eq!(new_config.default_page_size, 5);
    assert_eq!(new_config.protocol_fee_basis_points, 2000);
    assert_eq!(new_config.protocol_fee_recipient, treasury);
}
