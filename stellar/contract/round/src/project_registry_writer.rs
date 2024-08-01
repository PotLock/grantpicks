use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env};

pub fn read_project_contract(env: &Env) -> Address {
    let key = ContractKey::ProjectContract;
    env.storage().persistent().get(&key).unwrap()
}

pub fn write_project_contract(env: &Env, contract_address: &Address) {
    let key = ContractKey::ProjectContract;
    env.storage().persistent().set(&key, contract_address);
}
