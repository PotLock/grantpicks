use loam_sdk::soroban_sdk::{BytesN, Env};

use crate::storage_key::ContractKey;

pub fn read_wasm_hash(env: &Env) -> BytesN<32> {
    let key = ContractKey::Wasm;
    env.storage().persistent().get(&key).unwrap()
}

pub fn write_wasm_hash(env: &Env, wasm_hash: BytesN<32>) {
    let key = ContractKey::Wasm;
    env.storage().persistent().set(&key, &wasm_hash);
}
