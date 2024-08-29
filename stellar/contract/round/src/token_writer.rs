use crate::{storage_key::ContractKey, utils::get_storage};
use soroban_sdk::{Address, Env};

pub fn write_token_address(env: &Env, token_address: &Address) {
    get_storage(env)
        .set(&ContractKey::TokenContract, token_address);
}

pub fn read_token_address(env: &Env) -> Address {
    get_storage(env)
        .get(&ContractKey::TokenContract)
        .unwrap()
}
