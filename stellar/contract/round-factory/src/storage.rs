use crate::{soroban_sdk::Env, storage_key::ContractKey};

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const PERSISTENT_BUMP_CONSTANT: u32 = DAY_IN_LEDGERS * 180;
pub const PERSISTENT_BUMP_CONSTANT_THRESHOLD: u32 = DAY_IN_LEDGERS * 90;

pub fn extend_instance(env: &Env) {
    extend_persistent(env, &ContractKey::Admin);
    extend_persistent(env, &ContractKey::RoundNumber);
    extend_persistent(env, &ContractKey::Rounds);
    extend_persistent(env, &ContractKey::Wasm);
    extend_persistent(env, &ContractKey::TokenContract);
    extend_persistent(env, &ContractKey::ProjectContract);
}

pub fn extend_persistent(env: &Env, key: &ContractKey) {
    if env.storage().persistent().has(key) {
        env.storage().persistent().extend_ttl(
            key,
            PERSISTENT_BUMP_CONSTANT_THRESHOLD,
            PERSISTENT_BUMP_CONSTANT,
        );
    }
}
