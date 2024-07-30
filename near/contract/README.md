# Grantpicks (aka "Rounds") contract - NEAR

## Purpose

To facilitate pairwise voting & funding distribution on NEAR

## Contract Types / Structure

### Contract / Config

```rs
/// Contract state as stored on-chain
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
}

/// Ephemeral-only external struct (used in views)
pub struct Config {
    pub owner: AccountId,
    pub protocol_fee_recipient: Option<AccountId>,
    pub protocol_fee_basis_points: Option<u16>,
    pub default_page_size: u64,
}
```

### Rounds

```rs
pub type RoundId = u64; // auto-incrementing ID for Rounds

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
    pub compliance_requirement_description: Option<String>, // must be provided if use_compliance is true
    pub compliance_period_ms: Option<u64>, // defaults to DEFAULT_COMPLIANCE_PERIOD_MS if not provided
    pub allow_remaining_funds_redistribution: bool,
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
    pub use_referrals: bool,
    pub referrer_fee_basis_points: Option<u16>,
}

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
    /// Indicates whether matching pool can be redistributed to remaining_funds_redistribution_recipient after compliance period ends. Must be specified at deployment, and CANNOT be changed afterwards.
    pub allow_remaining_funds_redistribution: bool,
    /// Recipient of matching pool redistribution (if enabled). CANNOT be changed after public round has started.
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
    pub remaining_funds_redistributed_at_ms: Option<TimestampMs>,
    pub remaining_funds_redistribution_memo: Option<String>,
    pub remaining_funds_redistributed_by: Option<AccountId>,
    pub use_referrals: bool,
    pub referrer_fee_basis_points: Option<u16>,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub use_cooldown: bool,
    pub cooldown_period_ms: u64,
    pub cooldown_end_ms: Option<TimestampMs>,
    pub use_compliance: bool,
    pub compliance_requirement_description: Option<String>, // can be changed until compliance period ends
    pub compliance_period_ms: u64,
    pub compliance_end_ms: Option<TimestampMs>,
    pub round_complete: bool,
}

// Ephemeral/view-only struct that converts u128 to U128 for JSON compatibility
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
    pub use_referrals: bool,
    pub referrer_fee_basis_points: Option<u16>,
    pub allow_remaining_funds_redistribution: bool,
    pub remaining_funds_redistribution_recipient: Option<AccountId>,
    pub remaining_funds_redistributed_at_ms: Option<TimestampMs>,
    pub remaining_funds_redistribution_memo: Option<String>,
    pub remaining_funds_redistributed_by: Option<AccountId>,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub use_cooldown: bool,
    pub cooldown_period_ms: u64,
    pub cooldown_end_ms: Option<TimestampMs>,
    pub use_compliance: bool,
    pub compliance_requirement_description: Option<String>,
    pub compliance_period_ms: u64,
    pub compliance_end_ms: Option<TimestampMs>,
    pub round_complete: bool,
}
```

### Applications

```rs
// NB: Applications are indexed by Internal Project ID (populated as `applicant_id` on RoundApplicationExternal)

pub struct RoundApplication {
    pub round_id: RoundId,
    pub internal_project_id: InternalProjectId, // uses internal ID to save on storage
    pub applicant_note: Option<String>,
    pub video_url: Option<String>,
    pub status: ApplicationStatus,
    pub review_note: Option<String>,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

// Ephemeral/view-only, populates applicant_id
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

pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
    Blacklisted,
}
```

### Deposits

```rs
pub type DepositId = u64; // auto-incrementing ID for Deposits

pub struct Deposit {
    pub round_id: RoundId,
    pub depositor_id: AccountId,
    pub total_amount: u128,
    pub protocol_fee: u128,
    pub referrer_fee: u128,
    pub net_amount: u128,
    pub deposited_at: TimestampMs,
    pub memo: Option<String>,
}

// Ephemeral/view-only
pub struct DepositExternal {
    pub id: DepositId,
    pub round_id: RoundId,
    pub depositor_id: AccountId,
    pub total_amount: U128,
    pub protocol_fee: U128,
    pub referrer_fee: U128,
    pub net_amount: U128,
    pub deposited_at: TimestampMs,
    pub memo: Option<String>,
}
```

