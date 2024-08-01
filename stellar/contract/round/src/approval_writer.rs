use crate::storage_key::ContractKey;
use soroban_sdk::{Env, Vec};

pub fn read_approved_projects(env: &Env, round_id: u128) -> Vec<u128> {
    let key = ContractKey::ApprovedProjects(round_id);
    match env.storage().persistent().get(&key) {
        Some(approved_projects) => approved_projects,
        None => Vec::new(env),
    }
}

pub fn write_approved_projects(env: &Env, round_id: u128, approved_projects: &Vec<u128>) {
    let key = ContractKey::ApprovedProjects(round_id);
    env.storage().persistent().set(&key, approved_projects);
}

pub fn is_project_approved(env: &Env, round_id: u128, project_id: u128) -> bool {
    let approved_projects = read_approved_projects(env, round_id);
    approved_projects.contains(project_id)
}

