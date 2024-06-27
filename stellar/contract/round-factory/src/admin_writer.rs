use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Address, Env, Vec};

pub fn write_owner(env: &Env, admin: &Address) {
    let key = ContractKey::Owner;
    env.storage().persistent().set(&key, admin);
}

pub fn read_owner(env: &Env) -> Address {
    let key = ContractKey::Owner;
    env.storage().persistent().get(&key).unwrap()
}

pub fn read_admins(env: &Env) -> Vec<Address> {
    let key = ContractKey::Admin;
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn add_admin(env: &Env, admin: Address) {
    let mut admins = read_admins(env);
    admins.push_back(admin);
    write_admins(env, &admins);
}

pub fn write_admins(env: &Env, admins: &Vec<Address>) {
    let key = ContractKey::Admin;
    env.storage().persistent().set(&key, admins);
}

pub fn remove_admin(env: &Env, admin: &Address) {
    let mut admins = read_admins(env);
    let index = admins.first_index_of(admin).unwrap();
    let index_u32: u32 = index.try_into().unwrap();
    admins.remove(index_u32);
    write_admins(env, &admins);
}
