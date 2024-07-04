use loam_sdk::soroban_sdk::{Address, Env};
use crate::{admin_writer::{read_admins, read_owner}, data_type::CreateRoundParams};

pub fn validate_round(params: &CreateRoundParams) {
  assert!(
    params.voting_start_ms < params.voting_end_ms,
    "Round start time must be less than round end time"
    );

    assert!(
        params.application_start_ms <= params.application_end_ms,
        "Round application start time must be less than round application end time"
    );

    assert!(
        params.voting_start_ms >= params.application_end_ms,
        "Round start time must be greater than or equal round application end time"
    );
    assert!(params.expected_amount > 0, "Amount must be greater than 0");
    assert!(!params.admins.is_empty(), "Round admins must not empty");
    assert!(params.contacts.len() <= 10, "Contact must be less than 10");
    assert!(
        params.video_url.len() <= 200,
        "Video URL must be less than 200 characters. Use IPFS Hash Only"
    );
}

pub fn is_owner_or_admin(env: &Env, admin: &Address) -> bool {
    let contract_owner = read_owner(env);
    if contract_owner == admin.clone() {
        return true;
    }

    let admins = read_admins(env);
    let is_admin = admins.first_index_of(admin.clone());
    is_admin.is_some()
}

pub fn is_owner(env: &Env, admin: &Address) -> bool {
    let contract_owner = read_owner(env);
    contract_owner == admin.clone()
}

pub fn validate_owner_or_admin(env: &Env, admin: &Address) {
    assert!(is_owner_or_admin(env, &admin), "Only the contract owner or admin can performe action");
}

pub fn validate_owner(env: &Env, admin: &Address) {
    assert!(is_owner(env, admin), "Only the contract owner can performe action");
}