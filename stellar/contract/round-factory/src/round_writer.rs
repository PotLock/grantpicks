use crate::{data_type::{RoundInfo, RoundInfoWithDetail}, external::RoundClient, storage_key::ContractKey};
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

pub fn find_round(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundInfoWithDetail> {
    let rounds = read_round(env);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(5).try_into().unwrap();

    assert!(limit <= 10, "limit should be less than or equal to 10");

    let mut found_rounds: Vec<RoundInfoWithDetail> = Vec::new(env);

    rounds.iter().skip(skip).take(limit).for_each(|round| {
        let client = RoundClient::new(env, &round.contract_address);
        let detail = client.round_info();
        
        found_rounds.push_back(RoundInfoWithDetail{
            round_id: round.round_id,
            contract_address: round.contract_address,
            detail,
        });
    });

    found_rounds
}
