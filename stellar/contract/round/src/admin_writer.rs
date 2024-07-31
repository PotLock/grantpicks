use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Address, Env, Vec};

pub fn read_admins(env: &Env, round_id: u128) -> Vec<Address> {
    let key = ContractKey::Admin(round_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_admin(env: &Env, round_id: u128, admin: Address) {
    let mut admins = read_admins(env, round_id);
    admins.push_back(admin);
    write_admins(env, round_id, &admins);
}

pub fn write_admins(env: &Env, round_id: u128, admins: &Vec<Address>) {
    let key = ContractKey::Admin(round_id);
    env.storage().persistent().set(&key, admins);
}

pub fn remove_admin(env: &Env, round_id: u128, admin: &Address) {
    let mut admins = read_admins(env, round_id);
    let index = admins.first_index_of(admin).unwrap();
    admins.remove(index);
    write_admins(env, round_id, &admins);
}

pub fn is_admin(env: &Env, round_id: u128, admin: &Address) -> bool {
    let admins = read_admins(env, round_id);
    admins.contains(admin)
}

pub fn remove_all_admins(env: &Env, round_id: u128) {
    let key = ContractKey::Admin(round_id);
    let blank_admins: Vec<Address> = Vec::new(env);
    env.storage().persistent().set(&key, &blank_admins);
}
