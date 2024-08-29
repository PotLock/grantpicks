use crate::{storage_key::ContractKey, utils::get_storage};
use soroban_sdk::{Address, Env};

pub fn read_project_contract(env: &Env) -> Address {
    let key = ContractKey::ProjectContract;
    get_storage(env).get(&key).unwrap()
}

pub fn write_project_contract(env: &Env, contract_address: &Address) {
    let key = ContractKey::ProjectContract;
    get_storage(env).set(&key, contract_address);
}
