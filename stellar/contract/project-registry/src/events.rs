use crate::data_type::Project;
use soroban_sdk::{self, symbol_short, Env};

pub fn log_create_project_event(env: &Env, project: Project) {
    env.events().publish(
        (symbol_short!("c_project"), env.current_contract_address()),
        project,
    );
}

pub fn log_update_project_event(env: &Env, project: Project) {
    env.events().publish(
        (symbol_short!("u_project"), env.current_contract_address()),
        project,
    );
}
