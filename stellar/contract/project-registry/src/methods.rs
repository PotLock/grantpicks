use soroban_sdk::{Address, BytesN, Env, Vec};

use crate::data_type::{Project, CreateProjectParams, ProjectStatus, UpdateProjectParams};

pub trait ProjectRegistryTrait {
    fn initialize(env: &Env, contract_owner: Address);
    fn apply(env: &Env, applicant: Address, params: CreateProjectParams) -> Project;
    fn change_project_status(
        env: &Env,
        contract_owner: Address,
        project_id: u128,
        new_status: ProjectStatus,
    );
    fn update_project(
        env: &Env,
        admin: Address,
        project_id: u128,
        new_project_params: UpdateProjectParams,
    );
    fn add_admin(env: &Env, admin: Address, project_id: u128, new_admin: Address);
    fn remove_admin(env: &Env, admin: Address, project_id: u128, admin_to_remove: Address);
    fn get_project_by_id(env: &Env, project_id: u128) -> Option<Project>;
    fn get_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project>;
    fn get_project_admins(env: &Env, project_id: u128) -> Vec<Address>;
    fn get_total_projects(env: &Env) -> u32;
    fn get_project_from_applicant(env: &Env, applicant: Address) -> Option<Project>;
    fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>);
}
