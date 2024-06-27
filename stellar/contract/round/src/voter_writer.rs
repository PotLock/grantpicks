use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Address, Env, Map};

pub fn read_voters(env: &Env) -> Map<Address, bool> {
    let key = ContractKey::WhitelistAndBlacklist;
    match env.storage().persistent().get(&key) {
        Some(voters) => voters,
        None => Map::new(env),
    }
}

pub fn add_to_white_list(env: &Env, voter: Address) {
    let mut voters = read_voters(env);
    voters.set(voter, true);
    let key = ContractKey::WhitelistAndBlacklist;
    env.storage().persistent().set(&key, &voters);
}

pub fn remove_from_white_list(env: &Env, voter: Address) {
    let mut voters = read_voters(env);
    voters.remove_unchecked(voter);
    let key = ContractKey::WhitelistAndBlacklist;
    env.storage().persistent().set(&key, &voters);
}

pub fn is_white_listed(env: &Env, voter: Address) -> bool {
    let voters = read_voters(env);
    voters.get(voter).unwrap_or(false)
}

pub fn add_to_black_list(env: &Env, voter: Address) {
    let mut voters = read_voters(env);
    voters.set(voter, false);
    let key = ContractKey::WhitelistAndBlacklist;
    env.storage().persistent().set(&key, &voters);
}

pub fn remove_from_black_list(env: &Env, voter: Address) {
    let mut voters = read_voters(env);
    voters.remove_unchecked(voter);
    let key = ContractKey::WhitelistAndBlacklist;
    env.storage().persistent().set(&key, &voters);
}

pub fn is_black_listed(env: &Env, voter: Address) -> bool {
    let voters = read_voters(env);
    let has_key = voters.contains_key(voter.clone());

    if has_key {
        !voters.get(voter).unwrap()
    } else {
        false
    }
}
