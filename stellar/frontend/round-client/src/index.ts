import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAAH3TSAEGM34FRIKT7DBCF26DQ63STVGFUEHLP4CTNDD5XKQGXSLSSO",
  }
} as const

export type ApplicationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void} | {tag: "Blacklisted", values: void};


export interface Config {
  default_page_size: u64;
  kyc_wl_list_id: Option<u128>;
  list_contract: string;
  owner: string;
  pending_owner: Option<string>;
  project_contract: string;
  protocol_fee_basis_points: u32;
  protocol_fee_recipient: string;
  token_contract: string;
}


export interface RoundDetail {
  allow_applications: boolean;
  allow_remaining_dist: Option<boolean>;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  application_wl_list_id: Option<u128>;
  compliance_end_ms: Option<u64>;
  compliance_period_ms: Option<u64>;
  compliance_req_desc: string;
  contacts: Array<Contact>;
  cooldown_end_ms: Option<u64>;
  cooldown_period_ms: Option<u64>;
  current_vault_balance: u128;
  description: string;
  expected_amount: u128;
  id: u128;
  is_video_required: boolean;
  max_participants: u32;
  minimum_deposit: u128;
  name: string;
  num_picks_per_voter: u32;
  owner: string;
  referrer_fee_basis_points: Option<u32>;
  remaining_dist_address: string;
  remaining_dist_at_ms: Option<u64>;
  remaining_dist_by: string;
  remaining_dist_memo: string;
  round_complete_ms: Option<u64>;
  use_vault: Option<boolean>;
  use_whitelist_application: boolean;
  use_whitelist_voting: boolean;
  vault_total_deposits: u128;
  voting_end_ms: u64;
  voting_start_ms: u64;
  voting_wl_list_id: Option<u128>;
}


export interface CreateRoundParams {
  admins: Array<string>;
  allow_applications: boolean;
  allow_remaining_dist: boolean;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  application_wl_list_id: Option<u128>;
  compliance_period_ms: Option<u64>;
  compliance_req_desc: string;
  contacts: Array<Contact>;
  cooldown_period_ms: Option<u64>;
  description: string;
  expected_amount: u128;
  is_video_required: boolean;
  max_participants: Option<u32>;
  minimum_deposit: u128;
  name: string;
  num_picks_per_voter: Option<u32>;
  owner: string;
  referrer_fee_basis_points: Option<u32>;
  remaining_dist_address: string;
  use_vault: Option<boolean>;
  use_whitelist_application: Option<boolean>;
  use_whitelist_voting: Option<boolean>;
  voting_end_ms: u64;
  voting_start_ms: u64;
  voting_wl_list_id: Option<u128>;
}


export interface UpdateRoundParams {
  application_wl_list_id: Option<u128>;
  contacts: Array<Contact>;
  description: string;
  is_video_required: boolean;
  max_participants: Option<u32>;
  name: string;
  num_picks_per_voter: Option<u32>;
  referrer_fee_basis_points: Option<u32>;
  use_vault: Option<boolean>;
  use_whitelist_voting: Option<boolean>;
  voting_wl_list_id: Option<u128>;
}


export interface RoundApplication {
  applicant_id: string;
  applicant_note: string;
  project_id: u128;
  review_note: string;
  status: ApplicationStatus;
  submited_ms: u64;
  updated_ms: Option<u64>;
}


export interface Pair {
  pair_id: u32;
  projects: Array<u128>;
}


export interface PickedPair {
  pair_id: u32;
  voted_project_id: u128;
}


export interface PickResult {
  pair_id: u32;
  project_id: u128;
}


export interface VotingResult {
  picks: Array<PickResult>;
  voted_ms: u64;
  voter: string;
}


export interface ProjectVotingResult {
  is_flagged: boolean;
  project_id: u128;
  voting_count: u128;
}


export interface Contact {
  name: string;
  value: string;
}


export interface Payout {
  amount: i128;
  id: u32;
  memo: string;
  paid_amount: i128;
  paid_at_ms: Option<u64>;
  recipient_id: string;
  round_id: u128;
}


export interface PayoutInput {
  amount: i128;
  memo: string;
  recipient_id: string;
}


export interface PayoutsChallenge {
  admin_notes: string;
  challenger_id: string;
  created_at: u64;
  reason: string;
  resolved: boolean;
  resolved_by: string;
  round_id: u128;
}


export interface Deposit {
  deposit_id: u128;
  deposited_at: u64;
  depositor_id: string;
  memo: string;
  net_amount: i128;
  protocol_fee: i128;
  referrer_fee: i128;
  round_id: u128;
  total_amount: i128;
}


export interface FlagDetail {
  applicant_id: string;
  flagged_by: string;
  flagged_ms: u64;
  project_id: u128;
  reason: string;
}

export const Errors = {
  5: {message:"OwnerOrAdminOnly"},

  26: {message:"ContractNotInitialized"},

  31: {message:"InsufficientBalance"},

  32: {message:"IndexOutOfBound"},

  38: {message:"SameOwner"},

  52: {message:"DataNotFound"},

  57: {message:"AlreadyInitialized"},

  88: {message:"OwnerOnly"},

  89: {message:"NoPendingOwnershipTransfer"},

  65: {message:"ProtocolFeeTooHigh"},

  66: {message:"ReferrerFeeTooHigh"},0: {message:"VotingStartGreaterThanVotingEnd"},

  1: {message:"ApplicationStartGreaterThanApplicationEnd"},

  2: {message:"VotingStartLessThanApplicationEnd"},

  3: {message:"AmountMustBeGreaterThanZero"},

  4: {message:"ContactMustBeLessThanTen"},

  8: {message:"InvalidVaultBalance"},

  19: {message:"UserBlacklisted"},

  20: {message:"UserAlreadyBlacklisted"},

  21: {message:"BlacklistNotFound"},

  22: {message:"UserNotWhitelisted"},

  23: {message:"ReviewNotTooLong"},

  27: {message:"RoundAlreadyCompleted"},

  28: {message:"AdminNotFound"},

  29: {message:"OwnerCannotBeAdmin"},

  34: {message:"AlreadyPaidOut"},

  35: {message:"NoApprovedProjects"},

  36: {message:"UserWhitelisted"},

  37: {message:"VotesAlreadyCast"},

  39: {message:"ApplicationPeriodMustBeSet"},

  40: {message:"ZeroValutBalance"},

  41: {message:"BalanceNotEmpty"},

  44: {message:"InsufficientFunds"},

  45: {message:"ChallengeNotFound"},

  46: {message:"PayoutNotFound"},

  47: {message:"RedistributionNotAllowed"},

  48: {message:"RedistributionAlreadyDone"},

  49: {message:"CompliancePeriodInProcess"},

  50: {message:"CooldownPeriodNotInProcess"},

  51: {message:"NotSolveAllPayoutChallenge"},

  53: {message:"RoundDoesNotUseVault"},

  55: {message:"ApplicationPeriodNotSet"},

  56: {message:"CoolDownPeriodNotComplete"},

  61: {message:"VotingPeriodTooShort"},

  62: {message:"ApplicationPeriodTooShort"},

  63: {message:"ApplicationStartInPast"},

  64: {message:"VotingStartInPast"},

  69: {message:"CannotUpdateVaultAfterDeposits"},

  59: {message:"WhitelistIdNotSet"},

  74: {message:"NotProjectParticipant"},

  75: {message:"NotApprovedParticipant"},

  76: {message:"DepositAmountTooLow"},

  79: {message:"PayoutsAlreadySet"},

  90: {message:"MinimumDepositMustBeLessThanExpectedAmount"},

  6: {message:"VotingPeriodNotStarted"},

  7: {message:"VotingPeriodEnded"},

  9: {message:"VotingPeriodNotEnded"},

  12: {message:"VotingAlreadyStarted"},

  17: {message:"AlreadyVoted"},

  18: {message:"NotVoteAllPairs"},

  24: {message:"EmptyVote"},

  25: {message:"TooManyVotes"},

  33: {message:"ProjectNotInPair"},

  58: {message:"DuplicatePick"},

  60: {message:"TooManyVotesForAvailablePairs"},

  10: {message:"ApplicationPeriodNotStarted"},

  11: {message:"ApplicationPeriodEnded"},

  13: {message:"ProjectNotApproved"},

  14: {message:"ProjectAlreadyApproved"},

  15: {message:"ProjectNotFoundInRegistry"},

  16: {message:"MaxParticipantsReached"},

  30: {message:"ApplicationNotFound"},

  42: {message:"VideoUrlNotValid"},

  43: {message:"ProjectAlreadyApplied"},

  54: {message:"ApplicationNotAllowed"},

  81: {message:"ApplicationStartInPast"},

  82: {message:"ApplicationPeriodTooShort"},

  83: {message:"ApplicationOverlapsVoting"},

  84: {message:"ApplicationPeriodMustBeSet"}
}

