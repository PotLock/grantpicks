use crate::{storage_key::ContractKey, utils::get_storage};
use soroban_sdk::{Address, Env};

pub fn write_factory_owner(env: &Env, owner: &Address) {
    get_storage(env)
        .set(&ContractKey::FactoryOwner, owner);
}

pub fn read_factory_owner(env: &Env) -> Address {
    get_storage(env)
        .get(&ContractKey::FactoryOwner)
        .unwrap()
}
