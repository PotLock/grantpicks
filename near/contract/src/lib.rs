use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::store::{LookupMap, LookupSet, UnorderedMap, UnorderedSet};
use near_sdk::{
    env, log, near_bindgen, require, serde_json::json, AccountId, BorshStorageKey, Gas, NearToken,
    PanicOnDefault, Promise, PromiseError,
};
use std::collections::HashMap;

pub mod applications;
pub mod constants;
pub mod deposits;
pub mod events;
pub mod payouts;
pub mod rounds;
pub mod utils;
pub mod votes;
pub use crate::applications::*;
pub use crate::constants::*;
pub use crate::deposits::*;
pub use crate::events::*;
pub use crate::payouts::*;
pub use crate::rounds::*;
pub use crate::utils::*;
pub use crate::votes::*;

pub const EVENT_JSON_PREFIX: &str = "EVENT_JSON:";

pub type TimestampMs = u64;
pub type RoundId = u64;
pub type InternalProjectId = u32; // internal project ID, to save on storage

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
pub enum StorageKey {
    RoundsById,
    ProjectIdToInternalProjectId,
    InternalProjectIdToProjectId,
    ApplicationsForRoundByInternalProjectId,
    ApplicationsForRoundByInternalProjectIdInner {
        round_id: RoundId,
    },
    ApprovedInternalProjectIdsForRound,
    ApprovedInternalProjectIdsForRoundInner {
        round_id: RoundId,
    },
    VotesByRoundId,
    VotesByRoundIdInner {
        round_id: RoundId,
    },
    VotingCountPerProjectByRoundId,
    VotingCountPerProjectByRoundIdInner {
        round_id: RoundId,
    },
    DepositsById,
    DepositIdsForRound,
    DepositIdsForRoundInner {
        round_id: RoundId,
    },
    PayoutsById,
    PayoutIdsByRoundId,
    PayoutIdsByRoundIdInner {
        round_id: RoundId,
    },
    PayoutIdsByInternalProjectId,
    PayoutIdsByInternalProjectIdInner {
        internal_project_id: InternalProjectId,
    },
    PayoutsChallengesForRoundByChallengerId,
    PayoutsChallengesForRoundByChallengerIdInner {
        round_id: RoundId,
    },
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct Contract {
    rounds_by_id: UnorderedMap<RoundId, RoundDetailInternal>,
    next_round_id: RoundId,
    project_id_to_internal_id: LookupMap<AccountId, InternalProjectId>,
    internal_id_to_project_id: UnorderedMap<InternalProjectId, AccountId>,
    next_internal_project_id: InternalProjectId,
    applications_for_round_by_internal_project_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, RoundApplication>>,
    approved_internal_project_ids_for_round: UnorderedMap<RoundId, UnorderedSet<InternalProjectId>>,
    votes_by_round_id: UnorderedMap<RoundId, UnorderedMap<AccountId, VotingResult>>,
    voting_count_per_project_by_round_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, u32>>,
    deposits_by_id: UnorderedMap<DepositId, Deposit>,
    next_deposit_id: DepositId,
    deposit_ids_for_round: UnorderedMap<RoundId, UnorderedSet<DepositId>>,
    // payouts
    next_payout_id: PayoutId,
    payouts_by_id: UnorderedMap<PayoutId, Payout>,
    payout_ids_by_round_id: UnorderedMap<RoundId, UnorderedSet<PayoutId>>,
    payout_ids_by_internal_project_id: LookupMap<InternalProjectId, UnorderedSet<PayoutId>>,
    payouts_challenges_for_round_by_challenger_id:
        UnorderedMap<RoundId, UnorderedMap<AccountId, PayoutsChallenge>>, // TODO: consider changing this to index by challenge ID instead of account ID? or not necessary
    default_page_size: u64, // TODO: make this configurable by owner/admin
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new() -> Self {
        Self {
            rounds_by_id: UnorderedMap::new(StorageKey::RoundsById),
            next_round_id: 1,
            project_id_to_internal_id: LookupMap::new(StorageKey::ProjectIdToInternalProjectId),
            internal_id_to_project_id: UnorderedMap::new(StorageKey::InternalProjectIdToProjectId),
            next_internal_project_id: 1,
            applications_for_round_by_internal_project_id: UnorderedMap::new(
                StorageKey::ApplicationsForRoundByInternalProjectId,
            ),
            approved_internal_project_ids_for_round: UnorderedMap::new(
                StorageKey::ApprovedInternalProjectIdsForRound,
            ),
            votes_by_round_id: UnorderedMap::new(StorageKey::VotesByRoundId),
            voting_count_per_project_by_round_id: UnorderedMap::new(
                StorageKey::VotingCountPerProjectByRoundId,
            ),
            deposits_by_id: UnorderedMap::new(StorageKey::DepositsById),
            next_deposit_id: 1,
            deposit_ids_for_round: UnorderedMap::new(StorageKey::DepositIdsForRound),
            next_payout_id: 1,
            payouts_by_id: UnorderedMap::new(StorageKey::PayoutsById),
            payout_ids_by_round_id: UnorderedMap::new(StorageKey::PayoutIdsByRoundId),
            payout_ids_by_internal_project_id: LookupMap::new(
                StorageKey::PayoutIdsByInternalProjectId,
            ),
            payouts_challenges_for_round_by_challenger_id: UnorderedMap::new(
                StorageKey::PayoutsChallengesForRoundByChallengerId,
            ),
            default_page_size: DEFAULT_PAGE_SIZE, // TODO: make this configurable by owner/admin
        }
    }
}
