use soroban_sdk::{self, contractclient, contracttype, Address, Env, String, Vec};

#[contractclient(name = "ProjectRegistryClient")]
pub trait ProjectRegistryTrait {
    fn get_project_by_id(env: &Env, project_id: u128) -> Option<Project>;
    fn get_project_from_applicant(env: &Env, applicant: Address) -> Option<Project>;
    fn get_total_projects(env: &Env) -> u32;
}

#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProjectStatus {
    New,
    Approved,
    Rejected,
    Completed,
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
    pub status: ProjectStatus,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
    pub admins: Vec<Address>,
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
