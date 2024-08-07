use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env, Map};

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
