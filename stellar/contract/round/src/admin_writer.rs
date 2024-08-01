use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env, Vec};

pub fn read_admins(env: &Env, round_id: u128) -> Vec<Address> {
    let key = ContractKey::Admin(round_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn write_admins(env: &Env, round_id: u128, admins: &Vec<Address>) {
    let key = ContractKey::Admin(round_id);
    env.storage().persistent().set(&key, admins);
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
