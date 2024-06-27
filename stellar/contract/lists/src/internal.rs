use loam_sdk::soroban_sdk::{self, contract, contractimpl, Address, Env, Map, String, Vec};

use crate::{
    data_type::{
        ListExternal, ListInternal, RegistrationExternal, RegistrationInput, RegistrationInternal,
        RegistrationStatus,
    },
    events::{
        log_create_list_event, log_create_registration_event, log_delete_list_event,
        log_delete_registration_event, log_transfer_ownership_event, log_unvote_list_event,
        log_update_admins_event, log_update_list_event, log_update_registration_event,
        log_upvote_list_event,
    },
    lists_writer::{
        add_admin_to_list, add_list, add_list_to_owned_list, add_list_to_registrant_lists,
        clear_admins, get_list_by_id, get_lists_registered_by, increment_lists_number,
        read_admins_of_list, read_lists, read_lists_number, read_lists_owned_by,
        remove_admin_from_list, remove_list, remove_list_from_owned_list,
        remove_list_to_registrant_lists,
    },
    methods::ListsTrait,
    owner_writer::{read_contract_owner, write_contract_owner},
    registration_writer::{
        add_registration, add_registration_id_to_user, add_registration_to_list,
        get_registration_by_id, get_registrations_of_list, get_user_registration_ids_of,
        increment_registration_number, read_registration_number, remove_registration,
        remove_registration_id_to_user, remove_registration_to_list,
    },
    storage::extend_instance,
    upvotes_writer::{
        add_upvote_to_list, add_upvoted_list_to_user, clear_upvotes_for_list, read_list_upvotes,
        read_user_upvoted_lists, remove_upvote_from_list, remove_upvoted_list_from_user,
    },
};

#[contract]
pub struct ListsContract;

#[contractimpl]
impl ListsTrait for ListsContract {
    fn initialize(env: &Env, owner: Address) {
        write_contract_owner(env, &owner);
    }

    fn create_list(
        env: &Env,
        owner: Address,
        name: String,
        default_registration_status: RegistrationStatus,
        description: Option<String>,
        cover_image_url: Option<String>,
        admins: Option<Vec<Address>>,
        admin_only_registrations: Option<bool>,
    ) -> ListExternal {
        owner.require_auth();

        assert!(!name.is_empty(), "Name cannot be empty");

        if description.is_some() {
            assert!(
                description.clone().unwrap().len() < 500,
                "Description too long. max 500 characters"
            );
        }

        if cover_image_url.is_some() {
            assert!(
                cover_image_url.clone().unwrap().len() < 200,
                "Cover image url too long. max 200 characters"
            );
        }

        let mut internal_admins: Vec<Address> = Vec::new(env);

        if admins.is_some() {
            for admin in admins.unwrap() {
                internal_admins.push_back(admin);
            }
        }

        let list_id = increment_lists_number(env);
        let current_time = env.ledger().timestamp();
        let list = ListInternal {
            id: list_id,
            name: name.clone(),
            description: description
                .clone()
                .unwrap_or_else(|| String::from_str(env, "")),
            cover_image_url: cover_image_url
                .clone()
                .unwrap_or_else(|| String::from_str(env, "")),
            admin_only_registration: admin_only_registrations.unwrap_or(false),
            default_registration_status: default_registration_status.clone(),
            created_at: current_time,
            updated_at: current_time,
            owner: owner.clone(),
        };

        add_list(env, list_id, list);
        add_list_to_owned_list(env, owner.clone(), list_id);
        internal_admins.iter().for_each(|admin| {
            add_admin_to_list(env, list_id, admin);
        });
        extend_instance(env);

        let external_list = ListExternal {
            id: list_id,
            name,
            description: description
                .clone()
                .unwrap_or_else(|| String::from_str(env, "")),
            cover_img_url: cover_image_url
                .clone()
                .unwrap_or_else(|| String::from_str(env, "")),
            owner,
            admins: internal_admins,
            created_at: current_time,
            updated_at: current_time,
            default_registration_status,
            admin_only_registrations: admin_only_registrations.unwrap_or(false),
            total_registrations_count: 0,
            total_upvotes_count: 0,
        };

        log_create_list_event(env, external_list.clone());

        external_list
    }

