use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct CreateRoundParams {
    pub owner: AccountId,
    pub admins: Vec<AccountId>,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub allow_applications: bool,
    pub application_start_ms: Option<u64>, // must be present if allow_applications is true
    pub application_end_ms: Option<u64>,   // must be present if allow_applications is true
    pub application_requires_video: bool,
    pub expected_amount: U128, // NB: on Stellar this is an int (u128)
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: u32,
    pub max_participants: Option<u32>,
    pub use_cooldown: bool,
    pub cooldown_period_ms: Option<u64>, // defaults to DEFAULT_COOLDOWN_PERIOD_MS if not provided
    pub use_compliance: bool,
    pub compliance_period_ms: Option<u64>, // defaults to DEFAULT_COMPLIANCE_PERIOD_MS if not provided
    pub allow_remaining_funds_redistribution: bool,
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct RoundDetailInternal {
    pub id: RoundId,
    pub owner: AccountId,
    pub admins: Vec<AccountId>,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub allow_applications: bool,
    pub application_start_ms: Option<TimestampMs>, // must be present if allow_applications is true
    pub application_end_ms: Option<TimestampMs>,   // must be present if allow_applications is true
    pub application_requires_video: bool,
    pub voting_start_ms: TimestampMs,
    pub voting_end_ms: TimestampMs,
    pub blacklisted_voters: Vec<AccountId>, // todo: if these will grow large, consider storing on top-level contract instead
    pub whitelisted_voters: Option<Vec<AccountId>>, // todo: if these will grow large, consider storing on top-level contract instead
    pub use_whitelist: bool,
    pub expected_amount: u128,
    pub current_vault_balance: u128,
    pub vault_total_deposits: u128,
    // TODO: consider adding records for vault deposits, but this can also be handled via indexer
    /// Indicates whether matching pool can be redistributed to remaining_funds_redistribution_recipient after compliance period ends. Must be specified at deployment, and CANNOT be changed afterwards.
    pub allow_remaining_funds_redistribution: bool,
    /// Recipient of matching pool redistribution (if enabled). CANNOT be changed after public round has started.
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
    /// Timestamp when redistribution happened
    pub remaining_funds_redistributed_at_ms: Option<TimestampMs>,
    /// Memo for the redistribution transaction
    pub remaining_funds_redistribution_memo: Option<String>,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub use_cooldown: bool,
    pub cooldown_period_ms: u64,
    pub cooldown_end_ms: Option<TimestampMs>,
    pub use_compliance: bool,
    // TODO: add compliance_requirement
    pub compliance_period_ms: u64,
    pub compliance_end_ms: Option<TimestampMs>,
    pub round_complete: bool,
}

impl RoundDetailInternal {
    pub fn to_external(self) -> RoundDetailExternal {
        RoundDetailExternal {
            id: self.id,
            owner: self.owner,
            admins: self.admins,
            name: self.name,
            description: self.description,
            contacts: self.contacts,
            allow_applications: self.allow_applications,
            application_start_ms: self.application_start_ms,
            application_end_ms: self.application_end_ms,
            application_requires_video: self.application_requires_video,
            voting_start_ms: self.voting_start_ms,
            voting_end_ms: self.voting_end_ms,
            blacklisted_voters: self.blacklisted_voters,
            whitelisted_voters: self.whitelisted_voters,
            use_whitelist: self.use_whitelist,
            expected_amount: U128(self.expected_amount),
            current_vault_balance: U128(self.current_vault_balance),
            vault_total_deposits: U128(self.vault_total_deposits),
            allow_remaining_funds_redistribution: self.allow_remaining_funds_redistribution,
            remaining_funds_redistribution_recipient: self.remaining_funds_redistribution_recipient,
            remaining_funds_redistributed_at_ms: self.remaining_funds_redistributed_at_ms,
            remaining_funds_redistribution_memo: self.remaining_funds_redistribution_memo,
            num_picks_per_voter: self.num_picks_per_voter,
            max_participants: self.max_participants,
            use_cooldown: self.use_cooldown,
            cooldown_period_ms: self.cooldown_period_ms,
            cooldown_end_ms: self.cooldown_end_ms,
            use_compliance: self.use_compliance,
            compliance_period_ms: self.compliance_period_ms,
            compliance_end_ms: self.compliance_end_ms,
            round_complete: self.round_complete,
        }
    }

    //  VALIDATION NOTES FROM SHOT 7/25/24:

    //     1. when can voting start date be changed?
    //     2. when can voting end date be changed?
    //     3. when can application start date be changed?
    //     4. when can application end date be changed?
    //     5. when can expected amount be changed?
    //     6. when can name, description & contacts be changed?
    //     7. when can num picks per voter be changed?
    //     8. when can max participants be changed?
    //     9. when can optional cooldown config (whether or not to use a cooldown period and allow payouts challenges) be changed?
    //     10. when can optional compliance config (whether or not to use a compliance period) be changed?
    //     11. when can optional remaining funds redistribution config be changed?

    //     -----

    //     1&2) before the voting date starts
    //     3) before the application starts
    //     4) application end date can be extended as long as it doesnt overlap with voting and the application period isnt over
    //     5) expected amount can be changed any time  except when round is live
    //     6) name and description can be changed any time
    //     7) number of votes can be changed until voting starts
    //     8) max partipants as people applied, until application ends - allow for adding more just in case alot of influx during application
    //     9) cooldown period cannot be changed or can be changed if no money is on it (for non escrow based this always apply) up until voting is started -- lmk about pushback on this or over complexification
    //     10. i think maybe whenver cuz say compliance mechanism breaks or need to change
    //     11. optional remaining funds redistribution -- keep as potlock pot contracts - i forgot but when voting starts

    pub fn validate_name(&self, name: Option<String>) -> String {
        let mut validated_name = self.name.clone();
        if let Some(name) = name {
            validated_name = name;
        }
        validated_name
    }

    pub fn update_name(&mut self, name: Option<String>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update name");
        }
        self.name = self.validate_name(name);
    }

    pub fn validate_description(&self, description: Option<String>) -> String {
        let mut validated_description = self.description.clone();
        if let Some(description) = description {
            validated_description = description;
        }
        validated_description
    }

    pub fn update_description(&mut self, description: Option<String>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update description");
        }
        self.description = self.validate_description(description);
    }

    pub fn validate_contacts(&self, contacts: Option<Vec<Contact>>) -> Vec<Contact> {
        let mut validated_contacts = self.contacts.clone();
        if let Some(contacts) = contacts {
            validated_contacts = contacts;
        }
        validated_contacts
    }

    pub fn update_contacts(&mut self, contacts: Option<Vec<Contact>>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update contacts");
        }
        self.contacts = self.validate_contacts(contacts);
    }

    pub fn validate_admins(&self, admins: Option<Vec<AccountId>>) -> Vec<AccountId> {
        let mut validated_admins = self.admins.clone();
        if let Some(admins) = admins {
            validated_admins = admins;
        }
        validated_admins
    }

    pub fn update_admins(&mut self, admins: Option<Vec<AccountId>>) {
        if !self.is_caller_owner() {
            panic!("Only owner can update admins");
        }
        self.admins = self.validate_admins(admins);
    }

    pub fn validate_blacklisted_voters(
        &self,
        blacklisted_voters: Option<Vec<AccountId>>,
    ) -> Vec<AccountId> {
        let mut validated_blacklisted_voters = self.blacklisted_voters.clone();
        if let Some(blacklisted_voters) = blacklisted_voters {
            validated_blacklisted_voters = blacklisted_voters;
        }
        validated_blacklisted_voters
    }

    pub fn update_blacklisted_voters(&mut self, blacklisted_voters: Option<Vec<AccountId>>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update blacklisted voters");
        }
        self.blacklisted_voters = self.validate_blacklisted_voters(blacklisted_voters);
    }

    pub fn validate_use_whitelist(&self, use_whitelist: Option<bool>) -> bool {
        let mut validated_use_whitelist = self.use_whitelist;
        if let Some(use_whitelist) = use_whitelist {
            validated_use_whitelist = use_whitelist;
        }
        validated_use_whitelist
    }

    pub fn update_use_whitelist(&mut self, use_whitelist: Option<bool>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update use whitelist");
        }
        self.use_whitelist = self.validate_use_whitelist(use_whitelist);
    }

    pub fn validate_whitelisted_voters(
        &self,
        whitelisted_voters: Option<Vec<AccountId>>,
    ) -> Option<Vec<AccountId>> {
        let mut validated_whitelisted_voters = self.whitelisted_voters.clone();
        if let Some(whitelisted_voters) = whitelisted_voters {
            validated_whitelisted_voters = Some(whitelisted_voters);
        }
        validated_whitelisted_voters
    }

    pub fn update_whitelisted_voters(&mut self, whitelisted_voters: Option<Vec<AccountId>>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update whitelisted voters");
        }
        self.whitelisted_voters = self.validate_whitelisted_voters(whitelisted_voters);
    }

    pub fn validate_expected_amount(&self, expected_amount: Option<U128>) -> u128 {
        let mut validated_expected_amount = self.expected_amount;
        if let Some(expected_amount) = expected_amount {
            if self.is_voting_live() {
                panic!("Expected amount cannot be changed when round is live");
            }
            validated_expected_amount = expected_amount.0;
        }
        validated_expected_amount
    }

    pub fn update_expected_amount(&mut self, expected_amount: Option<U128>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update expected amount");
        }
        self.expected_amount = self.validate_expected_amount(expected_amount);
    }

    pub fn validate_num_picks_per_voter(&self, num_picks_per_voter: Option<u32>) -> u32 {
        let mut validated_num_picks_per_voter = self.num_picks_per_voter;
        if let Some(num_picks_per_voter) = num_picks_per_voter {
            if self.voting_start_ms > env::block_timestamp_ms() {
                validated_num_picks_per_voter = num_picks_per_voter;
            } else {
                panic!("Number of picks per voter can only be changed before voting period starts");
            }
        }
        validated_num_picks_per_voter
    }

    pub fn validate_max_participants(&self, max_participants: Option<u32>) -> u32 {
        let mut validated_max_participants = self.max_participants;
        if let Some(max_participants) = max_participants {
            if self.application_end_ms.unwrap_or(u64::MAX) > env::block_timestamp_ms() {
                validated_max_participants = max_participants;
            } else {
                panic!("Max participants can only be changed before application period ends");
            }
        }
        validated_max_participants
    }

    pub fn update_max_participants(&mut self, max_participants: Option<u32>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update max participants");
        }
        self.max_participants = self.validate_max_participants(max_participants);
    }

    pub fn update_num_picks_per_voter(&mut self, num_picks_per_voter: Option<u32>) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update number of picks per voter");
        }
        self.num_picks_per_voter = self.validate_num_picks_per_voter(num_picks_per_voter);
    }

    pub fn update_compliance_config(
        &mut self,
        use_compliance: Option<bool>,
        compliance_period_ms: Option<u64>,
    ) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update compliance config");
        }
        self.use_compliance = use_compliance.unwrap_or(self.use_compliance);
        self.compliance_period_ms = compliance_period_ms.unwrap_or(self.compliance_period_ms);
    }

    pub fn validate_cooldown_config(
        &self,
        use_cooldown: Option<bool>,
        cooldown_period_ms: Option<u64>,
    ) -> (bool, u64) {
        let mut validated_use_cooldown = self.use_cooldown;
        let mut validated_cooldown_period_ms = self.cooldown_period_ms;

        if let Some(use_cooldown) = use_cooldown {
            if self.vault_total_deposits == 0 {
                if self.voting_start_ms > env::block_timestamp_ms() {
                    validated_use_cooldown = use_cooldown;
                } else {
                    panic!("Cooldown period can only be changed before voting period starts");
                }
            } else {
                panic!("Cooldown period cannot be changed if there are funds in the vault");
            }
        }

        if let Some(cooldown_period_ms) = cooldown_period_ms {
            if self.vault_total_deposits == 0 {
                if self.voting_start_ms > env::block_timestamp_ms() {
                    validated_cooldown_period_ms = cooldown_period_ms;
                } else {
                    panic!("Cooldown period can only be changed before voting period starts");
                }
            } else {
                panic!("Cooldown period cannot be changed if there are funds in the vault");
            }
        }

        (validated_use_cooldown, validated_cooldown_period_ms)
    }

    pub fn update_cooldown_config(
        &mut self,
        use_cooldown: Option<bool>,
        cooldown_period_ms: Option<u64>,
    ) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update cooldown config");
        }
        let (validated_use_cooldown, validated_cooldown_period_ms) =
            self.validate_cooldown_config(use_cooldown, cooldown_period_ms);
        self.use_cooldown = validated_use_cooldown;
        self.cooldown_period_ms = validated_cooldown_period_ms;
    }

    pub fn validate_remaining_funds_redistribution_config(
        &self,
        allow_remaining_funds_redistribution: Option<bool>,
        remaining_funds_redistribution_recipient: Option<AccountId>,
    ) -> (bool, Option<AccountId>) {
        let mut validated_allow_remaining_funds_redistribution =
            self.allow_remaining_funds_redistribution;
        let mut validated_remaining_funds_redistribution_recipient =
            self.remaining_funds_redistribution_recipient.clone();

        if let Some(allow_remaining_funds_redistribution) = allow_remaining_funds_redistribution {
            if self.voting_start_ms > env::block_timestamp_ms() {
                if !allow_remaining_funds_redistribution {
                    validated_allow_remaining_funds_redistribution =
                        allow_remaining_funds_redistribution;
                    validated_remaining_funds_redistribution_recipient = None;
                } else {
                    if remaining_funds_redistribution_recipient.is_none() {
                        panic!("Recipient must be provided if remaining funds redistribution is enabled");
                    }
                    validated_allow_remaining_funds_redistribution =
                        allow_remaining_funds_redistribution;
                    validated_remaining_funds_redistribution_recipient =
                        remaining_funds_redistribution_recipient.clone();
                }
            } else {
                panic!("Remaining funds redistribution can only be changed before voting period starts");
            }
        }

        if let Some(remaining_funds_redistribution_recipient) =
            remaining_funds_redistribution_recipient
        {
            if self.allow_remaining_funds_redistribution {
                if self.voting_start_ms > env::block_timestamp_ms() {
                    validated_remaining_funds_redistribution_recipient =
                        Some(remaining_funds_redistribution_recipient);
                } else {
                    panic!("Remaining funds redistribution recipient can only be changed before voting period starts");
                }
            } else {
                panic!("Remaining funds redistribution recipient can only be changed if remaining funds redistribution is enabled");
            }
        }

        (
            validated_allow_remaining_funds_redistribution,
            validated_remaining_funds_redistribution_recipient,
        )
    }

    pub fn update_remaining_funds_redistribution_config(
        &mut self,
        allow_remaining_funds_redistribution: Option<bool>,
        remaining_funds_redistribution_recipient: Option<AccountId>,
    ) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update remaining funds redistribution config");
        }
        let (
            validated_allow_remaining_funds_redistribution,
            validated_remaining_funds_redistribution_recipient,
        ) = self.validate_remaining_funds_redistribution_config(
            allow_remaining_funds_redistribution,
            remaining_funds_redistribution_recipient,
        );

        self.allow_remaining_funds_redistribution = validated_allow_remaining_funds_redistribution;
        self.remaining_funds_redistribution_recipient =
            validated_remaining_funds_redistribution_recipient;
    }

    pub fn validate_voting_config(
        &self,
        voting_start_ms: Option<TimestampMs>,
        voting_end_ms: Option<TimestampMs>,
    ) -> (TimestampMs, TimestampMs) {
        let mut validated_voting_start_ms = self.voting_start_ms;
        let mut validated_voting_end_ms = self.voting_end_ms;

        if let Some(voting_start_ms) = voting_start_ms {
            if voting_start_ms < env::block_timestamp_ms() {
                panic!("Voting start date must be in the future");
            } else if env::block_timestamp_ms() > self.voting_start_ms {
                panic!("Voting start date can only be changed before voting period starts");
            }
            validated_voting_start_ms = voting_start_ms;
        }

        if let Some(voting_end_ms) = voting_end_ms {
            if voting_end_ms < env::block_timestamp_ms() {
                panic!("Voting end date must be in the future");
            } else if env::block_timestamp_ms() > self.voting_end_ms {
                panic!("Voting end date can only be changed before voting period ends");
            }
            validated_voting_end_ms = voting_end_ms;
        }
        if validated_voting_start_ms >= validated_voting_end_ms {
            panic!("Voting start date must be before voting end date");
        }

        (validated_voting_start_ms, validated_voting_end_ms)
    }

    pub fn update_voting_config(
        &mut self,
        voting_start_ms: Option<u64>,
        voting_end_ms: Option<u64>,
    ) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update voting config");
        }
        let (validated_voting_start_ms, validated_voting_end_ms) =
            self.validate_voting_config(voting_start_ms, voting_end_ms);

        self.voting_start_ms = validated_voting_start_ms;
        self.voting_end_ms = validated_voting_end_ms;
    }

    pub fn validate_application_config(
        &self,
        allow_applications: Option<bool>,
        application_start_ms: Option<TimestampMs>,
        application_end_ms: Option<TimestampMs>,
        application_requires_video: Option<bool>,
    ) -> (bool, Option<TimestampMs>, Option<TimestampMs>, bool) {
        let mut validated_allow_applications = self.allow_applications;
        let mut validated_application_start_ms = self.application_start_ms;
        let mut validated_application_end_ms = self.application_end_ms;
        let mut validated_application_requires_video = self.application_requires_video;

        // allow_applications can be changed before voting period starts
        if let Some(allow_applications) = allow_applications {
            if self.voting_start_ms > env::block_timestamp_ms() {
                if !allow_applications {
                    validated_allow_applications = allow_applications;
                    validated_application_start_ms = None;
                    validated_application_end_ms = None;
                } else {
                    if application_start_ms.is_none() || application_end_ms.is_none() {
                        panic!("Application start and end dates must be provided if allow applications is true");
                    }
                    validated_allow_applications = allow_applications;
                    validated_application_start_ms = application_start_ms;
                    validated_application_end_ms = application_end_ms;
                }
            } else {
                panic!("Allow applications can only be changed before voting period starts");
            }
        }

        // application start date can be extended as long as it doesn't overlap with voting
        if let Some(start_ms) = application_start_ms {
            if self.voting_start_ms > start_ms {
                validated_application_start_ms = Some(start_ms);
            } else {
                panic!("Application start date must be before voting start date");
            }
        }

        // application end date can be extended as long as it doesn't overlap with voting and the application period isn't over
        if let Some(end_ms) = application_end_ms {
            if let Some(current_end_ms) = self.application_end_ms {
                if env::block_timestamp_ms() > current_end_ms {
                    panic!("Application end date has passed");
                }
            }
            validated_application_end_ms = Some(end_ms);
        }

        if let Some(application_requires_video) = application_requires_video {
            validated_application_requires_video = application_requires_video;
        }

        (
            validated_allow_applications,
            validated_application_start_ms,
            validated_application_end_ms,
            validated_application_requires_video,
        )
    }

    pub fn update_application_config(
        &mut self,
        allow_applications: Option<bool>,
        application_start_ms: Option<u64>,
        application_end_ms: Option<u64>,
        application_requires_video: Option<bool>,
    ) {
        if !self.is_caller_owner_or_admin() {
            panic!("Only owner or admin can update application config");
        }
        let (
            validated_allow_applications,
            validated_application_start_ms,
            validated_application_end_ms,
            validated_application_requires_video,
        ) = self.validate_application_config(
            allow_applications,
            application_start_ms,
            application_end_ms,
            application_requires_video,
        );

        self.allow_applications = validated_allow_applications;
        if let Some(start_ms) = validated_application_start_ms {
            self.application_start_ms = Some(start_ms);
        }
        if let Some(end_ms) = validated_application_end_ms {
            self.application_end_ms = Some(end_ms);
        }
        self.application_requires_video = validated_application_requires_video;
    }

    pub fn is_caller_owner(&self) -> bool {
        let caller = env::predecessor_account_id();
        self.owner == *caller
    }

    pub fn is_caller_owner_or_admin(&self) -> bool {
        let caller = env::predecessor_account_id();
        self.owner == *caller || self.admins.contains(&caller)
    }

    pub fn assert_caller_is_owner_or_admin(&self) {
        assert!(
            self.is_caller_owner_or_admin(),
            "Caller must be owner or admin"
        );
    }

    pub fn is_application_live(&self) -> bool {
        self.allow_applications
            && self.application_start_ms.unwrap_or(0) <= env::block_timestamp_ms()
            && self.application_end_ms.unwrap_or(0) >= env::block_timestamp_ms()
    }

    pub fn assert_application_live(&self) {
        assert!(self.is_application_live(), "Application is not live");
    }

    pub fn assert_voting_not_started(&self) {
        assert!(
            self.voting_start_ms > env::block_timestamp_ms(),
            "Voting has already started"
        );
    }

    pub fn is_voting_live(&self) -> bool {
        self.voting_start_ms <= env::block_timestamp_ms()
            && self.voting_end_ms >= env::block_timestamp_ms()
    }

    pub fn assert_voting_live(&self) {
        assert!(self.is_voting_live(), "Voting is not live");
    }

    pub fn assert_voting_ended(&self) {
        assert!(
            self.voting_end_ms < env::block_timestamp_ms(),
            "Voting has not ended yet"
        );
    }

    pub fn validate_whitelist_blacklist(&self) {
        let caller = env::predecessor_account_id();
        if self.use_whitelist {
            assert!(
                self.whitelisted_voters
                    .as_ref()
                    .expect("Whitelist must be provided")
                    .contains(&caller),
                "Caller is not whitelisted"
            );
        }
        assert!(
            !self.blacklisted_voters.contains(&caller),
            "Caller is blacklisted"
        );
    }

    pub fn can_vote(&self, voter: &AccountId) -> bool {
        if !self.is_voting_live() {
            return false;
        }
        if self.use_whitelist {
            if let Some(whitelist) = &self.whitelisted_voters {
                if !whitelist.contains(&voter) {
                    return false;
                }
            }
        }
        !self.blacklisted_voters.contains(&voter)
    }

    pub fn assert_cooldown_period_in_process(&self) {
        assert!(
            self.use_cooldown && self.cooldown_end_ms.unwrap_or(0) > env::block_timestamp_ms(),
            "Cooldown period is not in process"
        );
    }

    pub fn assert_cooldown_period_complete(&self) {
        assert!(
            self.cooldown_end_ms.unwrap_or(0) < env::block_timestamp_ms(),
            "Cooldown period has not ended yet"
        );
    }

    pub fn assert_compliance_period_complete(&self) {
        assert!(
            self.compliance_end_ms.unwrap_or(0) < env::block_timestamp_ms(),
            "Compliance period has not ended yet"
        );
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct RoundDetailExternal {
    pub id: RoundId,
    pub owner: AccountId,
    pub admins: Vec<AccountId>,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub allow_applications: bool,
    pub application_start_ms: Option<TimestampMs>, // must be present if allow_applications is true
    pub application_end_ms: Option<TimestampMs>,   // must be present if allow_applications is true
    pub application_requires_video: bool,
    pub voting_start_ms: TimestampMs,
    pub voting_end_ms: TimestampMs,
    pub blacklisted_voters: Vec<AccountId>, // todo: if these will grow large, consider storing on top-level contract instead
    pub whitelisted_voters: Option<Vec<AccountId>>, // todo: if these will grow large, consider storing on top-level contract instead
    pub use_whitelist: bool,
    pub expected_amount: U128, // String for JSON purposes. NB: on Stellar this is an int (u128)
    pub current_vault_balance: U128, // String for JSON purposes. NB: on Stellar this is an int (u128)
    pub vault_total_deposits: U128,  // String for JSON purposes.
    pub allow_remaining_funds_redistribution: bool,
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
    pub remaining_funds_redistributed_at_ms: Option<TimestampMs>,
    pub remaining_funds_redistribution_memo: Option<String>,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub use_cooldown: bool,
    pub cooldown_period_ms: u64,
    pub cooldown_end_ms: Option<TimestampMs>,
    pub use_compliance: bool,
    pub compliance_period_ms: u64,
    pub compliance_end_ms: Option<TimestampMs>,
    pub round_complete: bool,
}

impl RoundDetailExternal {
    pub fn to_internal(self) -> RoundDetailInternal {
        RoundDetailInternal {
            id: self.id,
            owner: self.owner,
            admins: self.admins,
            name: self.name,
            description: self.description,
            contacts: self.contacts,
            allow_applications: self.allow_applications,
            application_start_ms: self.application_start_ms,
            application_end_ms: self.application_end_ms,
            application_requires_video: self.application_requires_video,
            voting_start_ms: self.voting_start_ms,
            voting_end_ms: self.voting_end_ms,
            blacklisted_voters: self.blacklisted_voters,
            whitelisted_voters: self.whitelisted_voters,
            use_whitelist: self.use_whitelist,
            expected_amount: self.expected_amount.0,
            current_vault_balance: self.current_vault_balance.0,
            vault_total_deposits: self.vault_total_deposits.0,
            allow_remaining_funds_redistribution: self.allow_remaining_funds_redistribution,
            remaining_funds_redistribution_recipient: self.remaining_funds_redistribution_recipient,
            remaining_funds_redistributed_at_ms: self.remaining_funds_redistributed_at_ms,
            remaining_funds_redistribution_memo: self.remaining_funds_redistribution_memo,
            num_picks_per_voter: self.num_picks_per_voter,
            max_participants: self.max_participants,
            use_cooldown: self.use_cooldown,
            cooldown_period_ms: self.cooldown_period_ms,
            cooldown_end_ms: self.cooldown_end_ms,
            use_compliance: self.use_compliance,
            compliance_period_ms: self.compliance_period_ms,
            compliance_end_ms: self.compliance_end_ms,
            round_complete: self.round_complete,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Contact {
    name: String,
    value: String,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn create_round(&mut self, round_detail: CreateRoundParams) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let id = self.next_round_id;
        let round = RoundDetailInternal {
            id,
            owner: round_detail.owner,
            admins: round_detail.admins,
            name: round_detail.name,
            description: round_detail.description,
            contacts: round_detail.contacts,
            allow_applications: round_detail.allow_applications,
            application_start_ms: round_detail.application_start_ms,
            application_end_ms: round_detail.application_end_ms,
            application_requires_video: round_detail.application_requires_video,
            voting_start_ms: round_detail.voting_start_ms,
            voting_end_ms: round_detail.voting_end_ms,
            blacklisted_voters: vec![],
            whitelisted_voters: None,
            use_whitelist: round_detail.use_whitelist.unwrap_or(false),
            expected_amount: round_detail.expected_amount.0,
            current_vault_balance: 0,
            vault_total_deposits: 0,
            num_picks_per_voter: round_detail.num_picks_per_voter,
            max_participants: round_detail.max_participants.unwrap_or(0),
            use_cooldown: round_detail.use_cooldown,
            cooldown_period_ms: round_detail
                .cooldown_period_ms
                .unwrap_or(DEFAULT_COOLDOWN_PERIOD_MS),
            cooldown_end_ms: None,
            use_compliance: round_detail.use_compliance,
            compliance_period_ms: round_detail
                .compliance_period_ms
                .unwrap_or(DEFAULT_COMPLIANCE_PERIOD_MS),
            compliance_end_ms: None,
            allow_remaining_funds_redistribution: round_detail.allow_remaining_funds_redistribution,
            remaining_funds_redistribution_recipient: round_detail
                .remaining_funds_redistribution_recipient,
            remaining_funds_redistributed_at_ms: None,
            remaining_funds_redistribution_memo: None,
            round_complete: false,
        };

        // validation
        round.validate_application_config(
            Some(round.allow_applications),
            round.application_start_ms,
            round.application_end_ms,
            Some(round.application_requires_video),
        );
        round.validate_voting_config(Some(round.voting_start_ms), Some(round.voting_end_ms));
        round.validate_cooldown_config(Some(round.use_cooldown), Some(round.cooldown_period_ms));
        round.validate_remaining_funds_redistribution_config(
            Some(round.allow_remaining_funds_redistribution),
            round.remaining_funds_redistribution_recipient.clone(),
        );

        self.rounds_by_id.insert(id, round.clone());
        self.next_round_id += 1;
        self.applications_for_round_by_internal_project_id.insert(
            id,
            UnorderedMap::new(StorageKey::ApplicationsForRoundByInternalProjectIdInner {
                round_id: id,
            }),
        );
        // add new mapping for approved applicants
        self.approved_internal_project_ids_for_round.insert(
            id,
            UnorderedSet::new(StorageKey::ApprovedInternalProjectIdsForRoundInner { round_id: id }),
        );
        // add new mapping for votes
        self.votes_by_round_id.insert(
            id,
            UnorderedMap::new(StorageKey::VotesByRoundIdInner { round_id: id }),
        );
        // add new mapping for vote counts by project
        self.voting_count_per_project_by_round_id.insert(
            id,
            UnorderedMap::new(StorageKey::VotingCountPerProjectByRoundIdInner { round_id: id }),
        );
        // add new mapping for payout records
        self.payout_ids_by_round_id.insert(
            id,
            UnorderedSet::new(StorageKey::PayoutIdsByRoundIdInner { round_id: id }),
        );
        // add new mapping for payout challenges
        self.payouts_challenges_for_round_by_challenger_id.insert(
            id,
            UnorderedMap::new(StorageKey::PayoutsChallengesForRoundByChallengerIdInner {
                round_id: id,
            }),
        );
        // clean-up
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_create_round(&round_external);
        round_external.clone()
    }

    #[payable]
    pub fn update_round(
        &mut self,
        // don't allow changing owner via this method
        round_id: RoundId,
        admins: Option<Vec<AccountId>>,
        name: Option<String>,
        description: Option<String>,
        contacts: Option<Vec<Contact>>,
        allow_applications: Option<bool>,
        application_start_ms: Option<TimestampMs>,
        application_end_ms: Option<TimestampMs>,
        application_requires_video: Option<bool>,
        voting_start_ms: Option<TimestampMs>,
        voting_end_ms: Option<TimestampMs>,
        blacklisted_voters: Option<Vec<AccountId>>,
        whitelisted_voters: Option<Vec<AccountId>>,
        use_whitelist: Option<bool>,
        expected_amount: Option<U128>,
        allow_remaining_funds_redistribution: Option<bool>,
        remaining_funds_redistribution_recipient: Option<AccountId>,
        num_picks_per_voter: Option<u32>,
        max_participants: Option<u32>,
        use_cooldown: Option<bool>,
        cooldown_period_ms: Option<u64>,
        use_compliance: Option<bool>,
        compliance_period_ms: Option<u64>,
        // don't allow changing round_complete via this method
    ) -> RoundDetailExternal {
        // TODO: this needs to be reviewed and extensive validation added for what can be updated and when
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner or admin (not strictly necessary here since individual update methods also do this)
        round.assert_caller_is_owner_or_admin();

        round.update_admins(admins);
        round.update_name(name);
        round.update_description(description);
        round.update_contacts(contacts);
        round.update_application_config(
            allow_applications,
            application_start_ms,
            application_end_ms,
            application_requires_video,
        );
        round.update_voting_config(voting_start_ms, voting_end_ms);
        round.update_blacklisted_voters(blacklisted_voters);
        round.update_whitelisted_voters(whitelisted_voters);
        round.update_use_whitelist(use_whitelist);
        round.update_expected_amount(expected_amount);
        round.update_remaining_funds_redistribution_config(
            allow_remaining_funds_redistribution,
            remaining_funds_redistribution_recipient,
        );
        round.update_num_picks_per_voter(num_picks_per_voter);
        round.update_max_participants(max_participants);
        round.update_cooldown_config(use_cooldown, cooldown_period_ms);
        round.update_compliance_config(use_compliance, compliance_period_ms);

        // clean-up
        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external.clone()
    }

    #[payable]
    /// Must have no balance, no applications & no votes
    pub fn delete_round(&mut self, round_id: RoundId) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let caller = env::predecessor_account_id();
        let round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();

        // Verify caller is owner
        if round.owner != caller {
            panic!("Only owner can delete round");
        }

        // Verify no balance
        assert_eq!(
            round.vault_total_deposits, 0,
            "Round must have no vault deposits"
        );

        // Verify no applications
        let applications_for_round = self
            .applications_for_round_by_internal_project_id
            .get(&round_id)
            .expect("Applications for round not found");
        assert_eq!(
            applications_for_round.len(),
            0,
            "Round must have no applications"
        );

        // Verify no votes
        let votes_for_round = self
            .votes_by_round_id
            .get(&round_id)
            .expect("Votes for round not found");
        assert_eq!(votes_for_round.len(), 0, "Round must have no votes");

        // Remove records from mappings
        self.rounds_by_id.remove(&round_id);
        self.applications_for_round_by_internal_project_id
            .remove(&round_id);
        self.approved_internal_project_ids_for_round
            .remove(&round_id);
        self.votes_by_round_id.remove(&round_id);
        self.voting_count_per_project_by_round_id.remove(&round_id);
        self.payout_ids_by_round_id.remove(&round_id);
        self.payouts_challenges_for_round_by_challenger_id
            .remove(&round_id);

        // clean-up
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_delete_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_name(&mut self, round_id: RoundId, name: String) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner or admin
        round.update_name(Some(name));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_description(
        &mut self,
        round_id: RoundId,
        description: String,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_description(Some(description));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_contacts(
        &mut self,
        round_id: RoundId,
        contacts: Vec<Contact>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_contacts(Some(contacts));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_voting_period(
        &mut self,
        round_id: RoundId,
        start_ms: TimestampMs,
        end_ms: TimestampMs,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_voting_config(Some(start_ms), Some(end_ms));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_applications_config(
        &mut self,
        round_id: RoundId,
        allow_applications: Option<bool>,
        application_start_ms: Option<TimestampMs>,
        application_end_ms: Option<TimestampMs>,
        application_requires_video: Option<bool>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_application_config(
            allow_applications,
            application_start_ms,
            application_end_ms,
            application_requires_video,
        );

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_expected_amount(
        &mut self,
        round_id: RoundId,
        expected_amount: U128,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_expected_amount(Some(expected_amount));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn close_voting_period(&mut self, round_id: RoundId) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner or admin
        round.assert_caller_is_owner_or_admin();
        // Voting must be live
        assert!(round.is_voting_live(), "Voting period is not live");

        round.voting_end_ms = env::block_timestamp_ms();

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_cooldown_config(
        &mut self,
        round_id: RoundId,
        use_cooldown: bool,
        cooldown_period_ms: Option<u64>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_cooldown_config(Some(use_cooldown), cooldown_period_ms);

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_compliance_config(
        &mut self,
        round_id: RoundId,
        use_compliance: bool,
        compliance_period_ms: Option<u64>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_compliance_config(Some(use_compliance), compliance_period_ms);

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_redistribution_config(
        &mut self,
        round_id: RoundId,
        allow_remaining_funds_redistribution: bool,
        remaining_funds_redistribution_recipient: Option<AccountId>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_remaining_funds_redistribution_config(
            Some(allow_remaining_funds_redistribution),
            remaining_funds_redistribution_recipient,
        );

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn add_admins(&mut self, round_id: RoundId, admins: Vec<AccountId>) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let caller = env::predecessor_account_id();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner
        if round.owner != caller {
            panic!("Only owner can add admins");
        }

        for admin in admins {
            if !round.admins.contains(&admin) {
                round.admins.push(admin);
            }
        }

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn remove_admins(
        &mut self,
        round_id: RoundId,
        admins: Vec<AccountId>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let caller = env::predecessor_account_id();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner
        if round.owner != caller {
            panic!("Only owner can remove admins");
        }

        round.admins = round
            .admins
            .iter()
            .filter(|admin| !admins.contains(admin))
            .cloned()
            .collect();

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_admins(&mut self, round_id: RoundId, admins: Vec<AccountId>) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        round.update_admins(Some(admins));

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn clear_admins(&mut self, round_id: RoundId) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let caller = env::predecessor_account_id();
        let round = self
            .rounds_by_id
            .get_mut(&round_id)
            .expect("Round not found");

        // Verify caller is owner
        if round.owner != caller {
            panic!("Only owner can clear admins");
        }

        round.admins = vec![];

        refund_deposit(initial_storage_usage, None);
        let round_external = round.clone().to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn deposit_to_round(&mut self, round_id: RoundId) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();
        let caller = env::predecessor_account_id();
        let attached_deposit = env::attached_deposit();
        let current_vault_balance = round.current_vault_balance + attached_deposit.as_yoctonear();
        let vault_total_deposits = round.vault_total_deposits + attached_deposit.as_yoctonear();
        let round = RoundDetailInternal {
            current_vault_balance,
            vault_total_deposits,
            ..round
        };
        self.rounds_by_id.insert(round_id, round.clone());
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_deposit(
            &round_external,
            U128(attached_deposit.as_yoctonear()),
            &caller,
        );
        round_external
        // TODO: determine whether deposit record should be saved on-chain (not currently done, only event is logged)
    }

    #[payable]
    pub fn flag_voters(
        &mut self,
        round_id: RoundId,
        voters: Vec<AccountId>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let mut round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();

        // Verify caller is owner or admin
        round.assert_caller_is_owner_or_admin();

        for voter in voters {
            if !round.blacklisted_voters.contains(&voter) {
                round.blacklisted_voters.push(voter);
            }
        }

        self.rounds_by_id.insert(round_id, round.clone());
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn unflag_voters(
        &mut self,
        round_id: RoundId,
        voters: Vec<AccountId>,
    ) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let mut round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();

        // Verify caller is owner or admin
        round.assert_caller_is_owner_or_admin();

        round.blacklisted_voters = round
            .blacklisted_voters
            .iter()
            .filter(|voter| !voters.contains(voter))
            .cloned()
            .collect();

        self.rounds_by_id.insert(round_id, round.clone());
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_update_round(&round_external);
        round_external
    }

    #[payable]
    pub fn set_round_complete(&mut self, round_id: RoundId) -> RoundDetailExternal {
        let initial_storage_usage = env::storage_usage();
        let mut round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();

        // Verify caller is owner or admin
        round.assert_caller_is_owner_or_admin();

        round.round_complete = true;

        self.rounds_by_id.insert(round_id, round.clone());
        refund_deposit(initial_storage_usage, None);
        let round_external = round.to_external();
        log_update_round(&round_external);
        round_external
    }

    // GETTER/VIEW METHODS

    pub fn get_rounds(
        &self,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundDetailExternal> {
        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(self.default_page_size);
        if from_index > self.rounds_by_id.len() as u64 {
            // TODO: check for off-by-one bug here
            return vec![];
        }
        self.rounds_by_id
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .map(|(_, round)| round.clone().to_external())
            .collect()
    }

    /// Retrieve a round by its ID
    pub fn get_round(&self, round_id: RoundId) -> RoundDetailExternal {
        self.rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone()
            .to_external()
    }

    pub fn is_voting_live(&self, round_id: RoundId) -> bool {
        self.rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .is_voting_live()
    }

    // pub fn add_projects_to_round(&mut self, round_id: RoundId, projects: Vec<AccountId>) -> &Round {
    //     let caller = env::predecessor_account_id();
    //     let round = self
    //         .rounds_by_id
    //         .get_mut(&round_id)
    //         .expect("Round not found");

    //     // Verify caller is owner or admin
    //     if round.owner != caller && !round.admins.contains(&caller) {
    //         panic!("Only owner or admin can add projects to round");
    //     }

    //     for project in projects {
    //         let internal_id = self.next_internal_id;
    //         self.project_id_to_internal_id
    //             .insert(project.clone(), internal_id);
    //         self.internal_id_to_project_id
    //             .insert(internal_id, project.clone());
    //         round.approved_applicants.insert(project);
    //         self.next_internal_id += 1;
    //     }

    //     self.rounds_by_id.get(&round_id).unwrap()
    // }
}
