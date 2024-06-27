#![cfg(test)]
use loam_sdk::soroban_sdk::Vec;

use crate::data_type::{
    ProjectContact, ProjectContract, ProjectRepository, ProjectStatus, ProjectTeamMember,
};
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String};
use crate::{internal::ProjectRegistry, internal::ProjectRegistryClient};

fn deploy_contract<'a>(env: &Env, admin: &Address) -> ProjectRegistryClient<'a> {
    let contract =
        ProjectRegistryClient::new(env, &env.register_contract(None, ProjectRegistry {}));
    contract.initialize(admin);
    contract
}

#[test]
fn test_apply() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    assert_eq!(project.owner, bob);
    assert_eq!(project.payout_address, bob);
}

#[test]
fn test_change_project_status() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    contract.change_project_status(&alice, &project.project_id, &ProjectStatus::Approved);

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.status, ProjectStatus::Approved);
}

#[test]
fn test_add_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    contract.add_admin(&alice, &project.project_id, &charlie);

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.admins.len(), 2);
    assert_eq!(project.admins.get(1).unwrap(), charlie);
}

#[test]
fn test_remove_admin() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    contract.add_admin(&alice, &project.project_id, &charlie);

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.admins.len(), 2);
    assert_eq!(project.admins.get(1).unwrap(), charlie);

    contract.remove_admin(&alice, &project.project_id, &charlie);

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.admins.len(), 1);
}

#[test]
fn test_get_projects() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    let projects = contract.get_projects(&None, &None);

    assert_eq!(projects.len(), 1);
    assert_eq!(projects.get(0).unwrap(), project);
}

#[test]
fn test_get_project_admins() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let charlie = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    contract.add_admin(&alice, &project.project_id, &charlie);

    let admins = contract.get_project_admins(&project.project_id);

    assert_eq!(admins.len(), 2);
    assert_eq!(admins.get(1).unwrap(), charlie);
}

#[test]
fn test_get_project_by_id() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.payout_address, bob);
    assert_eq!(project.admins.len(), 1);
}

#[test]
fn test_update_project() {
    let env = Env::default();
    env.mock_all_auths();
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &alice);

    let mut project_contracts: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories: Vec<ProjectRepository> = Vec::new(&env);
    let mut project_admins: Vec<Address> = Vec::new(&env);

    project_contracts.push_back(ProjectContract {
        name: String::from_str(&env, "contract name"),
        contract_address: Address::generate(&env),
    });

    project_contacts.push_back(ProjectContact {
        name: String::from_str(&env, "contact name"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name"),
        url: String::from_str(&env, "repository url"),
    });

    project_admins.push_back(alice.clone());

    let project = contract.apply(
        &bob,
        &crate::data_type::ProjectParams {
            image_url: String::from_str(&env, "image url"),
            name: String::from_str(&env, "name"),
            overview: String::from_str(&env, "overview"),
            payout_address: bob.clone(),
            contacts: project_contacts,
            contracts: project_contracts,
            team_members: project_team_members,
            repositories: project_repositories,
            admins: project_admins,
        },
    );

    let mut project_contracts2: Vec<ProjectContract> = Vec::new(&env);
    let mut project_contacts2: Vec<ProjectContact> = Vec::new(&env);
    let mut project_team_members2: Vec<ProjectTeamMember> = Vec::new(&env);
    let mut project_repositories2: Vec<ProjectRepository> = Vec::new(&env);

    project_contracts2.push_back(ProjectContract {
        name: String::from_str(&env, "contract name 2"),
        contract_address: Address::generate(&env),
    });

    project_contacts2.push_back(ProjectContact {
        name: String::from_str(&env, "contact name 2"),
        value: String::from_str(&env, "contact email"),
    });

    project_team_members2.push_back(ProjectTeamMember {
        name: String::from_str(&env, "team member name 2"),
        role: String::from_str(&env, "team member role"),
        image_url: String::from_str(&env, "team member image url"),
    });

    project_repositories2.push_back(ProjectRepository {
        label: String::from_str(&env, "repository name 2"),
        url: String::from_str(&env, "repository url"),
    });

    contract.update_project(
        &alice,
        &project.project_id,
        &crate::data_type::UpdateProjectParams {
            image_url: String::from_str(&env, "image url 2"),
            name: String::from_str(&env, "name 2"),
            overview: String::from_str(&env, "overview 2"),
            payout_address: bob.clone(),
            contacts: project_contacts2.clone(),
            contracts: project_contracts2.clone(),
            team_members: project_team_members2.clone(),
            repositories: project_repositories2.clone(),
        },
    );

    let project = contract.get_project_by_id(&project.project_id).unwrap();

    assert_eq!(project.image_url, String::from_str(&env, "image url 2"));
    assert_eq!(project.name, String::from_str(&env, "name 2"));
    assert_eq!(project.overview, String::from_str(&env, "overview 2"));
    assert_eq!(project.contacts.len(), 1);
    assert_eq!(
        project.contacts.get(0).unwrap().name,
        String::from_str(&env, "contact name 2")
    );
    assert_eq!(
        project.contacts.get(0).unwrap().value,
        String::from_str(&env, "contact email")
    );
    assert_eq!(project.contracts.len(), 1);
    assert_eq!(
        project.contracts.get(0).unwrap().name,
        String::from_str(&env, "contract name 2")
    );
    assert_eq!(
        project.contracts.get(0).unwrap().contract_address,
        project_contracts2.get(0).unwrap().contract_address
    );
    assert_eq!(project.team_members.len(), 1);
    assert_eq!(
        project.team_members.get(0).unwrap().name,
        String::from_str(&env, "team member name 2")
    );
    assert_eq!(
        project.team_members.get(0).unwrap().role,
        String::from_str(&env, "team member role")
    );
    assert_eq!(
        project.team_members.get(0).unwrap().image_url,
        String::from_str(&env, "team member image url")
    );
    assert_eq!(project.repositories.len(), 1);
    assert_eq!(
        project.repositories.get(0).unwrap().label,
        String::from_str(&env, "repository name 2")
    );
    assert_eq!(
        project.repositories.get(0).unwrap().url,
        String::from_str(&env, "repository url")
    );
}
