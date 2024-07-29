use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Pair {
    pub pair_id: u32,
    pub projects: Vec<AccountId>,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Pick {
    pub pair_id: u32,
    pub voted_project: AccountId,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct VotingResult {
    pub voter: AccountId,
    pub picks: Vec<Pick>,
    pub voted_ms: u64,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct ProjectVotingResult {
    pub project: AccountId,
    pub voting_count: u32,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn vote(&mut self, round_id: RoundId, picks: Vec<Pick>) -> VotingResult {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        let caller = env::predecessor_account_id();
        round.assert_voting_live();
        round.validate_whitelist_blacklist();
        // validate number of picks
        assert!(
            round.num_picks_per_voter == picks.len() as u32,
            "Invalid number of picks (must be {})",
            round.num_picks_per_voter
        );

        // let mut picked_pairs: Vec<Pick> = Vec::new();
        let approved_internal_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("Approved projects not found for round");
        let num_approved_projects = approved_internal_ids.len();
        let total_available_pairs = num_approved_projects * (num_approved_projects - 1) / 2;
        for pick in picks.clone() {
            let picked_index = pick.pair_id;
            assert!(
                picked_index < total_available_pairs,
                "Picked pair is greater than total available pairs"
            );
            let ids_vec: Vec<InternalProjectId> = approved_internal_ids.iter().cloned().collect();
            let pair = self.get_pair_by_index(total_available_pairs, picked_index, &ids_vec);
            let project_is_in_pair = pair.projects.contains(&pick.voted_project);
            assert!(project_is_in_pair, "Project not found in pair");
            // increment vote count for project
            let voted_project_internal_id = self
                .project_id_to_internal_id
                .get(&pick.voted_project)
                .expect("Internal ID not found for project");
            let vote_counts_for_round = self
                .voting_count_per_project_by_round_id
                .get_mut(&round_id)
                .expect("Vote count not found for round");
            let vote_count_for_project = vote_counts_for_round
                .entry(voted_project_internal_id.clone())
                .or_insert(0);
            *vote_count_for_project += 1;
        }

        let voting_result = VotingResult {
            voter: caller.clone(),
            picks,
            voted_ms: env::block_timestamp_ms(),
        };

        // validate that caller hasn't already voted
        let votes_for_round = self
            .votes_by_round_id
            .get_mut(&round_id)
            .expect("Votes not found for round");
        assert!(
            !votes_for_round.contains_key(&caller),
            "Caller has already voted for this round"
        );

        // insert voting result
        votes_for_round.insert(caller, voting_result.clone());
        log_vote(&voting_result);
        voting_result
    }

    // GETTER / VIEW METHODS

    pub fn get_pairs_to_vote(&self, round_id: RoundId) -> Vec<Pair> {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        round.assert_voting_live();
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
            pairs.push(self.get_pair_by_index(total_available_pairs, index as u32, &ids_vec));
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
            pairs.push(self.get_pair_by_index(total_available_pairs, i, &ids_vec));
        }

        pairs
    }

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
    pub fn get_pair_by_index(
        &self,
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
        let project_1 = self
            .internal_id_to_project_id
            .get(
                projects
                    .get(first_project_index as usize)
                    .expect("Project not found"),
            )
            .expect("Project ID not found");
        let project_2 = self
            .internal_id_to_project_id
            .get(
                projects
                    .get(second_project_index as usize)
                    .expect("Project not found"),
            )
            .expect("Project ID not found");

        // Return the pair with the specified index and the two projects
        Pair {
            pair_id: index,
            projects: vec![project_1.clone(), project_2.clone()],
        }
    }

    pub fn get_pair_by_id(&self, round_id: RoundId, pair_id: u32) -> Pair {
        let approved_internal_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("Approved projects not found for round");
        let num_approved_projects = approved_internal_ids.len();
        let total_available_pairs = num_approved_projects * (num_approved_projects - 1) / 2;
        assert!(
            pair_id < total_available_pairs,
            "Invalid pair ID (greater than total available pairs)"
        );
        let ids_vec: Vec<InternalProjectId> = approved_internal_ids.iter().cloned().collect();
        self.get_pair_by_index(total_available_pairs, pair_id, &ids_vec)
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
            let project = self
                .internal_id_to_project_id
                .get(project_id)
                .expect("Project ID not found");
            results.push(ProjectVotingResult {
                project: project.clone(),
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
}

// LOGIC FROM ORIGINAL IMPLEMENTATION; KEEPING FOR REFERENCE
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
