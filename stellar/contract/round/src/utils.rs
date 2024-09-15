// use soroban_fixed_point_math::SorobanFixedPoint;
use soroban_sdk::{storage::Persistent, Env};

use crate::config_writer::read_config;

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

pub fn calculate_protocol_fee(env: &Env, amount: u128) -> Option<u128> {
    let protocol_fee_basis_points = read_config(env).protocol_fee_basis_points;
    if protocol_fee_basis_points > 0 {
        // // COMMENTED CODE FIXED POINT MATH DUE BIGGER SIZE
        // let total_basis_points: u128 = 10_000;
        // let fee:u128 = protocol_fee_basis_points as u128;
        // let denominator:u128 = 1_0000000;
        // let fee_amount = fee.fixed_div_floor(env, &total_basis_points, &denominator).fixed_div_floor(env, &amount, &denominator);
        // // Round up
        // Some(fee_amount)
        let total_basis_points: u128 = 10_000;
        let fee_amount = (protocol_fee_basis_points as u128).saturating_mul(amount);
        // Round up
        Some(fee_amount.div_ceil(total_basis_points))
    } else {
        None
    }
}

pub fn get_storage(env: &Env)-> Persistent{
  env.storage().persistent()
}