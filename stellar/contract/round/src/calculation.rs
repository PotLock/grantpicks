use soroban_sdk::{Env, Vec};

use crate::{
    // approval_writer::{read_approved_projects, read_flagged_projects},
    approval_writer::read_approved_projects,
    data_type::ProjectVotingResult,
    voting_writer::get_voting_count,
};

pub fn calculate_voting_results(env: &Env, round_id: u128) -> Vec<ProjectVotingResult> {
    let approved_projects = read_approved_projects(env, round_id);
    // let flagged_projects = read_flagged_projects(env, round_id);
    let mut final_results: Vec<ProjectVotingResult> = Vec::new(env);

    approved_projects.iter().for_each(|project_id| {
        let voting_count = get_voting_count(env, round_id, project_id);
        let voting_result = ProjectVotingResult {
            project_id,
            voting_count,
            // is_flagged: flagged_projects.contains_key(project_id),
        };
        final_results.push_back(voting_result);
    });

    final_results
}
