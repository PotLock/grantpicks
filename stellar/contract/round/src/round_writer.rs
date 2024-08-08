use soroban_sdk::Env;

use crate::{data_type::RoundDetail, storage_key::ContractKey};

pub fn write_round_info(env: &Env, round_id: u128, round_info: &RoundDetail) {
    let key = ContractKey::RoundInfo(round_id);
    env.storage().persistent().set(&key, round_info);
}

pub fn read_round_info(env: &Env, round_id: u128) -> RoundDetail {
    let key = ContractKey::RoundInfo(round_id);
    env.storage().persistent().get(&key).unwrap()
}

pub fn is_initialized(env: &Env) -> bool {
    let key = ContractKey::FactoryOwner;
    env.storage().persistent().has(&key)
}

pub fn read_round_number(env: &Env) -> u128 {
    env.storage()
        .persistent()
        .get(&ContractKey::NextRoundId)
        .unwrap_or_default()
}

pub fn write_round_number(env: &Env, round_number: u128) {
    env.storage()
        .persistent()
        .set(&ContractKey::NextRoundId, &round_number);
}

pub fn increment_round_number(env: &Env) -> u128 {
    let round_number = read_round_number(env) + 1;
    write_round_number(env, round_number);
    round_number
}
