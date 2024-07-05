use crate::data_type::{CreateRoundParams, RoundInfo};
use loam_sdk::soroban_sdk::{Address, BytesN, Env, Vec};

pub trait RoundFactoryTrait {
    fn initialize(
        env: &Env,
        owner: Address,
        token_address: Address,
        registry_address: Address,
        wasm_hash: BytesN<32>,
    );
    fn create_round(env: &Env, admin: Address, params: CreateRoundParams) -> RoundInfo;
    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundInfo>;
    fn add_admin(env: &Env, owner: Address, admin: Address);
    fn remove_admin(env: &Env, owner: Address, admin: Address);
    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address);
    fn admins(env: &Env) -> Vec<Address>;
    fn owner(env: &Env) -> Address;
}
