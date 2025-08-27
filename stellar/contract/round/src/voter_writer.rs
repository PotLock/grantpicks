use crate::{storage_key::ContractKey, utils::get_storage};
use soroban_sdk::{Address, Env, Map, Vec};

pub fn read_all_blacklist(env: &Env, round_id: u128) -> Map<Address, bool> {
    let key = ContractKey::BlackList(round_id);
    match get_storage(env).get(&key) {
        Some(voters) => voters,
        None => Map::new(env),
    }
}

pub fn write_all_blacklist(env: &Env, round_id: u128, voters: &Map<Address, bool>) {
    let key = ContractKey::BlackList(round_id);
    get_storage(env).set(&key, voters);
}

pub fn add_to_blacklist(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_all_blacklist(env, round_id);
    voters.set(voter, false);
    write_all_blacklist(env, round_id, &voters);
}

pub fn remove_from_blacklist(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_all_blacklist(env, round_id);
    voters.remove_unchecked(voter);
    write_all_blacklist(env, round_id, &voters);
}

pub fn is_blacklisted(env: &Env, round_id: u128, voter: Address) -> bool {
    let voters = read_all_blacklist(env, round_id);
    let has_key = voters.contains_key(voter.clone());

    if has_key {
        !voters.get(voter).unwrap()
    } else {
        false
    }
}


pub fn get_voted_rounds_for_voter(env: &Env, voter: Address) -> Vec<u128> {
    read_voter_rounds(env, &voter)
}

pub fn read_voter_rounds(env: &Env, voter: &Address) -> Vec<u128> {
    let key = ContractKey::VotedRoundIds(voter.clone());
    match env.storage().persistent().get(&key) {
        Some(rounds) => rounds,
        None => Vec::new(env),
    }
}

pub fn write_voter_rounds(env: &Env, voter: &Address, rounds: &Vec<u128>) {
    let key = ContractKey::VotedRoundIds(voter.clone());
    env.storage().persistent().set(&key, rounds);
}

pub fn add_voted_round(env: &Env, voter: Address, round_id: u128) {
    let mut rounds = read_voter_rounds(env, &voter);
    rounds.push_back(round_id);
    write_voter_rounds(env, &voter, &rounds);
}

pub fn has_voted(env: &Env, voter: &Address, round_id: u128) -> bool {
    let rounds = read_voter_rounds(env, voter);
    rounds.contains(round_id)
}