    fn update_list(
        env: &Env,
        owner: Address,
        list_id: u128,
        name: Option<String>,
        description: Option<String>,
        cover_image_url: Option<String>,
        remove_cover_image: Option<bool>,
        default_registration_status: Option<RegistrationStatus>,
        admin_only_registrations: Option<bool>,
    ) -> ListExternal {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let mut ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can update the list");

        if name.is_some() {
            let new_name = name.unwrap();
            assert!(!new_name.is_empty(), "Name cannot be empty");
            ulist.name = new_name;
        }

        if description.is_some() {
            let new_description = description.unwrap();
            assert!(
                new_description.len() < 500,
                "Description too long. max 500 characters"
            );
            ulist.description = new_description;
        }

        if cover_image_url.is_some() {
            let new_cover_image_url = cover_image_url.unwrap();
            assert!(
                new_cover_image_url.len() < 200,
                "Cover image url too long. max 200 characters"
            );
            ulist.cover_image_url = new_cover_image_url;
        }

        if remove_cover_image.is_some() && remove_cover_image.unwrap() {
            ulist.cover_image_url = String::from_str(env, "");
        }

        if default_registration_status.is_some() {
            ulist.default_registration_status = default_registration_status.clone().unwrap();
        }

        if admin_only_registrations.is_some() {
            ulist.admin_only_registration = admin_only_registrations.unwrap();
        }

        add_list(env, list_id, ulist.clone());
        let admins = read_admins_of_list(env, list_id);
        extend_instance(env);

        let external_list = ListExternal {
            id: list_id,
            name: ulist.name.clone(),
            description: ulist.description.clone(),
            cover_img_url: ulist.cover_image_url.clone(),
            owner: ulist.owner.clone(),
            admins,
            created_at: ulist.created_at,
            updated_at: ulist.updated_at,
            default_registration_status: ulist.default_registration_status.clone(),
            admin_only_registrations: ulist.admin_only_registration,
            total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
            total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
        };

        log_update_list_event(env, external_list.clone());

        external_list
    }

    fn delete_list(env: &Env, owner: Address, list_id: u128) {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can delete the list");

        remove_list(env, list_id);
        remove_list_from_owned_list(env, owner, list_id);
        clear_upvotes_for_list(env, list_id);
        clear_admins(env, list_id);
        extend_instance(env);
        log_delete_list_event(env, list_id);
    }

    fn upvote(env: &Env, voter: Address, list_id: u128) {
        voter.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let upvotes = read_list_upvotes(env, list_id);
        assert!(!upvotes.contains(&voter), "Already upvoted");

        add_upvote_to_list(env, list_id, voter.clone());
        add_upvoted_list_to_user(env, voter, list_id);
        extend_instance(env);
        log_upvote_list_event(env, list_id);
    }

    fn remove_upvote(env: &Env, voter: Address, list_id: u128) {
        voter.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let upvotes = read_list_upvotes(env, list_id);
        assert!(upvotes.contains(&voter), "Not upvoted");

        remove_upvote_from_list(env, list_id, &voter);
        remove_upvoted_list_from_user(env, voter, list_id);
        extend_instance(env);
        log_unvote_list_event(env, list_id);
    }

    fn transfer_ownership(
        env: &Env,
        owner: Address,
        list_id: u128,
        new_owner_id: Address,
    ) -> Address {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let mut ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can transfer the list");

        ulist.owner = new_owner_id.clone();
        add_list(env, list_id, ulist.clone());
        remove_list_from_owned_list(env, owner, list_id);
        add_list_to_owned_list(env, new_owner_id.clone(), list_id);
        extend_instance(env);
        log_transfer_ownership_event(env, list_id, new_owner_id.clone());

        new_owner_id
    }

