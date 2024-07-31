use loam_sdk::soroban_sdk::{Env, Map, Vec};

use crate::{data_type::DepositInternal, storage_key::ContractKey};

pub fn read_deposit_id(env: &Env) -> u128 {
    let key = &ContractKey::NextDepositId;
    env.storage().persistent().get(key).unwrap_or(0)
}

pub fn write_deposit_id(env: &Env, next_deposit_id: u128) {
    let key = &ContractKey::NextDepositId;
    env.storage().persistent().set(key, &next_deposit_id);
}

pub fn increment_deposit_id(env: &Env) -> u128 {
    let next_deposit_id = read_deposit_id(env);
    let incremented_deposit_id = next_deposit_id + 1;
    write_deposit_id(env, incremented_deposit_id);
    incremented_deposit_id
}

pub fn write_deposit_info(env: &Env, deposit_info: &Map<u128, DepositInternal>) {
    let key = &ContractKey::DepositInfo;
    env.storage().persistent().set(key, deposit_info);
}

pub fn read_deposit_info(env: &Env) -> Map<u128, DepositInternal> {
    let key = &ContractKey::DepositInfo;
    match env.storage().persistent().get(key) {
        Some(deposit_info) => deposit_info,
        None => Map::new(env),
    }
}

pub fn write_deposit(env: &Env, deposit_id: u128, deposit: &DepositInternal) {
    let mut deposit_info = read_deposit_info(env);
    deposit_info.set(deposit_id, deposit.clone());
    write_deposit_info(env, &deposit_info);
}

pub fn read_deposit(env: &Env, deposit_id: u128) -> Option<DepositInternal> {
    let deposit_info = read_deposit_info(env);
    deposit_info.get(deposit_id)
}

pub fn write_deposit_to_round(env: &Env, round_id: u128, deposit_ids: &Vec<u128>) {
    let key = &ContractKey::Deposit(round_id);
    env.storage().persistent().set(key, deposit_ids);
}

pub fn read_deposit_from_round(env: &Env, round_id: u128) -> Vec<u128> {
    let key = &ContractKey::Deposit(round_id);
    match env.storage().persistent().get(key) {
        Some(deposit_ids) => deposit_ids,
        None => Vec::new(env),
    }
}

pub fn write_deposit_id_to_round(env: &Env, round_id: u128, deposit_id: u128) {
    let mut deposit_ids = read_deposit_from_round(env, round_id);
    deposit_ids.push_back(deposit_id);
    write_deposit_to_round(env, round_id, &deposit_ids);
}
