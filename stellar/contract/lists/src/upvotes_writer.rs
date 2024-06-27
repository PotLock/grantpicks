use loam_sdk::soroban_sdk::{Address, Env, Map, Vec};

use crate::storage_key::ContractKey;

pub fn read_upvotes(env: &Env) -> Map<u128, Vec<Address>> {
    let key = ContractKey::Upvotes;
    match env.storage().persistent().get(&key) {
        Some(upvotes) => upvotes,
        None => Map::new(env),
    }
}

pub fn write_upvotes(env: &Env, upvotes: Map<u128, Vec<Address>>) {
    let key = ContractKey::Upvotes;
    env.storage().persistent().set(&key, &upvotes);
}

pub fn read_list_upvotes(env: &Env, list_id: u128) -> Vec<Address> {
    let upvotes = read_upvotes(env);
    match upvotes.get(list_id) {
        Some(list_upvoters) => list_upvoters,
        None => Vec::new(env),
    }
}

pub fn add_upvote_to_list(env: &Env, list_id: u128, voter: Address) {
    let mut upvotes = read_upvotes(env);
    let mut upvoters = read_list_upvotes(env, list_id);
    upvoters.push_back(voter);
    upvotes.set(list_id, upvoters);
    write_upvotes(env, upvotes);
}

pub fn remove_upvote_from_list(env: &Env, list_id: u128, upvoter: Address) {
    let mut upvotes = read_upvotes(env);
    let mut upvoters = read_list_upvotes(env, list_id);
    let index = upvoters.first_index_of(&upvoter).unwrap();
    upvoters.remove(index as u32);
    upvotes.set(list_id, upvoters);
    write_upvotes(env, upvotes);
}

pub fn read_user_upvotes(env: &Env) -> Map<Address, Vec<u128>> {
    let key = ContractKey::UserUpvotes;
    match env.storage().persistent().get(&key) {
        Some(user_upvotes) => user_upvotes,
        None => Map::new(env),
    }
}

pub fn write_user_upvotes(env: &Env, upvoted_list: Map<Address, Vec<u128>>) {
    let key = ContractKey::UserUpvotes;
    env.storage().persistent().set(&key, &upvoted_list);
}

pub fn read_user_upvoted_lists(env: &Env, user: Address) -> Vec<u128> {
    let user_upvotes = read_user_upvotes(env);
    match user_upvotes.get(user) {
        Some(upvoted_lists) => upvoted_lists,
        None => Vec::new(env),
    }
}

pub fn add_upvoted_list_to_user(env: &Env, user: Address, list_id: u128) {
    let mut user_upvotes = read_user_upvotes(env);
    let mut upvoted_lists = read_user_upvoted_lists(env, user.clone());
    upvoted_lists.push_back(list_id);
    user_upvotes.set(user, upvoted_lists);
    write_user_upvotes(env, user_upvotes);
}

pub fn remove_upvoted_list_from_user(env: &Env, user: Address, list_id: u128) {
    let mut user_upvotes = read_user_upvotes(env);
    let mut upvoted_lists = read_user_upvoted_lists(env, user.clone());
    let index = upvoted_lists.first_index_of(&list_id).unwrap();
    upvoted_lists.remove(index as u32);
    user_upvotes.set(user, upvoted_lists);
    write_user_upvotes(env, user_upvotes);
}

pub fn clear_upvotes_for_list(env: &Env, list_id: u128) {
    let mut upvotes = read_upvotes(env);
    upvotes.remove(list_id);
    write_upvotes(env, upvotes);
}
