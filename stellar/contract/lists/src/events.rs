use crate::data_type::{ListExternal, RegistrationExternal};
use loam_sdk::soroban_sdk::{self, symbol_short, Address, Env, Vec};

pub fn log_create_list_event(env: &Env, list: ListExternal) {
    env.events().publish(
        (symbol_short!("c_list"), env.current_contract_address()),
        list,
    );
}

pub fn log_update_list_event(env: &Env, list: ListExternal) {
    env.events().publish(
        (symbol_short!("u_list"), env.current_contract_address()),
        list,
    );
}

pub fn log_delete_list_event(env: &Env, list_id: u128) {
    env.events().publish(
        (symbol_short!("d_list"), env.current_contract_address()),
        list_id,
    );
}

pub fn log_upvote_list_event(env: &Env, list_id: u128) {
    env.events().publish(
        (symbol_short!("vote"), env.current_contract_address()),
        list_id,
    );
}

pub fn log_unvote_list_event(env: &Env, list_id: u128) {
    env.events().publish(
        (symbol_short!("unvote"), env.current_contract_address()),
        list_id,
    );
}

pub fn log_update_admins_event(env: &Env, list_id: u128, admins: Vec<Address>) {
    env.events().publish(
        (symbol_short!("u_admins"), env.current_contract_address()),
        (list_id, admins),
    );
}

pub fn log_transfer_ownership_event(env: &Env, list_id: u128, new_owner: Address) {
    env.events().publish(
        (symbol_short!("t_owner"), env.current_contract_address()),
        (list_id, new_owner),
    );
}

pub fn log_create_registration_event(
    env: &Env,
    list_id: u128,
    registration_id: u128,
    registration: RegistrationExternal,
) {
    env.events().publish(
        (symbol_short!("c_reg"), env.current_contract_address()),
        (list_id, registration_id, registration),
    );
}

pub fn log_update_registration_event(
    env: &Env,
    list_id: u128,
    registration_id: u128,
    registration: RegistrationExternal,
) {
    env.events().publish(
        (symbol_short!("u_reg"), env.current_contract_address()),
        (list_id, registration_id, registration),
    );
}

pub fn log_delete_registration_event(env: &Env, list_id: u128, registration_id: u128) {
    env.events().publish(
        (symbol_short!("d_reg"), env.current_contract_address()),
        (list_id, registration_id),
    );
}
