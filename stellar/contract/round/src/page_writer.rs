use soroban_sdk::Env;

use crate::storage_key::ContractKey;

pub fn read_default_page_size(env: &Env) -> u64 {
    env.storage()
        .persistent()
        .get(&ContractKey::DefaultPageSize)
        .unwrap()
}

pub fn write_default_page_size(env: &Env, page_size: u64) {
    env.storage()
        .persistent()
        .set(&ContractKey::DefaultPageSize, &page_size);
}
