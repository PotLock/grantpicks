use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env, Map};

pub fn read_voters(env: &Env, round_id: u128) -> Map<Address, bool> {
    let key = ContractKey::WhitelistAndBlacklist(round_id);
    match env.storage().persistent().get(&key) {
        Some(voters) => voters,
        None => Map::new(env),
    }
}

pub fn write_voters(env: &Env, round_id: u128, voters: &Map<Address, bool>) {
    let key = ContractKey::WhitelistAndBlacklist(round_id);
    env.storage().persistent().set(&key, voters);
}

pub fn add_to_white_list(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_voters(env, round_id);
    voters.set(voter, true);
    write_voters(env, round_id, &voters);
}

pub fn remove_from_white_list(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_voters(env, round_id);
    voters.remove_unchecked(voter);
}

pub fn is_white_listed(env: &Env, round_id: u128, voter: Address) -> bool {
    let voters = read_voters(env, round_id);
    voters.get(voter).unwrap_or(false)
}

pub fn add_to_black_list(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_voters(env, round_id);
    voters.set(voter, false);
    write_voters(env, round_id, &voters);
}

pub fn remove_from_black_list(env: &Env, round_id: u128, voter: Address) {
    let mut voters = read_voters(env, round_id);
    voters.remove_unchecked(voter);
    write_voters(env, round_id, &voters);
}

pub fn is_black_listed(env: &Env, round_id: u128, voter: Address) -> bool {
    let voters = read_voters(env, round_id);
    let has_key = voters.contains_key(voter.clone());

    if has_key {
        !voters.get(voter).unwrap()
    } else {
        false
    }
}
