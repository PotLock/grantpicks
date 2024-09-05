use soroban_sdk::{Address, Env, Map, Vec};

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

pub fn add_registration(env: &Env, registration_id: u128, registration: RegistrationInternal) {
    let key = ContractKey::Registrations(registration_id);
    env.storage().persistent().set(&key, &registration);
}

pub fn remove_registration(env: &Env, registration_id: u128) {
    let key = ContractKey::Registrations(registration_id);
    env.storage().persistent().remove(&key);
}

pub fn get_registration_by_id(env: &Env, registration_id: u128) -> Option<RegistrationInternal> {
    let key = ContractKey::Registrations(registration_id);
    env.storage().persistent().get(&key)
}

pub fn get_registrations_of_list(env: &Env, list_id: u128) -> Vec<u128> {
    let key = ContractKey::ListRegistration(list_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_registration_to_list(env: &Env, list_id: u128, registration_id: u128) {
    let key = ContractKey::ListRegistration(list_id);
    let mut list_registrations = get_registrations_of_list(env, list_id);
    list_registrations.push_back(registration_id);
    env.storage().persistent().set(&key, &list_registrations);
}

pub fn remove_registration_to_list(env: &Env, list_id: u128, registration_id: u128) {
    let key = ContractKey::ListRegistration(list_id);
    let mut list_registrations = get_registrations_of_list(env, list_id);
    let index = list_registrations.first_index_of(registration_id).unwrap();
    list_registrations.remove(index as u32);
    env.storage().persistent().set(&key, &list_registrations);
}

pub fn get_user_registration_ids_of(env: &Env, user_id: &Address) -> Vec<u128> {
    let key = ContractKey::RegistrationsIDs(user_id.clone());
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_registration_id_to_user(env: &Env, user_id: Address, registration_id: u128) {
    let key = ContractKey::RegistrationsIDs(user_id.clone());
    let mut user_registration_ids = get_user_registration_ids_of(env, &user_id);
    user_registration_ids.push_back(registration_id);
    env.storage().persistent().set(&key, &user_registration_ids);
}

pub fn remove_registration_id_to_user(env: &Env, user_id: Address, registration_id: u128) {
    let key = ContractKey::RegistrationsIDs(user_id.clone());
    let mut user_registration_ids = get_user_registration_ids_of(env, &user_id);
    let index = user_registration_ids.first_index_of(registration_id).unwrap();
    user_registration_ids.remove(index as u32);
    env.storage().persistent().set(&key, &user_registration_ids);
}
