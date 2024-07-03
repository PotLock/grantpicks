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
    pub max_participants: Option<u32>
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct Contact {
    pub name: String,
    pub value: String,
}
