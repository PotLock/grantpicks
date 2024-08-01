use crate::{
    admin::{self, read_contract_owner},
    data_type::{Project, ProjectParams, UpdateProjectParams},
    project_writer::is_applied,
};
use soroban_sdk::{Address, Env};

pub fn validate_application(project_params: &ProjectParams) {
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
        assert!(
            !team_member.value.is_empty(),
            "team member role is required"
        );
        assert!(team_member.name.len() <= 50, "team member name is too long");
        assert!(
            team_member.value.len() <= 50,
            "team member role is too long"
        );
    });

    project_params.repositories.iter().for_each(|repository| {
        assert!(!repository.label.is_empty(), "repository name is required");
        assert!(!repository.url.is_empty(), "repository value is required");
        assert!(repository.label.len() <= 50, "repository name is too long");
        assert!(repository.url.len() <= 255, "repository value is too long");
    });
}

pub fn validate_update_project(update_params: &UpdateProjectParams) {
    assert!(!update_params.name.is_empty(), "name is required");
    assert!(!update_params.overview.is_empty(), "overview is required");
    assert!(!update_params.contacts.is_empty(), "contacts is required");
    assert!(!update_params.image_url.is_empty(), "image_url is required");
}

pub fn validate_owner_or_admin(admin: &Address, project: &Project) {
    if &project.owner != admin {
        let is_admin = project.admins.first_index_of(&admin.clone());
        assert!(
            is_admin.is_some(),
            "only owner or admin can performe action"
        );
    }
}

pub fn validate_owner(admin: &Address, project: &Project) {
    assert!(&project.owner == admin, "only owner can performe action");
}

pub fn validate_contract_owner(env: &Env, admin: &Address) {
    let contract_admin = read_contract_owner(env);
    assert!(
        admin == &contract_admin,
        "only contract admin can change status"
    );
}

pub fn validate_applicant(env: &Env, applicant: &Address) {
    assert!(
        !is_applied(env, applicant),
        "You Already Apply Some Project"
    );
}
