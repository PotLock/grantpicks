use loam_sdk::soroban_sdk::{self, symbol_short, Env};

use crate::data_type::RoundInfo;

pub fn log_create_round_contract_event(env: &Env, info: RoundInfo) {
    env.events().publish(
        (symbol_short!("c_roundc"), env.current_contract_address()),
        info,
    );
}
