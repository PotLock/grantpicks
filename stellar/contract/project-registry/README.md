# Grantpicks Project Registry contract - Stellar

## Purpose
To Save project profile


## Storage Structure

```rs
#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    NumOfProjects, // Project ID & Counter
    Projects, // Project Data
    RegistryAdmin, // Admin For Registry
    ApplicantToProjectID, // Applicant Owned Project ID (1 to 1 relation)
}

```

## Contract Error Code
```rs
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
  EmptyName = 1,
  EmptyOverview = 2,
  EmptyContacts = 3,
  EmptyAdmins = 4,
  EmptyImageUrl = 5,
  AdminOrOwnerOnly = 6,
  OwnerOnly = 7,
  ContractOwnerOnly = 8,
  AlreadyApplied = 9,
}
```

## Data Type 

```rs
#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq, Copy)]
pub enum ProjectStatus {
    New = 0,
    Approved  = 1,
    Rejected  = 2,
    Completed = 3,
}

// project information
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

// Project Create Params
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

// update project params
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
```

## Methods

```rs
//WRITE
// init contract
fn initialize(env: &Env, contract_owner: Address);

// Project Manipulation 
fn apply(env: &Env, applicant: Address, params: CreateProjectParams) -> Project;
fn update_project(
    env: &Env,
    admin: Address,
    project_id: u128,
    new_project_params: UpdateProjectParams,
);
fn add_admin(env: &Env, admin: Address, project_id: u128, new_admin: Address);
fn remove_admin(env: &Env, admin: Address, project_id: u128, admin_to_remove: Address);

// Change project status
fn change_project_status(
    env: &Env,
    contract_owner: Address,
    project_id: u128,
    new_status: ProjectStatus,
);
fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>);

// VIEW
fn get_project_by_id(env: &Env, project_id: u128) -> Option<Project>;
fn get_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project>;
fn get_project_admins(env: &Env, project_id: u128) -> Vec<Address>;
fn get_total_projects(env: &Env) -> u32;
fn get_project_from_applicant(env: &Env, applicant: Address) -> Option<Project>;

```