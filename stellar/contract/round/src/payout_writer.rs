use crate::{
    data_type::{Payout, PayoutsChallenge},
    storage_key::ContractKey, utils::get_storage,
};
use soroban_sdk::{Address, Env, Map, Vec};

pub fn read_payouts(env: &Env, round_id: u128) -> Vec<u32> {
    let key = ContractKey::Payouts(round_id);
    match get_storage(env).get(&key) {
        Some(payouts) => payouts,
        None => Vec::new(env),
    }
}

pub fn write_payouts(env: &Env, round_id: u128, payouts: &Vec<u32>) {
    let key = ContractKey::Payouts(round_id);
    get_storage(env).set(&key, payouts);
}

pub fn has_paid(env: &Env, round_id: u128) -> bool {
    let payouts = read_payouts(env, round_id);
    let mut is_paid = false;
    
    payouts.iter().for_each(|payout_id| {
        let payout = read_payout_info(env, payout_id).unwrap();
        if payout.paid_at_ms.is_some() {
            is_paid = true;
        }
    });

    is_paid
}

pub fn clear_payouts(env: &Env, round_id: u128) {
    let key = ContractKey::Payouts(round_id);
    let blank_payouts: Vec<u32> = Vec::new(env);
    get_storage(env).set(&key, &blank_payouts);
}

pub fn read_payout_id(env: &Env) -> u32 {
    get_storage(env)
        .get(&ContractKey::NextPayoutId)
        .unwrap_or_default()
}

pub fn write_payout_id(env: &Env, payout_id: u32) {
    get_storage(env).set(&ContractKey::NextPayoutId, &payout_id);
}

pub fn increment_payout_id(env: &Env) -> u32 {
    let payout_id = read_payout_id(env) + 1;
    write_payout_id(env, payout_id);
    payout_id
}

pub fn write_payout_info(env: &Env, payout_id: u32, payout: &Payout) {
    let key = ContractKey::PayoutInfo(payout_id as u128);
    get_storage(env).set(&key, payout);
}

pub fn read_payout_info(env: &Env, payout_id: u32) -> Option<Payout> {
    let key = ContractKey::PayoutInfo(payout_id as u128);
    get_storage(env).get(&key)
}

pub fn remove_payout_info(env: &Env, payout_id: u32) {
    let key = ContractKey::PayoutInfo(payout_id as u128);
    get_storage(env).remove(&key);
}

pub fn read_project_payout_ids(env: &Env, round_id: u128) -> Map<u128, Vec<u32>> {
    let key = ContractKey::ProjectPayoutIds(round_id);
    match get_storage(env).get(&key) {
        Some(payouts) => payouts,
        None => Map::new(env),
    }
}

pub fn write_project_payout_ids(env: &Env, round_id: u128, project_id: u128, payout_ids: &Vec<u32>) {
    let key = ContractKey::ProjectPayoutIds(round_id);
    let mut project_payout_ids = read_project_payout_ids(env, round_id);
    project_payout_ids.set(project_id, payout_ids.clone());
    get_storage(env).set(&key, &project_payout_ids);
}

pub fn read_project_payout_ids_for_project(env: &Env, round_id: u128, project_id: u128) -> Vec<u32> {
    let project_payout_ids = read_project_payout_ids(env, round_id);
    match project_payout_ids.get(project_id) {
        Some(payout_ids) => payout_ids.clone(),
        None => Vec::new(env),
    }
}

pub fn add_payout_id_to_project_payout_ids(env: &Env, round_id: u128, project_id: u128, payout_id: u32) {
    let mut payout_ids = read_project_payout_ids_for_project(env, round_id, project_id);
    payout_ids.push_back(payout_id);
    write_project_payout_ids(env, round_id, project_id, &payout_ids);
}

pub fn clear_project_payout_ids(env: &Env, round_id: u128, project_id: u128) {
    let key = ContractKey::ProjectPayoutIds(round_id);
    let mut project_payout_ids = read_project_payout_ids(env, round_id);
    project_payout_ids.remove(project_id);
    get_storage(env).set(&key, &project_payout_ids);
}

pub fn read_payout_challenges(env: &Env, round_id: u128) -> Map<Address, PayoutsChallenge> {
    let key = ContractKey::PayoutChallenges(round_id);
    match get_storage(env).get(&key) {
        Some(payouts) => payouts,
        None => Map::new(env),
    }
}

pub fn write_payout_challenges(
    env: &Env,
    round_id: u128,
    payout_challenges: &Map<Address, PayoutsChallenge>,
) {
    let key = ContractKey::PayoutChallenges(round_id);
    get_storage(env).set(&key, payout_challenges);
}

pub fn read_payout_challenge(
    env: &Env,
    round_id: u128,
    challenger_id: &Address,
) -> Option<PayoutsChallenge> {
    let payout_challenges = read_payout_challenges(env, round_id);
    payout_challenges.get(challenger_id.clone())
}

pub fn write_payout_challenge(
    env: &Env,
    round_id: u128,
    challenger_id: &Address,
    payout: &PayoutsChallenge,
) {
    let mut payout_challenges = read_payout_challenges(env, round_id);
    payout_challenges.set(challenger_id.clone(), payout.clone());
    write_payout_challenges(env, round_id, &payout_challenges);
}

pub fn remove_payout_challenge(env: &Env, round_id: u128, challenger_id: &Address) {
    let mut payout_challenges = read_payout_challenges(env, round_id);
    payout_challenges.remove(challenger_id.clone());
    write_payout_challenges(env, round_id, &payout_challenges);
}
