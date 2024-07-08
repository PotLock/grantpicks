use loam_sdk::soroban_sdk::{self, contractclient, contracttype, Address, Env, String, Vec};

#[contractclient(name = "RoundClient")]
pub trait RoundTrait {
    fn initialize(
        env: &Env,
        owner: Address,
        token_address: Address,
        registry_address: Address,
        round_detail: RCCreateParams,
    );

    fn round_info(env: &Env) -> RoundDetail;
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RCCreateParams {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub video_url: String,
    pub contacts: Vec<RCContact>,
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
pub struct RCContact {
    pub name: String,
    pub value: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundDetail {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub video_url: String,
    pub contacts: Vec<RCContact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: u64,
    pub application_end_ms: u64,
    pub expected_amount: u128,
    pub vault_balance: u128,
    pub is_completed: bool,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
}
