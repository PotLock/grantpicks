use soroban_sdk::Env;

use crate::{storage_key::ContractKey, utils::get_storage};

pub fn read_default_page_size(env: &Env) -> u64 {
    get_storage(env)
        .get(&ContractKey::DefaultPageSize)
        .unwrap()
}

pub fn write_default_page_size(env: &Env, page_size: u64) {
    get_storage(env)
        .set(&ContractKey::DefaultPageSize, &page_size);
}
