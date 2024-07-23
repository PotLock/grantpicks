use loam_sdk::soroban_sdk::{Address, BytesN, Env, Vec};

use crate::data_type::{CreateRoundParams, RoundDetailExternal};

pub trait RoundFactory {
    fn initialize(env: &Env, owner: Address, token_address: Address, registry_address: Address);
    fn create_round(env: &Env, admin: Address, params: CreateRoundParams) -> RoundDetailExternal;
    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundDetailExternal>;
    fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>);
    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address);
}
