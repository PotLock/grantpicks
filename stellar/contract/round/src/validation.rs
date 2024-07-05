use crate::{
    approval_writer::{is_project_approved, read_approved_projects},
    data_type::{CreateRoundParams, RoundDetail},
    project_registry_writer::read_project_contract,
    utils::get_ledger_second_as_millis,
    voter_writer::{is_black_listed, is_white_listed},
    voting_writer::get_voting_state,
};
use loam_sdk::soroban_sdk::{Address, Env, String, Vec};
loam_sdk::import_contract!(project_registry);

pub fn validate_round_detail(env: &Env, round_detail: &CreateRoundParams) {
    assert!(
        round_detail.voting_start_ms < round_detail.voting_end_ms,
        "Round start time must be less than round end time"
    );

    assert!(
        round_detail.application_start_ms <= round_detail.application_end_ms,
        "Round application start time must be less than equal round application end time"
    );

    assert!(
        round_detail.voting_start_ms >= round_detail.application_end_ms,
        "Round start time must be greater than or equal round application end time"
    );

    assert!(
        round_detail.expected_amount > 0,
        "Expected Amount must be greater than 0"
    );
    assert!(
        !round_detail.admins.is_empty(),
        "Round admins must not empty"
    );

    assert!(
        round_detail.contacts.len() <= 10,
        "Contact must be less than 10"
    );
    assert!(
        round_detail.video_url.len() <= 200,
        "Video URL must be less than 200 characters. Use IPFS Hash Only"
    );
}

pub fn validate_owner_or_admin(env: &Env, admin: &Address, round: &RoundDetail) {
    if round.owner != admin.clone() {
        let admin_index = round.admins.first_index_of(admin.clone());
        assert!(
            admin_index.is_some(),
            "Only round owner or round admin can change voting period"
        );
    }
}

pub fn validate_owner(env: &Env, owner: &Address, round: &RoundDetail) {
    assert!(
        round.owner == owner.clone(),
        "Only round owner can change round detail"
    );
}

pub fn validate_can_payout(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        round.voting_start_ms <= current_time,
        "Voting period is not started"
    );

    assert!(
        current_time >= round.voting_end_ms,
        "Voting period is not ended"
    );
}

pub fn validate_vault_fund(round: &RoundDetail) {
    let vault_fund = round.vault_balance;
    assert!(vault_fund > 0, "Vault fund must be greater than 0");
}

pub fn validate_voting_period(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        current_time >= round.voting_start_ms,
        "Voting period has not started yet"
    );
    assert!(
        current_time < round.voting_end_ms,
        "Voting period has ended"
    );
    assert!(!round.is_completed, "Round is completed");
}

pub fn validate_application_period(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        current_time >= round.application_start_ms,
        "Application period has not started yet"
    );
    assert!(
        current_time <= round.application_end_ms,
        "Application period has ended"
    );
    assert!(!round.is_completed, "Round is completed");
}

pub fn validate_approved_projects(env: &Env, project_id: u128) {
    let already_approved = is_project_approved(env, project_id);
    assert!(already_approved, "Project not approved");
}

pub fn validate_not_approved_projects(env: &Env, project_id: u128) {
    let already_approved = is_project_approved(env, project_id);
    assert!(!already_approved, "Project already approved");
}

pub fn validate_project_to_approve(env: &Env, project_ids: &Vec<u128>) {
    let project_contract = read_project_contract(env);
    let project_client = project_registry::Client::new(env, &project_contract);
    let total_projects: u128 = project_client.get_total_projects().into();

    project_ids.iter().for_each(|project_id| {
        assert!(
            project_id <= total_projects,
            "Project not found in registry"
        );

        validate_not_approved_projects(env, project_id);
    });
}

pub fn validate_project_to_apply(env: &Env, project_id: u128) {
    let project_contract = read_project_contract(env);
    let project_client = project_registry::Client::new(env, &project_contract);
    let project = project_client.get_project_by_id(&project_id);
    assert!(
        project.is_some(),
        "Project not found. Please register project first using project registry"
    );
}

pub fn validate_max_participants(env: &Env, round: &RoundDetail, project_ids: &Vec<u128>) {
    let approved_project = read_approved_projects(env);
    assert!(
        approved_project.len() + project_ids.len() <= round.max_participants,
        "Maximum project participants {}",
        round.max_participants
    );
}

pub fn validate_max_participant(env: &Env, round: &RoundDetail) {
    let approved_project = read_approved_projects(env);
    assert!(
        approved_project.len() < round.max_participants,
        "Maximum project participants {}",
        round.max_participants
    );
}

pub fn validate_has_voted(env: &Env, voter: &Address) {
    let state = get_voting_state(env, voter.clone());
    assert!(
        !state,
        "Voter already voted. Can not vote again in same round"
    );
}

pub fn validate_number_of_votes(required: u32, voted: u32) {
    assert!(
        required == voted,
        "Number of picks must be equal to number of picks per voter"
    );
}

pub fn validate_blacklist(env: &Env, voter: &Address) {
    let is_black_listed = is_black_listed(env, voter.clone());
    assert!(!is_black_listed, "Voter is black listed");
}

pub fn validate_blacklist_already(env: &Env, voter: &Address) {
    let is_black_listed = is_black_listed(env, voter.clone());
    assert!(!is_black_listed, "Voter is already black listed");
}

pub fn validate_not_blacklist(env: &Env, voter: &Address) {
    let is_black_listed = is_black_listed(env, voter.clone());
    assert!(is_black_listed, "Voter is not black listed");
}

pub fn validate_whitelist(env: &Env, voter: &Address) {
    let is_white_listed = is_white_listed(env, voter.clone());
    assert!(is_white_listed, "Voter is not white listed");
}

pub fn validate_review_notes(notes: &String) {
    assert!(
        notes.len() <= 300,
        "Review notes must be less than 300 characters"
    );
}

pub fn validate_pick_per_votes(num_picks_per_voter: u32) {
    assert!(
        num_picks_per_voter > 0,
        "Number of picks per voter must be greater than 0"
    );
    assert!(
        num_picks_per_voter <= 10,
        "Number of picks per voter must be less than or equal 10"
    );
}
