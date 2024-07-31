use loam_sdk::soroban_sdk::Env;

use crate::storage_key::ContractKey;

pub const DAY_IN_LEDGERS: u32 = 17280;
pub const PERSISTENT_BUMP_CONSTANT: u32 = DAY_IN_LEDGERS * 180;
pub const PERSISTENT_BUMP_CONSTANT_THRESHOLD: u32 = DAY_IN_LEDGERS * 90;

pub fn extend_instance(env: &Env) {
    extend_persistent(env, &ContractKey::FactoryOwner);
    extend_persistent(env, &ContractKey::ProtocolFee);
    extend_persistent(env, &ContractKey::ProtocolFeeRecepient);
    extend_persistent(env, &ContractKey::NextRoundId);
    extend_persistent(env, &ContractKey::NextPayoutId);
    extend_persistent(env, &ContractKey::NextDepositId);
    extend_persistent(env, &ContractKey::TokenContract);
    extend_persistent(env, &ContractKey::ProjectContract);
    extend_persistent(env, &ContractKey::ProjectPayoutIds);
    extend_persistent(env, &ContractKey::PayoutInfo);
    extend_persistent(env, &ContractKey::DepositInfo);
}

pub fn extend_round(env: &Env, round_id: u128) {
    extend_persistent(env, &ContractKey::RoundInfo(round_id));
    extend_persistent(env, &ContractKey::Votes(round_id));
    extend_persistent(env, &ContractKey::VotingState(round_id));
    extend_persistent(env, &ContractKey::Admin(round_id));
    extend_persistent(env, &ContractKey::Payouts(round_id));
    extend_persistent(env, &ContractKey::ProjectApplicants(round_id));
    extend_persistent(env, &ContractKey::PayoutChallenges(round_id));
    extend_persistent(env, &ContractKey::WhitelistAndBlacklist(round_id));
    extend_persistent(env, &ContractKey::Deposit(round_id));
}

pub fn extend_persistent(env: &Env, key: &ContractKey) {
    if env.storage().persistent().has(key) {
        env.storage().persistent().extend_ttl(
            key,
            PERSISTENT_BUMP_CONSTANT_THRESHOLD,
            PERSISTENT_BUMP_CONSTANT,
        );
    }
}

pub fn delete_persistent(env: &Env, key: &ContractKey) {
    if env.storage().persistent().has(key) {
        env.storage().persistent().remove(key);
    }
}

pub fn has_store_key(env: &Env, key: &ContractKey) -> bool {
    env.storage().persistent().has(key)
}

pub fn clear_round(env: &Env, round_id: u128) {
    delete_persistent(env, &ContractKey::RoundInfo(round_id));
    delete_persistent(env, &ContractKey::Votes(round_id));
    delete_persistent(env, &ContractKey::VotingState(round_id));
    delete_persistent(env, &ContractKey::Admin(round_id));
    delete_persistent(env, &ContractKey::Payouts(round_id));
    delete_persistent(env, &ContractKey::ProjectApplicants(round_id));
    delete_persistent(env, &ContractKey::WhitelistAndBlacklist(round_id));
    delete_persistent(env, &ContractKey::PayoutChallenges(round_id));
    delete_persistent(env, &ContractKey::Deposit(round_id));
}
