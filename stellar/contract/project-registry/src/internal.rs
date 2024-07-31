use loam_sdk::soroban_sdk::BytesN;

use crate::admin::{read_contract_owner, write_contract_owner};
use crate::data_type::{Project, ProjectParams, ProjectStatus, UpdateProjectParams};
use crate::events::{log_create_project_event, log_update_project_event};
use crate::methods::ProjectRegistryTrait;
use crate::project_writer::{
    add_applicant_project, add_project, find_projects, get_applicant_project_id, get_project,
    increment_project_num, read_projects, update_project,
};
use crate::soroban_sdk::{self, contract, contractimpl, Address, Env, Vec};
use crate::storage::extend_instance;
use crate::validation::{
    validate_applicant, validate_application, validate_contract_owner, validate_owner,
    validate_owner_or_admin, validate_update_project,
};

#[contract]
pub struct ProjectRegistry;

#[contractimpl]
impl ProjectRegistryTrait for ProjectRegistry {
    fn initialize(env: &Env, contract_owner: Address) {
        write_contract_owner(env, &contract_owner);
    }

    fn apply(env: &Env, applicant: Address, project_params: ProjectParams) -> Project {
        applicant.require_auth();

        validate_applicant(env, &applicant);
        validate_application(&project_params);

        let project_id = increment_project_num(env);

        let project = Project {
            id: project_id,
            name: project_params.name,
            overview: project_params.overview,
            contacts: project_params.contacts,
            contracts: project_params.contracts,
            team_members: project_params.team_members,
            repositories: project_params.repositories,
            payout_address: project_params.payout_address,
            image_url: project_params.image_url,
            video_url: project_params.video_url,
            status: ProjectStatus::New,
            submited_ms: env.ledger().timestamp() * 1000,
            updated_ms: None,
            admins: project_params.admins,
            owner: applicant.clone(),
        };

        add_project(env, project.clone());
        add_applicant_project(env, &applicant, project_id);
        extend_instance(env);
        log_create_project_event(env, project.clone());

        project
    }

    fn change_project_status(
        env: &Env,
        contract_owner: Address,
        project_id: u128,
        new_status: ProjectStatus,
    ) {
        contract_owner.require_auth();

        validate_contract_owner(env, &contract_owner);

        let project = get_project(env, project_id);
        assert!(project.is_some(), "project not found");

        let mut uproject = project.unwrap();

        uproject.status = new_status;
        uproject.updated_ms = Some(env.ledger().timestamp() * 1000);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_instance(env);
    }

    fn update_project(
        env: &Env,
        admin: Address,
        project_id: u128,
        new_project_params: UpdateProjectParams,
    ) {
        admin.require_auth();

        validate_update_project(&new_project_params);

        let project = get_project(env, project_id);
        assert!(project.is_some(), "project not found");

        let mut uproject = project.unwrap();

        validate_owner_or_admin(&admin, &uproject);

        uproject.name = new_project_params.name;
        uproject.image_url = new_project_params.image_url;
        uproject.video_url = new_project_params.video_url;
        uproject.overview = new_project_params.overview;
        uproject.contacts = new_project_params.contacts;
        uproject.contracts = new_project_params.contracts;
        uproject.team_members = new_project_params.team_members;
        uproject.repositories = new_project_params.repositories;
        uproject.payout_address = new_project_params.payout_address;

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_instance(env);
    }

    fn add_admin(env: &Env, admin: Address, project_id: u128, new_admin: Address) {
        admin.require_auth();

        let project = get_project(env, project_id);
        assert!(project.is_some(), "project not found");

        let mut uproject = project.unwrap();

        validate_owner(&admin, &uproject);

        uproject.admins.push_back(new_admin);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_instance(env);
    }

    fn remove_admin(env: &Env, admin: Address, project_id: u128, admin_to_remove: Address) {
        admin.require_auth();

        let project = get_project(env, project_id);
        assert!(project.is_some(), "project not found");

        let mut uproject = project.unwrap();

        validate_owner(&admin, &uproject);

        let index = uproject.admins.first_index_of(&admin_to_remove.clone());
        assert!(index.is_some(), "admin not found");

        let index_u32: u32 = index.unwrap();
        uproject.admins.remove(index_u32);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_instance(env);
    }

    fn get_project_by_id(env: &Env, project_id: u128) -> Option<Project> {
        let project = get_project(env, project_id);
        extend_instance(env);

        project
    }

    fn get_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project> {
        find_projects(env, skip, limit)
    }

    fn get_project_admins(env: &Env, project_id: u128) -> Vec<Address> {
        let project = get_project(env, project_id);
        extend_instance(env);

        if project.is_none() {
            return Vec::new(env);
        }

        project.unwrap().admins
    }

    fn get_total_projects(env: &Env) -> u32 {
        let projects = read_projects(env);
        extend_instance(env);

        projects.len()
    }

    fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>) {
        owner.require_auth();

        validate_contract_owner(env, &owner);

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance(env);
    }

    fn get_project_from_applicant(env: &Env, applicant: Address) -> Option<Project> {
        let project_id = get_applicant_project_id(env, &applicant);

        if project_id.is_none() {
            return None;
        }

        let project = get_project(env, project_id.unwrap());

        project
    }
}