export interface RoundPreCheck {
  applicant: string;
  has_video: boolean;
  project_id: u128;
}

export type RegistrationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void} | {tag: "Graylisted", values: void} | {tag: "Blacklisted", values: void};


export interface ListExternal {
  admin_only_registrations: boolean;
  admins: Array<string>;
  cover_img_url: string;
  created_ms: u64;
  default_registration_status: RegistrationStatus;
  description: string;
  id: u128;
  name: string;
  owner: string;
  total_registrations_count: u64;
  total_upvotes_count: u64;
  updated_ms: u64;
}

export type ContractKey = {tag: "Config", values: void} | {tag: "NextRoundId", values: void} | {tag: "NextPayoutId", values: void} | {tag: "NextDepositId", values: void} | {tag: "ProjectPayoutIds", values: readonly [u128]} | {tag: "PayoutInfo", values: readonly [u128]} | {tag: "DepositInfo", values: readonly [u128]} | {tag: "RoundInfo", values: readonly [u128]} | {tag: "BlackList", values: readonly [u128]} | {tag: "ProjectApplicants", values: readonly [u128]} | {tag: "ApprovedProjects", values: readonly [u128]} | {tag: "FlaggedProjects", values: readonly [u128]} | {tag: "Payouts", values: readonly [u128]} | {tag: "PayoutChallenges", values: readonly [u128]} | {tag: "VotingState", values: readonly [u128]} | {tag: "VotedRoundIds", values: readonly [string]} | {tag: "Votes", values: readonly [u128]} | {tag: "ProjectVotingCount", values: readonly [u128]} | {tag: "Admin", values: readonly [u128]} | {tag: "Deposit", values: readonly [u128]};


