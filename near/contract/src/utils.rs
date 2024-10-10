use near_sdk::near;

use crate::*;

pub fn calculate_required_storage_deposit(initial_storage_usage: u64) -> u128 {
    let storage_used = env::storage_usage() - initial_storage_usage;
    log!("Storage used: {} bytes", storage_used);
    let required_cost = env::storage_byte_cost().as_yoctonear() * storage_used as u128;
    required_cost
}

pub(crate) fn refund_deposit(initial_storage_usage: u64, refund_to: Option<AccountId>) {
    let refund_to = refund_to.unwrap_or_else(env::predecessor_account_id);
    let attached_deposit = env::attached_deposit();
    let mut refund = attached_deposit.as_yoctonear();
    if env::storage_usage() > initial_storage_usage {
        // caller should pay for the extra storage they used and be refunded for the rest
        let storage_used = env::storage_usage() - initial_storage_usage;
        log!("Storage used: {} bytes", storage_used);
        let required_cost = env::storage_byte_cost().as_yoctonear() * storage_used as u128;
        require!(
            required_cost <= attached_deposit.as_yoctonear(),
            format!(
                "Must attach {} to cover storage",
                NearToken::from_yoctonear(required_cost)
            )
        );
        refund -= required_cost;
    } else {
        // storage was freed up; caller should be refunded for what they freed up, in addition to the deposit they sent
        let storage_freed = initial_storage_usage - env::storage_usage();
        log!("Storage freed: {} bytes", storage_freed);
        let cost_freed = env::storage_byte_cost().as_yoctonear() * storage_freed as u128;
        refund += cost_freed;
    }
    if refund > 1 {
        log!(
            "Refunding {} to {}",
            NearToken::from_yoctonear(refund),
            refund_to
        );
        Promise::new(refund_to).transfer(NearToken::from_yoctonear(refund));
    }
}

/// Cloned directly from stellar implementation
/// Calculates the indices of a unique pair of projects based on the given index.
pub(crate) fn get_arithmetic_index(num_of_projects: u32, index: u32) -> (u32, u32) {
    // Initialize the sum and first project index
    let mut sum = 0;
    let mut first_project_index = 0;

    // Loop to determine the correct first project index
    // The loop continues until the sum of pairs up to the current first project index exceeds the given index
    while sum + (num_of_projects - first_project_index - 1) <= index {
        // Update the sum to include the number of pairs that can be formed with the current first project index
        sum += num_of_projects - first_project_index - 1;
        // Move to the next project index
        first_project_index += 1;
    }

    // Calculate the second project index based on the remaining index
    let second_project_index = first_project_index + 1 + (index - sum);

    // Return the pair of project indices
    (first_project_index, second_project_index)
}

/// Get a random number using `env::random_seed` and a shift amount.
pub(crate) fn get_random_number(shift_amount: u32) -> u64 {
    let seed = env::random_seed();
    let timestamp = env::block_timestamp().to_le_bytes();

    // Prepend the timestamp to the seed
    let mut new_seed = Vec::with_capacity(seed.len() + timestamp.len());
    new_seed.extend_from_slice(&timestamp);
    new_seed.extend_from_slice(&seed);

    // Rotate new_seed
    let len = new_seed.len();
    new_seed.rotate_left(shift_amount as usize % len);

    // Copy to array and convert to u64
    let mut arr: [u8; 8] = Default::default();
    arr.copy_from_slice(&new_seed[..8]);
    u64::from_le_bytes(arr)
}

#[near_bindgen]
impl Contract {
    pub(crate) fn assert_all_payouts_challenges_resolved(&self, round_id: RoundId) {
        let payouts_clallenges_for_round = self
            .payouts_challenges_for_round_by_challenger_id
            .get(&round_id);
        if let Some(payouts_challenges_for_round) = payouts_clallenges_for_round {
            for (challenger_id, payouts_challenge) in payouts_challenges_for_round.iter() {
                assert!(
                    payouts_challenge.resolved,
                    "Payouts challenge from challenger {} is not resolved",
                    challenger_id
                );
            }
        }
    }
}
