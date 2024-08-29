use crate::{data_type::FlagDetail, storage_key::ContractKey, utils::get_storage};
// use crate::storage_key::ContractKey;
use soroban_sdk::{Env, Map, Vec};

pub fn read_approved_projects(env: &Env, round_id: u128) -> Vec<u128> {
    let key = ContractKey::ApprovedProjects(round_id);
    match get_storage(env).get(&key) {
        Some(approved_projects) => approved_projects,
        None => Vec::new(env),
    }
}

pub fn write_approved_projects(env: &Env, round_id: u128, approved_projects: &Vec<u128>) {
    let key = ContractKey::ApprovedProjects(round_id);
    get_storage(env).set(&key, approved_projects);
}

pub fn is_project_approved(env: &Env, round_id: u128, project_id: u128) -> bool {
    let approved_projects = read_approved_projects(env, round_id);
    approved_projects.contains(project_id)
}

pub fn read_flagged_projects(env: &Env, round_id: u128) -> Map<u128, FlagDetail> {
    let key = ContractKey::FlaggedProjects(round_id);
    match get_storage(env).get(&key) {
        Some(flagged_projects) => flagged_projects,
        None => Map::new(env),
    }
}

pub fn write_flagged_projects(env: &Env, round_id: u128, flagged_projects: &Map<u128, FlagDetail>) {
    let key = ContractKey::FlaggedProjects(round_id);
    get_storage(env).set(&key, flagged_projects);
}
