use crate::*;

// PAYOUTS

pub type PayoutId = u32;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Payout {
    /// Unique identifier for the payout
    pub id: PayoutId,
    /// ID of the application receiving the payout
    pub recipient_id: AccountId,
    /// Amount to be paid out
    pub amount: u128,
    /// Timestamp when the payout was made. None if not yet paid out.
    pub paid_at: Option<TimestampMs>,
    /// Memo field for payout notes
    pub memo: Option<String>,
}

// TODO: handle vault redistribution

/// Ephemeral-only; used for setting payouts
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PayoutInput {
    pub amount: U128,
    pub recipient_id: AccountId,
    pub memo: Option<String>,
}

/// Ephemeral-only
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PayoutExternal {
    /// Unique identifier for the payout
    pub id: PayoutId,
    /// ID of the application receiving the payout
    pub recipient_id: AccountId,
    /// Amount to be paid out
    pub amount: U128,
    /// Timestamp when the payout was made. None if not yet paid out.
    pub paid_at: Option<TimestampMs>,
    /// Memo field for payout notes
    pub memo: Option<String>,
}

impl Payout {
    pub fn to_external(&self) -> PayoutExternal {
        PayoutExternal {
            id: self.id.clone(),
            recipient_id: self.recipient_id.clone(),
            amount: U128(self.amount),
            paid_at: self.paid_at,
            memo: self.memo.clone(),
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PayoutsChallenge {
    /// Timestamp when the payout challenge was made
    pub created_at: TimestampMs,
    /// Reason for the challenge
    pub reason: String,
    /// Notes from admin/owner
    pub admin_notes: Option<String>,
    /// Whether the challenge has been resolved
    pub resolved: bool,
}

/// Ephemeral-only
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct PayoutsChallengeExternal {
    /// Account that made the challenge
    pub challenger_id: AccountId,
    /// Timestamp when the payout challenge was made
    pub created_at: TimestampMs,
    /// Reason for the challenge
    pub reason: String,
    /// Notes from admin/owner
    pub admin_notes: Option<String>,
    /// Whether the challenge has been resolved
    pub resolved: bool,
}

impl PayoutsChallenge {
    pub fn to_external(&self, challenger_id: AccountId) -> PayoutsChallengeExternal {
        PayoutsChallengeExternal {
            challenger_id,
            created_at: self.created_at,
            reason: self.reason.clone(),
            admin_notes: self.admin_notes.clone(),
            resolved: self.resolved,
        }
    }
}

#[near_bindgen]
impl Contract {
    // set_payouts (callable by chef or admin)
    #[payable]
    pub fn set_payouts(
        &mut self,
        round_id: RoundId,
        payouts: Vec<PayoutInput>,
        clear_existing: bool,
    ) -> Vec<PayoutExternal> {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round does not exist");
        // verify that the caller is the owner or admin
        round.assert_caller_is_owner_or_admin();
        // verify that voting has ended
        round.assert_voting_ended();
        // get approved projects for the round
        let approved_internal_project_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("No approved projects for round");
        if clear_existing {
            for internal_project_id in approved_internal_project_ids.iter() {
                // if there are payouts for the project...
                if let Some(payout_ids_for_recipient) = self
                    .payout_ids_by_internal_project_id
                    .get(&internal_project_id)
                {
                    // ...remove them
                    for payout_id in payout_ids_for_recipient.iter() {
                        self.payouts_by_id.remove(&payout_id);
                    }
                    // ...and remove the set of payout IDs for the project
                    let removed = self
                        .payout_ids_by_internal_project_id
                        .remove(&internal_project_id);
                    if let Some(mut removed) = removed {
                        removed.clear();
                    }
                }
            }
        }
        // get down to business
        let mut running_total: u128 = 0;
        let payout_ids_for_round = match self.payout_ids_by_round_id.get_mut(&round_id) {
            Some(payout_ids) => payout_ids,
            None => {
                let new_set = UnorderedSet::new(StorageKey::PayoutIdsByRoundIdInner {
                    round_id: round_id.clone(),
                });
                self.payout_ids_by_round_id
                    .insert(round_id.clone(), new_set);
                self.payout_ids_by_round_id.get_mut(&round_id).unwrap()
            }
        };
        let mut external_payouts: Vec<PayoutExternal> = Vec::new();
        // for each payout:
        for payout in payouts.iter() {
            // verify that the project exists and is approved
            let internal_project_id = self
                .project_id_to_internal_id
                .get(&payout.recipient_id)
                .expect("Project does not exist");
            assert!(
                approved_internal_project_ids.contains(&internal_project_id),
                "Project {} (internal ID {}) is not approved for this round",
                &payout.recipient_id,
                internal_project_id
            );
            // add amount to running total
            running_total += payout.amount.0;
            // if round uses cooldown, set cooldown_end to now + cooldown period ms
            if round.use_cooldown {
                round.cooldown_end_ms = Some(env::block_timestamp_ms() + round.cooldown_period_ms);
            }
            // if round uses compliance, set compliance_end to now + compliance period ms
            if round.use_compliance {
                round.compliance_end_ms =
                    Some(env::block_timestamp_ms() + round.compliance_period_ms);
            }
            // add payout to payouts
            let payout_ids_for_recipient = match self
                .payout_ids_by_internal_project_id
                .get_mut(&internal_project_id)
            {
                Some(payout_ids) => payout_ids,
                None => {
                    let new_set =
                        UnorderedSet::new(StorageKey::PayoutIdsByInternalProjectIdInner {
                            internal_project_id: internal_project_id.clone(),
                        });
                    self.payout_ids_by_internal_project_id
                        .insert(internal_project_id.clone(), new_set);
                    self.payout_ids_by_internal_project_id
                        .get_mut(&internal_project_id)
                        .unwrap()
                }
            };

            let payout_id = self.next_payout_id;
            self.next_payout_id += 1;
            let payout = Payout {
                id: payout_id,
                amount: payout.amount.0,
                recipient_id: payout.recipient_id.clone(),
                paid_at: None,
                memo: payout.memo.clone(),
            };
            external_payouts.push(payout.to_external());
            self.payouts_by_id.insert(payout_id, payout);
            payout_ids_for_recipient.insert(payout_id);
            payout_ids_for_round.insert(payout_id);
        }
        // error if running total is more than vault balance
        assert!(
            running_total <= round.vault_balance,
            "Total payouts ({}) must not be greater than vault balance ({})",
            running_total,
            round.vault_balance
        );
        refund_deposit(initial_storage_usage, None);
        log_set_payouts(&external_payouts);
        external_payouts
    }

    #[payable]
    pub fn admin_process_payouts(&mut self, round_id: RoundId) {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round does not exist");
        // verify that the caller is the owner or admin
        round.assert_caller_is_owner_or_admin();
        // verify that all_paid_out is not true
        assert!(round.all_paid_out == false, "All paid out");
        // verify that the cooldown period has passed
        round.assert_cooldown_period_complete();
        // verify that any challenges have been resolved
        self.assert_all_payouts_challenges_resolved(round_id);
        // pay out each project
        // for each approved project...
        // loop through approved_application_ids set
        let approved_internal_project_ids = self
            .approved_internal_project_ids_for_round
            .get(&round_id)
            .expect("No approved projects for round");
        for internal_project_id in approved_internal_project_ids.iter() {
            //     // get application
            //     let application = Application::from(
            //         self.applications_by_id
            //             .get(&project_id)
            //             .expect("no application"),
            //     );
            // check that the project is not owner, admin or chef
            let project_id = self
                .internal_id_to_project_id
                .get(&internal_project_id)
                .expect("Project does not exist internally");
            if round.is_caller_owner_or_admin() {
                log!("Skipping payout for project {} (internal ID {}) as it is owner or admin and not eligible for payouts.", project_id, internal_project_id);
            } else {
                // ...if there are payouts for the project...
                if let Some(payout_ids_for_project) = self
                    .payout_ids_by_internal_project_id
                    .get(&internal_project_id)
                {
                    for payout_id in payout_ids_for_project.iter() {
                        let payout = self.payouts_by_id.get_mut(&payout_id).expect("no payout");
                        if payout.paid_at.is_none() {
                            // ...transfer funds...
                            Promise::new(project_id.clone())
                                .transfer(NearToken::from_yoctonear(payout.amount))
                                .then(
                                    Self::ext(env::current_account_id())
                                        .with_static_gas(XCC_GAS)
                                        .transfer_payout_callback(payout.clone()),
                                );
                            // update payout to indicate that funds transfer has been initiated
                            payout.paid_at = Some(env::block_timestamp_ms());
                        } else {
                            log!(
                                format!(
                                    "Skipping payout for project {} (internal ID {}) as it has already been paid out.",
                                    project_id, internal_project_id
                                )
                            );
                        }
                    }
                }
            }
        }
        refund_deposit(initial_storage_usage, None);
        // self.all_paid_out = true; // TODO: move this to separate admin method
    }

    /// Verifies whether payout transfer completed successfully & updates payout record accordingly
    #[private] // only callable by env::current_account_id()
    pub fn transfer_payout_callback(
        &mut self,
        mut payout: Payout,
        #[callback_result] call_result: Result<(), PromiseError>,
    ) {
        if call_result.is_err() {
            log!(format!(
                "Error paying out amount {:#?} to project {}",
                payout.amount, payout.recipient_id
            ));
            // update payout to indicate error transferring funds
            payout.paid_at = None;
            self.payouts_by_id.insert(payout.id.clone(), payout);
        } else {
            log!(format!(
                "Successfully paid out amount {:#?} to project {}",
                payout.amount, payout.recipient_id
            ));
        }
    }

    #[payable]
    pub fn challenge_payouts(
        &mut self,
        round_id: RoundId,
        reason: String,
    ) -> PayoutsChallengeExternal {
        let round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round does not exist");
        // verify that cooldown is in process
        round.assert_cooldown_period_in_process();
        // create challenge & store, charging user for storage
        let initial_storage_usage = env::storage_usage();
        let challenge = PayoutsChallenge {
            created_at: env::block_timestamp_ms(),
            reason,
            admin_notes: None,
            resolved: false,
        };
        // store challenge (overwriting any existing challenge for this user - only one challenge per user allowed)
        let payouts_challenges_for_round = self
            .payouts_challenges_for_round_by_challenger_id
            .get_mut(&round_id)
            .expect("No challenges for round");
        let challenger_id = env::predecessor_account_id();
        payouts_challenges_for_round.insert(challenger_id.clone(), challenge.clone());
        refund_deposit(initial_storage_usage, None);
        // return challenge
        challenge.to_external(challenger_id.clone())
    }

    pub fn remove_payouts_challenge(&mut self, round_id: RoundId) {
        let round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round does not exist");
        // verify that cooldown is in process
        round.assert_cooldown_period_in_process();
        // if a payout challenge exists for this caller, remove it (if unresolved) & refund for freed storage
        let payouts_challenges_for_round = self
            .payouts_challenges_for_round_by_challenger_id
            .get_mut(&round_id)
            .expect("No challenges for round");
        if let Some(challenge) = payouts_challenges_for_round.get(&env::predecessor_account_id()) {
            if !challenge.resolved {
                let initial_storage_usage = env::storage_usage();
                payouts_challenges_for_round.remove(&env::predecessor_account_id());
                refund_deposit(initial_storage_usage, None);
            } else {
                panic!("Payout challenge already resolved; cannot be removed");
            }
        }
    }

    // VIEW / GETTER METHODS

    pub fn get_payouts(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<PayoutExternal> {
        let start_index: u64 = from_index.unwrap_or_default();
        assert!(
            (self.payouts_by_id.len() as u64) >= start_index,
            "Out of bounds, please use a smaller from_index."
        );
        let limit = limit.unwrap_or(usize::MAX as u64);
        assert_ne!(limit, 0, "Cannot provide limit of 0.");
        self.payouts_by_id
            .iter()
            .skip(start_index as usize)
            .take(limit as usize)
            .map(|(_payout_id, payout)| payout.to_external())
            .collect()
    }

    pub fn get_payout(&self, payout_id: PayoutId) -> PayoutExternal {
        self.payouts_by_id
            .get(&payout_id)
            .expect("Payout does not exist")
            .to_external()
    }

    pub fn get_payouts_challenges(
        &self,
        round_id: RoundId,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<PayoutsChallengeExternal> {
        let start_index: u64 = from_index.unwrap_or_default();
        let limit = limit.unwrap_or(usize::MAX as u64);
        assert_ne!(limit, 0, "Cannot provide limit of 0.");
        let payouts_challenges_for_round = self
            .payouts_challenges_for_round_by_challenger_id
            .get(&round_id)
            .expect("No challenges for round");
        if payouts_challenges_for_round.len() as u64 <= start_index {
            return Vec::new();
        }
        payouts_challenges_for_round
            .iter()
            .skip(start_index as usize)
            .take(limit as usize)
            .map(|(challenger_id, challenge)| challenge.to_external(challenger_id.clone()))
            .collect()
    }
}
