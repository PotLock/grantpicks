# Grantpicks (aka "Rounds") contract - Stellar

## Purpose

To facilitate pairwise voting & funding distribution on Stellar

## Storage Structure

```rs
#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    ProtocolFeeRecepient, // FEE_RECIPIENT
    ProtocolFee,          // FEE
    FactoryOwner,   // Owner for contract
    NextRoundId,  // Incremental integeter to determine round_id
    NextPayoutId, //  Incremental integeter to determine payout_id
    NextDepositId,  // Incremental integeter to determine deposit_id
    ProjectPayoutIds, // Storage key to store owned payout ids by project
    TokenContract, // storage key to store XLM token contract
    ProjectContract, // storage ke to store project registry / detail
    RoundInfo(u128), // storage key to store Round Detail
    PayoutInfo, // key to store payout detail by id
    DepositInfo, // key to store deposit detail by id
    WhiteList(u128), // key to store whitelisted voters by round
    BlackList(u128), // for blacklisted for voters on round
    ProjectApplicants(u128), // store projects applicant/application for every round
    ApprovedProjects(u128), // store project ids that already approved
    Payouts(u128), // store payouts ids for round
    PayoutChallenges(u128), // to store payout challenges
    VotingState(u128), // to store voters voting state in every round
    Votes(u128), // store voting results in every round
    ProjectVotingCount(u128), // store every voting count in project
    Admin(u128), // store admins for round
    Deposit(u128), // store deposit ids for round
}
```

## Contract Error Code

```rs
use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    OwnerOrAdminOnly = 5,
    ContractNotInitialized = 26,
    InsufficientBalance = 31,
    IndexOutOfBound = 32,
    SameOwner = 38,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RoundError{
  VotingStartGreaterThanVotingEnd = 0,
  ApplicationStartGreaterThanApplicationEnd = 1,
  VotingStartLessThanApplicationEnd = 2,
  AmountMustBeGreaterThanZero = 3,
  ContactMustBeLessThanTen = 4,
  InvalidVaultBalance = 8,
  UserBlacklisted = 19,
  UserAlreadyBlacklisted = 20,
  BlacklistNotFound = 21,
  UserNotWhitelisted = 22,
  ReviewNotTooLong = 23,
  RoundAlreadyCompleted = 27,
  AdminNotFound = 28,
  OwnerCannotBeAdmin = 29,
  AlreadyPaidOut = 34,
  NoApprovedProjects = 35,
  UserWhitelisted = 36,
  VotesAlreadyCast = 37,
  ApplicationPeriodMustBeSet = 39,
  ZeroValutBalance = 40,
  BalanceNotEmpty = 41,
  InsufficientFunds = 44,
  ChallengeNotFound = 45,
  PayoutNotFound = 46,
  RedistributionNotAllowed = 47,
  RedistributionAlreadyDone = 48,
  CompliancePeriodNotStarted = 49,
  CooldownPeriodNotInProcess = 50,
  NotSolveAllPayoutChallenge = 51,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VoteError {
  VotingPeriodNotStarted = 6,
  VotingPeriodEnded = 7,
  VotingPeriodNotEnded = 9,
  VotingAlreadyStarted = 12,
  AlreadyVoted = 17,
  NotVoteAllPairs = 18,
  EmptyVote = 24,
  TooManyVotes = 25,
  ProjectNotInPair = 33,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ApplicationError{
  ApplicationPeriodNotStarted = 10,
  ApplicationPeriodEnded = 11,
  ProjectNotApproved = 13,
  ProjectAlreadyApproved = 14,
  ProjectNotFoundInRegistry = 15,
  MaxParticipantsReached = 16,
  ApplicationNotFound = 30,
  VideoUrlNotValid = 42,
  ProjectAlreadyApplied = 43,
}

```

## Data Type

