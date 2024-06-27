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

pub fn read_projects(env: &Env) -> Vec<Project> {
    let key = ContractKey::Projects;
    env.storage()
        .persistent()
        .get(&key)
        .unwrap_or(Vec::new(env))
}

pub fn get_project(env: &Env, project_id: u128) -> Option<Project> {
    let num_of_projects = read_project_num(env);

    if project_id > num_of_projects {
        return None;
    }

    let projects = read_projects(env);
    let skip: usize = (project_id - 1) as usize;
    projects
        .iter()
        .skip(skip)
        .take(1)
        .find(|project| project.project_id == project_id)
        .clone()
}

pub fn find_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project> {
    let projects = read_projects(env);
    let skip = skip.unwrap_or(0) as usize;
    let limit = limit.unwrap_or(10) as usize;
    assert!(limit <= 20, "limit should be less than or equal to 20");

    let mut found_projects: Vec<Project> = Vec::new(env);

    projects.iter().skip(skip).take(limit).for_each(|project| {
        found_projects.push_back(project.clone());
    });

    found_projects
}

pub fn add_project(env: &Env, project: Project) {
    let mut projects = read_projects(env);
    projects.push_back(project);
    let key = ContractKey::Projects;
    env.storage().persistent().set(&key, &projects);
}

pub fn update_project(env: &Env, project: Project) {
    let mut projects = read_projects(env);
    let project_id = project.project_id;
    let index: u32 = projects
        .iter()
        .position(|x| x.project_id == project_id)
        .unwrap()
        .try_into()
        .unwrap();
    projects.insert(index, project);
    let key = ContractKey::Projects;
    env.storage().persistent().set(&key, &projects);
}
