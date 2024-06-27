use crate::{
    soroban_sdk::{Address, Env},
    storage_key::ContractKey,
};

pub fn write_registry_admin(env: &Env, registry_admin: &Address) {
    let key: ContractKey = ContractKey::RegistryAdmin;
    env.storage().persistent().set(&key, registry_admin);
}

pub fn read_registry_admin(env: &Env) -> Address {
    let key: ContractKey = ContractKey::RegistryAdmin;
    env.storage().persistent().get(&key).unwrap()
}