    fn add_admins(env: &Env, owner: Address, list_id: u128, admins: Vec<Address>) -> Vec<Address> {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can add admins");

        let current_admins = read_admins_of_list(env, list_id);

        for admin in admins.clone() {
            assert!(!current_admins.contains(&admin), "Admin already exists");
        }

        for admin in admins {
            add_admin_to_list(env, list_id, admin.clone());
        }

        let new_admins = read_admins_of_list(env, list_id);
        extend_instance(env);
        log_update_admins_event(env, list_id, new_admins.clone());

        new_admins
    }

    fn remove_admins(
        env: &Env,
        owner: Address,
        list_id: u128,
        admins: Vec<Address>,
    ) -> Vec<Address> {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can remove admins");

        let current_admins = read_admins_of_list(env, list_id);

        for admin in admins.clone() {
            assert!(current_admins.contains(&admin), "Admin does not exist");
        }

        for admin in admins {
            remove_admin_from_list(env, list_id, admin.clone());
        }

        let new_admins = read_admins_of_list(env, list_id);
        extend_instance(env);
        log_update_admins_event(env, list_id, new_admins.clone());

        new_admins
    }

    fn clear_admins(env: &Env, owner: Address, list_id: u128) {
        owner.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        assert!(ulist.owner == owner, "Only the owner can clear admins");

        clear_admins(env, list_id);
        extend_instance(env);
        log_update_admins_event(env, list_id, Vec::new(env));
    }

    fn register_batch(
        env: &Env,
        submitter: Address,
        list_id: u128,
        notes: Option<String>,
        registrations: Option<Vec<RegistrationInput>>,
    ) -> Vec<RegistrationExternal> {
        submitter.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        let admins = read_admins_of_list(env, list_id);
        let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);
        if !is_admin_or_owner {
            assert!(notes.is_some(), "Notes Reqired for non-admin");
        }

        let current_time = env.ledger().timestamp();
        let mut registered: Vec<RegistrationExternal> = Vec::new(env);

        if is_admin_or_owner {
            assert!(
                registrations.is_some(),
                "Registrations required for admin or owner"
            );
        }

        let notes = notes.clone().unwrap_or_else(|| String::from_str(env, ""));
        if is_admin_or_owner {
            for registration in registrations.unwrap() {
                let registration_id = increment_registration_number(env);

                let internal_registration = RegistrationInternal {
                    id: registration_id,
                    list_id,
                    registrant_id: registration.registrant.clone(),
                    status: registration.status.clone(),
                    submited_at: registration.submitted_ms.unwrap_or(current_time),
                    updated_at: registration.updated_ms.unwrap_or(current_time),
                    admin_notes: registration.notes.clone(),
                    registrant_notes: notes.clone(),
                    registered_by: submitter.clone(),
                };

                add_registration(env, registration_id, internal_registration);
                add_registration_id_to_user(env, registration.registrant.clone(), registration_id);
                add_registration_to_list(env, list_id, registration_id);
                add_list_to_registrant_lists(env, registration.registrant.clone(), list_id);

                let registration = RegistrationExternal {
                    id: registration_id,
                    list_id,
                    registrant_id: registration.registrant.clone(),
                    status: registration.status.clone(),
                    admin_notes: registration.notes.clone(),
                    submitted_ms: current_time,
                    updated_ms: current_time,
                    registrant_notes: notes.clone(),
                    registered_by: submitter.clone(),
                };

                registered.push_back(registration.clone());

                log_create_registration_event(env, list_id, registration_id, registration.clone());
            }
        } else {
            let registration_id = increment_registration_number(env);
            let internal_registration = RegistrationInternal {
                id: registration_id,
                list_id,
                registrant_id: submitter.clone(),
                status: ulist.default_registration_status.clone(),
                submited_at: current_time,
                updated_at: current_time,
                admin_notes: String::from_str(env, ""),
                registrant_notes: notes.clone(),
                registered_by: submitter.clone(),
            };

            add_registration(env, registration_id, internal_registration);
            add_registration_id_to_user(env, submitter.clone(), registration_id);
            add_registration_to_list(env, list_id, registration_id);
            add_list_to_registrant_lists(env, submitter.clone(), list_id);

            let registration = RegistrationExternal {
                id: registration_id,
                list_id,
                registrant_id: submitter.clone(),
                status: ulist.default_registration_status.clone(),
                admin_notes: String::from_str(env, ""),
                submitted_ms: current_time,
                updated_ms: current_time,
                registrant_notes: notes.clone(),
                registered_by: submitter.clone(),
            };

            registered.push_back(registration.clone());
            log_create_registration_event(env, list_id, registration_id, registration.clone());
        }

