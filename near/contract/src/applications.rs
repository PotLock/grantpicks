use crate::*;

#[derive(BorshDeserialize, BorshSerialize, PartialEq, Debug, Clone, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
    // TODO: add Blacklisted
}

/// Stored in contract state
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct RoundApplication {
    // TODO: double check if video is included
    pub round_id: RoundId,
    pub internal_project_id: InternalProjectId, // uses internal ID to save on storage
    pub applicant_note: Option<String>,
    pub video_url: Option<String>,
    pub status: ApplicationStatus,
    pub review_note: Option<String>,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

/// Ephemeral (view-only)
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct RoundApplicationExternal {
    pub round_id: RoundId,
    pub applicant_id: AccountId,
    pub applicant_note: Option<String>,
    pub video_url: Option<String>,
    pub status: ApplicationStatus,
    pub review_note: Option<String>,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn apply_to_round(
        &mut self,
        round_id: RoundId,
        note: Option<String>,
        video_url: Option<String>,
        review_note: Option<String>,
        applicant: Option<AccountId>, // only allowed to be provided by round owner/admin, otherwise it is ignored
    ) -> RoundApplicationExternal {
        // should verify that caller has not already applied to this round
        let initial_storage_usage = env::storage_usage();
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        let is_owner_or_admin = round.is_caller_owner_or_admin();

        // if owner or admin, verify that voting hasn't started
        // TODO: ADD BACK IN AFTER TESTING
        // if is_owner_or_admin {
        //     assert!(
        //         env::block_timestamp_ms() < round.voting_start_ms,
        //         "Voting has already started"
        //     );
        // } else {
        //     assert!(
        //         round.allow_applications,
        //         "Applications are not allowed for this round"
        //     );
        //     assert!(
        //         round
        //             .application_start_ms
        //             .expect("round.application_start_ms not present")
        //             <= env::block_timestamp_ms(),
        //         "Application period has not started"
        //     );
        //     assert!(
        //         round
        //             .application_end_ms
        //             .expect("round.application_end_ms not present")
        //             >= env::block_timestamp(),
        //         "Application period has ended"
        //     );
        // }

        // determine applicant based on caller and `applicant` parameter
        let applicant = if let Some(applicant) = applicant {
            assert!(
                is_owner_or_admin,
                "Only round owner or admin can specify applicant"
            );
            applicant
        } else {
            env::predecessor_account_id()
        };

        // if caller isn't owner/admin and round requires video, verify that video is provided
        if !is_owner_or_admin && round.application_requires_video {
            assert!(
                video_url.is_some(),
                "Video is required for this round, but was not provided"
            );
        }

        // get internal project/applicant ID, or assign a new one
        let internal_project_id = self
            .project_id_to_internal_id
            .entry(applicant.clone())
            .or_insert_with(|| {
                let internal_project_id = self.next_internal_project_id;
                self.next_internal_project_id += 1;
                self.internal_id_to_project_id
                    .insert(internal_project_id, applicant.clone());
                internal_project_id
            });

        // verify that an application doesn't already exist for this project/applicant in this round
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get_mut(&round_id)
            .expect("Applications for round not found");

        assert!(
            applications_for_round.get(&internal_project_id).is_none(),
            "Application already exists for this project in this round"
        );

        // build RoundApplication
        let application = RoundApplication {
            round_id,
            internal_project_id: internal_project_id.clone(),
            applicant_note: note,
            video_url,
            status: if is_owner_or_admin {
                ApplicationStatus::Approved
            } else {
                ApplicationStatus::Pending
            },
            review_note: if is_owner_or_admin { review_note } else { None },
            submited_ms: env::block_timestamp_ms(),
            updated_ms: None,
        };

        // store application (don't need to insert back into parent map, as it is a mutable reference)
        applications_for_round.insert(internal_project_id.clone(), application.clone());

        // TODO: if admin, add to approved internal project IDs for round
        if is_owner_or_admin {
            let approved_internal_project_ids = self
                .approved_internal_project_ids_for_round
                .get_mut(&round_id)
                .expect("Approved internal project IDs for round not found");
            approved_internal_project_ids.insert(internal_project_id.clone());
        }

        // refund deposit
        refund_deposit(initial_storage_usage, None);

        // construct RoundApplicationExternal
        let app_external = RoundApplicationExternal {
            round_id: application.round_id,
            applicant_id: applicant.clone(),
            applicant_note: application.applicant_note,
            video_url: application.video_url,
            status: application.status,
            review_note: application.review_note,
            submited_ms: application.submited_ms,
            updated_ms: application.updated_ms,
        };

        // emit event
        log_create_application(&app_external);

        app_external
    }

    #[payable]
    /// Available to owner/admin ownly
    pub fn apply_to_round_batch(
        &mut self,
        round_id: RoundId,
        review_notes: Vec<Option<String>>,
        applicants: Vec<AccountId>,
    ) -> Vec<RoundApplicationExternal> {
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        assert!(
            round.is_caller_owner_or_admin(),
            "Only round owner or admin can apply to round in batch"
        );
        // TODO: assert a limit on the number of applicants
        let mut applications = Vec::new();
        for (i, applicant) in applicants.into_iter().enumerate() {
            let review_note = review_notes.get(i).cloned().unwrap_or_default();
            let application =
                self.apply_to_round(round_id, None, None, review_note, Some(applicant));
            applications.push(application);
        }
        applications
    }

    #[payable]
    pub fn unapply_from_round(
        &mut self,
        round_id: RoundId,
        applicant: Option<AccountId>,
    ) -> RoundApplicationExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        let is_owner_or_admin = round.is_caller_owner_or_admin();
        let applicant = if let Some(applicant) = applicant {
            assert!(
                is_owner_or_admin,
                "Only round owner or admin can specify applicant"
            );
            applicant
        } else {
            env::predecessor_account_id()
        };
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get_mut(&round_id)
            .expect("Applications for round not found");
        let internal_project_id = self
            .project_id_to_internal_id
            .get(&applicant)
            .expect("Applicant not found in internal project ID mapping");
        let application = applications_for_round.remove(internal_project_id);
        if let Some(application) = application {
            // cannot delete unless status is Pending (unless owner/admin)
            assert!(
                is_owner_or_admin || application.status == ApplicationStatus::Pending,
                "Cannot unapply from round if application is not Pending"
            );
            assert!(
                env::block_timestamp_ms() < round.voting_start_ms,
                "Voting has already started"
            );
            // if owner/admin, remove from approved internal project IDs for round
            if is_owner_or_admin {
                let approved_internal_project_ids = self
                    .approved_internal_project_ids_for_round
                    .get_mut(&round_id)
                    .expect("Approved internal project IDs for round not found");
                approved_internal_project_ids.remove(internal_project_id);
            }
            // clean-up
            refund_deposit(initial_storage_usage, None);
            let app_external = RoundApplicationExternal {
                round_id: application.round_id,
                applicant_id: applicant.clone(),
                applicant_note: application.applicant_note,
                video_url: application.video_url,
                status: application.status,
                review_note: application.review_note,
                submited_ms: application.submited_ms,
                updated_ms: application.updated_ms,
            };
            log_delete_application(&app_external);
            app_external
        } else {
            panic!("Application does not exist for this project in this round");
        }
    }

    #[payable]
    /// The idea here is that an applicant can update their message, and indexers can store these as individual "messages" in a conversation thread between applicant & reviewer. But the full thread doesn't need to be stored on-chain, just the latest message.
    pub fn update_applicant_note(
        &mut self,
        round_id: RoundId,
        note: String,
    ) -> RoundApplicationExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        if round.is_caller_owner_or_admin() {
            // owner/admin cannot update applicant note
            panic!("Owner/admin cannot update applicant note");
        }

        // get application data
        let applicant = env::predecessor_account_id();
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get_mut(&round_id)
            .expect("Applications for round not found");
        let internal_project_id = self
            .project_id_to_internal_id
            .get(&applicant)
            .expect("Applicant not found in internal project ID mapping");
        let application = applications_for_round
            .get_mut(internal_project_id)
            .expect("Application not found");

        // assert voting has not started
        assert!(
            env::block_timestamp_ms() < round.voting_start_ms,
            "Voting has already started"
        );

        // make updates (don't need to insert back into parent map, as it is a mutable reference)
        application.applicant_note = Some(note.clone());
        application.updated_ms = Some(env::block_timestamp_ms());

        // clean-up
        refund_deposit(initial_storage_usage, None);
        let app_external = RoundApplicationExternal {
            round_id: application.round_id,
            applicant_id: applicant.clone(),
            applicant_note: application.applicant_note.clone(),
            video_url: application.video_url.clone(),
            status: application.status.clone(),
            review_note: application.review_note.clone(),
            submited_ms: application.submited_ms,
            updated_ms: application.updated_ms,
        };
        log_update_application(&app_external);
        app_external
    }

    #[payable]
    /// An owner/admin can review a single application many times, but each time they must provide a status and a note. This is to allow for a conversation thread between the applicant and the reviewer. The full thread doesn't need to be stored on-chain, just the latest message.
    pub fn review_application(
        &mut self,
        round_id: RoundId,
        applicant: AccountId,
        status: ApplicationStatus,
        note: String,
    ) -> RoundApplicationExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self.rounds_by_id.get(&round_id).expect("Round not found");
        assert!(
            round.is_caller_owner_or_admin(),
            "Only round owner or admin can review applications"
        );
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get_mut(&round_id)
            .expect("Applications for round not found");
        let internal_project_id = self
            .project_id_to_internal_id
            .get(&applicant)
            .expect("Applicant not found in internal project ID mapping");
        let application = applications_for_round
            .get_mut(internal_project_id)
            .expect("Application not found");
        // validate voting period has not started
        assert!(
            env::block_timestamp_ms() < round.voting_start_ms,
            "Voting has already started"
        );
        // if Approving (and status is changing), check round.max_participants
        if status != application.status {
            let approved_applicants = self
                .approved_internal_project_ids_for_round
                .get_mut(&round_id)
                .expect("Approved internal project IDs for round not found");
            if status == ApplicationStatus::Approved {
                let num_participants = approved_applicants.len();
                assert!(
                    num_participants < round.max_participants,
                    "Round is already full"
                );
                // if approved, add to approved internal project IDs for round
                approved_applicants.insert(internal_project_id.clone());
            } else {
                // if no longer approved, remove from approved internal project IDs for round
                approved_applicants.remove(internal_project_id);
            }
        }
        application.status = status;
        application.review_note = Some(note);
        application.updated_ms = Some(env::block_timestamp_ms());
        refund_deposit(initial_storage_usage, None);
        let app_external = RoundApplicationExternal {
            round_id: application.round_id,
            applicant_id: applicant.clone(),
            applicant_note: application.applicant_note.clone(),
            video_url: application.video_url.clone(),
            status: application.status.clone(),
            review_note: application.review_note.clone(),
            submited_ms: application.submited_ms,
            updated_ms: application.updated_ms,
        };
        log_update_application(&app_external);
        app_external
    }

    pub fn get_applications_for_round(
        &self,
        round_id: RoundId,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundApplicationExternal> {
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get(&round_id)
            .expect("Applications for round not found");

        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(self.default_page_size);
        if from_index > applications_for_round.len() as u64 {
            // TODO: check for off-by-one bug here
            return vec![];
        }

        applications_for_round
            .values()
            .skip(from_index as usize)
            .take(limit as usize)
            .map(|application| RoundApplicationExternal {
                round_id: application.round_id,
                applicant_id: self
                    .internal_id_to_project_id
                    .get(&application.internal_project_id)
                    .expect("Invalid internal project ID")
                    .clone(),
                applicant_note: application.applicant_note.clone(),
                video_url: application.video_url.clone(),
                status: application.status.clone(),
                review_note: application.review_note.clone(),
                submited_ms: application.submited_ms,
                updated_ms: application.updated_ms,
            })
            .collect()
    }

    pub fn get_application(&self, applicant: AccountId) -> Option<RoundApplicationExternal> {
        let internal_project_id = self.project_id_to_internal_id.get(&applicant)?;
        self.get_application_by_internal_id(internal_project_id.clone())
    }

    pub fn get_application_by_internal_id(
        &self,
        internal_project_id: InternalProjectId,
    ) -> Option<RoundApplicationExternal> {
        let application = self
            .applications_for_round_by_internal_project_id
            .values()
            .find_map(|applications_for_round| {
                applications_for_round
                    .get(&internal_project_id)
                    .map(|application| RoundApplicationExternal {
                        round_id: application.round_id,
                        applicant_id: self
                            .internal_id_to_project_id
                            .get(&internal_project_id)
                            .expect("Invalid internal project ID")
                            .clone(),
                        applicant_note: application.applicant_note.clone(),
                        video_url: application.video_url.clone(),
                        status: application.status.clone(),
                        review_note: application.review_note.clone(),
                        submited_ms: application.submited_ms,
                        updated_ms: application.updated_ms,
                    })
            });
        application
    }
}
