use crate::soroban_sdk::{self, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundDetail {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub contact: Vec<Contact>,
    pub start_time: u64,
    pub end_time: u64,
    pub owner: Address,
    pub admins: Vec<Address>,
    pub application_start_time: u64,
    pub application_end_time: u64,
    pub expected_amount: u128,
    pub is_completed: bool,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct CreateRoundParams {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub contact: Vec<Contact>,
    pub start_time: u64,
    pub end_time: u64,
    pub application_start_time: u64,
    pub application_end_time: u64,
    pub amount: u128,
    pub admins: Vec<Address>,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct ProjectApplication {
    pub application_id: u128,
    pub project_id: u128,
    pub applicant: Address,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_at: u64,
    pub updated_at: Option<u64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Pair {
    pub pair_id: u32,
    pub projects: Vec<u128>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickedPair {
    pub pair_id: u32,
    pub voted_project_id: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickResult {
    pub pair_id: u32,
    pub project_id: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct VotingResult {
    pub voter: Address,
    pub picks: Vec<PickResult>,
    pub voting_time: u64,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct ProjectVotingResult {
    pub project_id: u128,
    pub voting_count: u128,
    pub allocation: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Contact {
    pub name: String,
    pub value: String,
}
