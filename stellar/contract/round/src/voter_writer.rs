use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env, Map, Vec};

pub fn read_all_whitelist(env: &Env, round_id: u128) -> Map<Address, bool> {
    let key = ContractKey::WhiteList(round_id);
    match env.storage().persistent().get(&key) {
        Some(voters) => voters,
        None => Map::new(env),
    }
}

pub fn write_all_whitelist(env: &Env, round_id: u128, voters: &Map<Address, bool>) {
    let key = ContractKey::WhiteList(round_id);
    env.storage().persistent().set(&key, voters);
}

pub fn read_all_blacklist(env: &Env, round_id: u128) -> Map<Address, bool> {
    let key = ContractKey::BlackList(round_id);
    match env.storage().persistent().get(&key) {
        Some(voters) => voters,
        None => Map::new(env),
    }
}

pub fn write_all_blacklist(env: &Env, round_id: u128, voters: &Map<Address, bool>) {
    let key = ContractKey::BlackList(round_id);
    env.storage().persistent().set(&key, voters);
}

pub fn add_to_whitelist(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_all_whitelist(env, round_id);
    voters.set(voter, true);
    write_all_whitelist(env, round_id, &voters);
}

pub fn remove_from_whitelist(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_all_whitelist(env, round_id);
    voters.remove_unchecked(voter);
    write_all_whitelist(env, round_id, &voters);
}

pub fn is_whitelisted(env: &Env, round_id: u128, voter: Address) -> bool {
    let voters = read_all_whitelist(env, round_id);
    voters.get(voter).unwrap_or(false)
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

pub fn read_voted_rounds(env: &Env) -> Map<Address, Vec<u128>> {
    let key = ContractKey::VotedRoundIds;
    match env.storage().persistent().get(&key) {
        Some(rounds) => rounds,
        None => Map::new(env),
    }
}

pub fn write_voted_rounds(env: &Env, rounds: &Map<Address, Vec<u128>>) {
    let key = ContractKey::VotedRoundIds;
    env.storage().persistent().set(&key, rounds);
}

pub fn add_voted_round(env: &Env, voter: Address, round_id: u128) {
    let mut rounds = read_voted_rounds(env);
    let voter_rounds = rounds.get(voter.clone()).unwrap_or(Vec::new(env));
    let mut voter_rounds = voter_rounds.clone();
    voter_rounds.push_back(round_id);
    rounds.set(voter, voter_rounds);
    write_voted_rounds(env, &rounds);
}

pub fn get_voted_rounds_for_voter(env: &Env, voter: Address) -> Vec<u128> {
    let rounds = read_voted_rounds(env);
    rounds.get(voter).unwrap_or(Vec::new(env))
}