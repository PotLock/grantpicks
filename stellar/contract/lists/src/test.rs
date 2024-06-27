#![cfg(test)]
use crate::data_type::RegistrationStatus;
use crate::soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};
use crate::{internal::ListsContract, internal::ListsContractClient};

fn deploy_contract<'a>(env: &Env, admin: &Address) -> ListsContractClient<'a> {
    let contract = ListsContractClient::new(env, &env.register_contract(None, ListsContract {}));
    contract.initialize(admin);
    contract
}

#[test]
fn test_create_list() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    assert_eq!(new_list.name, String::from_str(&env, "Alice's list"));
    assert_eq!(
        new_list.default_registration_status,
        RegistrationStatus::Pending
    );
    assert_eq!(
        new_list.description,
        String::from_str(&env, "This is a list created by Alice")
    );
    assert_eq!(
        new_list.cover_img_url,
        String::from_str(&env, "https://example.com/alice")
    );
    assert_eq!(new_list.admins.len(), 0);
    assert_eq!(new_list.admin_only_registrations, false);
}

#[test]
fn test_update_list() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let updated_list = contract.update_list(
        &alice,
        &new_list.id,
        &Some(String::from_str(&env, "Alice's updated list")),
        &Some(String::from_str(
            &env,
            "This is an updated list created by Alice",
        )),
        &Some(String::from_str(&env, "https://example.com/alice/updated")),
        &Some(false),
        &Some(RegistrationStatus::Approved),
        &Some(true),
    );

    assert_eq!(
        updated_list.name,
        String::from_str(&env, "Alice's updated list")
    );
    assert_eq!(
        updated_list.default_registration_status,
        RegistrationStatus::Approved
    );
    assert_eq!(
        updated_list.description,
        String::from_str(&env, "This is an updated list created by Alice")
    );
    assert_eq!(
        updated_list.cover_img_url,
        String::from_str(&env, "https://example.com/alice/updated")
    );
    assert_eq!(updated_list.admins.len(), 0);
    assert_eq!(updated_list.admin_only_registrations, true);
}

#[test]
fn test_delete_list() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    contract.delete_list(&alice, &new_list.id);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.len(), 0);
}

#[test]
fn test_upvote() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    contract.upvote(&alice, &new_list.id);

    let upvotes = contract.get_upvotes_for_list(&new_list.id, &None, &None);
    assert_eq!(upvotes.len(), 1);
    assert_eq!(upvotes.get(0).unwrap(), alice);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.get(0).unwrap().total_upvotes_count, 1);
}

#[test]
fn test_remove_upvote() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    contract.upvote(&alice, &new_list.id);

    let upvotes = contract.get_upvotes_for_list(&new_list.id, &None, &None);
    assert_eq!(upvotes.len(), 1);
    assert_eq!(upvotes.get(0).unwrap(), alice);

    contract.remove_upvote(&alice, &new_list.id);

    let upvotes = contract.get_upvotes_for_list(&new_list.id, &None, &None);
    assert_eq!(upvotes.len(), 0);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.get(0).unwrap().total_upvotes_count, 0);
}

#[test]
fn test_transfer_ownership() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let new_owner = contract.transfer_ownership(&alice, &new_list.id, &bob);

    assert_eq!(new_owner, bob);
}

#[test]
fn test_add_admins() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(bob.clone());
    let new_admins = contract.add_admins(&alice, &new_list.id, &admins);

    assert_eq!(new_admins.len(), 1);
    assert_eq!(new_admins.get(0).unwrap(), bob);
}

#[test]
fn test_remove_admins() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let mut admins: Vec<Address> = Vec::new(&env);
    admins.push_back(bob.clone());
    let new_admins = contract.add_admins(&alice, &new_list.id, &admins);

    assert_eq!(new_admins.len(), 1);

    let new_admins = contract.remove_admins(&alice, &new_list.id, &admins);

    assert_eq!(new_admins.len(), 0);
}

#[test]
fn test_registration() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let bob = Address::generate(&env);
    let registration = contract.register_batch(
        &bob,
        &new_list.id,
        &Some(String::from_str(&env, "Hello")),
        &None,
    );

    assert_eq!(registration.len(), 1);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.get(0).unwrap().total_registrations_count, 1);

    let bob_registrations = contract.get_lists_for_registrant(&bob);
    assert_eq!(bob_registrations.len(), 1);
}

#[test]
fn test_unregister() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let bob = Address::generate(&env);
    let registration = contract.register_batch(
        &bob,
        &new_list.id,
        &Some(String::from_str(&env, "Hello")),
        &None,
    );

    assert_eq!(registration.len(), 1);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.get(0).unwrap().total_registrations_count, 1);

    let bob_registrations = contract.get_lists_for_registrant(&bob);
    assert_eq!(bob_registrations.len(), 1);

    contract.unregister(&bob, &None, &Some(registration.get(0).unwrap().id));

    let bob_registrations = contract.get_lists_for_registrant(&bob);
    assert_eq!(bob_registrations.len(), 0);
}

#[test]
fn test_update_registration() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let contract = deploy_contract(&env, &admin);

    let new_list = contract.create_list(
        &alice,
        &String::from_str(&env, "Alice's list"),
        &RegistrationStatus::Pending,
        &Some(String::from_str(&env, "This is a list created by Alice")),
        &Some(String::from_str(&env, "https://example.com/alice")),
        &None,
        &None,
    );

    let bob = Address::generate(&env);
    let registration = contract.register_batch(
        &bob,
        &new_list.id,
        &Some(String::from_str(&env, "Hello")),
        &None,
    );

    assert_eq!(registration.len(), 1);

    let lists = contract.get_lists(&None, &None);
    assert_eq!(lists.get(0).unwrap().total_registrations_count, 1);

    let bob_registrations = contract.get_lists_for_registrant(&bob);
    assert_eq!(bob_registrations.len(), 1);

    let updated_registration = contract.update_registration(
        &alice,
        &new_list.id,
        &registration.get(0).unwrap().id,
        &RegistrationStatus::Approved,
        &Some(String::from_str(&env, "Hello")),
    );

    assert_eq!(updated_registration.status, RegistrationStatus::Approved);
    assert_eq!(
        updated_registration.admin_notes,
        String::from_str(&env, "Hello")
    );
}
