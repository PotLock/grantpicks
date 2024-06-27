use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::Env;

pub fn add_total_funding(env: &Env, funding: u128) {
    let mut total_funding = read_total_funding(env);
    total_funding += funding;
    write_total_funding(env, total_funding);
}

pub fn read_total_funding(env: &Env) -> u128 {
    let key = ContractKey::TotalFunding;
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn write_total_funding(env: &Env, total_funding: u128) {
    let key = ContractKey::TotalFunding;
    env.storage().persistent().set(&key, &total_funding);
}
