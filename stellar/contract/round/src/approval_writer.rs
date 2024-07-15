use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Env, Vec};

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

pub fn add_approved_project(env: &Env, round_id: u128, project_id: u128) {
    let mut approved_projects = read_approved_projects(env, round_id);
    approved_projects.push_back(project_id);
    write_approved_projects(env, round_id, &approved_projects);
}

pub fn remove_approved_project(env: &Env, round_id: u128, project_id: u128) {
    let mut approved_projects = read_approved_projects(env, round_id);
    let index = approved_projects.first_index_of(project_id);

    if let Some(index) = index {
        approved_projects.remove(index);
        write_approved_projects(env, round_id, &approved_projects);
    }
}