### Votes

```rs
pub type PairId = u32;

// Ephemeral-only
pub struct Pair {
    pub id: PairId,
    pub projects: Vec<AccountId>,
}

// Stored on-chain (within VotingResult)
pub struct Pick {
    pub pair_id: PairId,
    pub voted_project: AccountId,
}

// Stored on-chain
pub struct VotingResult {
    pub voter: AccountId,
    pub picks: Vec<Pick>,
    pub voted_ms: u64,
}

// Ephemeral-only
pub struct ProjectVotingResult {
    pub project: AccountId,
    pub voting_count: u32,
}
```

### Payouts

```rs
pub type PayoutId = u32;

pub struct Payout {
    /// Unique identifier for the payout
    pub id: PayoutId,
    /// ID of the round for which the payout was made
    pub round_id: RoundId,
    /// ID of the application receiving the payout
    pub recipient_id: AccountId,
    /// Amount to be paid out
    pub amount: u128,
    /// Timestamp when the payout was made. None if not yet paid out.
    pub paid_at: Option<TimestampMs>,
    /// Memo field for payout notes
    pub memo: Option<String>,
}

/// Ephemeral-only
pub struct PayoutExternal {
    /// Unique identifier for the payout
    pub id: PayoutId,
    /// ID of the round for which the payout was made
    pub round_id: RoundId,
    /// ID of the application receiving the payout
    pub recipient_id: AccountId,
    /// Amount to be paid out
    pub amount: U128,
    /// Timestamp when the payout was made. None if not yet paid out.
    pub paid_at: Option<TimestampMs>,
    /// Memo field for payout notes
    pub memo: Option<String>,
}

/// Ephemeral-only; used for setting payouts
pub struct PayoutInput {
    pub amount: U128,
    pub recipient_id: AccountId,
    pub memo: Option<String>,
}

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
pub struct PayoutsChallengeExternal {
    /// Account that made the challenge
    pub challenger_id: AccountId,
    /// Round ID for which the challenge was made
    pub round_id: RoundId,
    /// Timestamp when the payout challenge was made
    pub created_at: TimestampMs,
    /// Reason for the challenge
    pub reason: String,
    /// Notes from admin/owner
    pub admin_notes: Option<String>,
    /// Whether the challenge has been resolved
    pub resolved: bool,
}

```

### Contract Source Metadata

