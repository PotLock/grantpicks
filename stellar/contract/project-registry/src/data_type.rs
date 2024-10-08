use crate::soroban_sdk::{self, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq, Copy)]
pub enum ProjectStatus {
    New = 0,
    Approved = 1,
    Rejected = 2,
    Completed = 3,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Project {
    pub id: u128,
    pub image_url: String,
    pub video_url: String,
    pub name: String,
    pub overview: String,
    pub owner: Address,
    pub payout_address: Address,
    pub contacts: Vec<ProjectContact>,
    pub contracts: Vec<ProjectContract>,
    pub team_members: Vec<ProjectTeamMember>,
    pub repositories: Vec<ProjectRepository>,
    pub funding_histories: Vec<ProjectFundingHistory>,
    pub status: ProjectStatus,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
    pub admins: Vec<Address>,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CreateProjectParams {
    pub image_url: String,
    pub video_url: String,
    pub name: String,
    pub overview: String,
    pub payout_address: Address,
    pub contacts: Vec<ProjectContact>,
    pub contracts: Vec<ProjectContract>,
    pub team_members: Vec<ProjectTeamMember>,
    pub repositories: Vec<ProjectRepository>,
    pub fundings: Vec<ProjectFundingHistory>,
    pub admins: Vec<Address>,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct UpdateProjectParams {
    pub image_url: String,
    pub video_url: String,
    pub name: String,
    pub overview: String,
    pub payout_address: Address,
    pub contacts: Vec<ProjectContact>,
    pub contracts: Vec<ProjectContract>,
    pub team_members: Vec<ProjectTeamMember>,
    pub repositories: Vec<ProjectRepository>,
    pub fundings: Vec<ProjectFundingHistory>,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectContact {
    pub name: String,
    pub value: String,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectContract {
    pub name: String,
    pub contract_address: String,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectTeamMember {
    pub name: String,
    pub value: String,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectRepository {
    pub label: String,
    pub url: String,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ProjectFundingHistory {
    pub source: String,
    pub amount: u128,
    pub denomiation: String,
    pub description: String,
    pub funded_ms: u64,
}
