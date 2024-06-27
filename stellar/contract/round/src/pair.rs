use crate::{approval_writer::read_approved_projects, data_type::Pair};
use loam_sdk::soroban_sdk::{Env, Vec};

pub fn get_pair_by_index(env: &Env, total_available_pairs: u64, index: u64) -> Pair {
    let projects = read_approved_projects(env);

    assert!(index < total_available_pairs, "Index out of range");

    let mut pair_projects: Vec<u128> = Vec::new(env);
    let project_num_min_1: u64 = (projects.len() - 1).into();
    let project_1_index: u64 = index / project_num_min_1;

    let mut available_projects: Vec<u128> = projects.clone();
    available_projects.remove_unchecked(project_1_index.try_into().unwrap());

    let mut project_2_index: u64 = index;
    if project_2_index >= available_projects.len().into() {
        let available_projects_len: u64 = available_projects.len().into();
        project_2_index %= available_projects_len;
    }

    let project_1 = projects.get(project_1_index.try_into().unwrap()).unwrap();
    let project_2 = available_projects
        .get(project_2_index.try_into().unwrap())
        .unwrap();

    pair_projects.push_back(project_1);
    pair_projects.push_back(project_2);

    Pair {
        pair_id: index.try_into().unwrap(),
        projects: pair_projects,
    }
}

pub fn get_random_pairs(env: &Env, num_pairs: u64) -> Vec<Pair> {
    let projects = read_approved_projects(env);
    let total_available_pairs: u64 = (projects.len() * (projects.len() - 1)).into();

    assert!(
        num_pairs <= total_available_pairs,
        "Number of pairs requested is greater than total available pairs"
    );

    let mut pairs: Vec<Pair> = Vec::new(env);

    for _i in 0..num_pairs {
        let index = env.prng().gen_range::<u64>(0..total_available_pairs);
        let pair = get_pair_by_index(env, total_available_pairs, index);
        pairs.push_back(pair);
    }

    pairs
}

pub fn get_all_pairs(env: &Env) -> Vec<Pair> {
    let projects = read_approved_projects(env);
    let total_available_pairs: u64 = (projects.len() * (projects.len() - 1)).into();

    let mut pairs: Vec<Pair> = Vec::new(env);

    for i in 0..total_available_pairs {
        let pair = get_pair_by_index(env, total_available_pairs, i);
        pairs.push_back(pair);
    }

    pairs
}
