use soroban_sdk::{panic_with_error, BytesN};

use crate::admin::{read_contract_owner, write_contract_owner};
use crate::data_type::{CreateProjectParams, Project, RoundPreCheck, UpdateProjectParams};
use crate::error::Error;
use crate::events::{log_create_project_event, log_update_project_event};
use crate::methods::ProjectRegistryTrait;
use crate::project_writer::{
    add_applicant_project, add_project, find_projects, get_applicant_project_id, get_project, increment_project_num, read_old_projects, read_project_num, update_project
};
use crate::soroban_sdk::{self, contract, contractimpl, Address, Env, Vec};
use crate::storage::{extend_instance, extend_project};
use crate::validation::{
    validate_applicant, validate_application,
    validate_owner_or_admin, validate_update_project,
};

#[contract]
pub struct ProjectRegistry;

#[contractimpl]
impl ProjectRegistryTrait for ProjectRegistry {
    fn initialize(env: &Env, contract_owner: Address) {
        let owner = read_contract_owner(env);

        if owner.is_some() {
            panic_with_error!(env, Error::AlreadyInitialized);
        }

        write_contract_owner(env, &contract_owner);
    }

    fn apply(env: &Env, applicant: Address, project_params: CreateProjectParams) -> Project {
        applicant.require_auth();

        validate_applicant(env, &applicant);
        validate_application(env, &project_params);

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
            funding_histories: project_params.fundings,
            image_url: project_params.image_url,
            video_url: project_params.video_url,
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

    fn update_project(
        env: &Env,
        admin: Address,
        project_id: u128,
        new_project_params: UpdateProjectParams,
    ) {
        admin.require_auth();

        validate_update_project(env, &new_project_params);

        let project = get_project(env, project_id);
       
        if project.is_none() {
          panic_with_error!(env, Error::DataNotFound);
        }

        let mut uproject = project.unwrap();

        validate_owner_or_admin(env, &admin, &uproject);

        uproject.name = new_project_params.name;
        uproject.image_url = new_project_params.image_url;
        uproject.video_url = new_project_params.video_url;
        uproject.overview = new_project_params.overview;
        uproject.contacts = new_project_params.contacts;
        uproject.contracts = new_project_params.contracts;
        uproject.team_members = new_project_params.team_members;
        uproject.repositories = new_project_params.repositories;
        uproject.payout_address = new_project_params.payout_address;
        uproject.funding_histories = new_project_params.fundings;
        uproject.updated_ms = Some(env.ledger().timestamp() * 1000);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_project(env, project_id);
        extend_instance(env);
    }

    fn add_admin(env: &Env, project_id: u128, new_admin: Address) {
        let project = get_project(env, project_id);
       
        if project.is_none() {
          panic_with_error!(env, Error::DataNotFound);
        }

        let mut uproject = project.unwrap();

        uproject.owner.require_auth();

        uproject.admins.push_back(new_admin);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_project(env, project_id);
        extend_instance(env);
    }

    fn remove_admin(env: &Env, project_id: u128, admin_to_remove: Address) {
        let project = get_project(env, project_id);
        
        if project.is_none() {
          panic_with_error!(env, Error::DataNotFound);
        }

        let mut uproject = project.unwrap();

        uproject.owner.require_auth();

        let index = uproject.admins.first_index_of(&admin_to_remove.clone());
      
        if index.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        let index_u32: u32 = index.unwrap();
        uproject.admins.remove(index_u32);

        log_update_project_event(env, uproject.clone());
        update_project(env, uproject);
        extend_project(env, project_id);
        extend_instance(env);
    }

    fn get_project_by_id(env: &Env, project_id: u128) -> Project {
        let project = get_project(env, project_id);
        extend_project(env, project_id);
        extend_instance(env);
        if project.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        project.unwrap()
    }

    fn get_projects(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<Project> {
        find_projects(env, skip, limit)
    }

    fn get_project_admins(env: &Env, project_id: u128) -> Vec<Address> {
        let project = get_project(env, project_id);

        if project.is_none() {
            return Vec::new(env);
        }

        project.unwrap().admins
    }

    fn get_total_projects(env: &Env) -> u32 {
        let total = read_project_num(env);
        total as u32
    }

    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>) {
        let contract_owner = read_contract_owner(env);

        contract_owner.unwrap().require_auth();

        env.deployer().update_current_contract_wasm(new_wasm_hash);

        extend_instance(env);
    }

    fn get_project_from_applicant(env: &Env, applicant: Address) -> Project {
        let project_id = get_applicant_project_id(env, &applicant);

        if project_id.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        let project = get_project(env, project_id.unwrap());

        if project.is_none() {
            panic_with_error!(env, Error::DataNotFound);
        }

        project.unwrap()
    }

    fn owner(env: &Env) -> Address {
        read_contract_owner(env).unwrap()
    }

    fn get_precheck(env: &Env, applicant: Address) -> Option<RoundPreCheck>{
        let project_id = get_applicant_project_id(env, &applicant);

        if project_id.is_none() {
            return None;
        }

        let project = get_project(env, project_id.unwrap());

        if project.is_none() {
            return None;
        }

        let project = project.unwrap();
        let precheck = RoundPreCheck {
            project_id: project.id,
            applicant: applicant,
            has_video: project.video_url.len() > 0,
        };

        Some(precheck)
    }

    fn get_precheck_by_id(env: &Env, project_id: u128) -> Option<RoundPreCheck>{
        let project = get_project(env, project_id);

        if project.is_none() {
            return None;
        }

        let project = project.unwrap();
        let precheck = RoundPreCheck {
            project_id: project.id,
            applicant: project.owner,
            has_video: project.video_url.len() > 0,
        };

        Some(precheck)
    }

    // fn migrate(env: &Env, owner: Address, project_id: u128){
    //     owner.require_auth();

    //     validate_contract_owner(env, &owner);

    //     let old_projects = read_old_projects(env);
    //     let project = old_projects.get(project_id).unwrap();
    //     add_project(env, project.clone());
    //     extend_project(env, project_id);

    //     extend_instance(env)
    // }
}
