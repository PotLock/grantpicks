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
pub mod source;
pub mod utils;
pub mod votes;
pub use crate::applications::*;
pub use crate::constants::*;
pub use crate::deposits::*;
pub use crate::events::*;
pub use crate::payouts::*;
pub use crate::rounds::*;
pub use crate::source::*;
pub use crate::utils::*;
pub use crate::votes::*;

pub const EVENT_JSON_PREFIX: &str = "EVENT_JSON:";

pub type TimestampMs = u64;
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
    // rounds
    rounds_by_id: UnorderedMap<RoundId, RoundDetailInternal>,
    next_round_id: RoundId,
    // projects (utilizing internal ID integers to save on storage)
    project_id_to_internal_id: LookupMap<AccountId, InternalProjectId>,
    internal_id_to_project_id: UnorderedMap<InternalProjectId, AccountId>,
    next_internal_project_id: InternalProjectId,
    // applications
    applications_for_round_by_internal_project_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, RoundApplication>>,
    approved_internal_project_ids_for_round: UnorderedMap<RoundId, UnorderedSet<InternalProjectId>>,
    // votes
    votes_by_round_id: UnorderedMap<RoundId, UnorderedMap<AccountId, VotingResult>>,
    voting_count_per_project_by_round_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, u32>>,
    // deposits
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
    // config // TODO: make these configurable by owner/admin
    owner: AccountId,
    protocol_fee_recipient: Option<AccountId>,
    protocol_fee_basis_points: Option<u16>,
    default_page_size: u64,
    contract_source_metadata: ContractSourceMetadata,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Config {
    pub owner: AccountId,
    pub protocol_fee_recipient: Option<AccountId>,
    pub protocol_fee_basis_points: Option<u16>,
    pub default_page_size: u64,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
        owner: AccountId,
        protocol_fee_recipient: Option<AccountId>,
        protocol_fee_basis_points: Option<u16>,
        contract_source_metadata: ContractSourceMetadata,
    ) -> Self {
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
            owner,
            protocol_fee_recipient,
            protocol_fee_basis_points,
            default_page_size: DEFAULT_PAGE_SIZE,
            contract_source_metadata,
        }
    }

    pub fn owner_set_default_page_size(&mut self, default_page_size: u64) {
        self.assert_caller_is_owner();
        assert!(
            default_page_size > 0,
            "Default page size must be greater than 0"
        );
        self.default_page_size = default_page_size;
    }

    pub(crate) fn assert_caller_is_owner(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Caller is not the owner"
        );
    }

    #[payable]
    pub fn owner_set_protocol_fee_config(
        &mut self,
        protocol_fee_recipient: Option<AccountId>,
        protocol_fee_basis_points: Option<u16>,
    ) {
        self.assert_caller_is_owner();
        let initial_storage_usage = env::storage_usage();
        // both should be Some, or both should be None
        assert!(
            protocol_fee_recipient.is_some() == protocol_fee_basis_points.is_some(),
            "Both protocol fee recipient and basis points must be set or unset"
        );
        self.protocol_fee_recipient = protocol_fee_recipient.clone();
        // basis points should be within acceptable range
        if let Some(protocol_fee_basis_points) = protocol_fee_basis_points {
            assert!(
                protocol_fee_basis_points <= MAX_PROTOCOL_FEE_BASIS_POINTS,
                "Protocol fee basis points must be between 0 and {}",
                MAX_PROTOCOL_FEE_BASIS_POINTS
            );
        }
        self.protocol_fee_basis_points = protocol_fee_basis_points;
        refund_deposit(initial_storage_usage, None);
        log_protocol_fee_config_set(&protocol_fee_recipient, &protocol_fee_basis_points);
    }

    pub(crate) fn calculate_protocol_fee(&self, amount: u128) -> Option<u128> {
        if let Some(protocol_fee_basis_points) = self.protocol_fee_basis_points {
            // check for fee recipient
            if self.protocol_fee_recipient.is_some() {
                let total_basis_points = 10_000u128;
                let fee_amount = (protocol_fee_basis_points as u128).saturating_mul(amount);
                // Round up
                Some(fee_amount.div_ceil(total_basis_points))
            } else {
                None
            }
        } else {
            None
        }
    }

    pub fn get_config(&self) -> Config {
        Config {
            owner: self.owner.clone(),
            protocol_fee_recipient: self.protocol_fee_recipient.clone(),
            protocol_fee_basis_points: self.protocol_fee_basis_points,
            default_page_size: self.default_page_size,
        }
    }
}
