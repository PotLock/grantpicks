use crate::{data_type::ListInternal, storage_key::ContractKey};
use loam_sdk::soroban_sdk::{Address, Env, Map, Vec};

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

pub fn read_lists(env: &Env) -> Map<u128, ListInternal> {
    let key = ContractKey::Lists;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_lists(env: &Env, value: &Map<u128, ListInternal>) {
    let key = ContractKey::Lists;
    env.storage().persistent().set(&key, value);
}

pub fn add_list(env: &Env, list_id: u128, list: ListInternal) {
    let mut lists = read_lists(env);
    lists.set(list_id, list);
    write_lists(env, &lists);
}

pub fn get_list_by_id(env: &Env, list_id: u128) -> Option<ListInternal> {
    let lists = read_lists(env);
    lists.get(list_id)
}

pub fn remove_list(env: &Env, list_id: u128) {
    let mut lists = read_lists(env);
    lists.remove(list_id);
    write_lists(env, &lists);
}

pub fn read_owned_list(env: &Env) -> Map<Address, Vec<u128>> {
    let key = ContractKey::OwnedList;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_owned_list(env: &Env, value: &Map<Address, Vec<u128>>) {
    let key = ContractKey::OwnedList;
    env.storage().persistent().set(&key, value);
}

pub fn read_lists_owned_by(env: &Env, owner: Address) -> Vec<u128> {
    let owned_list = read_owned_list(env);
    match owned_list.get(owner) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_list_to_owned_list(env: &Env, owner: Address, list_id: u128) {
    let mut owned_list = read_owned_list(env);
    let list_owned_by_user = owned_list.get(owner.clone());
    if let Some(mut value) = list_owned_by_user {
        value.push_back(list_id);
        owned_list.set(owner, value);
    } else {
        let mut new_list = Vec::new(env);
        new_list.push_back(list_id);
        owned_list.set(owner, new_list);
    }
    write_owned_list(env, &owned_list);
}

pub fn remove_list_from_owned_list(env: &Env, owner: Address, list_id: u128) {
    let mut owned_list = read_owned_list(env);
    let list_owned_by_user = owned_list.get(owner.clone());
    match list_owned_by_user {
        Some(value) => {
            let mut new_list = Vec::new(env);
            for id in value.iter() {
                if id != list_id {
                    new_list.push_back(id);
                }
            }
            owned_list.set(owner, new_list);
        }
        None => {}
    }
    write_owned_list(env, &owned_list);
}

pub fn read_list_admins(env: &Env) -> Map<u128, Vec<Address>> {
    let key = ContractKey::ListAdmins;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_list_admins(env: &Env, value: &Map<u128, Vec<Address>>) {
    let key = ContractKey::ListAdmins;
    env.storage().persistent().set(&key, value);
}

pub fn read_admins_of_list(env: &Env, list_id: u128) -> Vec<Address> {
    let list_admins = read_list_admins(env);
    match list_admins.get(list_id) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_admin_to_list(env: &Env, list_id: u128, admin: Address) {
    let mut list_admins = read_list_admins(env);
    let admins_of_list = list_admins.get(list_id);
    if let Some(mut value) = admins_of_list {
        value.push_back(admin);
        list_admins.set(list_id, value);
    } else {
        let mut new_list = Vec::new(env);
        new_list.push_back(admin);
        list_admins.set(list_id, new_list);
    }
    write_list_admins(env, &list_admins);
}

pub fn remove_admin_from_list(env: &Env, list_id: u128, admin: Address) {
    let mut list_admins = read_list_admins(env);
    let admins_of_list = list_admins.get(list_id);
    match admins_of_list {
        Some(mut value) => {
            let index = value.first_index_of(admin);
            assert!(index.is_some(), "Admin not found in list admins");
            value.remove(index.unwrap() as u32);
            list_admins.set(list_id, value);
        }
        None => {}
    }
    write_list_admins(env, &list_admins);
}

pub fn clear_admins(env: &Env, list_id: u128) {
    let mut list_admins = read_list_admins(env);
    list_admins.remove(list_id);
    write_list_admins(env, &list_admins);
}

pub fn read_registrant_lists(env: &Env) -> Map<Address, Vec<u128>> {
    let key = ContractKey::RegistrantList;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_registrant_lists(env: &Env, value: &Map<Address, Vec<u128>>) {
    let key = ContractKey::RegistrantList;
    env.storage().persistent().set(&key, value);
}

pub fn get_lists_registered_by(env: &Env, registrant: Address) -> Vec<u128> {
    let registrant_lists = read_registrant_lists(env);
    match registrant_lists.get(registrant) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_list_to_registrant_lists(env: &Env, registrant: Address, list_id: u128) {
    let mut registrant_lists = read_registrant_lists(env);
    let lists_registered_by_user = registrant_lists.get(registrant.clone());
    if let Some(mut value) = lists_registered_by_user {
        value.push_back(list_id);
        registrant_lists.set(registrant, value);
    } else {
        let mut new_list = Vec::new(env);
        new_list.push_back(list_id);
        registrant_lists.set(registrant, new_list);
    }
    write_registrant_lists(env, &registrant_lists);
}

pub fn remove_list_to_registrant_lists(env: &Env, registrant: Address, list_id: u128) {
    let mut registrant_lists = read_registrant_lists(env);
    let lists_registered_by_user = registrant_lists.get(registrant.clone());
    match lists_registered_by_user {
        Some(mut value) => {
            let index = value.first_index_of(&list_id);
            assert!(index.is_some(), "List not found in registrant lists");

            let index_unwrap = index.unwrap();
            value.remove(index_unwrap as u32);
            registrant_lists.set(registrant, value);
        }
        None => {}
    }
    write_registrant_lists(env, &registrant_lists);
}