export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({caller, token_address, registry_address, list_address, kyc_wl_list_id, protocol_fee_basis_points, protocol_fee_recipient, default_page_size}: {caller: string, token_address: string, registry_address: string, list_address: string, kyc_wl_list_id: Option<u128>, protocol_fee_basis_points: Option<u32>, protocol_fee_recipient: Option<string>, default_page_size: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_round: ({caller, round_detail}: {caller: string, round_detail: CreateRoundParams}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a get_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_rounds: ({from_index, limit}: {from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RoundDetail>>>

  /**
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({new_wasm_hash}: {new_wasm_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a transfer_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer_ownership: ({new_owner}: {new_owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a accept_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  accept_ownership: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel_ownership_transfer transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  cancel_ownership_transfer: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_config: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Config>>

  /**
   * Construct and simulate a owner_set_default_page_size transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner_set_default_page_size: ({default_page_size}: {default_page_size: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a owner_set_protocol_fee_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner_set_protocol_fee_config: ({protocol_fee_recipient, protocol_fee_basis_points}: {protocol_fee_recipient: Option<string>, protocol_fee_basis_points: Option<u32>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a change_kyc_wl_list_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_kyc_wl_list_id: ({list_id}: {list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_voting_period: ({round_id, caller, start_ms, end_ms}: {round_id: u128, caller: string, start_ms: u64, end_ms: u64}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_expected_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_expected_amount: ({round_id, caller, amount}: {round_id: u128, caller: string, amount: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_minimum_deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_minimum_deposit: ({round_id, caller, amount}: {round_id: u128, caller: string, amount: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_admins: ({round_id, round_admin}: {round_id: u128, round_admin: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a apply_to_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply_to_round: ({round_id, caller, applicant, note, review_note}: {round_id: u128, caller: string, applicant: Option<string>, note: Option<string>, review_note: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundApplication>>

  /**
   * Construct and simulate a review_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  review_application: ({round_id, caller, applicant, status, note}: {round_id: u128, caller: string, applicant: string, status: ApplicationStatus, note: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundApplication>>

  /**
   * Construct and simulate a deposit_to_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit_to_round: ({round_id, caller, amount, memo, referrer_id}: {round_id: u128, caller: string, amount: u128, memo: Option<string>, referrer_id: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  vote: ({round_id, voter, picks}: {round_id: u128, voter: string, picks: Array<PickedPair>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_pairs_to_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pairs_to_vote: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Pair>>>

  /**
   * Construct and simulate a flag_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  flag_voters: ({round_id, admin, voters}: {round_id: u128, admin: string, voters: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a unflag_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unflag_voters: ({round_id, admin, voters}: {round_id: u128, admin: string, voters: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_voting_results_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_voting_results_for_round: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ProjectVotingResult>>>

  /**
   * Construct and simulate a process_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  process_payouts: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_votes_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_votes_for_round: ({round_id, skip, limit}: {round_id: u128, skip: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<VotingResult>>>

  /**
   * Construct and simulate a can_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  can_vote: ({round_id, voter}: {round_id: u128, voter: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_round: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a is_voting_live transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_voting_live: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_application_live transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_application_live: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_applications_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_applications_for_round: ({round_id, from_index, limit}: {round_id: u128, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RoundApplication>>>

  /**
   * Construct and simulate a get_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_application: ({round_id, applicant}: {round_id: u128, applicant: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundApplication>>

  /**
   * Construct and simulate a is_payout_done transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_payout_done: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a user_has_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  user_has_vote: ({round_id, voter}: {round_id: u128, voter: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a add_approved_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_approved_project: ({round_id, admin, project_ids}: {round_id: u128, admin: string, project_ids: Array<u128>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a remove_approved_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_approved_project: ({round_id, admin, project_ids}: {round_id: u128, admin: string, project_ids: Array<u128>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a whitelist_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  whitelist_status: ({round_id, address}: {round_id: u128, address: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a blacklist_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  blacklist_status: ({round_id, address}: {round_id: u128, address: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_all_pairs_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_all_pairs_for_round: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Pair>>>

  /**
   * Construct and simulate a get_pair_by_index transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pair_by_index: ({round_id, index}: {round_id: u128, index: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Pair>>

  /**
   * Construct and simulate a set_number_of_votes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_number_of_votes: ({round_id, admin, num_picks_per_voter}: {round_id: u128, admin: string, num_picks_per_voter: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a transfer_round_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  transfer_round_ownership: ({round_id, new_owner}: {round_id: u128, new_owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  admins: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a unapply_from_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unapply_from_round: ({round_id, caller, applicant}: {round_id: u128, caller: string, applicant: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundApplication>>

  /**
   * Construct and simulate a update_applicant_note transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_applicant_note: ({round_id, caller, note}: {round_id: u128, caller: string, note: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundApplication>>

  /**
   * Construct and simulate a set_applications_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_applications_config: ({round_id, caller, allow_applications, start_ms, end_ms}: {round_id: u128, caller: string, allow_applications: boolean, start_ms: Option<u64>, end_ms: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a update_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_round: ({caller, round_id, round_detail}: {caller: string, round_id: u128, round_detail: UpdateRoundParams}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a delete_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  delete_round: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a apply_to_round_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply_to_round_batch: ({caller, round_id, review_notes, applicants}: {caller: string, round_id: u128, review_notes: Array<Option<string>>, applicants: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RoundApplication>>>

  /**
   * Construct and simulate a get_payouts_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payouts_for_round: ({round_id, from_index, limit}: {round_id: u128, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Payout>>>

  /**
   * Construct and simulate a set_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_payouts: ({round_id, caller, payouts, clear_existing}: {round_id: u128, caller: string, payouts: Array<PayoutInput>, clear_existing: boolean}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Payout>>>

  /**
   * Construct and simulate a set_round_complete transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_round_complete: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a challenge_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  challenge_payouts: ({round_id, caller, reason}: {round_id: u128, caller: string, reason: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PayoutsChallenge>>

  /**
   * Construct and simulate a remove_payouts_challenge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_payouts_challenge: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a update_payouts_challenge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_payouts_challenge: ({round_id, caller, challenger_id, notes, resolve_challenge}: {round_id: u128, caller: string, challenger_id: string, notes: Option<string>, resolve_challenge: Option<boolean>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<PayoutsChallenge>>

  /**
   * Construct and simulate a remove_resolved_challenges transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_resolved_challenges: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payouts: ({from_index, limit}: {from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Payout>>>

  /**
   * Construct and simulate a get_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_payout: ({payout_id}: {payout_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Payout>>

  /**
   * Construct and simulate a redistribute_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  redistribute_vault: ({round_id, caller, memo}: {round_id: u128, caller: string, memo: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_deposits_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_deposits_for_round: ({round_id, from_index, limit}: {round_id: u128, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<Deposit>>>

  /**
   * Construct and simulate a set_cooldown_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_cooldown_config: ({round_id, caller, cooldown_period_ms}: {round_id: u128, caller: string, cooldown_period_ms: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a set_compliance_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_compliance_config: ({round_id, caller, compliance_req_desc, compliance_period_ms}: {round_id: u128, caller: string, compliance_req_desc: Option<string>, compliance_period_ms: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a blacklisted_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  blacklisted_voters: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a set_redistribution_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_redistribution_config: ({round_id, caller, allow_remaining_dist, remaining_dist_address}: {round_id: u128, caller: string, allow_remaining_dist: boolean, remaining_dist_address: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundDetail>>

  /**
   * Construct and simulate a get_my_vote_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_my_vote_for_round: ({round_id, voter}: {round_id: u128, voter: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<VotingResult>>

  /**
   * Construct and simulate a get_voted_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_voted_rounds: ({voter, from_index, limit}: {voter: string, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RoundDetail>>>

  /**
   * Construct and simulate a get_challenges_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_challenges_payout: ({round_id, from_index, limit}: {round_id: u128, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<PayoutsChallenge>>>

  /**
   * Construct and simulate a flag_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  flag_project: ({round_id, caller, project_id, reason}: {round_id: u128, caller: string, project_id: u128, reason: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<FlagDetail>>

  /**
   * Construct and simulate a unflag_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unflag_project: ({round_id, caller, project_id}: {round_id: u128, caller: string, project_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_approved_projects transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_approved_projects: ({round_id}: {round_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u128>>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAABAAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAAAAAAAAAAAAAhSZWplY3RlZAAAAAAAAAAAAAAAC0JsYWNrbGlzdGVkAA==",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAACQAAAAAAAAARZGVmYXVsdF9wYWdlX3NpemUAAAAAAAAGAAAAAAAAAA5reWNfd2xfbGlzdF9pZAAAAAAD6AAAAAoAAAAAAAAADWxpc3RfY29udHJhY3QAAAAAAAATAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADXBlbmRpbmdfb3duZXIAAAAAAAPoAAAAEwAAAAAAAAAQcHJvamVjdF9jb250cmFjdAAAABMAAAAAAAAAGXByb3RvY29sX2ZlZV9iYXNpc19wb2ludHMAAAAAAAAEAAAAAAAAABZwcm90b2NvbF9mZWVfcmVjaXBpZW50AAAAAAATAAAAAAAAAA50b2tlbl9jb250cmFjdAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAC1JvdW5kRGV0YWlsAAAAACIAAAAAAAAAEmFsbG93X2FwcGxpY2F0aW9ucwAAAAAAAQAAAAAAAAAUYWxsb3dfcmVtYWluaW5nX2Rpc3QAAAPoAAAAAQAAAAAAAAASYXBwbGljYXRpb25fZW5kX21zAAAAAAPoAAAABgAAAAAAAAAUYXBwbGljYXRpb25fc3RhcnRfbXMAAAPoAAAABgAAAAAAAAAWYXBwbGljYXRpb25fd2xfbGlzdF9pZAAAAAAD6AAAAAoAAAAAAAAAEWNvbXBsaWFuY2VfZW5kX21zAAAAAAAD6AAAAAYAAAAAAAAAFGNvbXBsaWFuY2VfcGVyaW9kX21zAAAD6AAAAAYAAAAAAAAAE2NvbXBsaWFuY2VfcmVxX2Rlc2MAAAAAEAAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAAdDb250YWN0AAAAAAAAAAAPY29vbGRvd25fZW5kX21zAAAAA+gAAAAGAAAAAAAAABJjb29sZG93bl9wZXJpb2RfbXMAAAAAA+gAAAAGAAAAAAAAABVjdXJyZW50X3ZhdWx0X2JhbGFuY2UAAAAAAAAKAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAA9leHBlY3RlZF9hbW91bnQAAAAACgAAAAAAAAACaWQAAAAAAAoAAAAAAAAAEWlzX3ZpZGVvX3JlcXVpcmVkAAAAAAAAAQAAAAAAAAAQbWF4X3BhcnRpY2lwYW50cwAAAAQAAAAAAAAAD21pbmltdW1fZGVwb3NpdAAAAAAKAAAAAAAAAARuYW1lAAAAEAAAAAAAAAATbnVtX3BpY2tzX3Blcl92b3RlcgAAAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAGXJlZmVycmVyX2ZlZV9iYXNpc19wb2ludHMAAAAAAAPoAAAABAAAAAAAAAAWcmVtYWluaW5nX2Rpc3RfYWRkcmVzcwAAAAAAEwAAAAAAAAAUcmVtYWluaW5nX2Rpc3RfYXRfbXMAAAPoAAAABgAAAAAAAAARcmVtYWluaW5nX2Rpc3RfYnkAAAAAAAATAAAAAAAAABNyZW1haW5pbmdfZGlzdF9tZW1vAAAAABAAAAAAAAAAEXJvdW5kX2NvbXBsZXRlX21zAAAAAAAD6AAAAAYAAAAAAAAACXVzZV92YXVsdAAAAAAAA+gAAAABAAAAAAAAABl1c2Vfd2hpdGVsaXN0X2FwcGxpY2F0aW9uAAAAAAAAAQAAAAAAAAAUdXNlX3doaXRlbGlzdF92b3RpbmcAAAABAAAAAAAAABR2YXVsdF90b3RhbF9kZXBvc2l0cwAAAAoAAAAAAAAADXZvdGluZ19lbmRfbXMAAAAAAAAGAAAAAAAAAA92b3Rpbmdfc3RhcnRfbXMAAAAABgAAAAAAAAARdm90aW5nX3dsX2xpc3RfaWQAAAAAAAPoAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAGgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAASYWxsb3dfYXBwbGljYXRpb25zAAAAAAABAAAAAAAAABRhbGxvd19yZW1haW5pbmdfZGlzdAAAAAEAAAAAAAAAEmFwcGxpY2F0aW9uX2VuZF9tcwAAAAAD6AAAAAYAAAAAAAAAFGFwcGxpY2F0aW9uX3N0YXJ0X21zAAAD6AAAAAYAAAAAAAAAFmFwcGxpY2F0aW9uX3dsX2xpc3RfaWQAAAAAA+gAAAAKAAAAAAAAABRjb21wbGlhbmNlX3BlcmlvZF9tcwAAA+gAAAAGAAAAAAAAABNjb21wbGlhbmNlX3JlcV9kZXNjAAAAABAAAAAAAAAACGNvbnRhY3RzAAAD6gAAB9AAAAAHQ29udGFjdAAAAAAAAAAAEmNvb2xkb3duX3BlcmlvZF9tcwAAAAAD6AAAAAYAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAD2V4cGVjdGVkX2Ftb3VudAAAAAAKAAAAAAAAABFpc192aWRlb19yZXF1aXJlZAAAAAAAAAEAAAAAAAAAEG1heF9wYXJ0aWNpcGFudHMAAAPoAAAABAAAAAAAAAAPbWluaW11bV9kZXBvc2l0AAAAAAoAAAAAAAAABG5hbWUAAAAQAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAA+gAAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAGXJlZmVycmVyX2ZlZV9iYXNpc19wb2ludHMAAAAAAAPoAAAABAAAAAAAAAAWcmVtYWluaW5nX2Rpc3RfYWRkcmVzcwAAAAAAEwAAAAAAAAAJdXNlX3ZhdWx0AAAAAAAD6AAAAAEAAAAAAAAAGXVzZV93aGl0ZWxpc3RfYXBwbGljYXRpb24AAAAAAAPoAAAAAQAAAAAAAAAUdXNlX3doaXRlbGlzdF92b3RpbmcAAAPoAAAAAQAAAAAAAAANdm90aW5nX2VuZF9tcwAAAAAAAAYAAAAAAAAAD3ZvdGluZ19zdGFydF9tcwAAAAAGAAAAAAAAABF2b3Rpbmdfd2xfbGlzdF9pZAAAAAAAA+gAAAAK",
        "AAAAAQAAAAAAAAAAAAAAEVVwZGF0ZVJvdW5kUGFyYW1zAAAAAAAACwAAAAAAAAAWYXBwbGljYXRpb25fd2xfbGlzdF9pZAAAAAAD6AAAAAoAAAAAAAAACGNvbnRhY3RzAAAD6gAAB9AAAAAHQ29udGFjdAAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAEWlzX3ZpZGVvX3JlcXVpcmVkAAAAAAAAAQAAAAAAAAAQbWF4X3BhcnRpY2lwYW50cwAAA+gAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAATbnVtX3BpY2tzX3Blcl92b3RlcgAAAAPoAAAABAAAAAAAAAAZcmVmZXJyZXJfZmVlX2Jhc2lzX3BvaW50cwAAAAAAA+gAAAAEAAAAAAAAAAl1c2VfdmF1bHQAAAAAAAPoAAAAAQAAAAAAAAAUdXNlX3doaXRlbGlzdF92b3RpbmcAAAPoAAAAAQAAAAAAAAARdm90aW5nX3dsX2xpc3RfaWQAAAAAAAPoAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAEFJvdW5kQXBwbGljYXRpb24AAAAHAAAAAAAAAAxhcHBsaWNhbnRfaWQAAAATAAAAAAAAAA5hcHBsaWNhbnRfbm90ZQAAAAAAEAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAALcmV2aWV3X25vdGUAAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9tcwAAAAAGAAAAAAAAAAp1cGRhdGVkX21zAAAAAAPoAAAABg==",
        "AAAAAQAAAAAAAAAAAAAABFBhaXIAAAACAAAAAAAAAAdwYWlyX2lkAAAAAAQAAAAAAAAACHByb2plY3RzAAAD6gAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tlZFBhaXIAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAQdm90ZWRfcHJvamVjdF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tSZXN1bHQAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAADFZvdGluZ1Jlc3VsdAAAAAMAAAAAAAAABXBpY2tzAAAAAAAD6gAAB9AAAAAKUGlja1Jlc3VsdAAAAAAAAAAAAAh2b3RlZF9tcwAAAAYAAAAAAAAABXZvdGVyAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQAAAAAAwAAAAAAAAAKaXNfZmxhZ2dlZAAAAAAAAQAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAMdm90aW5nX2NvdW50AAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0NvbnRhY3QAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAABlBheW91dAAAAAAABwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAEbWVtbwAAABAAAAAAAAAAC3BhaWRfYW1vdW50AAAAAAsAAAAAAAAACnBhaWRfYXRfbXMAAAAAA+gAAAAGAAAAAAAAAAxyZWNpcGllbnRfaWQAAAATAAAAAAAAAAhyb3VuZF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAC1BheW91dElucHV0AAAAAAMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAEbWVtbwAAABAAAAAAAAAADHJlY2lwaWVudF9pZAAAABM=",
        "AAAAAQAAAAAAAAAAAAAAEFBheW91dHNDaGFsbGVuZ2UAAAAHAAAAAAAAAAthZG1pbl9ub3RlcwAAAAAQAAAAAAAAAA1jaGFsbGVuZ2VyX2lkAAAAAAAAEwAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAGcmVhc29uAAAAAAAQAAAAAAAAAAhyZXNvbHZlZAAAAAEAAAAAAAAAC3Jlc29sdmVkX2J5AAAAABAAAAAAAAAACHJvdW5kX2lkAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0RlcG9zaXQAAAAACQAAAAAAAAAKZGVwb3NpdF9pZAAAAAAACgAAAAAAAAAMZGVwb3NpdGVkX2F0AAAABgAAAAAAAAAMZGVwb3NpdG9yX2lkAAAAEwAAAAAAAAAEbWVtbwAAABAAAAAAAAAACm5ldF9hbW91bnQAAAAAAAsAAAAAAAAADHByb3RvY29sX2ZlZQAAAAsAAAAAAAAADHJlZmVycmVyX2ZlZQAAAAsAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAMdG90YWxfYW1vdW50AAAACw==",
        "AAAAAQAAAAAAAAAAAAAACkZsYWdEZXRhaWwAAAAAAAUAAAAAAAAADGFwcGxpY2FudF9pZAAAABMAAAAAAAAACmZsYWdnZWRfYnkAAAAAABMAAAAAAAAACmZsYWdnZWRfbXMAAAAAAAYAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAABnJlYXNvbgAAAAAAEA==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAAQT3duZXJPckFkbWluT25seQAAAAUAAAAAAAAAFkNvbnRyYWN0Tm90SW5pdGlhbGl6ZWQAAAAAABoAAAAAAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAHwAAAAAAAAAPSW5kZXhPdXRPZkJvdW5kAAAAACAAAAAAAAAACVNhbWVPd25lcgAAAAAAACYAAAAAAAAADERhdGFOb3RGb3VuZAAAADQAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAOQAAAAAAAAAJT3duZXJPbmx5AAAAAAAAWAAAAAAAAAAaTm9QZW5kaW5nT3duZXJzaGlwVHJhbnNmZXIAAAAAAFkAAAAAAAAAElByb3RvY29sRmVlVG9vSGlnaAAAAAAAQQAAAAAAAAASUmVmZXJyZXJGZWVUb29IaWdoAAAAAABC",
        "AAAABAAAAAAAAAAAAAAAClJvdW5kRXJyb3IAAAAAACsAAAAAAAAAH1ZvdGluZ1N0YXJ0R3JlYXRlclRoYW5Wb3RpbmdFbmQAAAAAAAAAAAAAAAApQXBwbGljYXRpb25TdGFydEdyZWF0ZXJUaGFuQXBwbGljYXRpb25FbmQAAAAAAAABAAAAAAAAACFWb3RpbmdTdGFydExlc3NUaGFuQXBwbGljYXRpb25FbmQAAAAAAAACAAAAAAAAABtBbW91bnRNdXN0QmVHcmVhdGVyVGhhblplcm8AAAAAAwAAAAAAAAAYQ29udGFjdE11c3RCZUxlc3NUaGFuVGVuAAAABAAAAAAAAAATSW52YWxpZFZhdWx0QmFsYW5jZQAAAAAIAAAAAAAAAA9Vc2VyQmxhY2tsaXN0ZWQAAAAAEwAAAAAAAAAWVXNlckFscmVhZHlCbGFja2xpc3RlZAAAAAAAFAAAAAAAAAARQmxhY2tsaXN0Tm90Rm91bmQAAAAAAAAVAAAAAAAAABJVc2VyTm90V2hpdGVsaXN0ZWQAAAAAABYAAAAAAAAAEFJldmlld05vdFRvb0xvbmcAAAAXAAAAAAAAABVSb3VuZEFscmVhZHlDb21wbGV0ZWQAAAAAAAAbAAAAAAAAAA1BZG1pbk5vdEZvdW5kAAAAAAAAHAAAAAAAAAAST3duZXJDYW5ub3RCZUFkbWluAAAAAAAdAAAAAAAAAA5BbHJlYWR5UGFpZE91dAAAAAAAIgAAAAAAAAASTm9BcHByb3ZlZFByb2plY3RzAAAAAAAjAAAAAAAAAA9Vc2VyV2hpdGVsaXN0ZWQAAAAAJAAAAAAAAAAQVm90ZXNBbHJlYWR5Q2FzdAAAACUAAAAAAAAAGkFwcGxpY2F0aW9uUGVyaW9kTXVzdEJlU2V0AAAAAAAnAAAAAAAAABBaZXJvVmFsdXRCYWxhbmNlAAAAKAAAAAAAAAAPQmFsYW5jZU5vdEVtcHR5AAAAACkAAAAAAAAAEUluc3VmZmljaWVudEZ1bmRzAAAAAAAALAAAAAAAAAARQ2hhbGxlbmdlTm90Rm91bmQAAAAAAAAtAAAAAAAAAA5QYXlvdXROb3RGb3VuZAAAAAAALgAAAAAAAAAYUmVkaXN0cmlidXRpb25Ob3RBbGxvd2VkAAAALwAAAAAAAAAZUmVkaXN0cmlidXRpb25BbHJlYWR5RG9uZQAAAAAAADAAAAAAAAAAGUNvbXBsaWFuY2VQZXJpb2RJblByb2Nlc3MAAAAAAAAxAAAAAAAAABpDb29sZG93blBlcmlvZE5vdEluUHJvY2VzcwAAAAAAMgAAAAAAAAAaTm90U29sdmVBbGxQYXlvdXRDaGFsbGVuZ2UAAAAAADMAAAAAAAAAFFJvdW5kRG9lc05vdFVzZVZhdWx0AAAANQAAAAAAAAAXQXBwbGljYXRpb25QZXJpb2ROb3RTZXQAAAAANwAAAAAAAAAZQ29vbERvd25QZXJpb2ROb3RDb21wbGV0ZQAAAAAAADgAAAAAAAAAFFZvdGluZ1BlcmlvZFRvb1Nob3J0AAAAPQAAAAAAAAAZQXBwbGljYXRpb25QZXJpb2RUb29TaG9ydAAAAAAAAD4AAAAAAAAAFkFwcGxpY2F0aW9uU3RhcnRJblBhc3QAAAAAAD8AAAAAAAAAEVZvdGluZ1N0YXJ0SW5QYXN0AAAAAAAAQAAAAAAAAAAeQ2Fubm90VXBkYXRlVmF1bHRBZnRlckRlcG9zaXRzAAAAAABFAAAAAAAAABFXaGl0ZWxpc3RJZE5vdFNldAAAAAAAADsAAAAAAAAAFU5vdFByb2plY3RQYXJ0aWNpcGFudAAAAAAAAEoAAAAAAAAAFk5vdEFwcHJvdmVkUGFydGljaXBhbnQAAAAAAEsAAAAAAAAAE0RlcG9zaXRBbW91bnRUb29Mb3cAAAAATAAAAAAAAAARUGF5b3V0c0FscmVhZHlTZXQAAAAAAABPAAAAAAAAACpNaW5pbXVtRGVwb3NpdE11c3RCZUxlc3NUaGFuRXhwZWN0ZWRBbW91bnQAAAAAAFo=",
        "AAAABAAAAAAAAAAAAAAACVZvdGVFcnJvcgAAAAAAAAsAAAAAAAAAFlZvdGluZ1BlcmlvZE5vdFN0YXJ0ZWQAAAAAAAYAAAAAAAAAEVZvdGluZ1BlcmlvZEVuZGVkAAAAAAAABwAAAAAAAAAUVm90aW5nUGVyaW9kTm90RW5kZWQAAAAJAAAAAAAAABRWb3RpbmdBbHJlYWR5U3RhcnRlZAAAAAwAAAAAAAAADEFscmVhZHlWb3RlZAAAABEAAAAAAAAAD05vdFZvdGVBbGxQYWlycwAAAAASAAAAAAAAAAlFbXB0eVZvdGUAAAAAAAAYAAAAAAAAAAxUb29NYW55Vm90ZXMAAAAZAAAAAAAAABBQcm9qZWN0Tm90SW5QYWlyAAAAIQAAAAAAAAANRHVwbGljYXRlUGljawAAAAAAADoAAAAAAAAAHVRvb01hbnlWb3Rlc0ZvckF2YWlsYWJsZVBhaXJzAAAAAAAAPA==",
        "AAAABAAAAAAAAAAAAAAAEEFwcGxpY2F0aW9uRXJyb3IAAAAOAAAAAAAAABtBcHBsaWNhdGlvblBlcmlvZE5vdFN0YXJ0ZWQAAAAACgAAAAAAAAAWQXBwbGljYXRpb25QZXJpb2RFbmRlZAAAAAAACwAAAAAAAAASUHJvamVjdE5vdEFwcHJvdmVkAAAAAAANAAAAAAAAABZQcm9qZWN0QWxyZWFkeUFwcHJvdmVkAAAAAAAOAAAAAAAAABlQcm9qZWN0Tm90Rm91bmRJblJlZ2lzdHJ5AAAAAAAADwAAAAAAAAAWTWF4UGFydGljaXBhbnRzUmVhY2hlZAAAAAAAEAAAAAAAAAATQXBwbGljYXRpb25Ob3RGb3VuZAAAAAAeAAAAAAAAABBWaWRlb1VybE5vdFZhbGlkAAAAKgAAAAAAAAAVUHJvamVjdEFscmVhZHlBcHBsaWVkAAAAAAAAKwAAAAAAAAAVQXBwbGljYXRpb25Ob3RBbGxvd2VkAAAAAAAANgAAAAAAAAAWQXBwbGljYXRpb25TdGFydEluUGFzdAAAAAAAUQAAAAAAAAAZQXBwbGljYXRpb25QZXJpb2RUb29TaG9ydAAAAAAAAFIAAAAAAAAAGUFwcGxpY2F0aW9uT3ZlcmxhcHNWb3RpbmcAAAAAAABTAAAAAAAAABpBcHBsaWNhdGlvblBlcmlvZE11c3RCZVNldAAAAAAAVA==",
        "AAAAAQAAAAAAAAAAAAAADVJvdW5kUHJlQ2hlY2sAAAAAAAADAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAAloYXNfdmlkZW8AAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAK",
        "AAAAAgAAAAAAAAAAAAAAElJlZ2lzdHJhdGlvblN0YXR1cwAAAAAABQAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAAAAAAAAAAAAAhSZWplY3RlZAAAAAAAAAAAAAAACkdyYXlsaXN0ZWQAAAAAAAAAAAAAAAAAC0JsYWNrbGlzdGVkAA==",
        "AAAAAQAAAAAAAAAAAAAADExpc3RFeHRlcm5hbAAAAAwAAAAAAAAAGGFkbWluX29ubHlfcmVnaXN0cmF0aW9ucwAAAAEAAAAAAAAABmFkbWlucwAAAAAD6gAAABMAAAAAAAAADWNvdmVyX2ltZ191cmwAAAAAAAAQAAAAAAAAAApjcmVhdGVkX21zAAAAAAAGAAAAAAAAABtkZWZhdWx0X3JlZ2lzdHJhdGlvbl9zdGF0dXMAAAAH0AAAABJSZWdpc3RyYXRpb25TdGF0dXMAAAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAACaWQAAAAAAAoAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAGXRvdGFsX3JlZ2lzdHJhdGlvbnNfY291bnQAAAAAAAAGAAAAAAAAABN0b3RhbF91cHZvdGVzX2NvdW50AAAAAAYAAAAAAAAACnVwZGF0ZWRfbXMAAAAAAAY=",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAACAAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAAAAAADGxpc3RfYWRkcmVzcwAAABMAAAAAAAAADmt5Y193bF9saXN0X2lkAAAAAAPoAAAACgAAAAAAAAAZcHJvdG9jb2xfZmVlX2Jhc2lzX3BvaW50cwAAAAAAA+gAAAAEAAAAAAAAABZwcm90b2NvbF9mZWVfcmVjaXBpZW50AAAAAAPoAAAAEwAAAAAAAAARZGVmYXVsdF9wYWdlX3NpemUAAAAAAAPoAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3JvdW5kAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAxyb3VuZF9kZXRhaWwAAAfQAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAKZ2V0X3JvdW5kcwAAAAAAAgAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAABAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAQYWNjZXB0X293bmVyc2hpcAAAAAAAAAAA",
        "AAAAAAAAAAAAAAAZY2FuY2VsX293bmVyc2hpcF90cmFuc2ZlcgAAAAAAAAAAAAAA",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAfQAAAABkNvbmZpZwAA",
        "AAAAAAAAAAAAAAAbb3duZXJfc2V0X2RlZmF1bHRfcGFnZV9zaXplAAAAAAEAAAAAAAAAEWRlZmF1bHRfcGFnZV9zaXplAAAAAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAdb3duZXJfc2V0X3Byb3RvY29sX2ZlZV9jb25maWcAAAAAAAACAAAAAAAAABZwcm90b2NvbF9mZWVfcmVjaXBpZW50AAAAAAPoAAAAEwAAAAAAAAAZcHJvdG9jb2xfZmVlX2Jhc2lzX3BvaW50cwAAAAAAA+gAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAAVY2hhbmdlX2t5Y193bF9saXN0X2lkAAAAAAAAAQAAAAAAAAAHbGlzdF9pZAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAARc2V0X3ZvdGluZ19wZXJpb2QAAAAAAAAEAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAIc3RhcnRfbXMAAAAGAAAAAAAAAAZlbmRfbXMAAAAAAAYAAAAA",
        "AAAAAAAAAAAAAAATc2V0X2V4cGVjdGVkX2Ftb3VudAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAATc2V0X21pbmltdW1fZGVwb3NpdAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAKc2V0X2FkbWlucwAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAPqAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAOYXBwbHlfdG9fcm91bmQAAAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAPoAAAAEwAAAAAAAAAEbm90ZQAAA+gAAAAQAAAAAAAAAAtyZXZpZXdfbm90ZQAAAAPoAAAAEAAAAAEAAAfQAAAAEFJvdW5kQXBwbGljYXRpb24=",
        "AAAAAAAAAAAAAAAScmV2aWV3X2FwcGxpY2F0aW9uAAAAAAAFAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAARub3RlAAAD6AAAABAAAAABAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAQZGVwb3NpdF90b19yb3VuZAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAABG1lbW8AAAPoAAAAEAAAAAAAAAALcmVmZXJyZXJfaWQAAAAD6AAAABMAAAAA",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAVwaWNrcwAAAAAAA+oAAAfQAAAAClBpY2tlZFBhaXIAAAAAAAA=",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJzX3RvX3ZvdGUAAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAB9AAAAAEUGFpcg==",
        "AAAAAAAAAAAAAAALZmxhZ192b3RlcnMAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABnZvdGVycwAAAAAD6gAAABMAAAAA",
        "AAAAAAAAAAAAAAANdW5mbGFnX3ZvdGVycwAAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZ2b3RlcnMAAAAAA+oAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAcZ2V0X3ZvdGluZ19yZXN1bHRzX2Zvcl9yb3VuZAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAPqAAAH0AAAABNQcm9qZWN0Vm90aW5nUmVzdWx0AA==",
        "AAAAAAAAAAAAAAAPcHJvY2Vzc19wYXlvdXRzAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAATZ2V0X3ZvdGVzX2Zvcl9yb3VuZAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABHNraXAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAAAxWb3RpbmdSZXN1bHQ=",
        "AAAAAAAAAAAAAAAIY2FuX3ZvdGUAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAJZ2V0X3JvdW5kAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAOaXNfdm90aW5nX2xpdmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAATaXNfYXBwbGljYXRpb25fbGl2ZQAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAaZ2V0X2FwcGxpY2F0aW9uc19mb3Jfcm91bmQAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAAQUm91bmRBcHBsaWNhdGlvbg==",
        "AAAAAAAAAAAAAAAPZ2V0X2FwcGxpY2F0aW9uAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAfQAAAAEFJvdW5kQXBwbGljYXRpb24=",
        "AAAAAAAAAAAAAAAOaXNfcGF5b3V0X2RvbmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAANdXNlcl9oYXNfdm90ZQAAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAUYWRkX2FwcHJvdmVkX3Byb2plY3QAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALcHJvamVjdF9pZHMAAAAD6gAAAAoAAAAA",
        "AAAAAAAAAAAAAAAXcmVtb3ZlX2FwcHJvdmVkX3Byb2plY3QAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3Byb2plY3RfaWRzAAAAA+oAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAQd2hpdGVsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAQYmxhY2tsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAXZ2V0X2FsbF9wYWlyc19mb3Jfcm91bmQAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAA+oAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJfYnlfaW5kZXgAAAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAATc2V0X251bWJlcl9vZl92b3RlcwAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAATbnVtX3BpY2tzX3Blcl92b3RlcgAAAAAEAAAAAA==",
        "AAAAAAAAAAAAAAAYdHJhbnNmZXJfcm91bmRfb3duZXJzaGlwAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAASdW5hcHBseV9mcm9tX3JvdW5kAAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAD6AAAABMAAAABAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAVdXBkYXRlX2FwcGxpY2FudF9ub3RlAAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vdGUAAAAQAAAAAQAAB9AAAAAQUm91bmRBcHBsaWNhdGlvbg==",
        "AAAAAAAAAAAAAAAXc2V0X2FwcGxpY2F0aW9uc19jb25maWcAAAAABQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAEmFsbG93X2FwcGxpY2F0aW9ucwAAAAAAAQAAAAAAAAAIc3RhcnRfbXMAAAPoAAAABgAAAAAAAAAGZW5kX21zAAAAAAPoAAAABgAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAMdXBkYXRlX3JvdW5kAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAADHJvdW5kX2RldGFpbAAAB9AAAAARVXBkYXRlUm91bmRQYXJhbXMAAAAAAAABAAAH0AAAAAtSb3VuZERldGFpbAA=",
        "AAAAAAAAAAAAAAAMZGVsZXRlX3JvdW5kAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAUYXBwbHlfdG9fcm91bmRfYmF0Y2gAAAAEAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAMcmV2aWV3X25vdGVzAAAD6gAAA+gAAAAQAAAAAAAAAAphcHBsaWNhbnRzAAAAAAPqAAAAEwAAAAEAAAPqAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAVZ2V0X3BheW91dHNfZm9yX3JvdW5kAAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAApmcm9tX2luZGV4AAAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAAAZQYXlvdXQAAA==",
        "AAAAAAAAAAAAAAALc2V0X3BheW91dHMAAAAABAAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAB3BheW91dHMAAAAD6gAAB9AAAAALUGF5b3V0SW5wdXQAAAAAAAAAAA5jbGVhcl9leGlzdGluZwAAAAAAAQAAAAEAAAPqAAAH0AAAAAZQYXlvdXQAAA==",
        "AAAAAAAAAAAAAAASc2V0X3JvdW5kX2NvbXBsZXRlAAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAARY2hhbGxlbmdlX3BheW91dHMAAAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAGcmVhc29uAAAAAAAQAAAAAQAAB9AAAAAQUGF5b3V0c0NoYWxsZW5nZQ==",
        "AAAAAAAAAAAAAAAYcmVtb3ZlX3BheW91dHNfY2hhbGxlbmdlAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAYdXBkYXRlX3BheW91dHNfY2hhbGxlbmdlAAAABQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAADWNoYWxsZW5nZXJfaWQAAAAAAAATAAAAAAAAAAVub3RlcwAAAAAAA+gAAAAQAAAAAAAAABFyZXNvbHZlX2NoYWxsZW5nZQAAAAAAA+gAAAABAAAAAQAAB9AAAAAQUGF5b3V0c0NoYWxsZW5nZQ==",
        "AAAAAAAAAAAAAAAacmVtb3ZlX3Jlc29sdmVkX2NoYWxsZW5nZXMAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAALZ2V0X3BheW91dHMAAAAAAgAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAAGUGF5b3V0AAA=",
        "AAAAAAAAAAAAAAAKZ2V0X3BheW91dAAAAAAAAQAAAAAAAAAJcGF5b3V0X2lkAAAAAAAABAAAAAEAAAfQAAAABlBheW91dAAA",
        "AAAAAAAAAAAAAAAScmVkaXN0cmlidXRlX3ZhdWx0AAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAEbWVtbwAAA+gAAAAQAAAAAA==",
        "AAAAAAAAAAAAAAAWZ2V0X2RlcG9zaXRzX2Zvcl9yb3VuZAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAApmcm9tX2luZGV4AAAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAAAdEZXBvc2l0AA==",
        "AAAAAAAAAAAAAAATc2V0X2Nvb2xkb3duX2NvbmZpZwAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAASY29vbGRvd25fcGVyaW9kX21zAAAAAAPoAAAABgAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAVc2V0X2NvbXBsaWFuY2VfY29uZmlnAAAAAAAABAAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAE2NvbXBsaWFuY2VfcmVxX2Rlc2MAAAAD6AAAABAAAAAAAAAAFGNvbXBsaWFuY2VfcGVyaW9kX21zAAAD6AAAAAYAAAABAAAH0AAAAAtSb3VuZERldGFpbAA=",
        "AAAAAAAAAAAAAAASYmxhY2tsaXN0ZWRfdm90ZXJzAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAAZc2V0X3JlZGlzdHJpYnV0aW9uX2NvbmZpZwAAAAAAAAQAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAABRhbGxvd19yZW1haW5pbmdfZGlzdAAAAAEAAAAAAAAAFnJlbWFpbmluZ19kaXN0X2FkZHJlc3MAAAAAA+gAAAATAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAVZ2V0X215X3ZvdGVfZm9yX3JvdW5kAAAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAV2b3RlcgAAAAAAABMAAAABAAAH0AAAAAxWb3RpbmdSZXN1bHQ=",
        "AAAAAAAAAAAAAAAQZ2V0X3ZvdGVkX3JvdW5kcwAAAAMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAVZ2V0X2NoYWxsZW5nZXNfcGF5b3V0AAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAApmcm9tX2luZGV4AAAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAABBQYXlvdXRzQ2hhbGxlbmdl",
        "AAAAAAAAAAAAAAAMZmxhZ19wcm9qZWN0AAAABAAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAABnJlYXNvbgAAAAAAEAAAAAEAAAfQAAAACkZsYWdEZXRhaWwAAA==",
        "AAAAAAAAAAAAAAAOdW5mbGFnX3Byb2plY3QAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAVZ2V0X2FwcHJvdmVkX3Byb2plY3RzAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAA+oAAAAK",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAABQAAAAAAAAAAAAAAAZDb25maWcAAAAAAAAAAAAAAAAAC05leHRSb3VuZElkAAAAAAAAAAAAAAAADE5leHRQYXlvdXRJZAAAAAAAAAAAAAAADU5leHREZXBvc2l0SWQAAAAAAAABAAAAAAAAABBQcm9qZWN0UGF5b3V0SWRzAAAAAQAAAAoAAAABAAAAAAAAAApQYXlvdXRJbmZvAAAAAAABAAAACgAAAAEAAAAAAAAAC0RlcG9zaXRJbmZvAAAAAAEAAAAKAAAAAQAAAAAAAAAJUm91bmRJbmZvAAAAAAAAAQAAAAoAAAABAAAAAAAAAAlCbGFja0xpc3QAAAAAAAABAAAACgAAAAEAAAAAAAAAEVByb2plY3RBcHBsaWNhbnRzAAAAAAAAAQAAAAoAAAABAAAAAAAAABBBcHByb3ZlZFByb2plY3RzAAAAAQAAAAoAAAABAAAAAAAAAA9GbGFnZ2VkUHJvamVjdHMAAAAAAQAAAAoAAAABAAAAAAAAAAdQYXlvdXRzAAAAAAEAAAAKAAAAAQAAAAAAAAAQUGF5b3V0Q2hhbGxlbmdlcwAAAAEAAAAKAAAAAQAAAAAAAAALVm90aW5nU3RhdGUAAAAAAQAAAAoAAAABAAAAAAAAAA1Wb3RlZFJvdW5kSWRzAAAAAAAAAQAAABMAAAABAAAAAAAAAAVWb3RlcwAAAAAAAAEAAAAKAAAAAQAAAAAAAAASUHJvamVjdFZvdGluZ0NvdW50AAAAAAABAAAACgAAAAEAAAAAAAAABUFkbWluAAAAAAAAAQAAAAoAAAABAAAAAAAAAAdEZXBvc2l0AAAAAAEAAAAK" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_round: this.txFromJSON<RoundDetail>,
        get_rounds: this.txFromJSON<Array<RoundDetail>>,
        upgrade: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<null>,
        accept_ownership: this.txFromJSON<null>,
        cancel_ownership_transfer: this.txFromJSON<null>,
        get_config: this.txFromJSON<Config>,
        owner_set_default_page_size: this.txFromJSON<null>,
        owner_set_protocol_fee_config: this.txFromJSON<null>,
        change_kyc_wl_list_id: this.txFromJSON<null>,
        set_voting_period: this.txFromJSON<null>,
        set_expected_amount: this.txFromJSON<null>,
        set_minimum_deposit: this.txFromJSON<null>,
        set_admins: this.txFromJSON<null>,
        apply_to_round: this.txFromJSON<RoundApplication>,
        review_application: this.txFromJSON<RoundApplication>,
        deposit_to_round: this.txFromJSON<null>,
        vote: this.txFromJSON<null>,
        get_pairs_to_vote: this.txFromJSON<Array<Pair>>,
        flag_voters: this.txFromJSON<null>,
        unflag_voters: this.txFromJSON<null>,
        get_voting_results_for_round: this.txFromJSON<Array<ProjectVotingResult>>,
        process_payouts: this.txFromJSON<null>,
        get_votes_for_round: this.txFromJSON<Array<VotingResult>>,
        can_vote: this.txFromJSON<boolean>,
        get_round: this.txFromJSON<RoundDetail>,
        is_voting_live: this.txFromJSON<boolean>,
        is_application_live: this.txFromJSON<boolean>,
        get_applications_for_round: this.txFromJSON<Array<RoundApplication>>,
        get_application: this.txFromJSON<RoundApplication>,
        is_payout_done: this.txFromJSON<boolean>,
        user_has_vote: this.txFromJSON<boolean>,
        add_approved_project: this.txFromJSON<null>,
        remove_approved_project: this.txFromJSON<null>,
        whitelist_status: this.txFromJSON<boolean>,
        blacklist_status: this.txFromJSON<boolean>,
        get_all_pairs_for_round: this.txFromJSON<Array<Pair>>,
        get_pair_by_index: this.txFromJSON<Pair>,
        set_number_of_votes: this.txFromJSON<null>,
        transfer_round_ownership: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>,
        unapply_from_round: this.txFromJSON<RoundApplication>,
        update_applicant_note: this.txFromJSON<RoundApplication>,
        set_applications_config: this.txFromJSON<RoundDetail>,
        update_round: this.txFromJSON<RoundDetail>,
        delete_round: this.txFromJSON<RoundDetail>,
        apply_to_round_batch: this.txFromJSON<Array<RoundApplication>>,
        get_payouts_for_round: this.txFromJSON<Array<Payout>>,
        set_payouts: this.txFromJSON<Array<Payout>>,
        set_round_complete: this.txFromJSON<RoundDetail>,
        challenge_payouts: this.txFromJSON<PayoutsChallenge>,
        remove_payouts_challenge: this.txFromJSON<null>,
        update_payouts_challenge: this.txFromJSON<PayoutsChallenge>,
        remove_resolved_challenges: this.txFromJSON<null>,
        get_payouts: this.txFromJSON<Array<Payout>>,
        get_payout: this.txFromJSON<Payout>,
        redistribute_vault: this.txFromJSON<null>,
        get_deposits_for_round: this.txFromJSON<Array<Deposit>>,
        set_cooldown_config: this.txFromJSON<RoundDetail>,
        set_compliance_config: this.txFromJSON<RoundDetail>,
        blacklisted_voters: this.txFromJSON<Array<string>>,
        set_redistribution_config: this.txFromJSON<RoundDetail>,
        get_my_vote_for_round: this.txFromJSON<VotingResult>,
        get_voted_rounds: this.txFromJSON<Array<RoundDetail>>,
        get_challenges_payout: this.txFromJSON<Array<PayoutsChallenge>>,
        flag_project: this.txFromJSON<FlagDetail>,
        unflag_project: this.txFromJSON<null>,
        get_approved_projects: this.txFromJSON<Array<u128>>
  }
}