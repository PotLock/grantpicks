use soroban_sdk::{Address, BytesN, Env, Vec};

use crate::data_type::{Config, CreateRoundParams, RoundDetail};

pub trait RoundCreator {
    fn initialize(env: &Env, caller: Address, token_address: Address, registry_address: Address, protocol_fee_basis_points: Option<u32>, protocol_fee_recipient: Option<Address>, default_page_size: Option<u64>);
    fn create_round(env: &Env, caller: Address, params: CreateRoundParams) -> RoundDetail;
    fn get_rounds(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail>;
    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>);
    fn transfer_ownership(env: &Env, new_owner: Address);
    fn owner_set_default_page_size(env: &Env, default_page_size: u64);
    fn owner_set_protocol_fee_config(env: &Env, protocol_fee_recipient: Option<Address>, protocol_fee_basis_points: Option<u32>);
    fn get_config(env: &Env) -> Config;
}
