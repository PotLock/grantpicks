use loam_sdk::soroban_sdk::{Address, Env, Map, Vec};

use crate::{data_type::VotingResult, storage_key::ContractKey};

pub fn read_voting_state(env: &Env) -> Map<Address, bool> {
    let key = ContractKey::VotingState;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_voting_state(env: &Env, voting_state: &Map<Address, bool>) {
    let key = ContractKey::VotingState;
    env.storage().persistent().set(&key, voting_state);
}

pub fn set_voting_state(env: &Env, voter: Address, state: bool) {
    let mut voting_state = read_voting_state(env);
    voting_state.set(voter, state);
    write_voting_state(env, &voting_state);
}

pub fn get_voting_state(env: &Env, voter: Address) -> bool {
    let voting_state = read_voting_state(env);
    voting_state.get(voter).unwrap_or(false)
}

pub fn read_voting_results(env: &Env) -> Vec<VotingResult> {
    let key = ContractKey::Votes;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn write_voting_results(env: &Env, voting_results: &Vec<VotingResult>) {
    let key = ContractKey::Votes;
    env.storage().persistent().set(&key, voting_results);
}

pub fn find_voting_result(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<VotingResult> {
    let voting_results = read_voting_results(env);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");
    let mut voting_result: Vec<VotingResult> = Vec::new(env);

    voting_results
        .iter()
        .skip(skip)
        .take(limit)
        .for_each(|result| {
            voting_result.push_back(result);
        });

    voting_result
}

pub fn add_voting_result(env: &Env, voting_result: VotingResult) {
    let mut voting_results = read_voting_results(env);
    voting_results.push_back(voting_result);
    write_voting_results(env, &voting_results);
}

pub fn read_voting_count(env: &Env) -> Map<u128, u128> {
    let key = ContractKey::ProjectVotingCount;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_voting_count(env: &Env, voting_count: &Map<u128, u128>) {
    let key = ContractKey::ProjectVotingCount;
    env.storage().persistent().set(&key, voting_count);
}

pub fn get_voting_count(env: &Env, project_id: u128) -> u128 {
    let voting_count = read_voting_count(env);
    voting_count.get(project_id).unwrap_or(0)
}

pub fn increment_voting_count(env: &Env, project_id: u128) {
    let mut voting_count = read_voting_count(env);
    let count = voting_count.get(project_id).unwrap_or(0);
    voting_count.set(project_id, count + 1);
    write_voting_count(env, &voting_count);
}
