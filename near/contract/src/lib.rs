use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::store::{LookupMap, LookupSet, UnorderedMap, UnorderedSet};
use near_sdk::{
    env, log, near_bindgen, require, serde_json::json, AccountId, BorshStorageKey, NearToken,
    PanicOnDefault, Promise,
};
use std::collections::HashMap;

pub mod applications;
pub mod constants;
pub mod events;
pub mod rounds;
pub mod utils;
pub mod validation;
pub mod votes;
pub use crate::applications::*;
pub use crate::constants::*;
pub use crate::events::*;
pub use crate::rounds::*;
pub use crate::utils::*;
pub use crate::validation::*;
pub use crate::votes::*;

pub const EVENT_JSON_PREFIX: &str = "EVENT_JSON:";

pub type TimestampMs = u64;
pub type RoundId = u64;
pub type InternalProjectId = u32; // internal project ID, to save on storage

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct VotingResult {
    // keyed at the voter's account ID
    picks: String,
    voted_ms: TimestampMs,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Payout {
    amount: String,
    paid_at_ms: TimestampMs,
    error: Option<String>,
}

#[derive(BorshSerialize, BorshStorageKey)]
#[borsh(crate = "near_sdk::borsh")]
pub enum StorageKey {
    RoundsById,
    ProjectIdToInternalProjectId,
    InternalProjectIdToProjectId,
    // ApplicationsById,
    // ApplicationIdsByRoundId,
    // ApplicationIdsByRoundIdInner { round_id: RoundId },
    ApplicationsForRoundByInternalProjectId,
    ApplicationsForRoundByInternalProjectIdInner { round_id: RoundId },
    ApprovedInternalProjectIdsForRound,
    ApprovedInternalProjectIdsForRoundInner { round_id: RoundId },
    VotesByRoundId,
    VotesByRoundIdInner { round_id: RoundId },
    VotingCountPerProjectByRoundId,
    VotingCountPerProjectByRoundIdInner { round_id: RoundId },
    PayoutsByRoundId,
    PayoutsByRoundIdInner { round_id: RoundId },
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
    // applications_by_id: UnorderedMap<ApplicationId, Application>, // TODO: is this needed?
    // next_application_id: ApplicationId, // TODO: is this needed?
    // project_ids_for_round
    applications_for_round_by_internal_project_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, RoundApplication>>,
    approved_internal_project_ids_for_round: UnorderedMap<RoundId, UnorderedSet<InternalProjectId>>,
    // application_ids_by_round_id: UnorderedMap<RoundId, UnorderedSet<ApplicationId>>,
    // approved_application_ids_by_round_id: UnorderedMap<RoundId, UnorderedSet<ApplicationId>>, // can add in if useful
    votes_by_round_id: UnorderedMap<RoundId, UnorderedMap<AccountId, VotingResult>>,
    voting_count_per_project_by_round_id:
        UnorderedMap<RoundId, UnorderedMap<InternalProjectId, u32>>,
    payouts_by_round_id: UnorderedMap<RoundId, UnorderedMap<InternalProjectId, Payout>>,
    default_page_size: u64, // TODO: make this configurable by owner/admin
}

const PICK_DELIMITER: &str = ":";

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
            payouts_by_round_id: UnorderedMap::new(StorageKey::PayoutsByRoundId),
            default_page_size: DEFAULT_PAGE_SIZE, // TODO: make this configurable by owner/admin
        }
    }

    // pub fn submit_vote(&mut self, round_id: RoundId, picks: Vec<String>) {
    //     let voter_id = env::predecessor_account_id();
    //     let round = self
    //         .rounds_by_id
    //         .get_mut(&round_id)
    //         .expect("Round not found");

    //     let mut internal_picks = Vec::new();
    //     for pick in picks {
    //         let projects: Vec<&str> = pick.split(PICK_DELIMITER).collect();
    //         let project_a: AccountId = projects[0].parse().unwrap();
    //         let project_b: AccountId = projects[1].parse().unwrap();
    //         if projects.len() == 2 {
    //             let project_a_internal_id = self
    //                 .project_id_to_internal_id
    //                 .get(&project_a)
    //                 .expect("Invalid project ID")
    //                 .to_string();
    //             let project_b_internal_id = self
    //                 .project_id_to_internal_id
    //                 .get(&project_b)
    //                 .expect("Invalid project ID")
    //                 .to_string();
    //             internal_picks.push(format!(
    //                 "{}{}{}",
    //                 project_a_internal_id, PICK_DELIMITER, project_b_internal_id
    //             ));
    //         }
    //     }

    //     round.votes.insert(voter_id, internal_picks.join(","));
    // }

    // pub fn get_picks(&self, round_id: RoundId) -> HashMap<AccountId, Vec<String>> {
    //     let round = self.rounds_by_id.get(&round_id).expect("Round not found");
    //     let mut picks_map = HashMap::new();
    //     for (voter_id, picks_str) in &round.votes {
    //         let picks: Vec<String> = picks_str
    //             .split(',')
    //             .map(|s| {
    //                 let ids: Vec<&str> = s.split(PICK_DELIMITER).collect();
    //                 let project_a = self
    //                     .internal_id_to_project_id
    //                     .get(&ids[0].parse::<u32>().unwrap())
    //                     .expect("Invalid project ID");
    //                 let project_b = self
    //                     .internal_id_to_project_id
    //                     .get(&ids[1].parse::<u32>().unwrap())
    //                     .expect("Invalid project ID");
    //                 format!("{}{}{}", project_a, PICK_DELIMITER, project_b)
    //             })
    //             .collect();
    //         picks_map.insert(voter_id.clone(), picks);
    //     }
    //     picks_map
    // }

    // /// Get a random number using `env::random_seed` and a shift amount.
    // pub(crate) fn get_random_number(shift_amount: u32) -> u64 {
    //     let seed = env::random_seed();
    //     let timestamp = env::block_timestamp().to_le_bytes();

    //     // Prepend the timestamp to the seed
    //     let mut new_seed = Vec::with_capacity(seed.len() + timestamp.len());
    //     new_seed.extend_from_slice(&timestamp);
    //     new_seed.extend_from_slice(&seed);

    //     // Rotate new_seed
    //     let len = new_seed.len();
    //     new_seed.rotate_left(shift_amount as usize % len);

    //     // Copy to array and convert to u64
    //     let mut arr: [u8; 8] = Default::default();
    //     arr.copy_from_slice(&new_seed[..8]);
    //     u64::from_le_bytes(arr)
    // }

    // /// Get random pairs for voting
    // pub fn get_random_picks(&self, round_id: RoundId) -> Vec<String> {
    //     let round = self.rounds_by_id.get(&round_id).expect("Round not found");
    //     let approved_applicants: Vec<AccountId> =
    //         round.approved_applicants.iter().cloned().collect();
    //     let all_pairs = self.generate_all_pairs(&approved_applicants);
    //     let num_picks = round.num_picks_per_voter as usize;
    //     let mut selected_pairs = Vec::new();
    //     let mut used_indices = std::collections::HashSet::new();

    //     for i in 0..num_picks {
    //         let random_num = Self::get_random_number(i as u32);
    //         let mut index = (random_num % all_pairs.len() as u64) as usize;

    //         // Ensure the same pair is not picked more than once
    //         while used_indices.contains(&index) {
    //             index = (index + 1) % all_pairs.len();
    //         }

    //         used_indices.insert(index);
    //         selected_pairs.push(all_pairs[index].clone());
    //     }

    //     selected_pairs
    // }

    // /// Generate all possible pairs from a list of projects
    // pub(crate) fn generate_all_pairs(&self, projects: &[AccountId]) -> Vec<String> {
    //     let mut pairs = Vec::new();
    //     for i in 0..projects.len() {
    //         for j in (i + 1)..projects.len() {
    //             pairs.push(format!("{}{}{}", projects[i], PICK_DELIMITER, projects[j]));
    //         }
    //     }
    //     pairs
    // }

    // pub fn get_projects_with_ids(&self, from_index: u32, limit: u32) -> Vec<(AccountId, u32)> {
    //     let start = (from_index * limit) as usize;
    //     let end = ((from_index + 1) * limit) as usize;
    //     self.project_id_to_internal_id
    //         .iter()
    //         .skip(start)
    //         .take(end - start)
    //         .map(|(project_id, internal_id)| (project_id.clone(), *internal_id))
    //         .collect()
    // }

    // pub fn get_internal_project_ids(&self) -> Vec<u32> {
    //     self.internal_id_to_project_id.keys().cloned().collect()
    // }
}