```rs
/*
Project Application status
*/
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
    Blacklisted,
}

//Contract Configuration
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Config {
    pub owner: Address,
    pub protocol_fee_recipient: Address,
    pub protocol_fee_basis_points: u32,
    pub default_page_size: u64,
}

// Round Detail Information
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundDetail {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub current_vault_balance: u128,
    pub vault_total_deposits: u128,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub allow_applications: bool,
    pub is_video_required: bool,
    pub cooldown_period_ms: Option<u64>, // use_cooldown replaced using .is_some() cooldown period
    pub cooldown_end_ms: Option<u64>,
    pub compliance_req_desc: String, // compliance  requiremnt description (shorted too long)
    pub compliance_period_ms: Option<u64>, // use_compliance replaced using .is_some() compliance period
    pub compliance_end_ms: Option<u64>,
    pub allow_remaining_dist: Option<bool>, // allow remaining distribution shorted
    pub remaining_dist_address: Address,
    pub remaining_dist_at_ms: Option<u64>,
    pub remaining_dist_memo: String,
    pub remaining_dist_by: Address,
    pub referrer_fee_basis_points: Option<u32>,
    pub round_complete_ms: Option<u64>,
}

// Parameter for creating rounds
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct CreateRoundParams {
    pub owner: Address,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub admins: Vec<Address>,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
    pub cooldown_period_ms: Option<u64>,
    pub cooldown_end_ms: Option<u64>,
    pub compliance_req_desc: String, // too long on stellar
    pub compliance_period_ms: Option<u64>,
    pub compliance_end_ms: Option<u64>,
    pub allow_remaining_dist: bool,
    pub remaining_dist_address: Address,
    pub referrer_fee_basis_points: Option<u32>,
}

//parameters for updating round
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct UpdateRoundParams {
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
}

// Applications for round
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundApplication{
    pub project_id: u128,
    pub applicant_id: Address,
    pub applicant_note: String,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

// Pair generated by algorithm
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Pair {
    pub pair_id: u32,
    pub projects: Vec<u128>,
}
// Picked Pair by User
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickedPair {
    pub pair_id: u32,
    pub voted_project_id: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickResult {
    pub pair_id: u32,
    pub project_id: u128,
}

// Voting Result
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct VotingResult {
    pub voter: Address,
    pub picks: Vec<PickResult>,
    pub voted_ms: u64,
}

// Basicly Voting Count For Project
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct ProjectVotingResult {
    pub project_id: u128,
    pub voting_count: u128,
    pub allocation: u128,
}

// Round Contact
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Contact {
    pub name: String,
    pub value: String,
}

// Payout Detail
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct Payout {
    pub id: u32,
    pub round_id: u128,
    pub recipient_id: Address,
    pub amount: i128,
    pub paid_at_ms: Option<u64>,
    pub memo: String,
}

// Payout Input By Admin
#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PayoutInput {
    pub recipient_id: Address,
    pub amount: i128,
    pub memo: String,
}

// Payout Challenge By User
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct PayoutsChallenge {
    pub round_id: u128,
    pub challenger_id: Address,
    pub created_at: u64,
    pub reason: String,
    pub admin_notes: String,
    pub resolved: bool,
}

// Data type for every Deposit
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct Deposit {
    pub deposit_id: u128,
    pub round_id: u128,
    pub depositor_id: Address,
    pub total_amount: i128,
    pub protocol_fee: i128,
    pub referrer_fee: i128,
    pub net_amount: i128,
    pub deposited_at: u64,
    pub memo: String,
}

```

## Factory Methods

```rs
//WRITE

// initialize new contract
fn initialize(env: &Env, caller: Address, token_address: Address, registry_address: Address, fee_basis_points: Option<u32>,fee_address: Option<Address>);

// create a round
fn create_round(env: &Env, caller: Address, params: CreateRoundParams) -> RoundDetail;

// upgrade contract code
fn upgrade(env: &Env, new_wasm_hash: BytesN<32>);

// transfer ownership
fn transfer_ownership(env: &Env, new_owner: Address);

//READ

// get all rounds in contract
fn get_rounds(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<RoundDetail>;

// get current contract config
fn get_config(env: &Env) -> Config;

```

## Round & Votes Methods

