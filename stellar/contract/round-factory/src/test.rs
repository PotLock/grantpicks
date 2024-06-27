#![cfg(test)]

use loam_sdk::soroban_sdk::token::{StellarAssetClient, TokenClient};
use loam_sdk::soroban_sdk::Vec;

use crate::data_type::CreateRoundParams;
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::{internal::RoundFactory, internal::RoundFactoryClient};

loam_sdk::import_contract!(project_registry);
loam_sdk::import_contract!(round);

fn deploy_contract<'a>(env: &Env, _admin: &Address) -> RoundFactoryClient<'a> {
    let contract = RoundFactoryClient::new(env, &env.register_contract(None, RoundFactory {}));

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

fn create_token<'a>(env: &Env, admin: &Address) -> (TokenClient<'a>, StellarAssetClient<'a>) {
    let contract_address = env.register_stellar_asset_contract(admin.clone());
    (
        TokenClient::new(env, &contract_address),
        StellarAssetClient::new(env, &contract_address),
    )
}

#[test]
fn test_create_round() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let registry_contract = deploy_registry_contract(&env, &admin);
    let token = create_token(&env, &admin);
    let (token_client, _) = token;
    let token_address = token_client.address;
    let round_factory = deploy_contract(&env, &admin);

    round_factory.init(&admin, &token_address, &registry_contract.address);

    let mut admins = Vec::new(&env);
    admins.push_back(user1.clone());

    let params = CreateRoundParams {
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

    let round_info = round_factory.create_round(&admin, &params);
    let info = round_factory.get_rounds(&None, &None);
    assert!(info.len() == 1);
    let detail_info = info.get(0).unwrap();

    assert_eq!(detail_info.round_id, 1);
    assert_eq!(detail_info.contract_address, round_info.contract_address);

    let round_client = round::Client::new(&env, &detail_info.contract_address);

    let round = round_client.get_round_info();
    assert_eq!(round.name, params.name);
    assert_eq!(round.start_time, params.start_time);
}

#[test]
fn test_add_remove_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let registry_contract = deploy_registry_contract(&env, &admin);
    let token = create_token(&env, &admin);
    let (token_client, _) = token;
    let token_address = token_client.address;
    let round_factory = deploy_contract(&env, &admin);

    round_factory.init(&admin, &token_address, &registry_contract.address);

    let new_admin = Address::generate(&env);
    round_factory.add_admin(&admin, &new_admin);
    assert_eq!(round_factory.admins().len(), 1);

    round_factory.remove_admin(&admin, &new_admin);
    assert_eq!(round_factory.admins().len(), 0);
}

#[test]
fn transfer_owmership() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let registry_contract = deploy_registry_contract(&env, &admin);
    let token = create_token(&env, &admin);
    let (token_client, _) = token;
    let token_address = token_client.address;
    let round_factory = deploy_contract(&env, &admin);

    round_factory.init(&admin, &token_address, &registry_contract.address);

    assert!(round_factory.owner() == admin);
    let new_admin = Address::generate(&env);
    round_factory.transfer_ownership(&admin, &new_admin);
    assert_eq!(round_factory.owner(), new_admin);
}
