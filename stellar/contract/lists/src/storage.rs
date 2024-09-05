use soroban_sdk::{Address, Env};

use crate::storage_key::ContractKey;

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const PERSISTENT_BUMP_CONSTANT: u32 = DAY_IN_LEDGERS * 180;
pub const PERSISTENT_BUMP_CONSTANT_THRESHOLD: u32 = DAY_IN_LEDGERS * 90;

pub fn extend_instance(env: &Env) {
    extend_persistent(env, &ContractKey::ContractOwner);
    extend_persistent(env, &ContractKey::ListsNumber);
    extend_persistent(env, &ContractKey::RegistrationsNumber);
}

pub fn extend_list(env: &Env, list_id: u128) {
    extend_persistent(env, &ContractKey::ListAdmins(list_id));
    extend_persistent(env, &ContractKey::ListRegistration(list_id));
    extend_persistent(env, &ContractKey::Lists(list_id));
    extend_persistent(env, &ContractKey::Upvotes(list_id));
}

pub fn extend_registration(env: &Env, registration_id: u128) {
    extend_persistent(env, &ContractKey::Registrations(registration_id));
}

pub fn extend_user(env: &Env, user_id: &Address) {
    extend_persistent(env, &ContractKey::OwnedList(user_id.clone()));
    extend_persistent(env, &ContractKey::RegistrantList(user_id.clone()));
    extend_persistent(env, &ContractKey::RegistrationsIDs(user_id.clone()));
    extend_persistent(env, &ContractKey::UserUpvotes(user_id.clone()));
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
