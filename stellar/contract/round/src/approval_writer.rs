use crate::storage_key::ContractKey;
use loam_sdk::soroban_sdk::{Env, Vec};

pub fn read_approved_projects(env: &Env) -> Vec<u128> {
    let key = ContractKey::ApprovedProjects;
    match env.storage().persistent().get(&key) {
        Some(approved_projects) => approved_projects,
        None => Vec::new(env),
    }
}

pub fn write_approved_projects(env: &Env, approved_projects: &Vec<u128>) {
    let key = ContractKey::ApprovedProjects;
    env.storage().persistent().set(&key, approved_projects);
}

pub fn is_project_approved(env: &Env, project_id: u128) -> bool {
    let approved_projects = read_approved_projects(env);
    let index = approved_projects.first_index_of(&project_id);

    match index {
        Some(_) => true,
        None => false,
    }
}

pub fn add_approved_project(env: &Env, project_id: u128) {
    let mut approved_projects = read_approved_projects(env);
    approved_projects.push_back(project_id);
    write_approved_projects(env, &approved_projects);
}

pub fn remove_approved_project(env: &Env, project_id: u128) {
    let mut approved_projects = read_approved_projects(env);
    let index = approved_projects.first_index_of(&project_id);

    if index.is_some() {
        approved_projects.remove(index.unwrap() as u32);
        write_approved_projects(env, &approved_projects);
    }
}
