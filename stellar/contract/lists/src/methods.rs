use soroban_sdk::{Address, BytesN, Env, String, Vec};

use crate::data_type::{ListExternal, RegistrationExternal, RegistrationInput, RegistrationStatus};

pub trait ListsTrait {
    fn initialize(env: &Env, owner: Address);
    fn create_list(
        env: &Env,
        owner: Address,
        name: String,
        default_registration_status: RegistrationStatus,
        description: Option<String>,
        cover_image_url: Option<String>,
        admins: Option<Vec<Address>>,
        admin_only_registrations: Option<bool>,
    ) -> ListExternal;
    fn update_list(
        env: &Env,
        list_id: u128,
        name: Option<String>,
        description: Option<String>,
        cover_image_url: Option<String>,
        remove_cover_image: Option<bool>,
        default_registration_status: Option<RegistrationStatus>,
        admin_only_registrations: Option<bool>,
    ) -> ListExternal;
    fn delete_list(env: &Env, list_id: u128);
    fn upvote(env: &Env, voter: Address, list_id: u128);
    fn remove_upvote(env: &Env, voter: Address, list_id: u128);
    fn transfer_ownership(
        env: &Env,
        list_id: u128,
        new_owner_id: Address,
    ) -> Address;
    fn add_admins(env: &Env, list_id: u128, admins: Vec<Address>) -> Vec<Address>;
    fn remove_admins(
        env: &Env,
        list_id: u128,
        admins: Vec<Address>,
    ) -> Vec<Address>;
    fn clear_admins(env: &Env, list_id: u128);
    fn register_batch(
        env: &Env,
        submitter: Address,
        list_id: u128,
        notes: Option<String>,
        registrations: Option<Vec<RegistrationInput>>,
    ) -> Vec<RegistrationExternal>;
    fn unregister(
        env: &Env,
        submitter: Address,
        list_id: Option<u128>,
        registration_id: Option<u128>,
    );
    fn update_registration(
        env: &Env,
        submitter: Address,
        list_id: u128,
        registration_id: u128,
        status: RegistrationStatus,
        notes: Option<String>,
    ) -> RegistrationExternal;

    fn get_list(env: &Env, list_id: u128) -> ListExternal;

    fn get_lists(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<ListExternal>;

    fn get_lists_for_owner(env: &Env, owner_id: Address) -> Vec<ListExternal>;

    fn get_lists_for_registrant(env: &Env, registrant_id: Address) -> Vec<ListExternal>;

    fn get_upvotes_for_list(
        env: &Env,
        list_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Address>;

    fn get_upvoted_lists_for_account(
        env: &Env,
        user: Address,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ListExternal>;

    // REGISTRATIONS

    fn get_registration(env: &Env, registration_id: u128) -> RegistrationExternal;

    fn get_registrations_for_list(
        env: &Env,
        list_id: u128,
        required_status: Option<RegistrationStatus>,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RegistrationExternal>;

    fn get_registrations_for_registrant(
        env: &Env,
        registrant_id: Address,
        required_status: Option<RegistrationStatus>,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RegistrationExternal>;

    fn is_registered(
        env: &Env,
        list_id: u128,
        registrant_id: Address,
        required_status: Option<RegistrationStatus>, // defaults to Approved
    ) -> bool;

    fn owner(env: &Env) -> Address;
    fn upgrade(env: &Env, new_wasm_hash: BytesN<32>);
    fn admins(env: &Env, list_id: u128) -> Vec<Address>;
}
