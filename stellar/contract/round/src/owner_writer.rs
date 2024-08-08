use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env};

pub fn write_factory_owner(env: &Env, owner: &Address) {
    env.storage()
        .persistent()
        .set(&ContractKey::FactoryOwner, owner);
}

pub fn read_factory_owner(env: &Env) -> Address {
    env.storage()
        .persistent()
        .get(&ContractKey::FactoryOwner)
        .unwrap()
}
