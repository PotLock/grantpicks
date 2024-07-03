use loam_sdk::soroban_sdk::{self, contract, contractimpl, Address, BytesN, Env, Vec};

use crate::{
    admin_writer::{add_admin, read_admins, read_owner, remove_admin, write_owner},
    data_type::{CreateRoundParams, RoundInfo},
    events::log_create_round_contract_event,
    methods::RoundFactoryTrait,
    project_registry_writer::{read_project_contract, write_project_contract},
    round_writer::{add_round, find_round, increment_round_number},
    storage::extend_instance,
    token_writer::{read_token_address, write_token_address},
    wasm_writer::{read_wasm_hash, write_wasm_hash},
};
loam_sdk::import_contract!(round);

#[contract]
pub struct RoundFactory;

#[contractimpl]
impl RoundFactoryTrait for RoundFactory {
    fn init(env: &Env, owner: Address, token_address: Address, registry_address: Address) {
        write_owner(env, &owner);
        let wasm_hash = env.deployer().upload_contract_wasm(round::WASM);
        write_wasm_hash(env, &wasm_hash);
        write_token_address(env, &token_address);
        write_project_contract(env, &registry_address);
    }

    fn create_round(env: &Env, admin: Address, params: CreateRoundParams) -> RoundInfo {
        admin.require_auth();

        let contract_owner = read_owner(env);
        if contract_owner != admin {
            let admins = read_admins(env);
            let is_admin = admins.first_index_of(admin.clone());
            assert!(
                is_admin.is_some(),
                "Only the contract owner or admin can create a round"
            );
        }

        assert!(
            params.start_time < params.end_time,
            "Round start time must be less than round end time"
        );

        assert!(
            params.application_start_time <= params.application_end_time,
            "Round application start time must be less than round application end time"
        );

        assert!(
            params.start_time >= params.application_end_time,
            "Round start time must be greater than or equal round application end time"
        );
        assert!(params.amount > 0, "Amount must be greater than 0");
        assert!(!params.admins.is_empty(), "Round admins must not empty");
        assert!(params.admins.len() < 5, "Round admins must be less than 5");
        assert!(params.contact.len() <= 10, "Contact must be less than 10");
        assert!(
            params.image_url.len() <= 200,
            "Image URL must be less than 200 characters. Use IPFS Hash Only"
        );

        let round_id = increment_round_number(env);
        let wasm_hash = read_wasm_hash(env);
        let contract_address = env.current_contract_address();
        let salt = BytesN::from_array(env, &[u8::try_from(round_id).expect("Overflow"); 32]);

        let deployed_address = env
            .deployer()
            .with_address(contract_address, salt)
            .deploy(wasm_hash);

        let round_client = round::Client::new(env, &deployed_address);
        let token_address = read_token_address(env);
        let registry_address = read_project_contract(env);

        let mut contacts: Vec<round::Contact> = Vec::new(env);
        for contact in params.contact {
            contacts.push_back(round::Contact {
                name: contact.name,
                value: contact.value,
            });
        }

        round_client.init(
            &admin,
            &token_address,
            &registry_address,
            &round::CreateRoundParams {
                id: round_id,
                name: params.name,
                description: params.description,
                image_url: params.image_url,
                contact: contacts,
                start_time: params.start_time,
                end_time: params.end_time,
                application_start_time: params.application_start_time,
                application_end_time: params.application_end_time,
                amount: params.amount,
                admins: params.admins,
                use_whitelist: params.use_whitelist,
                num_picks_per_voter: params.num_picks_per_voter,
                max_participants: params.max_participants,
            },
        );

        let round_info = RoundInfo {
            contract_address: deployed_address,
            round_id,
        };

        add_round(env, &round_info);
        extend_instance(env);
        log_create_round_contract_event(env, round_info.clone());

        round_info
    }

    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundInfo> {
        let rounds = find_round(env, skip, limit);
        extend_instance(env);

        rounds
    }

    fn add_admin(env: &Env, owner: Address, admin: Address) {
        owner.require_auth();

        let contract_owner = read_owner(env);
        assert!(
            contract_owner == owner,
            "Only the contract owner can add an admin"
        );

        let admins = read_admins(env);
        assert!(admins.len() < 5, "Admins must be less than 5");

        let is_exist = admins.iter().any(|round_admin| round_admin == admin);

        assert!(!is_exist, "Admin already exists");

        add_admin(env, admin);
        extend_instance(env);
    }

    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address) {
        owner.require_auth();

        let contract_owner = read_owner(env);
        assert!(
            contract_owner == owner,
            "Only the contract owner can transfer ownership"
        );

        write_owner(env, &new_owner);
        extend_instance(env);
    }

    fn remove_admin(env: &Env, owner: Address, admin: Address) {
        owner.require_auth();

        let contract_owner = read_owner(env);
        assert!(
            contract_owner == owner,
            "Only the contract owner can remove an admin"
        );

        let is_exist = read_admins(env)
            .iter()
            .any(|round_admin| round_admin == admin);

        assert!(is_exist, "Admin does not exist");

        remove_admin(env, &admin);
        extend_instance(env);
    }

    fn admins(env: &Env) -> Vec<Address> {
        let admins = read_admins(env);
        extend_instance(env);

        admins
    }

    fn owner(env: &Env) -> Address {
        let owner = read_owner(env);
        extend_instance(env);

        owner
    }
}
