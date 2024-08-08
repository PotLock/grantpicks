use soroban_sdk::{Env, Vec};

use crate::{
    approval_writer::read_approved_projects,
    data_type::ProjectVotingResult,
    round_writer::read_round_info,
    voting_writer::{get_voting_count, read_voting_results},
};

pub fn calculate_voting_results(env: &Env, round_id: u128) -> Vec<ProjectVotingResult> {
    let approved_projects = read_approved_projects(env, round_id);
    let voting_results = read_voting_results(env, round_id);
    let round = read_round_info(env, round_id);
    let number_of_voting_results: u128 = voting_results.len().into();
    let num_of_pick: u128 = round.num_picks_per_voter.into();
    let total_voting_count = number_of_voting_results * num_of_pick;
    let mut final_results: Vec<ProjectVotingResult> = Vec::new(env);

    approved_projects.iter().for_each(|project_id| {
        let voting_count = get_voting_count(env, round_id, project_id);
        let voting_result = ProjectVotingResult {
            project_id,
            voting_count,
            allocation: calculate_allocation(voting_count, total_voting_count),
        };
        final_results.push_back(voting_result);
    });

    final_results
}

// NOTE: calculate voting result is still subject to change
pub fn calculate_allocation(voting_count: u128, total_voting_count: u128) -> u128 {
    voting_count * 10000 / total_voting_count
}
