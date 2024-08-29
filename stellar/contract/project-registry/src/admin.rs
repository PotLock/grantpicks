use crate::{
    soroban_sdk::{Address, Env},
    storage_key::ContractKey,
};

pub fn write_contract_owner(env: &Env, owner: &Address) {
    let key: ContractKey = ContractKey::RegistryAdmin;
    env.storage().persistent().set(&key, owner);
}

pub fn read_contract_owner(env: &Env) -> Address {
    let key: ContractKey = ContractKey::RegistryAdmin;
    env.storage().persistent().get(&key).unwrap()
}
