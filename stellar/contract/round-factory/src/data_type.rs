use loam_sdk::soroban_sdk::{self, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundInfo {
    pub round_id: u128,
    pub contract_address: Address,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct CreateRoundParams {
    pub name: String,
    pub description: String,
    pub video_url: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: u64,
    pub application_end_ms: u64,
    pub expected_amount: u128,
    pub admins: Vec<Address>,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct Contact {
    pub name: String,
    pub value: String,
}
