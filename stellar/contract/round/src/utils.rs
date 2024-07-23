use loam_sdk::soroban_sdk::{Address, Env};

use crate::{admin_writer::is_admin, data_type::RoundDetailExternal};

pub fn count_total_available_pairs(num_of_projects: u32) -> u32 {
    num_of_projects * (num_of_projects - 1) / 2
}

pub fn get_arithmetic_index(num_of_projects: u32, index: u32) -> (u32, u32) {
    let mut sum = 0;
    let mut first_project_index = 0;

    while sum + (num_of_projects - first_project_index - 1) <= index {
        sum += num_of_projects - first_project_index - 1;
        first_project_index += 1;
    }

    let second_project_index = first_project_index + 1 + (index - sum);

    (first_project_index, second_project_index)
}

pub fn get_ledger_second_as_millis(env: &Env) -> u64 {
    env.ledger().timestamp() * 1000
}
