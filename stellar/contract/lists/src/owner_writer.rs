use crate::storage_key::ContractKey;
use soroban_sdk::{Address, Env};

pub fn read_contract_owner(env: &Env) -> Option<Address> {
    let key = ContractKey::ContractOwner;
    env.storage().persistent().get(&key)
}

pub fn write_contract_owner(env: &Env, value: &Address) {
    let key = ContractKey::ContractOwner;
    env.storage().persistent().set(&key, value);
}
