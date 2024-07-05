use loam_sdk::soroban_sdk::{self, contract, contractimpl, Address, BytesN, Env, Vec};

use crate::{
    admin_writer::{add_admin, read_admins, read_owner, remove_admin, write_owner}, data_type::{CreateRoundParams, RoundInfo, RoundInfoWithDetail}, events::log_create_round_contract_event, external::{RCContact, RCCreateParams, RoundClient}, methods::RoundFactoryTrait, project_registry_writer::{read_project_contract, write_project_contract}, round_writer::{add_round, find_round, increment_round_number}, storage::extend_instance, token_writer::{read_token_address, write_token_address}, validation::{validate_owner, validate_owner_or_admin, validate_round}, wasm_writer::{read_wasm_hash, write_wasm_hash}
};

#[contract]
pub struct RoundFactory;

#[contractimpl]
impl RoundFactoryTrait for RoundFactory {
    fn initialize(
        env: &Env,
        owner: Address,
        token_address: Address,
        registry_address: Address,
        wasm_hash: BytesN<32>,
    ) {
        write_owner(env, &owner);
        write_wasm_hash(env, &wasm_hash);
        write_token_address(env, &token_address);
        write_project_contract(env, &registry_address);
    }

    fn create_round(env: &Env, admin: Address, params: CreateRoundParams) -> RoundInfo {
        admin.require_auth();

        validate_owner_or_admin(env, &admin);
        validate_round(&params);

        let round_id = increment_round_number(env);
        let wasm_hash = read_wasm_hash(env);
        let contract_address = env.current_contract_address();
        let salt = BytesN::from_array(env, &[u8::try_from(round_id).expect("Overflow"); 32]);

        let deployed_address = env
            .deployer()
            .with_address(contract_address, salt)
            .deploy(wasm_hash);

        let round_client = RoundClient::new(env, &deployed_address);
        let token_address = read_token_address(env);
        let registry_address = read_project_contract(env);

        let mut contacts: Vec<RCContact> = Vec::new(env);
        for contact in params.contacts {
            contacts.push_back(RCContact{
                name: contact.name,
                value: contact.value,
            });
        }

        round_client.initialize(
            &admin,
            &token_address,
            &registry_address,
            &RCCreateParams {
                id: round_id,
                name: params.name,
                description: params.description,
                video_url: params.video_url,
                contacts,
                voting_start_ms: params.voting_start_ms,
                voting_end_ms: params.voting_end_ms,
                application_start_ms: params.application_start_ms,
                application_end_ms: params.application_end_ms,
                expected_amount: params.expected_amount,
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

    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundInfoWithDetail> {
        let rounds = find_round(env, skip, limit);
        extend_instance(env);

        rounds
    }

    fn add_admin(env: &Env, owner: Address, admin: Address) {
        owner.require_auth();

        validate_owner(env, &owner);

        let admins = read_admins(env);
        let is_exist = admins.first_index_of(admin.clone()).is_some();

        assert!(!is_exist, "Admin already exists");

        add_admin(env, admin);
        extend_instance(env);
    }

    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address) {
        owner.require_auth();

        validate_owner(env, &owner);

        write_owner(env, &new_owner);
        extend_instance(env);
    }

    fn remove_admin(env: &Env, owner: Address, admin: Address) {
        owner.require_auth();

        validate_owner(env, &owner);

        let is_exist = read_admins(env).first_index_of(admin.clone()).is_some();
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
