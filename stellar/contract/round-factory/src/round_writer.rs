use crate::{data_type::RoundInfo, storage_key::ContractKey};
use loam_sdk::soroban_sdk::{Env, Vec};

pub fn read_round_number(env: &Env) -> u128 {
    let key = ContractKey::RoundNumber;
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn increment_round_number(env: &Env) -> u128 {
    let key = ContractKey::RoundNumber;
    let round_number = read_round_number(env) + 1;
    env.storage().persistent().set(&key, &round_number);
    round_number
}

pub fn read_round(env: &Env) -> Vec<RoundInfo> {
    let key = ContractKey::Rounds;
    match env.storage().persistent().get(&key) {
        Some(rounds) => rounds,
        None => Vec::new(env),
    }
}

pub fn add_round(env: &Env, round: &RoundInfo) {
    let mut rounds = read_round(env);
    rounds.push_back(round.clone());
    let key = ContractKey::Rounds;
    env.storage().persistent().set(&key, &rounds);
}

pub fn find_round(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundInfo> {
    let rounds = read_round(env);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");
    let mut found_rounds: Vec<RoundInfo> = Vec::new(env);

    rounds.iter().skip(skip).take(limit).for_each(|round| {
        found_rounds.push_back(round.clone());
    });

    found_rounds
}
