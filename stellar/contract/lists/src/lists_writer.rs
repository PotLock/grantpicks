use crate::{data_type::ListInternal, storage_key::ContractKey};
use soroban_sdk::{Address, Env, Map, Vec};

pub fn read_lists_number(env: &Env) -> u128 {
    let key = ContractKey::ListsNumber;
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn write_lists_number(env: &Env, value: u128) {
    let key = ContractKey::ListsNumber;
    env.storage().persistent().set(&key, &value);
}

pub fn increment_lists_number(env: &Env) -> u128 {
    let value = read_lists_number(env);
    let next_id = value + 1;
    write_lists_number(env, next_id);
    next_id
}

pub fn add_list(env: &Env, list_id: u128, list: ListInternal) {
    let key = ContractKey::Lists(list_id);
    env.storage().persistent().set(&key, &list);
}

pub fn get_list_by_id(env: &Env, list_id: u128) -> Option<ListInternal> {
    let key = ContractKey::Lists(list_id);
    env.storage().persistent().get(&key)
}

pub fn remove_list(env: &Env, list_id: u128) {
    let key = ContractKey::Lists(list_id);
    env.storage().persistent().remove(&key);
}

pub fn read_lists_owned_by(env: &Env, owner: &Address) -> Vec<u128> {
    let key = ContractKey::OwnedList(owner.clone());
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_list_to_owned_list(env: &Env, owner: &Address, list_id: u128) {
    let key = ContractKey::OwnedList(owner.clone());
    let mut owned_list = read_lists_owned_by(env, &owner);
    owned_list.push_back(list_id);
    env.storage().persistent().set(&key, &owned_list);
}

pub fn remove_list_from_owned_list(env: &Env, owner: &Address, list_id: u128) {
    let key = ContractKey::OwnedList(owner.clone());
    let mut owned_list = read_lists_owned_by(env, owner);
    let index = owned_list.first_index_of(list_id).unwrap();
    owned_list.remove(index as u32);
    env.storage().persistent().set(&key, &owned_list);
}

pub fn read_list_admins(env: &Env, list_id: u128) -> Vec<Address>{
    let key = ContractKey::ListAdmins(list_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_admin_to_list(env: &Env, list_id: u128, admin: &Address) {
    let key = ContractKey::ListAdmins(list_id);
    let mut list_admins = read_list_admins(env, list_id);
    let index = list_admins.first_index_of(admin);
    if index.is_none() {
        list_admins.push_back(admin.clone());
        env.storage().persistent().set(&key, &list_admins);
    }
}

pub fn remove_admin_from_list(env: &Env, list_id: u128, admin: Address) {
    let key = ContractKey::ListAdmins(list_id);
    let mut list_admins = read_list_admins(env, list_id);
    let index = list_admins.first_index_of(&admin).unwrap();
    list_admins.remove(index as u32);
    env.storage().persistent().set(&key, &list_admins);
}

pub fn clear_admins(env: &Env, list_id: u128) {
    let key = ContractKey::ListAdmins(list_id);
    env.storage().persistent().remove(&key);
}

pub fn get_lists_registered_by(env: &Env, registrant: &Address) -> Vec<u128> {
    let key = ContractKey::RegistrantList(registrant.clone());
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_list_to_registrant_lists(env: &Env, registrant: Address, list_id: u128) {
    let key = ContractKey::RegistrantList(registrant.clone());
    let mut registrant_lists = get_lists_registered_by(env, &registrant);
    registrant_lists.push_back(list_id);
    env.storage().persistent().set(&key, &registrant_lists);
}

pub fn remove_list_to_registrant_lists(env: &Env, registrant: Address, list_id: u128) {
    let key = ContractKey::RegistrantList(registrant.clone());
    let mut registrant_lists = get_lists_registered_by(env, &registrant);
    let index = registrant_lists.first_index_of(list_id).unwrap();
    registrant_lists.remove(index as u32);
    env.storage().persistent().set(&key, &registrant_lists);
}
