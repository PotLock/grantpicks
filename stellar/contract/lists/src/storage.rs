use soroban_sdk::Env;

use crate::storage_key::ContractKey;

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const PERSISTENT_BUMP_CONSTANT: u32 = DAY_IN_LEDGERS * 180;
pub const PERSISTENT_BUMP_CONSTANT_THRESHOLD: u32 = DAY_IN_LEDGERS * 90;

pub fn extend_instance(env: &Env) {
    extend_persistent(env, &ContractKey::ContractOwner);
    extend_persistent(env, &ContractKey::ListAdmins);
    extend_persistent(env, &ContractKey::ListRegistration);
    extend_persistent(env, &ContractKey::Lists);
    extend_persistent(env, &ContractKey::ListsNumber);
    extend_persistent(env, &ContractKey::OwnedList);
    extend_persistent(env, &ContractKey::Registrations);
    extend_persistent(env, &ContractKey::RegistrationsIDs);
    extend_persistent(env, &ContractKey::RegistrationsNumber);
    extend_persistent(env, &ContractKey::Upvotes);
    extend_persistent(env, &ContractKey::UserUpvotes);
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
