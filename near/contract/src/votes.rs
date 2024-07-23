use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Pair {
    pub pair_id: u32,
    pub projects: Vec<InternalProjectId>,
}

impl Pair {
    /// Ported directly from Stellar implementation
    /// Returns a Pair struct by determining the indices of the projects
    /// based on the given index in a list of all possible pairs.
    ///
    /// # Arguments
    /// * `total_available_pairs` - The total number of unique pairs available.
    /// * `index` - The index of the desired pair.
    /// * `projects` - A vector of project IDs.
    ///
    /// # Panics
    /// This function will panic if the index is out of the range of total available pairs.
    pub fn get_by_index(
        total_available_pairs: u32,
        index: u32,
        projects: &Vec<InternalProjectId>,
    ) -> Pair {
        // Ensure the given index is within the range of total available pairs
        assert!(index < total_available_pairs, "Index out of range");

        /*
        Determine pair by index e.g., for 4 projects:
        1 2, 1 3, 1 4, 2 3, 2 4, 3 4
        */
        let (first_project_index, second_project_index) =
            get_arithmetic_index(projects.len() as u32, index);

        // Retrieve the projects using the calculated indices
        let project_1 = projects
            .get(first_project_index as usize)
            .expect("Project not found");
        let project_2 = projects
            .get(second_project_index as usize)
            .expect("Project not found");

        // Return the pair with the specified index and the two projects
        Pair {
            pair_id: index,
            projects: vec![*project_1, *project_2],
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PickedPair {
    pub pair_id: u32,
    pub voted_project_id: InternalProjectId, // TODO: consider using Address here for ease of use and limiting client errors (remember to note on Steller implementation)
                                             // pub voted_project: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PickResult {
    pub pair_id: u32,
    pub project_id: InternalProjectId,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct VotingResult {
    pub voter: AccountId,
    pub picks: Vec<PickResult>,
    pub voted_ms: u64,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct ProjectVotingResult {
    pub project_id: InternalProjectId, // TODO: consider using Address here for ease of use and limiting client errors (remember to note on Steller implementation)
    // pub project: AccountId,
    pub voting_count: u32,
    // pub allocation: u128,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn vote(&mut self, round_id: RoundId, picks: Vec<PickedPair>) -> VotingResult {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        // round.assert_voting_live(); // TODO: ADD BACK IN AFTER TESTING
        round.validate_whitelist_blacklist();
        // check that caller hasn't already voted
        let caller = env::predecessor_account_id();
        let votes_for_round = self
            .votes_by_round_id
            .get_mut(&round_id)
            .expect("Votes not found for round");
        assert!(
            !votes_for_round.contains_key(&caller),
            "Caller has already voted for this round"
        );
        // validate number of picks
        assert!(
            round.num_picks_per_voter == picks.len() as u32,
            "Invalid number of picks (must be {})",
            round.num_picks_per_voter
        );

        let mut picked_pairs: Vec<PickResult> = Vec::new();
        let approved_internal_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("Approved projects not found for round");
        let num_approved_projects = approved_internal_ids.len();
        let total_available_pairs = num_approved_projects * (num_approved_projects - 1) / 2;
        for pick in picks {
            let picked_index = pick.pair_id;
            assert!(
                picked_index < total_available_pairs,
                "Picked pair is greater than total available pairs"
            );
            let ids_vec: Vec<InternalProjectId> = approved_internal_ids.iter().cloned().collect();
            let pair = Pair::get_by_index(total_available_pairs, picked_index, &ids_vec);
            let project_is_in_pair = pair.projects.contains(&pick.voted_project_id);
            assert!(project_is_in_pair, "Project not found in pair");
            // increment vote count for project
            let vote_counts_for_round = self
                .voting_count_per_project_by_round_id
                .get_mut(&round_id)
                .expect("Vote count not found for round");
            let vote_count_for_project = vote_counts_for_round
                .entry(pick.voted_project_id)
                .or_insert(0);
            *vote_count_for_project += 1;
            picked_pairs.push(PickResult {
                pair_id: pick.pair_id,
                project_id: pick.voted_project_id,
            });
        }
        let voting_result = VotingResult {
            voter: caller.clone(),
            picks: picked_pairs,
            voted_ms: env::block_timestamp_ms(),
        };
        votes_for_round.insert(caller, voting_result.clone());
        log_vote(&voting_result);
        voting_result
    }

    // GETTER / VIEW METHODS

    pub fn get_pairs_to_vote(&self, round_id: RoundId) -> Vec<Pair> {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        // round.assert_voting_live(); // TODO: ADD BACK IN AFTER TESTING
        let approved_internal_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("Approved projects not found for round");
        let num_approved_projects = approved_internal_ids.len();
        let total_available_pairs = num_approved_projects * (num_approved_projects - 1) / 2;
        assert!(
            round.num_picks_per_voter <= total_available_pairs,
            "Invalid number of picks"
        );
        let mut pairs: Vec<Pair> = Vec::new();
        let mut used_indices = std::collections::HashSet::new();
        let ids_vec: Vec<InternalProjectId> = approved_internal_ids.iter().cloned().collect();

        for i in 0..round.num_picks_per_voter {
            let random_num = get_random_number(i as u32);
            let mut index = (random_num % total_available_pairs as u64) as usize;

            // Ensure the same pair is not picked more than once
            while used_indices.contains(&index) {
                index = (index + 1) % total_available_pairs as usize;
            }

            used_indices.insert(index);
            pairs.push(Pair::get_by_index(
                total_available_pairs,
                index as u32,
                &ids_vec,
            ));
        }

        pairs
    }

    pub fn get_all_pairs_for_round(&self, round_id: RoundId) -> Vec<Pair> {
        let approved_internal_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("Approved projects not found for round");
        let num_approved_projects = approved_internal_ids.len();
        let total_available_pairs = num_approved_projects * (num_approved_projects - 1) / 2;
        let mut pairs: Vec<Pair> = Vec::new();
        let ids_vec: Vec<InternalProjectId> = approved_internal_ids.iter().cloned().collect();

        for i in 0..total_available_pairs {
            pairs.push(Pair::get_by_index(total_available_pairs, i, &ids_vec));
        }

        pairs
    }

    pub fn get_votes_for_round(
        &self,
        round_id: RoundId,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<VotingResult> {
        let votes_for_round = self
            .votes_by_round_id
            .get(&round_id)
            .expect("Votes not found for round");
        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(self.default_page_size);
        if from_index > votes_for_round.len() as u64 {
            // TODO: check for off-by-one bug here
            return vec![];
        }
        votes_for_round
            .values()
            .skip(from_index as usize)
            .take(limit as usize)
            .cloned()
            .collect()
    }

    pub fn get_results_for_round(&self, round_id: RoundId) -> Vec<ProjectVotingResult> {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        round.assert_voting_ended();
        let vote_counts_for_round = self
            .voting_count_per_project_by_round_id
            .get(&round_id)
            .expect("Vote count not found for round");
        let mut results: Vec<ProjectVotingResult> = Vec::new();
        for (project_id, vote_count) in vote_counts_for_round.iter() {
            results.push(ProjectVotingResult {
                project_id: *project_id,
                voting_count: *vote_count,
            });
        }
        results
    }

    pub fn can_vote(&self, round_id: RoundId, voter: AccountId) -> bool {
        self.rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .can_vote(&voter)
    }

    // pub(crate) fn increment_vote_count_for_project(
    //     &self,
    //     round_id: RoundId,
    //     internal_project_id: InternalProjectId,
    // ) {
    //     let vote_counts_for_round = self
    //         .voting_count_per_project_by_round_id
    //         .get_mut(&round_id)
    //         .expect("Vote count not found for round");
    //     let vote_count = vote_counts_for_round
    //         .entry(internal_project_id)
    //         .or_insert(0);
    //     *vote_count += 1;
    // }
}
