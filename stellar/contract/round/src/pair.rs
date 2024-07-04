use crate::{approval_writer::read_approved_projects, data_type::Pair};
use loam_sdk::soroban_sdk::{Env, Vec};

pub fn get_pair_by_index(env: &Env, total_available_pairs: u64, index: u64, projects: Vec<u128>) -> Pair {
    assert!(index < total_available_pairs, "Index out of range");

    /*
    Determine pair by index eg. 1 2, 1 3, 1 4, 2 3, 2 4, 3 4 for 4 projects
     */
    let mut pair_projects: Vec<u128> = Vec::new(env);
    let n:u64 = projects.len().into();
    let mut sum = 0;
    let mut first_project_index = 0;

    // Find the first project index based on the given index
    while sum + (n - first_project_index - 1) <= index {
        sum += n - first_project_index - 1;
        first_project_index += 1;
    }

    let second_project_index = first_project_index + 1 + (index - sum) ;

    let project_1 = projects.get(first_project_index.try_into().unwrap()).unwrap();
    let project_2 = projects.get(second_project_index.try_into().unwrap()).unwrap();

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
        let index = env.prng().gen_range::<u64>(0..total_available_pairs/2);
        let pair = get_pair_by_index(env, total_available_pairs/2, index, projects.clone());
        pairs.push_back(pair);
    }

    pairs
}

pub fn get_all_pairs(env: &Env) -> Vec<Pair> {
    let projects = read_approved_projects(env);
    let total_available_pairs: u64 = (projects.len() * (projects.len() - 1)).into();
    let mut pairs: Vec<Pair> = Vec::new(env);

    for i in 0..total_available_pairs/2 {
        let pair = get_pair_by_index(env, total_available_pairs/2, i, projects.clone());
        pairs.push_back(pair);
    }

    pairs
}