        extend_instance(env);

        registered
    }

    fn unregister(
        env: &Env,
        submitter: Address,
        list_id: Option<u128>,
        registration_id: Option<u128>,
    ) {
        submitter.require_auth();

        let mut list: Option<ListInternal> = None;

        if list_id.is_some() {
            let current_list = read_lists_number(env);
            assert!(list_id.unwrap() <= current_list, "Invalid List ID");

            list = get_list_by_id(env, list_id.unwrap());
            assert!(list.is_some(), "List not found");
        }

        if registration_id.is_some() {
            let current_registration_number = read_registration_number(env);
            assert!(
                registration_id.unwrap() <= current_registration_number,
                "Invalid Registration ID"
            );
        }

        if list_id.is_some() {
            let ulist = list.unwrap();
            let admins = read_admins_of_list(env, list_id.unwrap());

            if registration_id.is_some() {
                let uregistration_id = registration_id.unwrap();
                let registration = get_registration_by_id(env, uregistration_id);
                assert!(registration.is_some(), "Registration not found");
                let uregistration = registration.unwrap();

                let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);

                if uregistration.registrant_id != submitter && !is_admin_or_owner {
                    assert!(
                        uregistration.registered_by == submitter,
                        "Only the registrant or the admin can unregister"
                    );
                }

                remove_registration(env, uregistration_id);
                remove_list_to_registrant_lists(
                    env,
                    uregistration.registrant_id.clone(),
                    uregistration.list_id,
                );
                remove_registration_to_list(env, uregistration.list_id, uregistration_id);
                remove_registration_id_to_user(env, uregistration.registrant_id, uregistration_id);
                log_delete_registration_event(env, uregistration.list_id, uregistration_id);
            } else {
                let registrant_id = submitter.clone();
                let registration_ids = get_user_registration_ids_of(env, registrant_id.clone());

                registration_ids.iter().for_each(|registration_id| {
                    let registration = get_registration_by_id(env, registration_id);
                    if registration.is_some() {
                        let uregistration = registration.unwrap();
                        if uregistration.list_id == ulist.id {
                            remove_registration(env, registration_id);
                            remove_list_to_registrant_lists(
                                env,
                                uregistration.registrant_id.clone(),
                                uregistration.list_id,
                            );
                            remove_registration_to_list(
                                env,
                                uregistration.list_id,
                                registration_id,
                            );
                            remove_registration_id_to_user(
                                env,
                                uregistration.registrant_id,
                                registration_id,
                            );
                            log_delete_registration_event(
                                env,
                                uregistration.list_id,
                                registration_id,
                            );
                        }
                    }
                });
            }
        } else {
            let registrant_id = submitter.clone();
            let registration_ids = get_user_registration_ids_of(env, registrant_id.clone());
            let list_registered = get_lists_registered_by(env, registrant_id.clone());

            registration_ids.iter().for_each(|registration_id| {
                let registration = get_registration_by_id(env, registration_id);
                if registration.is_some() {
                    let uregistration = registration.unwrap();
                    if list_registered.contains(uregistration.list_id) {
                        remove_registration(env, registration_id);
                        remove_list_to_registrant_lists(
                            env,
                            uregistration.registrant_id.clone(),
                            uregistration.list_id,
                        );
                        remove_registration_to_list(env, uregistration.list_id, registration_id);
                        remove_registration_id_to_user(
                            env,
                            uregistration.registrant_id,
                            registration_id,
                        );
                        log_delete_registration_event(env, uregistration.list_id, registration_id);
                    }
                }
            });
        }
        extend_instance(env);
    }

    fn update_registration(
        env: &Env,
        submitter: Address,
        list_id: u128,
        registration_id: u128,
        status: RegistrationStatus,
        notes: Option<String>,
    ) -> RegistrationExternal {
        submitter.require_auth();

        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let registration = get_registration_by_id(env, registration_id);
        assert!(registration.is_some(), "Registration not found");

        let ulist = list.unwrap();
        let admins = read_admins_of_list(env, list_id);
        let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);
        assert!(
            is_admin_or_owner,
            "Only owner and admins can update registrations"
        );

        let mut uregistration = registration.unwrap();
        uregistration.status = status;

        if notes.is_some() {
            uregistration.admin_notes = notes.clone().unwrap();
        }

        add_registration(env, registration_id, uregistration.clone());
        extend_instance(env);

        let registration_external = RegistrationExternal {
            id: registration_id,
            list_id: uregistration.list_id,
            registrant_id: uregistration.registrant_id,
            status: uregistration.status,
            admin_notes: uregistration.admin_notes,
            submitted_ms: uregistration.submited_at,
            updated_ms: uregistration.updated_at,
            registrant_notes: uregistration.registrant_notes,
            registered_by: uregistration.registered_by,
        };

        log_update_registration_event(env, list_id, registration_id, registration_external.clone());

        registration_external
    }

    fn get_list(env: &Env, list_id: u128) -> ListExternal {
        let current_list = read_lists_number(env);
        assert!(list_id <= current_list, "Invalid List ID");

        let list = get_list_by_id(env, list_id);
        assert!(list.is_some(), "List not found");

        let ulist = list.unwrap();
        let admins = read_admins_of_list(env, list_id);

        ListExternal {
            id: list_id,
            name: ulist.name.clone(),
            description: ulist.description.clone(),
            cover_img_url: ulist.description.clone(),
            owner: ulist.owner.clone(),
            admins,
            created_at: ulist.created_at,
            updated_at: ulist.updated_at,
            default_registration_status: ulist.default_registration_status.clone(),
            admin_only_registrations: ulist.admin_only_registration,
            total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
            total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
        }
    }

    fn get_lists(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<ListExternal> {
        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();

        assert!(internal_limit <= 20, "Limit cannot be more than 20");

        let lists = read_lists(env);
        let keys = lists.keys();
        let mut result: Vec<ListExternal> = Vec::new(env);

        keys.iter()
            .take(internal_limit)
            .skip(internal_skip)
            .for_each(|id| {
                let list = lists.get(id);
                if list.is_some() {
                    let ulist = list.unwrap();
                    result.push_back(ListExternal {
                        id: ulist.id,
                        name: ulist.name.clone(),
                        description: ulist.description.clone(),
                        cover_img_url: ulist.description.clone(),
                        owner: ulist.owner.clone(),
                        admin_only_registrations: ulist.admin_only_registration,
                        default_registration_status: ulist.default_registration_status.clone(),
                        admins: read_admins_of_list(env, ulist.id),
                        created_at: ulist.created_at,
                        updated_at: ulist.updated_at,
                        total_registrations_count: get_registrations_of_list(env, ulist.id)
                            .len()
                            .into(),
                        total_upvotes_count: read_list_upvotes(env, ulist.id).len().into(),
                    });
                }
            });

        result
    }

    fn get_lists_for_owner(env: &Env, owner_id: Address) -> Vec<ListExternal> {
        let owned_list = read_lists_owned_by(env, owner_id);
        let mut lists: Vec<ListExternal> = Vec::new(env);

        owned_list.iter().for_each(|list_id| {
            let list = get_list_by_id(env, list_id);

            if list.is_some() {
                let ulist = list.unwrap();
                lists.push_back(ListExternal {
                    id: ulist.id,
                    name: ulist.name.clone(),
                    description: ulist.description.clone(),
                    cover_img_url: ulist.description.clone(),
                    owner: ulist.owner.clone(),
                    admin_only_registrations: ulist.admin_only_registration,
                    default_registration_status: ulist.default_registration_status.clone(),
                    admins: read_admins_of_list(env, ulist.id),
                    created_at: ulist.created_at,
                    updated_at: ulist.updated_at,
                    total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
                    total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
                });
            }
        });

        lists
    }

    fn get_lists_for_registrant(env: &Env, registrant_id: Address) -> Vec<ListExternal> {
        let registered_lists = get_lists_registered_by(env, registrant_id);
        let mut lists: Vec<ListExternal> = Vec::new(env);

        registered_lists.iter().for_each(|list_id| {
            let list = get_list_by_id(env, list_id);

            if list.is_some() {
                let ulist = list.unwrap();
                lists.push_back(ListExternal {
                    id: ulist.id,
                    name: ulist.name.clone(),
                    description: ulist.description.clone(),
                    cover_img_url: ulist.description.clone(),
                    owner: ulist.owner.clone(),
                    admin_only_registrations: ulist.admin_only_registration,
                    default_registration_status: ulist.default_registration_status.clone(),
                    admins: read_admins_of_list(env, ulist.id),
                    created_at: ulist.created_at,
                    updated_at: ulist.updated_at,
                    total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
                    total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
                });
            }
        });

        lists
    }

    fn get_upvotes_for_list(
        env: &Env,
        list_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Address> {
        let upvotes = read_list_upvotes(env, list_id);
        let mut result: Vec<Address> = Vec::new(env);

        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        assert!(internal_limit <= 20, "Limit cannot be more than 20");

        upvotes
            .iter()
            .skip(internal_skip)
            .take(internal_limit)
            .for_each(|upvoter| {
                result.push_back(upvoter.clone());
            });

        result
    }

    fn get_upvoted_lists_for_account(
        env: &Env,
        user: Address,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ListExternal> {
        let upvoted_list = read_user_upvoted_lists(env, user);
        let mut lists: Map<u128, ListInternal> = Map::new(env);
        let mut result: Vec<ListExternal> = Vec::new(env);

        upvoted_list.iter().for_each(|list_id| {
            let list = get_list_by_id(env, list_id);
            if list.is_some() {
                let ulist = list.unwrap();
                lists.set(ulist.id, ulist);
            }
        });

        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        assert!(internal_limit <= 20, "Limit cannot be more than 20");

        lists
            .keys()
            .iter()
            .skip(internal_skip)
            .take(internal_limit)
            .for_each(|list_id| {
                let ulist = lists.get(list_id).unwrap();
                result.push_back(ListExternal {
                    id: ulist.id,
                    name: ulist.name.clone(),
                    description: ulist.description.clone(),
                    cover_img_url: ulist.description.clone(),
                    owner: ulist.owner.clone(),
                    admin_only_registrations: ulist.admin_only_registration,
                    default_registration_status: ulist.default_registration_status.clone(),
                    admins: read_admins_of_list(env, ulist.id),
                    created_at: ulist.created_at,
                    updated_at: ulist.updated_at,
                    total_registrations_count: get_registrations_of_list(env, list_id)
                        .len()
                        .into(),
                    total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
                });
            });

        result
    }

    fn get_registration(env: &Env, registration_id: u128) -> RegistrationExternal {
        let registration = get_registration_by_id(env, registration_id);
        assert!(registration.is_some(), "Registration Not Found");

        let uregistration = registration.unwrap();

        RegistrationExternal {
            id: registration_id,
            list_id: uregistration.list_id,
            registrant_id: uregistration.registrant_id,
            status: uregistration.status,
            admin_notes: uregistration.admin_notes,
            submitted_ms: uregistration.submited_at,
            updated_ms: uregistration.updated_at,
            registrant_notes: uregistration.registrant_notes,
            registered_by: uregistration.registered_by,
        }
    }

    fn get_registrations_for_list(
        env: &Env,
        list_id: u128,
        required_status: Option<RegistrationStatus>,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RegistrationExternal> {
        let registration_ids = get_registrations_of_list(env, list_id);
        let mut registrations: Map<u128, RegistrationInternal> = Map::new(env);
        let mut result: Vec<RegistrationExternal> = Vec::new(env);

        if required_status.is_none() {
            registration_ids.iter().for_each(|registration_id| {
                let registration = get_registration_by_id(env, registration_id);
                if registration.is_some() {
                    let uregistration = registration.unwrap();
                    registrations.set(uregistration.id, uregistration);
                }
            });
        } else {
            let ustatus = required_status.unwrap();
            registration_ids.iter().for_each(|registration_id| {
                let registration = get_registration_by_id(env, registration_id);
                if registration.is_some() {
                    let uregistration = registration.unwrap();
                    if uregistration.status == ustatus {
                        registrations.set(uregistration.id, uregistration);
                    }
                }
            });
        }

        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        assert!(internal_limit <= 20, "Limit cannot be more than 20");

        registrations
            .keys()
            .iter()
            .skip(internal_skip)
            .take(internal_limit)
            .for_each(|registration_id| {
                let registration = registrations.get(registration_id).unwrap();
                result.push_back(RegistrationExternal {
                    id: registration_id,
                    list_id: registration.list_id,
                    registrant_id: registration.registrant_id.clone(),
                    status: registration.status.clone(),
                    admin_notes: registration.admin_notes.clone(),
                    submitted_ms: registration.submited_at,
                    updated_ms: registration.updated_at,
                    registrant_notes: registration.registrant_notes.clone(),
                    registered_by: registration.registered_by.clone(),
                });
            });

        extend_instance(env);

        result
    }

    fn get_registrations_for_registrant(
        env: &Env,
        registrant_id: Address,
        required_status: Option<RegistrationStatus>,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RegistrationExternal> {
        let registration_ids = get_user_registration_ids_of(env, registrant_id.clone());
        let mut registrations: Map<u128, RegistrationInternal> = Map::new(env);
        let mut result: Vec<RegistrationExternal> = Vec::new(env);

        if required_status.is_none() {
            registration_ids.iter().for_each(|registration_id| {
                let registration = get_registration_by_id(env, registration_id);
                if registration.is_some() {
                    let uregistration = registration.unwrap();
                    registrations.set(uregistration.id, uregistration);
                }
            });
        } else {
            let ustatus = required_status.unwrap();
            registration_ids.iter().for_each(|registration_id| {
                let registration = get_registration_by_id(env, registration_id);
                if registration.is_some() {
                    let uregistration = registration.unwrap();
                    if uregistration.status == ustatus {
                        registrations.set(uregistration.id, uregistration);
                    }
                }
            });
        }

        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        assert!(internal_limit <= 20, "Limit cannot be more than 20");

        registrations
            .keys()
            .iter()
            .skip(internal_skip)
            .take(internal_limit)
            .for_each(|registration_id| {
                let registration = registrations.get(registration_id).unwrap();
                result.push_back(RegistrationExternal {
                    id: registration_id,
                    list_id: registration.list_id,
                    registrant_id: registration.registrant_id.clone(),
                    status: registration.status.clone(),
                    admin_notes: registration.admin_notes.clone(),
                    submitted_ms: registration.submited_at,
                    updated_ms: registration.updated_at,
                    registrant_notes: registration.registrant_notes.clone(),
                    registered_by: registration.registered_by.clone(),
                });
            });

        extend_instance(env);

        result
    }

    fn is_registered(
        env: &Env,
        list_id: Option<u128>,
        registrant_id: Address,
        required_status: Option<RegistrationStatus>,
    ) -> bool {
        extend_instance(env);
        let registration_ids = get_user_registration_ids_of(env, registrant_id.clone());

        if required_status.is_none() && list_id.is_none() {
            return !registration_ids.is_empty();
        }

        if list_id.is_some() && required_status.is_none() {
            return get_lists_registered_by(env, registrant_id.clone()).contains(list_id.unwrap());
        }

        let status = required_status.unwrap();
        let ulist_id = list_id.unwrap();
        

        registration_ids.iter().any(|registration_id| {
            let registration = get_registration_by_id(env, registration_id);
            if registration.is_some() {
                let uregistration = registration.unwrap();
                return uregistration.list_id == ulist_id && uregistration.status == status;
            }
            false
        })
    }

    fn owner(env: &Env) -> Address {
        read_contract_owner(env)
    }
}
