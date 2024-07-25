use crate::{data_type::PayoutInternal, storage_key::ContractKey};
use loam_sdk::soroban_sdk::{Address, Env, Map};

pub fn read_payouts(env: &Env, round_id: u128) -> Map<u128, PayoutInternal> {
    let key = ContractKey::Payouts(round_id);
    match env.storage().persistent().get(&key) {
        Some(payouts) => payouts,
        None => Map::new(env),
    }
}

pub fn write_payouts(env: &Env, round_id: u128, payouts: &Map<u128, PayoutInternal>) {
    let key = ContractKey::Payouts(round_id);
    env.storage().persistent().set(&key, payouts);
}

pub fn has_paid(env: &Env, round_id: u128) -> bool {
    let key = ContractKey::Payouts(round_id);
    env.storage().persistent().has(&key)
}
