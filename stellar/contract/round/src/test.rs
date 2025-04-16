#![cfg(test)]

use list_contract::ListExternal;
use soroban_sdk::testutils::{AuthorizedFunction, AuthorizedInvocation, Ledger};
use soroban_sdk::token::{StellarAssetClient, TokenClient};
use soroban_sdk::xdr::FromXdr;
use soroban_sdk::{self, contracttype, symbol_short, Bytes, FromVal, IntoVal, Map, Symbol, Vec};

use crate::data_type::{
    ApplicationStatus, CreateRoundParams, Pair, PayoutInput, PickedPair, UpdateRoundParams,
};
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::utils::get_ledger_second_as_millis;
use crate::{internal::RoundContract, internal::RoundContractClient};

mod project_registry {
    soroban_sdk::contractimport!(file = "../build/project_registry.wasm",);
}

mod list_contract {
    soroban_sdk::contractimport!(file = "../build/lists.wasm",);
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
    let contract =
        list_contract::Client::new(env, &env.register_contract_wasm(None, list_contract::WASM));

    contract.initialize(&admin);
    create_kyc_list(env, &admin, &contract);

    contract
}

fn create_kyc_list(
    env: &Env,
    owner: &Address,
    list_contract: &list_contract::Client,
) -> ListExternal {
    /*
    for test used default value Approved
     */
    list_contract.create_list(
        owner,
        &String::from_str(&env, "kyc_list"),
        &list_contract::RegistrationStatus::Approved,
        &None,
        &None,
        &None,
        &None,
    )
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
        denomination: String::from_str(&env, "USD"),
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
/**
 * Helper function to create uniform test dates
 * This ensures application period and voting period are consistent across tests
 */
fn create_test_period(env: &Env) -> (u64, u64, u64, u64) {
    let application_start = get_ledger_second_as_millis(env);
    let application_end = application_start + 86400000;
    let voting_start = application_end; // Start voting immediately after application ends
    let voting_end = voting_start + 86400000;

    (application_start, application_end, voting_start, voting_end)
}
/*
Test case:
1. Create a round
2. Get the round and admins
*/
#[test]
fn test_round_create() {
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);

    let round_info = round.get_round(&created_round.id);
    let admins = round.admins(&created_round.id);
    assert_eq!(round_info.expected_amount, 5);
    assert_eq!(admins, admins);
    assert_eq!(round_info.owner, admin);
    assert_eq!(round_info.use_whitelist_voting, false);
    assert_eq!(round_info.use_whitelist_application, false);
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
    env.budget().reset_unlimited();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);

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
    env.budget().reset_unlimited();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
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
    env.budget().reset_unlimited();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);

    let application_wl_list = list_contract.create_list(
        &admin,
        &String::from_str(&env, "application_wl"),
        &list_contract::RegistrationStatus::Approved,
        &None,
        &None,
        &None,
        &None,
    );

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(true),
        use_whitelist_application: Some(true),
        voting_wl_list_id: Some(1),
        application_wl_list_id: Some(application_wl_list.id),
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
        &Some(1),
        &Some(2),
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
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
4. Vote for the project using unwhitelisted voter
5. Vote tx should panic
*/
#[test]
#[should_panic]
fn test_unwhitelisted_voters_should_panic() {
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    // let application_wl_list = list_contract.create_list(&admin, &String::from_str(&env, "application_wl"), &list_contract::RegistrationStatus::Approved, &None, &None, &None, &None);

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(true),
        use_whitelist_application: Some(false),
        voting_wl_list_id: Some(1),
        application_wl_list_id: None,
        num_picks_per_voter: Some(1),
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
        &Some(1), // use kyc list that was created with contract
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    // let project_id = 1;
    // let applicant = Address::generate(&env);
    // list_contract.register_batch(&applicant, &application_wl_list.id, &None, &None);

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
    let pair_to_vote = round.get_pairs_to_vote(&created_round.id);
    // list_contract.register_batch(&voter, &1, &Some(String::from_str(&env, "Test")), &None);
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(0).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(0).unwrap().projects.get(0).unwrap(),
    });
    let mut ledger = env.ledger().get();
    ledger.timestamp = 90000;
    env.ledger().set(ledger);
    round.vote(&created_round.id, &voter, &picks);

    let whitelisted = list_contract.is_registered(
        &1,
        &voter,
        &Some(list_contract::RegistrationStatus::Approved),
    );

    assert_eq!(whitelisted, true);
}

