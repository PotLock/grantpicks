use soroban_sdk::Env;

use crate::{data_type::RoundDetail, storage_key::ContractKey, utils::get_storage};

pub fn write_round_info(env: &Env, round_id: u128, round_info: &RoundDetail) {
    let key = ContractKey::RoundInfo(round_id);
    get_storage(env).set(&key, round_info);
}

pub fn read_round_info(env: &Env, round_id: u128) -> RoundDetail {
    let key = ContractKey::RoundInfo(round_id);
    get_storage(env).get(&key).unwrap()
}

pub fn is_initialized(env: &Env) -> bool {
    let key = ContractKey::Config;
    get_storage(env).has(&key)
}

pub fn read_round_number(env: &Env) -> u128 {
    get_storage(env)
        .get(&ContractKey::NextRoundId)
        .unwrap_or_default()
}

pub fn write_round_number(env: &Env, round_number: u128) {
    get_storage(env)
        .set(&ContractKey::NextRoundId, &round_number);
}

pub fn increment_round_number(env: &Env) -> u128 {
    let round_number = read_round_number(env) + 1;
    write_round_number(env, round_number);
    round_number
}
