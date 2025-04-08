use soroban_sdk::{Address, Map};

use crate::{
    data_type::Project,
    soroban_sdk::{Env, Vec},
    storage_key::ContractKey,
};

pub fn read_project_num(env: &Env) -> u128 {
    let key = ContractKey::NumOfProjects;
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn increment_project_num(env: &Env) -> u128 {
    let key = ContractKey::NumOfProjects;
    let num = read_project_num(env);
    let next_num = num + 1;
    env.storage().persistent().set(&key, &next_num);
    next_num
}

pub fn read_project(env: &Env, project_id: u128) -> Option<Project> {
    let key = ContractKey::Project(project_id);
    env.storage().persistent().get(&key)
}

pub fn write_project(env: &Env, project_id: u128, project: &Project) {
    let key = ContractKey::Project(project_id);
    env.storage().persistent().set(&key, project);
}

pub fn read_old_projects(env: &Env) -> Map<u128, Project> {
    let key = ContractKey::Projects;
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Map::new(env))
}

pub fn get_project(env: &Env, project_id: u128) -> Option<Project> {
    let project = read_project(env, project_id);
    project
}

pub fn find_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project> {
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");

    let mut found_projects: Vec<Project> = Vec::new(env);

    for i in skip..skip + limit {
        if let Some(project) = read_project(env, (i+1) as u128) {
            found_projects.push_back(project);
        } else {
            break;
        }
    }

    found_projects
}

pub fn add_project(env: &Env, project: Project) {
    write_project(env, project.id, &project);
}

pub fn update_project(env: &Env, project: Project) {
    write_project(env, project.id, &project);
}

pub fn read_applicant_project(env: &Env, applicant: &Address) -> Option<u128> {
    let key = ContractKey::ApplicantToProjectID(applicant.clone());
    env.storage().persistent().get(&key)
}

pub fn write_applicant_project(env: &Env, applicant: &Address, project_id: u128) {
    let key = ContractKey::ApplicantToProjectID(applicant.clone());
    env.storage().persistent().set(&key, &project_id);
}

pub fn add_applicant_project(env: &Env, applicant: &Address, project_id: u128) {
    write_applicant_project(env, applicant, project_id);
}

pub fn is_applied(env: &Env, applicant: &Address) -> bool {
    let key = ContractKey::ApplicantToProjectID(applicant.clone());
    env.storage().persistent().has(&key)
}

pub fn get_applicant_project_id(env: &Env, applicant: &Address) -> Option<u128> {
    read_applicant_project(env, applicant)
}