/*
Test case:
1. Create a round
2. Apply to the round
3. Review the application
4. whitelist the voter
5. Vote for the project using whitelisted voter
*/
#[test]
fn test_whitelisted_voter_can_vote() {
    extern crate std;
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    // let application_wl_list = list_contract.create_list(&admin, &String::from_str(&env, "application_wl"), &list_contract::RegistrationStatus::Approved, &None, &None, &None, &None);

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(true),
        use_whitelist_application: Some(false),
        voting_wl_list_id: Some(1),
        application_wl_list_id: None,
        num_picks_per_voter: Some(1),
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
        &Some(1), // use kyc list that was created with contract
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    // let project_id = 1;
    // let applicant = Address::generate(&env);
    // list_contract.register_batch(&applicant, &application_wl_list.id, &None, &None);

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
    let pair_to_vote = round.get_pairs_to_vote(&created_round.id);
    list_contract.register_batch(&voter, &1, &Some(String::from_str(&env, "Test")), &None);
    let mut picks: Vec<PickedPair> = Vec::new(&env);
    picks.push_back(PickedPair {
        pair_id: pair_to_vote.get(0).unwrap().pair_id,
        voted_project_id: pair_to_vote.get(0).unwrap().projects.get(0).unwrap(),
    });
    let mut ledger = env.ledger().get();
    ledger.timestamp = 90000;
    env.ledger().set(ledger);
    round.vote(&created_round.id, &voter, &picks);

    let whitelisted = list_contract.is_registered(
        &1,
        &voter,
        &Some(list_contract::RegistrationStatus::Approved),
    );

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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
        num_picks_per_voter: Some(1),
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
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
    let mut ledger = env.ledger().get();
    ledger.timestamp = 90000;
    env.ledger().set(ledger);
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 4);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);

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
        &projects.get(3).unwrap().owner,
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
    let mut ledger = env.ledger().get();
    ledger.timestamp = 90000;
    env.ledger().set(ledger);
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let roby = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(roby.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + 86400000;

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
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
    env.budget().reset_unlimited();
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

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 10 * deposit,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);

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

    // let vote_start = application_end + 10000;

    // round.set_voting_period(
    //     &created_round.id,
    //     &admin,
    //     &vote_start,
    //     &(vote_start + 86400000),
    // );

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

    let mut ledger = env.ledger().get();
    ledger.timestamp = 90000;
    env.ledger().set(ledger.clone());

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

    // round.set_voting_period(&created_round.id, &admin, &0, &0);

    let mut payouts: Vec<PayoutInput> = Vec::new(&env);

    payouts.push_back(PayoutInput {
        recipient_id: projects.get(0).unwrap().owner,
        amount: (deposit / 2).try_into().unwrap(),
        memo: String::from_str(&env, "payout"),
    });

    ledger.timestamp = 190000;
    env.ledger().set(ledger);

    round.set_payouts(&created_round.id, &admin, &payouts, &false);

    for payout in payouts.iter() {
        list_contract.register_batch(
            &payout.recipient_id,
            &1,
            &Some(String::from_str(&env, "Test")),
            &None,
        );
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    generate_fake_project(&env, &project_contract, 10);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (_, _, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: None,
        application_end_ms: None,
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 4);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + 86400000;

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    let new_num_picks_per_voter = 3;
    let mut project_ids: Vec<u128> = Vec::new(&env);
    for i in 0..4 {
        project_ids.push_back(i + 1);
    }
    round.add_approved_project(&created_round.id, &admin, &project_ids);
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + 86400000;

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + 86400000;

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    let new_start_ms = voting_start + 1;
    let new_end_ms = voting_start + 86400000 + 1;
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + (86400000 * 3);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    let new_application_start_ms = get_ledger_second_as_millis(&env) + 1000;
    let new_application_end_ms = new_application_start_ms + 86400000;
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let application_start = get_ledger_second_as_millis(&env);
    let voting_start = get_ledger_second_as_millis(&env) + 86400000;

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_start + 86400000,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_start + 86400000),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
    let new_round_detail = UpdateRoundParams {
        name: String::from_str(&env, "new_name"),
        description: String::from_str(&env, "new_description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        use_whitelist_voting: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
        use_vault: None,
        referrer_fee_basis_points: Some(500),
        num_picks_per_voter: Some(2),
        max_participants: Some(100),
    };

    let updated_round = round.update_round(&admin, &created_round.id, &new_round_detail);
    assert!(created_round.name != updated_round.name);
    assert!(created_round.description != updated_round.description);
    assert!(created_round.max_participants != updated_round.max_participants);
    // assert!(created_round.expected_amount != updated_round.expected_amount);
}

