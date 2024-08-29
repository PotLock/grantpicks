use soroban_sdk::{Address, Env};

use crate::{storage_key::ContractKey, utils::get_storage};

pub fn write_fee_basis_points(env: &Env, fee_basis_points: u32) {
    let key = &ContractKey::ProtocolFee;
    get_storage(env).set(key, &fee_basis_points);
}

pub fn write_fee_address(env: &Env, fee_address: &Address) {
    let key = &ContractKey::ProtocolFeeRecepient;
    get_storage(env).set(key, fee_address);
}

pub fn read_fee_basis_points(env: &Env) -> Option<u32> {
    let key = &ContractKey::ProtocolFee;
    get_storage(env).get(key)
}

pub fn read_fee_address(env: &Env) -> Option<Address> {
    let key = &ContractKey::ProtocolFeeRecepient;
    get_storage(env).get(key)
}
