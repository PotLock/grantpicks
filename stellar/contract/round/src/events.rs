use crate::data_type::{RoundApplication, RoundDetail, VotingResult};
use soroban_sdk::{self, symbol_short, Address, Env, Vec};

/*
function name fn log_[action]_[resource]
topic : u/c/d_[resource]
u : update
c : create
d : delete

topic shorter :
1. round = round
2. application = app
3. deposit = depo
4. vote = vote
5. payout = pay
6. approved_projects = ap
7. whitelist = wl
8. blacklist = bl
9. admin = adm
*/

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

pub fn log_update_admin(env: &Env, round_id: u128, admins: Vec<Address>) {
  env.events().publish(
      (symbol_short!("u_adm"), env.current_contract_address()),
      (round_id, admins),
  );
}

pub fn log_create_app(env: &Env, round_id: u128, application: RoundApplication) {
    env.events().publish(
        (symbol_short!("c_app"), env.current_contract_address()),
        (round_id, application),
    );
}

pub fn log_update_app(env: &Env, round_id: u128, application: RoundApplication, updated_by: Address) {
    env.events().publish(
        (symbol_short!("u_app"), env.current_contract_address()),
        (round_id, application, updated_by),
    );
}

pub fn log_delete_app(env: &Env, round_id: u128, application: RoundApplication) {
    env.events().publish(
        (symbol_short!("d_app"), env.current_contract_address()),
        (round_id, application),
    );
}

pub fn log_create_deposit(env: &Env, round_id: u128, actor: Address, amount: u128) {
    env.events().publish(
        (symbol_short!("c_depo"), env.current_contract_address()),
        (round_id, actor, amount),
    );
}

pub fn log_create_vote(env: &Env, round_id: u128, result: VotingResult) {
    env.events().publish(
        (symbol_short!("c_vote"), env.current_contract_address()),
        (round_id, result),
    );
}

pub fn log_create_payout(env: &Env, round_id: u128, address: Address, amount: i128) {
    env.events().publish(
        (symbol_short!("c_pay"), env.current_contract_address()),
        (round_id, address, amount),
    );
}

pub fn log_update_approved_projects(env: &Env, round_id: u128, project_ids: Vec<u128>) {
    env.events().publish(
        (symbol_short!("u_ap"), env.current_contract_address()),
        (round_id, project_ids),
    );
}

pub fn log_update_whitelist(env: &Env, round_id: u128, address: Address, is_add: bool) {
    env.events().publish(
        (symbol_short!("u_wl"), env.current_contract_address()),
        (round_id, address, is_add),
    );
}

pub fn log_update_user_flag(env: &Env, round_id: u128, address: Address, is_flag: bool) {
    env.events().publish(
        (symbol_short!("u_bl"), env.current_contract_address()),
        (round_id, address, is_flag),
    );
}