/*
Test case:
1. Create a round
2. Change allow applications
*/
#[test]
fn test_change_allow_applications() {
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, _token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        name: String::from_str(&env, "name"),
        description: String::from_str(&env, "description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 10 * 10u128.pow(7),
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, _token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);
    let projects = generate_fake_project(&env, &project_contract, 5);
    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        name: String::from_str(&env, "name"),
        description: String::from_str(&env, "description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 10 * 10u128.pow(7),
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
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
    env.budget().reset_unlimited();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let treasury = Address::generate(&env);
    let round = deploy_contract(&env, &admin);
    let (token_contract, _token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &Some(1),
        &None,
        &None,
        &None,
    );

    let prev_config = round.get_config();

    round.owner_set_default_page_size(&5);
    round.owner_set_protocol_fee_config(&Some(treasury.clone()), &Some(500));

    let new_config = round.get_config();

    assert_eq!(prev_config.default_page_size, 10);
    assert_eq!(prev_config.protocol_fee_basis_points, 0);
    assert_eq!(prev_config.protocol_fee_recipient, admin);

    assert_eq!(new_config.default_page_size, 5);
    assert_eq!(new_config.protocol_fee_basis_points, 500);
    assert_eq!(new_config.protocol_fee_recipient, treasury);
}

/*
Test case:
1. Create a round
2. Create payout challenges using non participant address
*/
#[test]
#[should_panic(expected = "74")]
fn test_only_participants_can_challenge() {
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let challenger1 = Address::generate(&env);

    let round = deploy_contract(&env, &admin);
    let token_contract = create_token(&env, &admin).0;
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    // Create round
    let round_detail = &CreateRoundParams {
        description: String::from_str(&env, "description"),
        name: String::from_str(&env, "name"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 5,
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
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
        &Some(1),
        &None,
        &None,
        &None,
    );

    let created_round = round.create_round(&admin, round_detail);

    let reason1 = String::from_str(&env, "Challenge reason 1");

    // Create three challenges
    round.challenge_payouts(&created_round.id, &challenger1, &reason1);

    // Resolve two of the challenges
    // let admin_notes = String::from_str(&env, "Admin notes");
    // round.update_payouts_challenge(
    //     &created_round.id,
    //     &admin,
    //     &challenger1,
    //     &Some(admin_notes.clone()),
    //     &Some(true), // Resolve this challenge
    // );

    // round.update_payouts_challenge(
    //     &created_round.id,
    //     &admin,
    //     &challenger2,
    //     &Some(admin_notes.clone()),
    //     &Some(true),
    // );

    // let challenges_before = round.get_challenges_payout(&created_round.id, &None, &None);
    // assert_eq!(challenges_before.len(), 3);

    // // Count resolved challenges
    // let resolved_count = challenges_before.iter().filter(|c| c.resolved).count();
    // assert_eq!(resolved_count, 2);

    // // Remove resolved challenges
    // round.remove_resolved_challenges(&created_round.id, &admin);

    // let challenges_after = round.get_challenges_payout(&created_round.id, &None, &None);
    // assert_eq!(challenges_after.len(), 1);

    // assert_eq!(challenges_after.get(0).unwrap().challenger_id, challenger3);
    // assert_eq!(challenges_after.get(0).unwrap().resolved, false);

    // // Resolve the last challenge
    // round.update_payouts_challenge(
    //     &created_round.id,
    //     &admin,
    //     &challenger3,
    //     &Some(admin_notes.clone()),
    //     &Some(true),
    // );

    // // Remove all resolved challenges
    // round.remove_resolved_challenges(&created_round.id, &admin);

    // // Verify no challenges remain
    // let final_challenges = round.get_challenges_payout(&created_round.id, &None, &None);
    // assert_eq!(final_challenges.len(), 0);
}

#[test]
fn test_deposit_with_and_without_referrer() {
    let env = Env::default();
    env.budget().reset_unlimited();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let depositor = Address::generate(&env);
    let referrer = Address::generate(&env);

    let round = deploy_contract(&env, &admin);
    let (token_contract, token_admin) = create_token(&env, &admin);
    let project_contract = deploy_registry_contract(&env, &admin);
    let list_contract = deploy_list_contract(&env, &admin);

    round.initialize(
        &admin,
        &token_contract.address,
        &project_contract.address,
        &list_contract.address,
        &Some(1),
        &None,
        &None,
        &None,
    );

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(admin.clone());

    let (application_start, application_end, voting_start, voting_end) = create_test_period(&env);

    let round_detail = &CreateRoundParams {
        name: String::from_str(&env, "name"),
        description: String::from_str(&env, "description"),
        is_video_required: false,
        contacts: Vec::new(&env),
        voting_start_ms: voting_start,
        voting_end_ms: voting_end,
        application_start_ms: Some(application_start),
        application_end_ms: Some(application_end),
        expected_amount: 10 * 10u128.pow(7),
        minimum_deposit: 1,
        admins: admins.clone(),
        use_whitelist_voting: Some(false),
        use_whitelist_application: Some(false),
        voting_wl_list_id: None,
        application_wl_list_id: None,
        num_picks_per_voter: Some(2),
        max_participants: Some(10),
        allow_applications: true,
        owner: admin.clone(),
        cooldown_period_ms: None,
        compliance_req_desc: String::from_str(&env, ""),
        compliance_period_ms: None,
        allow_remaining_dist: false,
        remaining_dist_address: admin.clone(),
        referrer_fee_basis_points: Some(500), // 5% referrer fee
        use_vault: Some(true),
    };

    let created_round = round.create_round(&admin, &round_detail);
    let amount = 1000 * 10u128.pow(7);

    // Test deposit without referrer
    token_admin.mint(&depositor, &(amount as i128));
    token_contract.approve(
        &depositor,
        &round.address,
        &(amount as i128),
        &env.ledger().sequence().saturating_add(300),
    );
    round.deposit_to_round(&created_round.id, &depositor, &amount, &None, &None);

    let deposit_without_referrer = round.get_deposits_for_round(&1, &None, &None);
    let deposit_without_referrer = deposit_without_referrer.first().unwrap();
    assert_eq!(deposit_without_referrer.referrer_fee, 0);
    // assert_eq!(
    //     deposit_without_referrer.net_amount as u128,
    //     amount.saturating_sub(calculate_protocol_fee(&env, amount).unwrap())
    // );

    // assert that referrer balance is 0 before deposit
    let referrer_balance1 = token_contract.balance(&referrer);

    assert_eq!(0, referrer_balance1);
    // Test deposit with referrer
    token_admin.mint(&depositor, &(amount as i128));
    token_contract.approve(
        &depositor,
        &round.address,
        &(amount as i128),
        &env.ledger().sequence().saturating_add(300),
    );
    round.deposit_to_round(
        &created_round.id,
        &depositor,
        &amount,
        &None,
        &Some(referrer.clone()),
    );

    let deposit_with_referrer = round.get_deposits_for_round(&1, &None, &None);
    let deposit_with_referrer = deposit_with_referrer.get(1).unwrap();
    let expected_referrer_fee = (amount * 500) / 10000; // 5% referrer fee
    assert_eq!(
        deposit_with_referrer.referrer_fee as u128,
        expected_referrer_fee
    );
    // assert_eq!(
    //     deposit_with_referrer.net_amount as u128,
    //     amount.saturating_sub(calculate_protocol_fee(&env, amount).unwrap()).saturating_sub(expected_referrer_fee)
    // );

    // Verify referrer received the fee

    let referrer_balance = token_contract.balance(&referrer);
    assert_eq!(referrer_balance as u128, expected_referrer_fee);
}

// commenting out because function names have to be shortened to test, did that locally.
// #[test]
// fn test_two_step_ownership_transfer() {
//     let env = Env::default();
//     env.budget().reset_unlimited();
//     env.mock_all_auths();

//     // Setup initial owner
//     let initial_owner = Address::generate(&env);
//     let round = deploy_contract(&env, &initial_owner);
//     let token_contract = create_token(&env, &initial_owner).0;
//     let project_contract = deploy_registry_contract(&env, &initial_owner);
//     let list_contract = deploy_list_contract(&env, &initial_owner);

//     // Initialize contract
//     round.initialize(
//         &initial_owner,
//         &token_contract.address,
//         &project_contract.address,
//         &list_contract.address,
//         &Some(1),
//         &None,
//         &None,
//         &None,
//         &None,
//     );

//     // Verify initial owner
//     let config = round.get_config();
//     assert_eq!(config.owner, initial_owner);
//     assert_eq!(config.pending_owner, None);

//     // Create new owner address
//     let new_owner = Address::generate(&env);

//     // Transfer ownership (step 1)
//     round.transfer_ownership(&new_owner);

//     // Verify pending owner is set
//     let config = round.get_config();
//     assert_eq!(config.owner, initial_owner);
//     assert_eq!(config.pending_owner, Some(new_owner.clone()));

//     // Accept ownership with correct pending owner (step 2)
//     round.acceptown();

//     assert_eq!(
//         // Get the auths that were seen in the last invocation.
//         env.auths(),
//         [(
//             // Address for which auth is performed
//             new_owner.clone(),
//             AuthorizedInvocation {
//                 // Function that is authorized. Can be a contract function or
//                 // a host function that requires authorization.
//                 function: AuthorizedFunction::Contract((
//                     // Address of the called contract
//                     round.address.clone(),
//                     // Name of the called function
//                     symbol_short!("acceptown"),
//                     // Arguments used to call `increment` (converted to the
//                     // env-managed vector via `into_val`)
//                     ().into_val(&env),
//                 )),
//                 // The contract doesn't call any other contracts that require
//                 // authorization,
//                 sub_invocations: [].to_vec()
//             }
//         )]
//     );

//     // Verify ownership has been transferred
//     let config = round.get_config();
//     assert_eq!(config.owner, new_owner);
//     assert_eq!(config.pending_owner, None);

//     // Test ownership transfer cancellation
//     let another_owner = Address::generate(&env);

//     // Initiate another transfer
//     round.transfer_ownership(&another_owner);

//     // Verify pending owner is set
//     let config = round.get_config();
//     assert_eq!(config.owner, new_owner);
//     assert_eq!(config.pending_owner, Some(another_owner.clone()));

//     // Cancel the transfer
//     round.cancel_ownership_transfer();

//     // Verify pending owner is cleared
//     let config = round.get_config();
//     assert_eq!(config.owner, new_owner);
//     assert_eq!(config.pending_owner, None);

// }
