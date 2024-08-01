use crate::data_type::{RoundApplication, RoundDetail, VotingResult};
use soroban_sdk::{self, symbol_short, Address, Env, Vec};

pub fn log_create_round(env: &Env, round_detail: RoundDetail) {
    env.events().publish(
        (symbol_short!("c_round"), env.current_contract_address()),
        round_detail,
    );
}

pub fn log_update_round(env: &Env, round_detail: RoundDetail) {
    env.events().publish(
        (symbol_short!("u_round"), env.current_contract_address()),
        round_detail,
    );
}

pub fn log_project_application(env: &Env, application: RoundApplication) {
    env.events().publish(
        (symbol_short!("c_app"), env.current_contract_address()),
        application,
    );
}

pub fn log_project_application_update(env: &Env, application: RoundApplication) {
    env.events().publish(
        (symbol_short!("u_app"), env.current_contract_address()),
        application,
    );
}

pub fn log_project_application_delete(env: &Env, application: RoundApplication) {
    env.events().publish(
        (symbol_short!("d_app"), env.current_contract_address()),
        application,
    );
}

pub fn log_deposit(env: &Env, round_id: u128, actor: Address, amount: u128) {
    env.events().publish(
        (symbol_short!("deposit"), env.current_contract_address()),
        (round_id, actor, amount),
    );
}

pub fn log_vote(env: &Env, round_id: u128, result: VotingResult) {
    env.events().publish(
        (symbol_short!("vote"), env.current_contract_address()),
        (round_id, result),
    );
}

pub fn log_payout(env: &Env, round_id: u128, address: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("payout"), env.current_contract_address()),
        (round_id, address, amount),
    );
}

pub fn log_update_approved_projects(env: &Env, round_id: u128, project_ids: Vec<u128>) {
    env.events().publish(
        (symbol_short!("p_approve"), env.current_contract_address()),
        (round_id, project_ids),
    );
}

pub fn log_update_white_list(env: &Env, round_id: u128, address: Address, is_add: bool) {
    env.events().publish(
        (symbol_short!("p_white"), env.current_contract_address()),
        (round_id, address, is_add),
    );
}

pub fn log_update_user_flag(env: &Env, round_id: u128, address: Address, is_flag: bool) {
    env.events().publish(
        (symbol_short!("p_flag"), env.current_contract_address()),
        (round_id, address, is_flag),
    );
}
