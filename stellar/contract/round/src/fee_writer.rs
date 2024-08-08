use soroban_sdk::{Address, Env};

use crate::storage_key::ContractKey;

pub fn write_fee_basis_points(env: &Env, fee_basis_points: u32) {
    let key = &ContractKey::ProtocolFee;
    env.storage().persistent().set(key, &fee_basis_points);
}

pub fn write_fee_address(env: &Env, fee_address: &Address) {
    let key = &ContractKey::ProtocolFeeRecepient;
    env.storage().persistent().set(key, fee_address);
}

pub fn read_fee_basis_points(env: &Env) -> Option<u32> {
    let key = &ContractKey::ProtocolFee;
    env.storage().persistent().get(key)
}

pub fn read_fee_address(env: &Env) -> Option<Address> {
    let key = &ContractKey::ProtocolFeeRecepient;
    env.storage().persistent().get(key)
}
