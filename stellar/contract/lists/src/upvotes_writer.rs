use soroban_sdk::{Address, Env, Map, Vec};

use crate::storage_key::ContractKey;

pub fn read_list_upvotes(env: &Env, list_id: u128) -> Vec<Address> {
   let key = ContractKey::Upvotes(list_id);
    match env.storage().persistent().get(&key) {
        Some(list_upvotes) => list_upvotes,
        None => Vec::new(env),
    }
}

pub fn add_upvote_to_list(env: &Env, list_id: u128, voter: Address) {
    let key = ContractKey::Upvotes(list_id);
    let mut list_upvotes = read_list_upvotes(env, list_id);
    list_upvotes.push_back(voter);
    env.storage().persistent().set(&key, &list_upvotes);
}

pub fn remove_upvote_from_list(env: &Env, list_id: u128, voter: &Address) {
    let key = ContractKey::Upvotes(list_id);
    let mut list_upvotes = read_list_upvotes(env, list_id);
    let index = list_upvotes.first_index_of(voter.clone()).unwrap();
    list_upvotes.remove(index as u32);
    env.storage().persistent().set(&key, &list_upvotes);
}

pub fn read_user_upvoted_lists(env: &Env, user: &Address) -> Vec<u128> {
    let key = ContractKey::UserUpvotes(user.clone());
    match env.storage().persistent().get(&key) {
        Some(user_upvotes) => user_upvotes,
        None => Vec::new(env),
    }
}

pub fn add_upvoted_list_to_user(env: &Env, user: Address, list_id: u128) {
    let key = ContractKey::UserUpvotes(user.clone());
    let mut user_upvotes = read_user_upvoted_lists(env, &user);
    user_upvotes.push_back(list_id);
    env.storage().persistent().set(&key, &user_upvotes);
}

pub fn remove_upvoted_list_from_user(env: &Env, user: Address, list_id: u128) {
    let key = ContractKey::UserUpvotes(user.clone());
    let mut user_upvotes = read_user_upvoted_lists(env, &user);
    let index = user_upvotes.first_index_of(list_id).unwrap();
    user_upvotes.remove(index as u32);
    env.storage().persistent().set(&key, &user_upvotes);
}

pub fn clear_upvotes_for_list(env: &Env, list_id: u128) {
    let key = ContractKey::Upvotes(list_id);
    env.storage().persistent().remove(&key);
}
