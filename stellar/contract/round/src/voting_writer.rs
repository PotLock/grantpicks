use soroban_sdk::{Address, Env, Map, Vec};

use crate::{data_type::VotingResult, storage_key::ContractKey, utils::get_storage};

pub fn read_voting_state(env: &Env, round_id: u128) -> Map<Address, u32> {
    let key = ContractKey::VotingState(round_id);
    match get_storage(env).get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_voting_state(env: &Env, round_id: u128, voting_state: &Map<Address, u32>) {
    let key = ContractKey::VotingState(round_id);
    get_storage(env).set(&key, voting_state);
}

pub fn set_voting_state(env: &Env, round_id: u128, voter: Address, state: u32) {
    let mut voting_state = read_voting_state(env, round_id);
    voting_state.set(voter, state);
    write_voting_state(env, round_id, &voting_state);
}

pub fn get_voting_state_done(env: &Env, round_id: u128, voter: Address) -> bool {
    let voting_state = read_voting_state(env, round_id);
    voting_state.contains_key(voter)
}

pub fn get_voting_state(env: &Env, round_id: u128, voter: Address) -> Option<u32> {
  let voting_state = read_voting_state(env, round_id);
  voting_state.get(voter)
}

pub fn read_voting_results(env: &Env, round_id: u128) -> Vec<VotingResult> {
    let key = ContractKey::Votes(round_id);
    match get_storage(env).get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn write_voting_results(env: &Env, round_id: u128, voting_results: &Vec<VotingResult>) {
    let key = ContractKey::Votes(round_id);
    get_storage(env).set(&key, voting_results);
}

pub fn find_voting_result(
    env: &Env,
    round_id: u128,
    skip: Option<u64>,
    limit: Option<u64>,
) -> Vec<VotingResult> {
    let voting_results = read_voting_results(env, round_id);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");
    let mut results: Vec<VotingResult> = Vec::new(env);
  
    voting_results
        .iter()
        .skip(skip)
        .take(limit)
        .for_each(|result| {
            results.push_back(result);
        });

    results
}

// pub fn add_voting_result(env: &Env, round_id: u128, voting_result: VotingResult) {
//     let mut voting_results = read_voting_results(env, round_id);
//     voting_results.push_back(voting_result);
//     write_voting_results(env, round_id, &voting_results);
// }

pub fn read_voting_count(env: &Env, round_id: u128) -> Map<u128, u128> {
    let key = ContractKey::ProjectVotingCount(round_id);
    match get_storage(env).get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_voting_count(env: &Env, round_id: u128, voting_count: &Map<u128, u128>) {
    let key = ContractKey::ProjectVotingCount(round_id);
    get_storage(env).set(&key, voting_count);
}

pub fn get_voting_count(env: &Env, round_id: u128, project_id: u128) -> u128 {
    let voting_count = read_voting_count(env, round_id);
    voting_count.get(project_id).unwrap_or(0)
}
