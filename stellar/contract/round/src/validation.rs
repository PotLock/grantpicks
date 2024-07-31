use crate::{
    admin_writer::is_admin,
    approval_writer::{is_project_approved, read_approved_projects},
    data_type::{CreateRoundParams, RoundDetailInternal, UpdateRoundParams},
    external::ProjectRegistryClient,
    project_registry_writer::read_project_contract,
    utils::get_ledger_second_as_millis,
    voter_writer::{is_black_listed, is_white_listed},
    voting_writer::get_voting_state,
};
use loam_sdk::soroban_sdk::{Address, Env, String, Vec};

pub fn validate_round_detail(round_detail: &CreateRoundParams) {
    assert!(
        round_detail.voting_start_ms < round_detail.voting_end_ms,
        "Round start time must be less than round end time"
    );

    assert!(
        round_detail.application_start_ms.unwrap() <= round_detail.application_end_ms.unwrap(),
        "Round application start time must be less than equal round application end time"
    );

    assert!(
        round_detail.voting_start_ms >= round_detail.application_end_ms.unwrap(),
        "Round start time must be greater than or equal round application end time"
    );

    assert!(
        round_detail.expected_amount > 0,
        "Expected Amount must be greater than 0"
    );

    assert!(
        round_detail.contacts.len() <= 10,
        "Contact must be less than 10"
    );
}

pub fn validate_round_detail_update(round_detail: &UpdateRoundParams) {
    assert!(
        round_detail.voting_start_ms < round_detail.voting_end_ms,
        "Round start time must be less than round end time"
    );

    assert!(
        round_detail.application_start_ms.unwrap() <= round_detail.application_end_ms.unwrap(),
        "Round application start time must be less than equal round application end time"
    );

    assert!(
        round_detail.voting_start_ms >= round_detail.application_end_ms.unwrap(),
        "Round start time must be greater than or equal round application end time"
    );

    assert!(
        round_detail.expected_amount > 0,
        "Expected Amount must be greater than 0"
    );

    assert!(
        round_detail.contacts.len() <= 10,
        "Contact must be less than 10"
    );
}

pub fn validate_owner_or_admin(env: &Env, admin: &Address, round: &RoundDetailInternal) {
    if round.owner != admin.clone() {
        assert!(
            is_admin(env, round.id, admin),
            "Only round owner or round admin can performe this action"
        );
    }
}

pub fn validate_can_payout(env: &Env, round: &RoundDetailInternal) {
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

pub fn validate_vault_fund(round: &RoundDetailInternal) {
    let vault_fund = round.current_vault_balance;
    assert!(vault_fund > 0, "Vault fund must be greater than 0");
}

pub fn validate_voting_period(env: &Env, round: &RoundDetailInternal) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        current_time >= round.voting_start_ms,
        "Voting period has not started yet"
    );
    assert!(
        current_time < round.voting_end_ms,
        "Voting period has ended"
    );
}

pub fn validate_application_period(env: &Env, round: &RoundDetailInternal) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        current_time >= round.application_start_ms.unwrap(),
        "Application period has not started yet"
    );
    assert!(
        current_time <= round.application_end_ms.unwrap(),
        "Application period has ended"
    );
}

pub fn validate_voting_not_started(env: &Env, round: &RoundDetailInternal) {
    let current_time = get_ledger_second_as_millis(env);
    assert!(
        current_time < round.voting_start_ms,
        "Voting has already started"
    );
}

pub fn validate_approved_projects(env: &Env, round_id: u128, project_id: u128) {
    let already_approved = is_project_approved(env, round_id, project_id);
    assert!(already_approved, "Project not approved");
}

pub fn validate_not_approved_projects(env: &Env, round_id: u128, project_id: u128) {
    let already_approved = is_project_approved(env, round_id, project_id);
    assert!(!already_approved, "Project already approved");
}

pub fn validate_project_to_approve(env: &Env, round_id: u128, project_ids: &Vec<u128>) {
    let project_contract = read_project_contract(env);
    let project_client = ProjectRegistryClient::new(env, &project_contract);
    let total_projects: u128 = project_client.get_total_projects().into();

    project_ids.iter().for_each(|project_id| {
        assert!(
            project_id <= total_projects,
            "Project not found in registry"
        );

        validate_not_approved_projects(env, round_id, project_id);
    });
}

pub fn validate_max_participants(env: &Env, round: &RoundDetailInternal, project_ids: &Vec<u128>) {
    let approved_project = read_approved_projects(env, round.id);
    assert!(
        approved_project.len() + project_ids.len() <= round.max_participants,
        "Maximum project participants {}",
        round.max_participants
    );
}

pub fn validate_max_participant(env: &Env, round: &RoundDetailInternal) {
    let approved_project = read_approved_projects(env, round.id);
    assert!(
        approved_project.len() < round.max_participants,
        "Maximum project participants {}",
        round.max_participants
    );
}

pub fn validate_has_voted(env: &Env, round_id: u128, voter: &Address) {
    let state = get_voting_state(env, round_id, voter.clone());
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

pub fn validate_blacklist(env: &Env, round_id: u128, voter: &Address) {
    let is_black_listed = is_black_listed(env, round_id, voter.clone());
    assert!(!is_black_listed, "Voter is black listed");
}

pub fn validate_blacklist_already(env: &Env, round_id: u128, voter: &Address) {
    let is_black_listed = is_black_listed(env, round_id, voter.clone());
    assert!(!is_black_listed, "Voter is already black listed");
}

pub fn validate_not_blacklist(env: &Env, round_id: u128, voter: &Address) {
    let is_black_listed = is_black_listed(env, round_id, voter.clone());
    assert!(is_black_listed, "Voter is not black listed");
}

pub fn validate_whitelist(env: &Env, round_id: u128, voter: &Address) {
    let is_white_listed = is_white_listed(env, round_id, voter.clone());
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

pub fn validate_specify_applicant(is_owner_or_admin: bool) {
    assert!(
        is_owner_or_admin,
        "Only round owner or admin can specify applicant"
    );
}
