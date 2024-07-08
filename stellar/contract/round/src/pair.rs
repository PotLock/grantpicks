use crate::{
    approval_writer::read_approved_projects,
    data_type::Pair,
    utils::{count_total_available_pairs, get_arithmetic_index},
};
use loam_sdk::soroban_sdk::{Env, Vec};

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

pub fn get_random_pairs(env: &Env, num_pairs: u32) -> Vec<Pair> {
    let projects = read_approved_projects(env);
    let total_available_pairs = count_total_available_pairs(projects.len());

    assert!(
        num_pairs <= total_available_pairs,
        "Number of pairs requested is greater than total available pairs"
    );

    let mut pairs: Vec<Pair> = Vec::new(env);

    for _i in 0..num_pairs {
        let index = env.prng().gen_range::<u64>(0..total_available_pairs.into());
        let index_u32: u32 = index.try_into().unwrap();
        let pair = get_pair_by_index(env, total_available_pairs, index_u32, &projects);
        pairs.push_back(pair);
    }

    pairs
}

pub fn get_all_pairs(env: &Env) -> Vec<Pair> {
    let projects = read_approved_projects(env);
    let total_available_pairs = count_total_available_pairs(projects.len());
    let mut pairs: Vec<Pair> = Vec::new(env);

    for i in 0..total_available_pairs {
        let pair = get_pair_by_index(env, total_available_pairs, i, &projects);
        pairs.push_back(pair);
    }

    pairs
}