use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Address, Env};

pub fn write_token_address(env: &Env, token_address: &Address) {
    env.storage()
        .persistent()
        .set(&ContractKey::TokenContract, token_address);
}

pub fn read_token_address(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&ContractKey::TokenContract)
        .unwrap()
}