```rs
//WRITE

//manipulate/update round
fn set_cooldown_config(env: &Env, round_id: u128, caller: Address, cooldown_period_ms: Option<u64>) -> RoundDetail;
fn set_compliance_config(env: &Env, round_id: u128, caller: Address, compliance_req_desc: Option<String>, compliance_period_ms: Option<u64>) -> RoundDetail;
fn change_voting_period(env: &Env, round_id: u128, caller: Address, start_ms: u64, end_ms: u64);
fn change_application_period(env: &Env, round_id: u128, caller: Address, start_ms: u64, end_ms: u64);
fn change_number_of_votes(env: &Env, round_id: u128, caller: Address, num_picks_per_voter: u32);
fn change_expected_amount(env: &Env, round_id: u128, caller: Address, amount: u128);
fn close_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
fn start_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
fn add_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
fn remove_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
fn set_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
fn clear_admins(env: &Env, round_id: u128);
fn transfer_round_ownership(env: &Env, round_id: u128, new_owner: Address);
fn set_round_complete(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
fn change_allow_applications(env: &Env, round_id: u128, caller: Address, allow_applications: bool, start_ms: Option<u64>, end_ms: Option<u64>) -> RoundDetail;
fn update_round(env: &Env, caller: Address, round_id: u128, round_detail: UpdateRoundParams) -> RoundDetail;
fn delete_round(env: &Env, round_id: u128) -> RoundDetail;

// round application and manipulate add/remove projects from round
fn apply_to_round(env: &Env, round_id: u128, caller: Address, applicant: Option<Address>, note: Option<String>, review_note: Option<String>) -> RoundApplication;
fn review_application(env: &Env,round_id: u128, caller: Address, applicant: Address, status: ApplicationStatus, note: Option<String>) -> RoundApplication;
fn unapply_from_round(env: &Env, round_id: u128, caller: Address, applicant: Option<Address>) -> RoundApplication;
fn add_approved_project(env: &Env, round_id: u128, caller: Address, project_ids: Vec<u128>);
fn remove_approved_project(env: &Env, around_id: u128, caller: Address, project_ids: Vec<u128>);
fn update_applicant_note(env: &Env, round_id: u128, caller: Address, note: String) -> RoundApplication;
fn apply_to_round_batch(env: &Env, caller: Address, round_id: u128, review_notes: Vec<Option<String>>, applicants: Vec<Address>) -> Vec<RoundApplication>;

// deposit XLM to round
fn deposit_to_round(env: &Env, round_id: u128, caller: Address, amount: u128, memo: Option<String>, referrer_id: Option<Address>);

// cast vote
fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>);

//blacklist user
fn flag_voter(env: &Env, round_id: u128, caller: Address, voter: Address);
fn unflag_voter(env: &Env, round_id: u128, caller: Address, voter: Address);

// whitelist user
fn add_whitelist(env: &Env, round_id: u128, caller: Address, address: Address);
fn remove_from_whitelist(env: &Env, round_id: u128, caller: Address, address: Address);

// manually add payout and payout challenge
fn set_payouts(env: &Env, round_id: u128, caller: Address, payouts: Vec<PayoutInput>, clear_existing: bool) -> Vec<Payout>;
fn process_payouts(env: &Env, round_id: u128, caller: Address);
fn challenge_payouts(env: &Env, round_id: u128, caller: Address, reason: String) -> PayoutsChallenge;
fn remove_payouts_challenge(env: &Env, round_id: u128, caller: Address);
fn update_payouts_challenge(env: &Env, round_id: u128, caller: Address, challenger_id: Address, notes: Option<String>, resolve_challenge: Option<bool>) -> PayoutsChallenge;
fn remove_resolved_challenges(env: &Env, round_id: u128, caller: Address);

// redistribute remaining vault in round
fn redistribute_vault(env: &Env, round_id: u128, caller: Address, memo: Option<String>);
// READ
fn get_payouts(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<Payout>;
fn get_all_voters(env: &Env, round_id: u128, from_index: Option<u64>, limit: Option<u64>) -> Vec<VotingResult>;
fn can_vote(env: &Env, round_id: u128, voter: Address) -> bool;
fn get_round(env: &Env, round_id: u128) -> RoundDetail;
fn is_voting_live(env: &Env, round_id: u128) -> bool;
fn is_application_live(env: &Env, round_id: u128) -> bool;
fn get_applications_for_round(env: &Env, round_id: u128, from_index: Option<u64>, limit: Option<u64>) -> Vec<RoundApplication>;
fn get_application(env: &Env, round_id: u128, applicant: Address) -> Option<RoundApplication>;
fn is_payout_done(env: &Env, round_id: u128) -> bool;
fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool;
fn total_funding(env: &Env, round_id: u128) -> u128;
fn get_pairs_to_vote(env: &Env, round_id: u128) -> Vec<Pair>;
fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool;
fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool;
fn get_all_pairs_for_round(env: &Env, round_id: u128) -> Vec<Pair>;
fn get_pair_by_index(env: &Env, round_id: u128, index: u32) -> Pair;
fn admins(env: &Env, round_id: u128) -> Vec<Address>;
fn get_payouts_for_round(env: &Env, round_id: u128, from_index: Option<u64>, limit: Option<u64>) -> Vec<Payout>;
fn get_payout(env: &Env, payout_id: u32) -> Payout;
fn get_deposits_for_round(env: &Env, round_id: u128, from_index: Option<u64>, limit: Option<u64>) -> Vec<Deposit>;
fn get_results_for_round(env: &Env, round_id: u128) -> Vec<ProjectVotingResult>;
fn blacklisted_voters(env: &Env, round_id: u128) -> Vec<Address>;
fn whitelisted_voters(env: &Env, round_id: u128) -> Vec<Address>;
```