_NB: Below implemented as per NEP 0330 (https://github.com/near/NEPs/blob/master/neps/nep-0330.md), with addition of `commit_hash`_

```rs
pub struct ContractSourceMetadata {
    /// Version of source code, e.g. "v1.0.0", could correspond to Git tag
    pub version: String,
    /// Git commit hash of currently deployed contract code
    pub commit_hash: String,
    /// GitHub repo url for currently deployed contract code
    pub link: String,
}
```

## Methods

### Write Methods

```rs
// INIT

pub fn new(
    owner: AccountId,
    protocol_fee_recipient: Option<AccountId>,
    protocol_fee_basis_points: Option<u16>,
    contract_source_metadata: ContractSourceMetadata,
) -> Self


// CONTRACT OWNER / TOP-LEVEL CONTRACT CONFIG

pub fn owner_set_default_page_size(&mut self, default_page_size: u64)

#[payable]
pub fn owner_set_protocol_fee_config(
    &mut self,
    protocol_fee_recipient: Option<AccountId>,
    protocol_fee_basis_points: Option<u16>,
)


// ROUNDS

#[payable]
pub fn create_round(&mut self, round_detail: CreateRoundParams) -> RoundDetailExternal

#[payable]
/// All-purpose update method; granular methods also available (outlined below)
pub fn update_round(
    &mut self,
    // NB: changing owner &/or round_complete via this method is not allowed
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
    use_referrals: Option<bool>,
    referrer_fee_basis_points: Option<u16>,
    allow_remaining_funds_redistribution: Option<bool>,
    remaining_funds_redistribution_recipient: Option<AccountId>,
    num_picks_per_voter: Option<u32>,
    max_participants: Option<u32>,
    use_cooldown: Option<bool>,
    cooldown_period_ms: Option<u64>,
    use_compliance: Option<bool>,
    compliance_requirement_description: Option<String>,
    compliance_period_ms: Option<u64>,
) -> RoundDetailExternal

#[payable]
/// Must have no balance, no applications & no votes
pub fn delete_round(&mut self, round_id: RoundId) -> RoundDetailExternal

#[payable]
pub fn set_name(&mut self, round_id: RoundId, name: String) -> RoundDetailExternal

#[payable]
pub fn set_description(
    &mut self,
    round_id: RoundId,
    description: String,
) -> RoundDetailExternal

#[payable]
pub fn set_contacts(
    &mut self,
    round_id: RoundId,
    contacts: Vec<Contact>,
) -> RoundDetailExternal

#[payable]
pub fn set_voting_period(
    &mut self,
    round_id: RoundId,
    start_ms: TimestampMs,
    end_ms: TimestampMs,
) -> RoundDetailExternal

#[payable]
pub fn set_applications_config(
    &mut self,
    round_id: RoundId,
    allow_applications: Option<bool>,
    application_start_ms: Option<TimestampMs>,
    application_end_ms: Option<TimestampMs>,
    application_requires_video: Option<bool>,
) -> RoundDetailExternal

#[payable]
pub fn set_expected_amount(
    &mut self,
    round_id: RoundId,
    expected_amount: U128,
) -> RoundDetailExternal

#[payable]
pub fn close_voting_period(&mut self, round_id: RoundId) -> RoundDetailExternal

#[payable]
pub fn set_cooldown_config(
    &mut self,
    round_id: RoundId,
    use_cooldown: bool,
    cooldown_period_ms: Option<u64>,
) -> RoundDetailExternal

#[payable]
pub fn set_compliance_config(
    &mut self,
    round_id: RoundId,
    use_compliance: bool,
    compliance_requirement_description: Option<String>,
    compliance_period_ms: Option<u64>,
) -> RoundDetailExternal

#[payable]
pub fn set_redistribution_config(
    &mut self,
    round_id: RoundId,
    allow_remaining_funds_redistribution: bool,
    remaining_funds_redistribution_recipient: Option<AccountId>,
) -> RoundDetailExternal

#[payable]
pub fn add_admins(&mut self, round_id: RoundId, admins: Vec<AccountId>) -> RoundDetailExternal

#[payable]
pub fn remove_admins(
    &mut self,
    round_id: RoundId,
    admins: Vec<AccountId>,
) -> RoundDetailExternal

#[payable]
pub fn set_admins(&mut self, round_id: RoundId, admins: Vec<AccountId>) -> RoundDetailExternal

#[payable]
pub fn clear_admins(&mut self, round_id: RoundId) -> RoundDetailExternal

#[payable]
pub fn flag_voters(
    &mut self,
    round_id: RoundId,
    voters: Vec<AccountId>,
) -> RoundDetailExternal

#[payable]
pub fn unflag_voters(
    &mut self,
    round_id: RoundId,
    voters: Vec<AccountId>,
) -> RoundDetailExternal

#[payable]
pub fn set_round_complete(&mut self, round_id: RoundId) -> RoundDetailExternal


// APPLICATIONS

#[payable]
pub fn apply_to_round(
    &mut self,
    round_id: RoundId,
    note: Option<String>,
    video_url: Option<String>,
    review_note: Option<String>,
    applicant: Option<AccountId>, // only allowed to be provided by round owner/admin, otherwise it is ignored
) -> RoundApplicationExternal

#[payable]
/// Available to owner/admin ownly
pub fn apply_to_round_batch(
    &mut self,
    round_id: RoundId,
    review_notes: Vec<Option<String>>,
    applicants: Vec<AccountId>,
) -> Vec<RoundApplicationExternal>

#[payable]
pub fn unapply_from_round(
    &mut self,
    round_id: RoundId,
    applicant: Option<AccountId>,
) -> RoundApplicationExternal

#[payable]
/// The idea here is that an applicant can update their message, and indexers can store these as individual "messages" in a conversation thread between applicant & reviewer. But the full thread doesn't need to be stored on-chain, just the latest message.
pub fn update_applicant_note(
    &mut self,
    round_id: RoundId,
    note: String,
) -> RoundApplicationExternal

#[payable]
/// An owner/admin can review a single application many times, but each time they must provide a status and a note. This is to allow for a conversation thread between the applicant and the reviewer. The full thread doesn't need to be stored on-chain, just the latest message.
pub fn review_application(
    &mut self,
    round_id: RoundId,
    applicant: AccountId,
    status: ApplicationStatus,
    note: String,
) -> RoundApplicationExternal


// DEPOSITS

#[payable]
pub fn deposit_to_round(
    &mut self,
    round_id: RoundId,
    memo: Option<String>,
    referrer_id: Option<AccountId>,
) -> DepositExternal


// VOTES

#[payable]
pub fn vote(&mut self, round_id: RoundId, picks: Vec<Pick>) -> VotingResult


// PAYOUTS

#[payable]
pub fn set_payouts(
    &mut self,
    round_id: RoundId,
    payouts: Vec<PayoutInput>,
    clear_existing: bool,
) -> Vec<PayoutExternal>

#[payable]
pub fn process_payouts(&mut self, round_id: RoundId)

#[payable]
pub fn challenge_payouts(
    &mut self,
    round_id: RoundId,
    reason: String,
) -> PayoutsChallengeExternal

pub fn remove_payouts_challenge(&mut self, round_id: RoundId) -> ()

#[payable]
pub fn update_payouts_challenge(
    &mut self,
    round_id: RoundId,
    challenger_id: AccountId,
    notes: Option<String>,
    resolve_challenge: Option<bool>,
) -> ()

#[payable]
pub fn remove_resolved_payouts_challenges(&mut self, round_id: RoundId) -> ()


// VAULT REDISTRIBUTION

#[payable]
// Callable by owner or admin
pub fn redistribute_vault(&mut self, round_id: RoundId, memo: Option<String>)

```

### Read Methods

```rs
// TOP-LEVEL CONTRACT CONFIG

pub fn get_config(&self) -> Config


// ROUNDS

pub fn get_rounds(
    &self,
    from_index: Option<u64>,
    limit: Option<u64>,
) -> Vec<RoundDetailExternal>


pub fn get_round(&self, round_id: RoundId) -> Option<RoundDetailExternal>

pub fn is_voting_live(&self, round_id: RoundId) -> bool

// APPLICATIONS

pub fn get_applications_for_round(
    &self,
    round_id: RoundId,
    from_index: Option<u64>,
    limit: Option<u64>,
) -> Vec<RoundApplicationExternal>

pub fn get_application(&self, applicant: AccountId) -> Option<RoundApplicationExternal>

pub fn get_application_by_internal_project_id(
        &self,
        internal_project_id: InternalProjectId,
    ) -> Option<RoundApplicationExternal>


// DEPOSITS

pub fn get_deposits_for_round(
    &self,
    round_id: RoundId,
    from_index: Option<u64>,
    limit: Option<u64>,
) -> Vec<DepositExternal>


// VOTES

pub fn get_pairs_to_vote(&self, round_id: RoundId) -> Vec<Pair>

pub fn get_all_pairs_for_round(&self, round_id: RoundId) -> Vec<Pair>

pub fn get_pair_by_index(
    &self,
    total_available_pairs: u32,
    index: u32,
    projects: &Vec<InternalProjectId>,
) -> Pair

pub fn get_pair_by_id(&self, round_id: RoundId, pair_id: PairId)

pub fn get_votes_for_round(
    &self,
    round_id: RoundId,
    from_index: Option<u64>,
    limit: Option<u64>,
) -> Vec<VotingResult>

pub fn get_voting_results_for_round(&self, round_id: RoundId) -> Vec<ProjectVotingResult>

pub fn can_vote(&self, round_id: RoundId, voter: AccountId) -> bool


// PAYOUTS

pub fn get_payouts(&self, from_index: Option<u64>, limit: Option<u64>) -> Vec<PayoutExternal>

pub fn get_payouts_challenges(
    &self,
    round_id: RoundId,
    from_index: Option<u64>,
    limit: Option<u64>,
) -> Vec<PayoutsChallengeExternal>


// SOURCE METADATA

pub fn get_contract_source_metadata(&self) -> ContractSourceMetadata

```
