use loam_sdk::soroban_sdk::{Address, Env, Map, Vec};

use crate::{data_type::RegistrationInternal, storage_key::ContractKey};

pub fn read_registration_number(env: &Env) -> u128 {
    let key = ContractKey::RegistrationsNumber;
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn write_registration_number(env: &Env, value: u128) {
    let key = ContractKey::RegistrationsNumber;
    env.storage().persistent().set(&key, &value);
}

pub fn increment_registration_number(env: &Env) -> u128 {
    let value = read_registration_number(env);
    let next_id = value + 1;
    write_registration_number(env, next_id);
    next_id
}

pub fn read_registrations(env: &Env) -> Map<u128, RegistrationInternal> {
    let key = ContractKey::Registrations;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_registrations(env: &Env, value: &Map<u128, RegistrationInternal>) {
    let key = ContractKey::Registrations;
    env.storage().persistent().set(&key, value);
}

pub fn add_registration(env: &Env, registration_id: u128, registration: RegistrationInternal) {
    let mut registrations = read_registrations(env);
    registrations.set(registration_id, registration);
    write_registrations(env, &registrations);
}

pub fn remove_registration(env: &Env, registration_id: u128) {
    let mut registrations = read_registrations(env);
    registrations.remove(registration_id);
    write_registrations(env, &registrations);
}

pub fn get_registration_by_id(env: &Env, registration_id: u128) -> Option<RegistrationInternal> {
    let registrations = read_registrations(env);
    registrations.get(registration_id)
}

pub fn read_list_registrations(env: &Env) -> Map<u128, Vec<u128>> {
    let key = ContractKey::ListRegistration;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_list_registrations(env: &Env, value: &Map<u128, Vec<u128>>) {
    let key = ContractKey::ListRegistration;
    env.storage().persistent().set(&key, value);
}

pub fn get_registrations_of_list(env: &Env, list_id: u128) -> Vec<u128> {
    let list_registrations = read_list_registrations(env);
    match list_registrations.get(list_id) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_registration_to_list(env: &Env, list_id: u128, registration_id: u128) {
    let mut list_registrations = read_list_registrations(env);
    if let Some(mut value) = list_registrations.get(list_id) {
        value.push_back(registration_id);
        list_registrations.set(list_id, value);
    } else {
        let mut new_list = Vec::new(env);
        new_list.push_back(registration_id);
        list_registrations.set(list_id, new_list);
    }
    write_list_registrations(env, &list_registrations);
}

pub fn remove_registration_to_list(env: &Env, list_id: u128, registration_id: u128) {
    let mut list_registrations = read_list_registrations(env);
    if let Some(mut value) = list_registrations.get(list_id) {
        let index = value.first_index_of(registration_id);
        assert!(
            index.is_some(),
            "Registration ID not found in list's registration list"
        );

        let index_unwrap = index.unwrap();
        value.remove(index_unwrap);
        list_registrations.set(list_id, value);
    }
    write_list_registrations(env, &list_registrations);
}

pub fn read_user_registration_ids(env: &Env) -> Map<Address, Vec<u128>> {
    let key = ContractKey::RegistrationsIDs;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_user_registration_ids(env: &Env, value: &Map<Address, Vec<u128>>) {
    let key = ContractKey::RegistrationsIDs;
    env.storage().persistent().set(&key, value);
}

pub fn get_user_registration_ids_of(env: &Env, user_id: Address) -> Vec<u128> {
    let user_registration_ids = read_user_registration_ids(env);
    match user_registration_ids.get(user_id) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_registration_id_to_user(env: &Env, user_id: Address, registration_id: u128) {
    let mut user_registration_ids = read_user_registration_ids(env);
    if let Some(mut value) = user_registration_ids.get(user_id.clone()) {
        value.push_back(registration_id);
        user_registration_ids.set(user_id, value);
    } else {
        let mut new_list = Vec::new(env);
        new_list.push_back(registration_id);
        user_registration_ids.set(user_id, new_list);
    }
    write_user_registration_ids(env, &user_registration_ids);
}

pub fn remove_registration_id_to_user(env: &Env, user_id: Address, registration_id: u128) {
    let mut user_registration_ids = read_user_registration_ids(env);
    if let Some(mut value) = user_registration_ids.get(user_id.clone()) {
        let index = value.first_index_of(registration_id);
        assert!(
            index.is_some(),
            "Registration ID not found in user's registration list"
        );

        let index_unwrap = index.unwrap();
        value.remove(index_unwrap);
        user_registration_ids.set(user_id, value);
    }
    write_user_registration_ids(env, &user_registration_ids);
}
