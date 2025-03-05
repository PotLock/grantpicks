use crate::{
    approval_writer::read_approved_projects, config_writer::read_config, data_type::{Pair, RoundDetail}, error::Error, round_writer::read_round_info, storage::has_store_key, storage_key::ContractKey, utils::{count_total_available_pairs, get_arithmetic_index}
};
use soroban_sdk::{panic_with_error, Env, Vec};

pub fn get_pair_by_index(
    env: &Env,
    total_available_pairs: u32,
    index: u32,
    projects: &Vec<u128>,
) -> Pair {
    assert!(index < total_available_pairs, "Index out of range");

    /*
    Determine pair by index eg. 1 2, 1 3, 1 4, 2 3, 2 4, 3 4 for 4 projects
     */
    let mut pair_projects: Vec<u128> = Vec::new(env);
    let (first_project_index, second_project_index) = get_arithmetic_index(projects.len(), index);
    let project_1 = projects
        .get(first_project_index.try_into().unwrap())
        .unwrap();
    let project_2 = projects
        .get(second_project_index.try_into().unwrap())
        .unwrap();

    pair_projects.push_back(project_1);
    pair_projects.push_back(project_2);

    Pair {
        pair_id: index.try_into().unwrap(),
        projects: pair_projects,
    }
}

pub fn get_random_pairs(env: &Env, round_id: u128, num_pairs: u32) -> Vec<Pair> {
    let projects = read_approved_projects(env, round_id);

    if projects.len() < 2 {
        panic_with_error!(env, Error::DataNotFound);
    }

    let total_available_pairs = count_total_available_pairs(projects.len());

    if num_pairs > total_available_pairs {
        panic_with_error!(env, Error::DataNotFound);
    }

    let mut pairs: Vec<Pair> = Vec::new(env);
    let mut used_indices: Vec<u32> = Vec::new(env);

    while pairs.len() < num_pairs as u32 {
        let index = env.prng().gen_range::<u64>(0..total_available_pairs.into());
        let index_u32: u32 = index.try_into().unwrap();
        
        // Check pair not already selected
        if !used_indices.contains(index_u32) {
            let pair = get_pair_by_index(env, total_available_pairs, index_u32, &projects);
            pairs.push_back(pair);
            used_indices.push_back(index_u32);
        }
    }

    pairs
}

pub fn get_all_pairs(env: &Env, round_id: u128) -> Vec<Pair> {
    let projects = read_approved_projects(env, round_id);
    let total_available_pairs = count_total_available_pairs(projects.len());
    let mut pairs: Vec<Pair> = Vec::new(env);

    for i in 0..total_available_pairs {
        let pair = get_pair_by_index(env, total_available_pairs, i, &projects);
        pairs.push_back(pair);
    }

    pairs
}

pub fn get_all_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail> {
    let default_page_size = read_config(env).default_page_size;
    let skip: u64 = skip.unwrap_or(0).try_into().unwrap();
    let mut limit: u64 = limit.unwrap_or(default_page_size).try_into().unwrap();

    if limit > 10 {
        limit = 10;
    }

    let mut results: Vec<RoundDetail> = Vec::new(env);

    for i in skip..skip+limit {
        let round_id: u128 = (i + 1).into();
        let key = ContractKey::RoundInfo(round_id);

        if has_store_key(env, &key) {
            let detail = read_round_info(env, round_id);
            results.push_back(detail.clone());
        }
    }

    results
}
