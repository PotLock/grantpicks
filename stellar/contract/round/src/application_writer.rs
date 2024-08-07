use soroban_sdk::{Address, Env, Map, Vec};

use crate::{data_type::RoundApplication, storage_key::ContractKey};

pub fn read_application(env: &Env, round_id: u128) -> Map<Address, RoundApplication> {
    let key = ContractKey::ProjectApplicants(round_id);
    match env.storage().persistent().get(&key) {
        Some(value) => value,
        None => Map::new(env),
    }
}

pub fn write_application(env: &Env, round_id: u128, applications: &Map<Address, RoundApplication>) {
    let key = ContractKey::ProjectApplicants(round_id);
    env.storage().persistent().set(&key, applications);
}

pub fn update_application(env: &Env, round_id: u128, application: &RoundApplication) {
    let mut applications = read_application(env, round_id);
    applications.set(application.applicant_id.clone(), application.clone());
    write_application(env, round_id, &applications);
}

pub fn find_applications(
    env: &Env,
    round_id: u128,
    skip: Option<u64>,
    limit: Option<u64>,
) -> Vec<RoundApplication> {
    let applications = read_application(env, round_id);
    let skip: usize = skip.unwrap_or(0).try_into().unwrap();
    let limit: usize = limit.unwrap_or(10).try_into().unwrap();
    assert!(limit <= 20, "limit should be less than or equal to 20");
    let mut found_applications: Vec<RoundApplication> = Vec::new(env);
    let keys = applications.keys();

    keys.iter().skip(skip).take(limit).for_each(|applicant| {
        let application = applications.get(applicant).unwrap();
        found_applications.push_back(application);
    });

    found_applications
}

pub fn get_application_by_applicant(
    env: &Env,
    round_id: u128,
    applicant_id: &Address,
) -> Option<RoundApplication> {
    let applications = read_application(env, round_id);

    applications.get(applicant_id.clone())
}
