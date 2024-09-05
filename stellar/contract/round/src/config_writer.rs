use soroban_sdk::Env;

use crate::{data_type::Config, storage_key::ContractKey, utils::get_storage};

pub fn write_config(env: &Env, config: &Config) {
    let key = ContractKey::Config;
    get_storage(env).set(&key, config);
}

pub fn read_config(env: &Env) -> Config {
    let key = ContractKey::Config;
    get_storage(env).get(&key).unwrap()
}