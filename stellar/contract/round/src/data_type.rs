use loam_sdk::soroban_sdk::Env;

use crate::{
    admin_writer::is_admin,
    soroban_sdk::{self, contracttype, Address, String, Vec},
};

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
}

//Note: Whitelist And Blacklist In Different Storage
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundDetailInternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub vault_balance: u128,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub allow_applications: bool,
    pub is_video_required: bool,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundDetailExternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub vault_balance: u128,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub allow_applications: bool,
    pub is_video_required: bool,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct CreateRoundParams {
    pub owner: Address,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub admins: Vec<Address>,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
}


#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct UpdateRoundParams {
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
}

//Note: use String for Option<String>. soroban SDK not allow Option<soroban_sdk::String>
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundApplicationInternal {
    pub project_id: u128,
    pub applicant_id: Address,
    pub applicant_note: String,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundApplicationExternal {
    pub project_id: u128,
    pub applicant_id: Address,
    pub applicant_note: String,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
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
    pub voted_ms: u64,
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

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Payout {
    pub project_id: u128,
    pub address: Address,
    pub amount: i128,
    pub paid_at_ms: u64,
}

impl RoundDetailInternal {
    pub fn to_external(&self) -> RoundDetailExternal {
        let contacts = self.contacts.clone();
        RoundDetailExternal {
            id: self.id,
            owner: self.owner.clone(),
            name: self.name.clone(),
            description: self.description.clone(),
            contacts,
            allow_applications: self.allow_applications,
            application_start_ms: self.application_start_ms,
            application_end_ms: self.application_end_ms,
            voting_start_ms: self.voting_start_ms,
            voting_end_ms: self.voting_end_ms,
            use_whitelist: self.use_whitelist,
            expected_amount: self.expected_amount,
            vault_balance: self.vault_balance,
            num_picks_per_voter: self.num_picks_per_voter,
            max_participants: self.max_participants,
            is_video_required: self.is_video_required,
        }
    }

    pub fn is_caller_owner_or_admin(&self, env: &Env, caller: &Address) -> bool {
        self.owner == caller.clone() || is_admin(env, self.id, caller)
    }
}

impl RoundApplicationInternal {
    pub fn to_external(&self) -> RoundApplicationExternal {
        RoundApplicationExternal {
            applicant_id: self.applicant_id.clone(),
            applicant_note: self.applicant_note.clone(),
            project_id: self.project_id,
            review_note: self.review_note.clone(),
            status: self.status.clone(),
            submited_ms: self.submited_ms,
            updated_ms: self.updated_ms,
        }
    }
}
