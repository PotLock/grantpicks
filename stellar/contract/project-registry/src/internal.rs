use crate::admin::{read_contract_owner, write_contract_owner};
use crate::data_type::{Project, ProjectParams, ProjectStatus, UpdateProjectParams};
use crate::events::{log_create_project_event, log_update_project_event};
use crate::methods::ProjectRegistryTrait;
use crate::project_writer::{
    add_project, find_projects, get_project, increment_project_num, read_projects, update_project,
};
use crate::soroban_sdk::{self, contract, contractimpl, Address, Env, Vec};
use crate::storage::extend_instance;

#[contract]
pub struct ProjectRegistry;

#[contractimpl]
impl ProjectRegistryTrait for ProjectRegistry {
    fn initialize(env: &Env, contract_owner: Address) {
        write_contract_owner(env, &contract_owner);
    }

    fn apply(env: &Env, applicant: Address, project_params: ProjectParams) -> Project {
        applicant.require_auth();

        assert!(!project_params.name.is_empty(), "name is required");
        assert!(!project_params.overview.is_empty(), "overview is required");
        assert!(!project_params.contacts.is_empty(), "contacts is required");
        assert!(!project_params.admins.is_empty(), "admin is required");
        assert!(
            !project_params.image_url.is_empty(),
            "image_url is required"
        );
        assert!(
            project_params.admins.len() < 5,
            "too many admin. max. 4 admin allowed"
        );
        assert!(project_params.contacts.len() <= 10, "too many contacts");
        assert!(project_params.contracts.len() <= 10, "too many contracts");
        assert!(
            project_params.team_members.len() <= 10,
            "too many team members"
        );
        assert!(
            project_params.repositories.len() <= 10,
            "too many repositories"
        );

        project_params.contacts.iter().for_each(|contact| {
            assert!(!contact.name.is_empty(), "contact name is required");
            assert!(!contact.value.is_empty(), "contact value is required");
            assert!(contact.name.len() <= 50, "contact name is too long");
            assert!(contact.value.len() <= 100, "contact value is too long");
        });

        project_params.contracts.iter().for_each(|contract| {
            assert!(!contract.name.is_empty(), "contract name is required");
            assert!(
                !contract.contract_address.is_empty(),
                "contract value is required"
            );
            assert!(contract.name.len() <= 50, "contract name is too long");
            assert!(
                contract.contract_address.len() <= 100,
                "contract value is too long"
            );
        });

        project_params.team_members.iter().for_each(|team_member| {
            assert!(!team_member.name.is_empty(), "team member name is required");
            assert!(!team_member.value.is_empty(), "team member role is required");
            assert!(team_member.name.len() <= 50, "team member name is too long");
            assert!(team_member.value.len() <= 50, "team member role is too long");
        });

        project_params.repositories.iter().for_each(|repository| {
            assert!(!repository.label.is_empty(), "repository name is required");
            assert!(!repository.url.is_empty(), "repository value is required");
            assert!(repository.label.len() <= 50, "repository name is too long");
            assert!(repository.url.len() <= 255, "repository value is too long");
        });

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
            status: ProjectStatus::New,
            submited_ms: env.ledger().timestamp() * 1000,
            updated_ms: None,
            admins: project_params.admins,
            owner: applicant.clone(),
        };

        add_project(env, project.clone());
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

        let contract_admin = read_contract_owner(env);
        assert!(
            contract_owner == contract_admin,
            "only contract admin can change status"
        );

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

        assert!(!new_project_params.name.is_empty(), "name is required");
        assert!(
            !new_project_params.overview.is_empty(),
            "overview is required"
        );
        assert!(
            !new_project_params.contacts.is_empty(),
            "contacts is required"
        );
        assert!(
            !new_project_params.image_url.is_empty(),
            "image_url is required"
        );

        let project = get_project(env, project_id);
        assert!(project.is_some(), "project not found");

        let mut uproject = project.unwrap();

        if uproject.owner != admin {
            let is_admin = uproject.admins.first_index_of(&admin.clone());
            assert!(is_admin.is_some(), "only owner or admin can update");
        }

        uproject.name = new_project_params.name;
        uproject.image_url = new_project_params.image_url;
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
        assert!(uproject.owner == admin, "only owner can add admin");
        assert!(
            uproject.admins.len() < 5,
            "too many admin. max. 4 admin allowed"
        );

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
        assert!(uproject.owner == admin, "only owner can add admin");
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
}
