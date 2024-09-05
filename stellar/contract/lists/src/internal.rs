use soroban_sdk::{self, contract, contractimpl, panic_with_error, Address, BytesN, Env, Map, String, Vec};

use crate::{
    data_type::{
        ListExternal, ListInternal, RegistrationExternal, RegistrationInput, RegistrationInternal,
        RegistrationStatus,
    }, error::Error, events::{
        log_create_list_event, log_create_registration_event, log_delete_list_event,
        log_delete_registration_event, log_transfer_ownership_event, log_unvote_list_event,
        log_update_admins_event, log_update_list_event, log_update_registration_event,
        log_upvote_list_event,
    }, lists_writer::{
        add_admin_to_list, add_list, add_list_to_owned_list, add_list_to_registrant_lists, clear_admins, get_list_by_id, get_lists_registered_by, increment_lists_number, read_list_admins, read_lists_owned_by, remove_admin_from_list, remove_list, remove_list_from_owned_list, remove_list_to_registrant_lists
    }, methods::ListsTrait, owner_writer::{read_contract_owner, write_contract_owner}, registration_writer::{
        add_registration, add_registration_id_to_user, add_registration_to_list,
        get_registration_by_id, get_registrations_of_list, get_user_registration_ids_of,
        increment_registration_number, read_registration_number, remove_registration,
        remove_registration_id_to_user, remove_registration_to_list,
    }, storage::{extend_instance, extend_list, extend_user}, upvotes_writer::{
        add_upvote_to_list, add_upvoted_list_to_user, clear_upvotes_for_list, read_list_upvotes,
        read_user_upvoted_lists, remove_upvote_from_list, remove_upvoted_list_from_user,
    }, utils::unwrap_or_blank, validation::{
        validate_cover_image_url, validate_description,
        validate_has_upvoted_list, validate_name, validate_upvotes_status, validate_valid_list_id,
    }
};

#[contract]
pub struct ListsContract;

