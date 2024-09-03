use soroban_sdk::{Env, Vec};

use crate::{data_type::Deposit, storage_key::ContractKey, utils::get_storage};

pub fn read_deposit_id(env: &Env) -> u128 {
    let key = &ContractKey::NextDepositId;
    get_storage(env).get(key).unwrap_or(0)
}

pub fn write_deposit_id(env: &Env, next_deposit_id: u128) {
    let key = &ContractKey::NextDepositId;
    get_storage(env).set(key, &next_deposit_id);
}

pub fn increment_deposit_id(env: &Env) -> u128 {
    let next_deposit_id = read_deposit_id(env);
    let incremented_deposit_id = next_deposit_id + 1;
    write_deposit_id(env, incremented_deposit_id);
    incremented_deposit_id
}

pub fn write_deposit(env: &Env, deposit_id: u128, deposit: &Deposit) {
    let key = &ContractKey::DepositInfo(deposit_id);
    get_storage(env).set(key, deposit);
}

pub fn read_deposit(env: &Env, deposit_id: u128) -> Option<Deposit> {
    let key = &ContractKey::DepositInfo(deposit_id);
    get_storage(env).get(key)
}

pub fn write_deposit_to_round(env: &Env, round_id: u128, deposit_ids: &Vec<u128>) {
    let key = &ContractKey::Deposit(round_id);
    get_storage(env).set(key, deposit_ids);
}

pub fn read_deposit_from_round(env: &Env, round_id: u128) -> Vec<u128> {
    let key = &ContractKey::Deposit(round_id);
    match get_storage(env).get(key) {
        Some(deposit_ids) => deposit_ids,
        None => Vec::new(env),
    }
}

pub fn write_deposit_id_to_round(env: &Env, round_id: u128, deposit_id: u128) {
    let mut deposit_ids = read_deposit_from_round(env, round_id);
    deposit_ids.push_back(deposit_id);
    write_deposit_to_round(env, round_id, &deposit_ids);
}
