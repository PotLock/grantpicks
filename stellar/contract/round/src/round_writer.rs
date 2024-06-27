use loam_sdk::soroban_sdk::Env;

use crate::{data_type::RoundDetail, storage_key::ContractKey};

pub fn write_round_info(env: &Env, round_info: &RoundDetail) {
    env.storage()
        .persistent()
        .set(&ContractKey::RoundInfo, round_info);
}

pub fn read_round_info(env: &Env) -> RoundDetail {
    env.storage()
        .persistent()
        .get(&ContractKey::RoundInfo)
        .unwrap()
}

pub fn is_initialized(env: &Env) -> bool {
    let key = ContractKey::RoundInfo;
    env.storage().persistent().has(&key)
}