#[contractimpl]
impl ListsTrait for ListsContract {
    fn initialize(env: &Env, owner: Address) {
        let contract_owner = read_contract_owner(env);
        if contract_owner.is_some() {
            panic_with_error!(env, Error::AlreadyInitialized);
        }

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

        validate_name(env, &name);

        if description.is_some() {
            validate_description(env, &description);
        }

        if cover_image_url.is_some() {
            validate_cover_image_url(env, &cover_image_url);
        }

        let mut internal_admins: Vec<Address> = Vec::new(env);

        if admins.is_some() {
            for admin in admins.unwrap() {
                internal_admins.push_back(admin);
            }
        }

        let list_id = increment_lists_number(env);
        let current_time = env.ledger().timestamp() * 1000;
        let list = ListInternal {
            id: list_id,
            name: name.clone(),
            description: unwrap_or_blank(env, &description),
            cover_image_url: unwrap_or_blank(env, &cover_image_url),
            admin_only_registration: admin_only_registrations.unwrap_or(false),
            default_registration_status: default_registration_status.clone(),
            created_ms: current_time,
            updated_ms: current_time,
            owner: owner.clone(),
        };

        add_list(env, list_id, list);
        add_list_to_owned_list(env, &owner, list_id);
        internal_admins.iter().for_each(|admin| {
            add_admin_to_list(env, list_id, &admin);
        });
        extend_instance(env);

        let external_list = ListExternal {
            id: list_id,
            name,
            description: unwrap_or_blank(env, &description),
            cover_img_url: unwrap_or_blank(env, &cover_image_url),
            owner,
            admins: internal_admins,
            created_ms: current_time,
            updated_ms: current_time,
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
        list_id: u128,
        name: Option<String>,
        description: Option<String>,
        cover_image_url: Option<String>,
        remove_cover_image: Option<bool>,
        default_registration_status: Option<RegistrationStatus>,
        admin_only_registrations: Option<bool>,
    ) -> ListExternal {

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let mut ulist = list.unwrap();
        
        ulist.owner.require_auth();

        if name.is_some() {
            let new_name = name.unwrap();
            validate_name(env, &new_name);
            ulist.name = new_name;
        }

        if description.is_some() {
            validate_description(env, &description);
            let new_description = description.unwrap();
            ulist.description = new_description;
        }

        if cover_image_url.is_some() {
            validate_cover_image_url(env, &cover_image_url);
            let new_cover_image_url = cover_image_url.unwrap();
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
        let admins = read_list_admins(env, list_id);
        extend_instance(env);
        extend_list(env, list_id);

        let external_list = ListExternal {
            id: list_id,
            name: ulist.name.clone(),
            description: ulist.description.clone(),
            cover_img_url: ulist.cover_image_url.clone(),
            owner: ulist.owner.clone(),
            admins,
            created_ms: ulist.created_ms,
            updated_ms: ulist.updated_ms,
            default_registration_status: ulist.default_registration_status.clone(),
            admin_only_registrations: ulist.admin_only_registration,
            total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
            total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
        };

        log_update_list_event(env, external_list.clone());

        external_list
    }

    fn delete_list(env: &Env, list_id: u128) {

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
        
        ulist.owner.require_auth();

        remove_list(env, list_id);
        remove_list_from_owned_list(env, &ulist.owner, list_id);
        clear_upvotes_for_list(env, list_id);
        clear_admins(env, list_id);
        extend_instance(env);
        log_delete_list_event(env, list_id);
    }

    fn upvote(env: &Env, voter: Address, list_id: u128) {
        voter.require_auth();

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
       
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        validate_upvotes_status(env, &voter, list_id);

        add_upvote_to_list(env, list_id, voter.clone());
        add_upvoted_list_to_user(env, voter, list_id);
        extend_instance(env);
        extend_list(env, list_id);
        log_upvote_list_event(env, list_id);
    }

    fn remove_upvote(env: &Env, voter: Address, list_id: u128) {
        voter.require_auth();

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        validate_has_upvoted_list(env, &voter, list_id);

        remove_upvote_from_list(env, list_id, &voter);
        remove_upvoted_list_from_user(env, voter, list_id);
        extend_instance(env);
        log_unvote_list_event(env, list_id);
    }

    fn transfer_ownership(
        env: &Env,
        list_id: u128,
        new_owner_id: Address,
    ) -> Address {
        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
       
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let mut ulist = list.unwrap();
        
        ulist.owner.require_auth();

        remove_list_from_owned_list(env, &ulist.owner, list_id);
        ulist.owner = new_owner_id.clone();
        add_list(env, list_id, ulist.clone());
        add_list_to_owned_list(env, &new_owner_id, list_id);
        extend_instance(env);
        extend_list(env, list_id);
        log_transfer_ownership_event(env, list_id, new_owner_id.clone());

        new_owner_id
    }

    fn add_admins(env: &Env, list_id: u128, admins: Vec<Address>) -> Vec<Address> {
        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
      
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
       
        ulist.owner.require_auth();

        let current_admins = read_list_admins(env, list_id);

        for admin in admins.clone() {
            if current_admins.contains(&admin) {
                panic_with_error!(env, Error::AdminAlreadyExists);
            }
        }

        for admin in admins {
            add_admin_to_list(env, list_id, &admin);
        }

        let new_admins = read_list_admins(env, list_id);
        extend_instance(env);
        extend_list(env, list_id);
        log_update_admins_event(env, list_id, new_admins.clone());

        new_admins
    }

    fn remove_admins(
        env: &Env,
        list_id: u128,
        admins: Vec<Address>,
    ) -> Vec<Address> {
        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
        
        ulist.owner.require_auth();

        let current_admins = read_list_admins(env, list_id);

        for admin in admins.clone() {
            if !current_admins.contains(&admin) {
                panic_with_error!(env, Error::AdminDoesNotExist);
            }
        }

        for admin in admins {
            remove_admin_from_list(env, list_id, admin.clone());
        }

        let new_admins = read_list_admins(env, list_id);
        extend_instance(env);
        extend_list(env, list_id);
        log_update_admins_event(env, list_id, new_admins.clone());

        new_admins
    }

    fn clear_admins(env: &Env, list_id: u128) {
        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
       
        ulist.owner.require_auth();

        clear_admins(env, list_id);
        extend_instance(env);
        extend_list(env, list_id);
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

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
        let admins = read_list_admins(env, list_id);
        let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);
        if !is_admin_or_owner {
            if notes.is_none() {
                panic_with_error!(env, Error::NoteRequired);
            }
        }

        let current_time = env.ledger().timestamp() * 1000;
        let mut registered: Vec<RegistrationExternal> = Vec::new(env);

        if is_admin_or_owner {
            if registrations.is_none() {
                panic_with_error!(env, Error::RegistrationsRequired);
            }
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
                    submited_ms: registration.submitted_ms.unwrap_or(current_time),
                    updated_ms: registration.updated_ms.unwrap_or(current_time),
                    admin_notes: registration.notes.clone(),
                    registrant_notes: notes.clone(),
                    registered_by: submitter.clone(),
                };

                add_registration(env, registration_id, internal_registration);
                add_registration_id_to_user(env, registration.registrant.clone(), registration_id);
                add_registration_to_list(env, list_id, registration_id);
                add_list_to_registrant_lists(env, registration.registrant.clone(), list_id);

                let registration_external = RegistrationExternal {
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

                registered.push_back(registration_external.clone());

                extend_user(env, &registration_external.registrant_id);
                log_create_registration_event(env, list_id, registration_id, registration_external);
            }
        } else {
            let registration_id = increment_registration_number(env);
            let internal_registration = RegistrationInternal {
                id: registration_id,
                list_id,
                registrant_id: submitter.clone(),
                status: ulist.default_registration_status.clone(),
                submited_ms: current_time,
                updated_ms: current_time,
                admin_notes: String::from_str(env, ""),
                registrant_notes: notes.clone(),
                registered_by: submitter.clone(),
            };

            add_registration(env, registration_id, internal_registration);
            add_registration_id_to_user(env, submitter.clone(), registration_id);
            add_registration_to_list(env, list_id, registration_id);
            add_list_to_registrant_lists(env, submitter.clone(), list_id);

            let registration_external = RegistrationExternal {
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

            registered.push_back(registration_external.clone());
            extend_user(env, &registration_external.registrant_id);
            log_create_registration_event(env, list_id, registration_id, registration_external);
        }

        extend_instance(env);
        extend_list(env, list_id);

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
            validate_valid_list_id(env, list_id.unwrap());

            list = get_list_by_id(env, list_id.unwrap());
            
            if list.is_none(){
              panic_with_error!(env, Error::ListNotFound);
            }
        }

        if registration_id.is_some() {
            let current_registration_number = read_registration_number(env);
            if registration_id.unwrap() > current_registration_number{
              panic_with_error!(env, Error::InvalidRegistrationId);
            }
        }

        if list_id.is_some() {
            let ulist = list.unwrap();
            let admins = read_list_admins(env, list_id.unwrap());

            if registration_id.is_some() {
                let uregistration_id = registration_id.unwrap();
                let registration = get_registration_by_id(env, uregistration_id);

                if registration.is_none(){
                  panic_with_error!(env, Error::RegistrationNotFound);
                }

                let uregistration = registration.unwrap();

                let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);

                if uregistration.registrant_id != submitter && !is_admin_or_owner {
                    if  uregistration.registered_by != submitter{
                      panic_with_error!(env, Error::AdminOrOwnerOnly);
                    }
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
                let registration_ids = get_user_registration_ids_of(env, &registrant_id);

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
          

          extend_list(env, ulist.id);
        } else {
            let registrant_id = submitter.clone();
            let registration_ids = get_user_registration_ids_of(env, &registrant_id);
            let list_registered = get_lists_registered_by(env, &registrant_id);

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

        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
       
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let registration = get_registration_by_id(env, registration_id);
       
        if registration.is_none(){
          panic_with_error!(env, Error::RegistrationNotFound);
        }

        let ulist = list.unwrap();
        let admins = read_list_admins(env, list_id);
        let is_admin_or_owner = ulist.owner == submitter || admins.contains(&submitter);
       
        if !is_admin_or_owner {
            panic_with_error!(env, Error::AdminOrOwnerOnly);
        }

        let mut uregistration = registration.unwrap();
        uregistration.status = status;

        if notes.is_some() {
            uregistration.admin_notes = notes.clone().unwrap();
        }

        add_registration(env, registration_id, uregistration.clone());
        extend_instance(env);
        extend_list(env, list_id);

        let registration_external = RegistrationExternal {
            id: registration_id,
            list_id: uregistration.list_id,
            registrant_id: uregistration.registrant_id,
            status: uregistration.status,
            admin_notes: uregistration.admin_notes,
            submitted_ms: uregistration.submited_ms,
            updated_ms: uregistration.updated_ms,
            registrant_notes: uregistration.registrant_notes,
            registered_by: uregistration.registered_by,
        };

        log_update_registration_event(env, list_id, registration_id, registration_external.clone());

        registration_external
    }

    fn get_list(env: &Env, list_id: u128) -> ListExternal {
        validate_valid_list_id(env, list_id);

        let list = get_list_by_id(env, list_id);
        
        if list.is_none(){
          panic_with_error!(env, Error::ListNotFound);
        }

        let ulist = list.unwrap();
        let admins = read_list_admins(env, list_id);

        ListExternal {
            id: list_id,
            name: ulist.name.clone(),
            description: ulist.description.clone(),
            cover_img_url: ulist.description.clone(),
            owner: ulist.owner.clone(),
            admins,
            created_ms: ulist.created_ms,
            updated_ms: ulist.updated_ms,
            default_registration_status: ulist.default_registration_status.clone(),
            admin_only_registrations: ulist.admin_only_registration,
            total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
            total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
        }
    }

    fn get_lists(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<ListExternal> {
        let internal_skip: usize = from_index.unwrap_or(0).try_into().unwrap();
        let mut internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();

        if internal_limit > 20 {
            internal_limit = 20;
        }

        let mut result: Vec<ListExternal> = Vec::new(env);

        for list_id in internal_skip..internal_skip+internal_limit{
            let list = get_list_by_id(env, list_id as u128);

            if list.is_some(){
              let total_upvotes_count:u64 = read_list_upvotes(env, list_id as u128).len().into();
              let total_registrations_count:u64 = get_registrations_of_list(env, list_id as u128).len().into();
              let ulist = list.unwrap();

              result.push_back(ListExternal {
                  id: ulist.id,
                  name: ulist.name.clone(),
                  description: ulist.description.clone(),
                  cover_img_url: ulist.description.clone(),
                  owner: ulist.owner.clone(),
                  admins: read_list_admins(env, ulist.id),
                  created_ms: ulist.created_ms,
                  updated_ms: ulist.updated_ms,
                  default_registration_status: ulist.default_registration_status.clone(),
                  admin_only_registrations: ulist.admin_only_registration,
                  total_registrations_count,
                  total_upvotes_count,
              });
            }
        }

        result
    }

    fn get_lists_for_owner(env: &Env, owner_id: Address) -> Vec<ListExternal> {
        let owned_list = read_lists_owned_by(env, &owner_id);
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
                    admins: read_list_admins(env, ulist.id),
                    created_ms: ulist.created_ms,
                    updated_ms: ulist.updated_ms,
                    total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
                    total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
                });
            }
        });

        lists
    }

    fn get_lists_for_registrant(env: &Env, registrant_id: Address) -> Vec<ListExternal> {
        let registered_lists = get_lists_registered_by(env, &registrant_id);
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
                    admins: read_list_admins(env, ulist.id),
                    created_ms: ulist.created_ms,
                    updated_ms: ulist.updated_ms,
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
        let mut internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
      
        if internal_limit > 20 {
            internal_limit = 20;
        }

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
        let upvoted_list = read_user_upvoted_lists(env, &user);
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
        let mut internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        
        if internal_limit > 20 {
            internal_limit = 20;
        }

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
                    admins: read_list_admins(env, ulist.id),
                    created_ms: ulist.created_ms,
                    updated_ms: ulist.updated_ms,
                    total_registrations_count: get_registrations_of_list(env, list_id).len().into(),
                    total_upvotes_count: read_list_upvotes(env, list_id).len().into(),
                });
            });

        result
    }

    fn get_registration(env: &Env, registration_id: u128) -> RegistrationExternal {
        let registration = get_registration_by_id(env, registration_id);
        
        if registration.is_none(){
          panic_with_error!(env, Error::RegistrationNotFound);
        }

        let uregistration = registration.unwrap();

        RegistrationExternal {
            id: registration_id,
            list_id: uregistration.list_id,
            registrant_id: uregistration.registrant_id,
            status: uregistration.status,
            admin_notes: uregistration.admin_notes,
            submitted_ms: uregistration.submited_ms,
            updated_ms: uregistration.updated_ms,
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
        let mut internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        
        if internal_limit > 20 {
            internal_limit = 20;
        }

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
                    submitted_ms: registration.submited_ms,
                    updated_ms: registration.updated_ms,
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
        let registration_ids = get_user_registration_ids_of(env, &registrant_id);
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
        let mut internal_limit: usize = limit.unwrap_or(10).try_into().unwrap();
        
        if internal_limit > 20 {
            internal_limit = 20;
        }

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
                    submitted_ms: registration.submited_ms,
                    updated_ms: registration.updated_ms,
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
        let registration_ids = get_user_registration_ids_of(env, &registrant_id);

        if required_status.is_none() && list_id.is_none() {
            return !registration_ids.is_empty();
        }

        if required_status.is_none() {
            return get_lists_registered_by(env, &registrant_id).contains(list_id.unwrap());
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
        read_contract_owner(env).unwrap()
    }

    fn upgrade(env: &Env, wasm_hash: BytesN<32>) {
        let contract_owner = read_contract_owner(env);
        
        contract_owner.unwrap().require_auth();

        env.deployer().update_current_contract_wasm(wasm_hash);
        extend_instance(env);
    }

    fn admins(env: &Env, list_id: u128) -> Vec<Address> {
        let admins = read_list_admins(env, list_id);
        extend_instance(env);

        admins
    }
}
