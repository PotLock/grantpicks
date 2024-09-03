use crate::{
    admin::read_contract_owner,
    data_type::{CreateProjectParams, Project, UpdateProjectParams},
    error::Error,
    project_writer::is_applied,
};
use soroban_sdk::{panic_with_error, Address, Env};

pub fn validate_application(env: &Env, project_params: &CreateProjectParams) {
    if project_params.admins.is_empty() {
        panic_with_error!(env, Error::EmptyAdmins);
    }

    if project_params.contacts.is_empty() {
        panic_with_error!(env, Error::EmptyContacts);
    }

    if project_params.image_url.is_empty() {
        panic_with_error!(env, Error::EmptyImageUrl);
    }

    if project_params.name.is_empty() {
        panic_with_error!(env, Error::EmptyName);
    }

    if project_params.overview.is_empty() {
        panic_with_error!(env, Error::EmptyOverview);
    }
}

pub fn validate_update_project(env: &Env, update_params: &UpdateProjectParams) {
    if update_params.contacts.is_empty() {
        panic_with_error!(env, Error::EmptyContacts);
    }

    if update_params.image_url.is_empty() {
        panic_with_error!(env, Error::EmptyImageUrl);
    }

    if update_params.name.is_empty() {
        panic_with_error!(env, Error::EmptyName);
    }

    if update_params.overview.is_empty() {
        panic_with_error!(env, Error::EmptyOverview);
    }
}

pub fn validate_owner_or_admin(env: &Env, admin: &Address, project: &Project) {
    if &project.owner != admin {
        let is_admin = project.admins.first_index_of(&admin.clone());

        if is_admin.is_none() {
            panic_with_error!(env, Error::AdminOrOwnerOnly);
        }
    }
}

pub fn validate_contract_owner(env: &Env, caller: &Address) {
    let contract_admin = read_contract_owner(env);

    if contract_admin != caller.clone() {
        panic_with_error!(env, Error::ContractOwnerOnly);
    }
}

pub fn validate_applicant(env: &Env, applicant: &Address) {
    if is_applied(env, applicant) {
        panic_with_error!(env, Error::AlreadyApplied);
    }
}
