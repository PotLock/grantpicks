use soroban_sdk::{Address, Env};

use crate::storage_key::ContractKey;

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const PERSISTENT_BUMP_CONSTANT: u32 = DAY_IN_LEDGERS * 180;
pub const PERSISTENT_BUMP_CONSTANT_THRESHOLD: u32 = DAY_IN_LEDGERS * 90;

pub fn extend_instance(env: &Env) {
    extend_persistent(env, &ContractKey::Projects);
    extend_persistent(env, &ContractKey::NumOfProjects);
    extend_persistent(env, &ContractKey::RegistryAdmin);
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

pub fn extend_project(env: &Env, project_id: u128) {
    extend_persistent(env, &ContractKey::Project(project_id));
}

pub fn extend_applicant(env: &Env, applicant: &Address) {
    extend_persistent(env, &ContractKey::ApplicantToProjectID(applicant.clone()));
}