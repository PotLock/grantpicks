use loam_sdk::soroban_sdk::{Env, Vec};

use crate::{data_type::ProjectApplication, storage_key::ContractKey};

pub fn read_application_number(env: &Env, round_id: u128) -> u128 {
    let key = ContractKey::ApplicationNumber(round_id);
    env.storage().persistent().get(&key).unwrap_or(0)
}

pub fn increment_application_number(env: &Env, round_id: u128) -> u128 {
    let key = ContractKey::ApplicationNumber(round_id);
    let application_number = read_application_number(env, round_id) + 1;
    env.storage().persistent().set(&key, &application_number);
    application_number
}

pub fn add_application(env: &Env, round_id: u128, application: ProjectApplication) {
    let mut applications = read_application(env, round_id);
    applications.push_back(application);
    write_application(env, round_id, &applications);
}

pub fn read_application(env: &Env, round_id: u128) -> Vec<ProjectApplication> {
    let key = ContractKey::ProjectApplicants(round_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Vec::new(env),
    }
}

pub fn write_application(env: &Env, round_id: u128, applications: &Vec<ProjectApplication>) {
    let key = ContractKey::ProjectApplicants(round_id);
    env.storage().persistent().set(&key, applications);
}

pub fn update_application(env: &Env, round_id: u128, application: ProjectApplication) {
    let mut applications = read_application(env, round_id);
    let index = applications
        .iter()
        .position(|x| x.application_id == application.application_id)
        .unwrap();
    let index_u32: u32 = index.try_into().unwrap();
    applications.set(index_u32, application);
    write_application(env, round_id, &applications);
}

pub fn find_applications(
    env: &Env,
    round_id: u128,
    skip: Option<u64>,
    limit: Option<u64>,
) -> Vec<ProjectApplication> {
    let applications = read_application(env, round_id);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");
    let mut found_applications: Vec<ProjectApplication> = Vec::new(env);

    applications
        .iter()
        .skip(skip)
        .take(limit)
        .for_each(|application| {
            found_applications.push_back(application.clone());
        });

    found_applications
}

pub fn get_application(env: &Env, round_id: u128, project_id: u128) -> Option<ProjectApplication> {
    let applications = read_application(env, round_id);

    applications
        .iter()
        .find(|application| application.project_id == project_id)
}

pub fn get_application_by_id(
    env: &Env,
    round_id: u128,
    application_id: u128,
) -> Option<ProjectApplication> {
    let applications = read_application(env, round_id);
    let skip: usize = (application_id - 1).try_into().unwrap();

    applications
        .iter()
        .skip(skip)
        .take(1)
        .find(|application| application.application_id == application_id)
}
