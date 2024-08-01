use soroban_sdk::{Address, BytesN, Env, Vec};

use crate::data_type::{Config, CreateRoundParams, RoundDetail};

pub trait RoundCreator {
    fn initialize(env: &Env, caller: Address, token_address: Address, registry_address: Address, fee_basis_points: Option<u32>,fee_address: Option<Address>);
    fn create_round(env: &Env, caller: Address, params: CreateRoundParams) -> RoundDetail;
    fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail>;
    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>);
    fn transfer_ownership(env: &Env, new_owner: Address);
    fn get_config(env: &Env) -> Config;
}
