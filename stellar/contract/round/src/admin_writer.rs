use crate::{storage_key::ContractKey, utils::get_storage};
use soroban_sdk::{Address, Env, Vec};

pub fn read_admins(env: &Env, round_id: u128) -> Vec<Address> {
    let key = ContractKey::Admin(round_id);
    match get_storage(env).get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn write_admins(env: &Env, round_id: u128, admins: &Vec<Address>) {
    let key = ContractKey::Admin(round_id);
    get_storage(env).set(&key, admins);
}

pub fn is_admin(env: &Env, round_id: u128, admin: &Address) -> bool {
    let admins = read_admins(env, round_id);
    admins.contains(admin)
}
