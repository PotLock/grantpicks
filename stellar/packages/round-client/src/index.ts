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
    contractId: "CDSKTD7GO6KMPVM6RGOPDAN3DAEGBBJT2IDKHFKWENPWB5GAIRSB2STC",
  }
} as const

export type ApplicationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void};


export interface Config {
  default_page_size: u64;
  owner: string;
  protocol_fee_basis_points: u32;
  protocol_fee_recipient: string;
}


export interface RoundDetail {
  allow_applications: boolean;
  allow_remaining_dist: Option<boolean>;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
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
  name: string;
  num_picks_per_voter: u32;
  owner: string;
  referrer_fee_basis_points: Option<u32>;
  remaining_dist_address: string;
  remaining_dist_at_ms: Option<u64>;
  remaining_dist_by: string;
  remaining_dist_memo: string;
  round_complete_ms: Option<u64>;
  use_whitelist: boolean;
  vault_total_deposits: u128;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface CreateRoundParams {
  admins: Array<string>;
  allow_applications: boolean;
  allow_remaining_dist: boolean;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  compliance_end_ms: Option<u64>;
  compliance_period_ms: Option<u64>;
  compliance_req_desc: string;
  contacts: Array<Contact>;
  cooldown_end_ms: Option<u64>;
  cooldown_period_ms: Option<u64>;
  description: string;
  expected_amount: u128;
  is_video_required: boolean;
  max_participants: Option<u32>;
  name: string;
  num_picks_per_voter: Option<u32>;
  owner: string;
  referrer_fee_basis_points: Option<u32>;
  remaining_dist_address: string;
  use_whitelist: Option<boolean>;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface UpdateRoundParams {
  allow_applications: boolean;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  contacts: Array<Contact>;
  description: string;
  expected_amount: u128;
  is_video_required: boolean;
  max_participants: Option<u32>;
  name: string;
  num_picks_per_voter: Option<u32>;
  use_whitelist: Option<boolean>;
  voting_end_ms: u64;
  voting_start_ms: u64;
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
  allocation: u128;
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

export type ProjectStatus = {tag: "New", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void} | {tag: "Completed", values: void};


export interface Project {
  admins: Array<string>;
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  id: u128;
  image_url: string;
  name: string;
  overview: string;
  owner: string;
  payout_address: string;
  repositories: Array<ProjectRepository>;
  status: ProjectStatus;
  submited_ms: u64;
  team_members: Array<ProjectTeamMember>;
  updated_ms: Option<u64>;
  video_url: string;
}


export interface ProjectContact {
  name: string;
  value: string;
}


export interface ProjectContract {
  contract_address: string;
  name: string;
}


export interface ProjectTeamMember {
  name: string;
  value: string;
}


export interface ProjectRepository {
  label: string;
  url: string;
}


export interface ProjectFundingHistory {
  amount: u128;
  denomiation: string;
  description: string;
  funded_ms: u64;
  source: string;
}

export type ContractKey = {tag: "ProtocolFeeRecepient", values: void} | {tag: "ProtocolFee", values: void} | {tag: "FactoryOwner", values: void} | {tag: "NextRoundId", values: void} | {tag: "NextPayoutId", values: void} | {tag: "NextDepositId", values: void} | {tag: "ProjectPayoutIds", values: void} | {tag: "TokenContract", values: void} | {tag: "ProjectContract", values: void} | {tag: "RoundInfo", values: readonly [u128]} | {tag: "PayoutInfo", values: void} | {tag: "DepositInfo", values: void} | {tag: "WhitelistAndBlacklist", values: readonly [u128]} | {tag: "ProjectApplicants", values: readonly [u128]} | {tag: "ApprovedProjects", values: readonly [u128]} | {tag: "Payouts", values: readonly [u128]} | {tag: "PayoutChallenges", values: readonly [u128]} | {tag: "VotingState", values: readonly [u128]} | {tag: "Votes", values: readonly [u128]} | {tag: "ProjectVotingCount", values: readonly [u128]} | {tag: "Admin", values: readonly [u128]} | {tag: "Deposit", values: readonly [u128]};

export const Errors = {

}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({caller, token_address, registry_address, fee_basis_points, fee_address}: {caller: string, token_address: string, registry_address: string, fee_basis_points: Option<u32>, fee_address: Option<string>}, options?: {
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
  get_rounds: ({skip, limit}: {skip: Option<u64>, limit: Option<u64>}, options?: {
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
   * Construct and simulate a change_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_voting_period: ({round_id, caller, round_start_ms, round_end_ms}: {round_id: u128, caller: string, round_start_ms: u64, round_end_ms: u64}, options?: {
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
   * Construct and simulate a change_application_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_application_period: ({round_id, caller, round_application_start_ms, round_application_end_ms}: {round_id: u128, caller: string, round_application_start_ms: u64, round_application_end_ms: u64}, options?: {
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
   * Construct and simulate a change_expected_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_expected_amount: ({round_id, caller, amount}: {round_id: u128, caller: string, amount: u128}, options?: {
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
   * Construct and simulate a close_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  close_voting_period: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
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
   * Construct and simulate a start_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  start_voting_period: ({round_id, caller}: {round_id: u128, caller: string}, options?: {
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
   * Construct and simulate a add_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_admins: ({round_id, round_admin}: {round_id: u128, round_admin: Array<string>}, options?: {
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
   * Construct and simulate a remove_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_admins: ({round_id, round_admin}: {round_id: u128, round_admin: Array<string>}, options?: {
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
   * Construct and simulate a clear_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  clear_admins: ({round_id}: {round_id: u128}, options?: {
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
   * Construct and simulate a flag_voter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  flag_voter: ({round_id, admin, voter}: {round_id: u128, admin: string, voter: string}, options?: {
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
   * Construct and simulate a unflag_voter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unflag_voter: ({round_id, admin, voter}: {round_id: u128, admin: string, voter: string}, options?: {
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
   * Construct and simulate a get_results_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_results_for_round: ({round_id}: {round_id: u128}, options?: {
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
   * Construct and simulate a get_all_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_all_voters: ({round_id, skip, limit}: {round_id: u128, skip: Option<u64>, limit: Option<u64>}, options?: {
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
  get_applications_for_round: ({round_id, skip, limit}: {round_id: u128, skip: Option<u64>, limit: Option<u64>}, options?: {
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
  }) => Promise<AssembledTransaction<Option<RoundApplication>>>

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
   * Construct and simulate a total_funding transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  total_funding: ({round_id}: {round_id: u128}, options?: {
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
  }) => Promise<AssembledTransaction<u128>>

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
   * Construct and simulate a add_white_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_white_list: ({round_id, admin, address}: {round_id: u128, admin: string, address: string}, options?: {
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
   * Construct and simulate a remove_from_white_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_from_white_list: ({round_id, admin, address}: {round_id: u128, admin: string, address: string}, options?: {
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
   * Construct and simulate a change_number_of_votes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_number_of_votes: ({round_id, admin, num_picks_per_voter}: {round_id: u128, admin: string, num_picks_per_voter: u32}, options?: {
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
   * Construct and simulate a change_allow_applications transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_allow_applications: ({round_id, caller, allow_applications, start_ms, end_ms}: {round_id: u128, caller: string, allow_applications: boolean, start_ms: Option<u64>, end_ms: Option<u64>}, options?: {
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

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAwAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAAAAAAAAAAAAAhSZWplY3RlZA==",
        "AAAAAQAAAAAAAAAAAAAABkNvbmZpZwAAAAAABAAAAAAAAAARZGVmYXVsdF9wYWdlX3NpemUAAAAAAAAGAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAGXByb3RvY29sX2ZlZV9iYXNpc19wb2ludHMAAAAAAAAEAAAAAAAAABZwcm90b2NvbF9mZWVfcmVjaXBpZW50AAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAAC1JvdW5kRGV0YWlsAAAAAB0AAAAAAAAAEmFsbG93X2FwcGxpY2F0aW9ucwAAAAAAAQAAAAAAAAAUYWxsb3dfcmVtYWluaW5nX2Rpc3QAAAPoAAAAAQAAAAAAAAASYXBwbGljYXRpb25fZW5kX21zAAAAAAPoAAAABgAAAAAAAAAUYXBwbGljYXRpb25fc3RhcnRfbXMAAAPoAAAABgAAAAAAAAARY29tcGxpYW5jZV9lbmRfbXMAAAAAAAPoAAAABgAAAAAAAAAUY29tcGxpYW5jZV9wZXJpb2RfbXMAAAPoAAAABgAAAAAAAAATY29tcGxpYW5jZV9yZXFfZGVzYwAAAAAQAAAAAAAAAAhjb250YWN0cwAAA+oAAAfQAAAAB0NvbnRhY3QAAAAAAAAAAA9jb29sZG93bl9lbmRfbXMAAAAD6AAAAAYAAAAAAAAAEmNvb2xkb3duX3BlcmlvZF9tcwAAAAAD6AAAAAYAAAAAAAAAFWN1cnJlbnRfdmF1bHRfYmFsYW5jZQAAAAAAAAoAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAD2V4cGVjdGVkX2Ftb3VudAAAAAAKAAAAAAAAAAJpZAAAAAAACgAAAAAAAAARaXNfdmlkZW9fcmVxdWlyZWQAAAAAAAABAAAAAAAAABBtYXhfcGFydGljaXBhbnRzAAAABAAAAAAAAAAEbmFtZQAAABAAAAAAAAAAE251bV9waWNrc19wZXJfdm90ZXIAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAABlyZWZlcnJlcl9mZWVfYmFzaXNfcG9pbnRzAAAAAAAD6AAAAAQAAAAAAAAAFnJlbWFpbmluZ19kaXN0X2FkZHJlc3MAAAAAABMAAAAAAAAAFHJlbWFpbmluZ19kaXN0X2F0X21zAAAD6AAAAAYAAAAAAAAAEXJlbWFpbmluZ19kaXN0X2J5AAAAAAAAEwAAAAAAAAATcmVtYWluaW5nX2Rpc3RfbWVtbwAAAAAQAAAAAAAAABFyb3VuZF9jb21wbGV0ZV9tcwAAAAAAA+gAAAAGAAAAAAAAAA11c2Vfd2hpdGVsaXN0AAAAAAAAAQAAAAAAAAAUdmF1bHRfdG90YWxfZGVwb3NpdHMAAAAKAAAAAAAAAA12b3RpbmdfZW5kX21zAAAAAAAABgAAAAAAAAAPdm90aW5nX3N0YXJ0X21zAAAAAAY=",
        "AAAAAQAAAAAAAAAAAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAFwAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAASYWxsb3dfYXBwbGljYXRpb25zAAAAAAABAAAAAAAAABRhbGxvd19yZW1haW5pbmdfZGlzdAAAAAEAAAAAAAAAEmFwcGxpY2F0aW9uX2VuZF9tcwAAAAAD6AAAAAYAAAAAAAAAFGFwcGxpY2F0aW9uX3N0YXJ0X21zAAAD6AAAAAYAAAAAAAAAEWNvbXBsaWFuY2VfZW5kX21zAAAAAAAD6AAAAAYAAAAAAAAAFGNvbXBsaWFuY2VfcGVyaW9kX21zAAAD6AAAAAYAAAAAAAAAE2NvbXBsaWFuY2VfcmVxX2Rlc2MAAAAAEAAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAAdDb250YWN0AAAAAAAAAAAPY29vbGRvd25fZW5kX21zAAAAA+gAAAAGAAAAAAAAABJjb29sZG93bl9wZXJpb2RfbXMAAAAAA+gAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAA9leHBlY3RlZF9hbW91bnQAAAAACgAAAAAAAAARaXNfdmlkZW9fcmVxdWlyZWQAAAAAAAABAAAAAAAAABBtYXhfcGFydGljaXBhbnRzAAAD6AAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAA+gAAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAGXJlZmVycmVyX2ZlZV9iYXNpc19wb2ludHMAAAAAAAPoAAAABAAAAAAAAAAWcmVtYWluaW5nX2Rpc3RfYWRkcmVzcwAAAAAAEwAAAAAAAAANdXNlX3doaXRlbGlzdAAAAAAAA+gAAAABAAAAAAAAAA12b3RpbmdfZW5kX21zAAAAAAAABgAAAAAAAAAPdm90aW5nX3N0YXJ0X21zAAAAAAY=",
        "AAAAAQAAAAAAAAAAAAAAEVVwZGF0ZVJvdW5kUGFyYW1zAAAAAAAADQAAAAAAAAASYWxsb3dfYXBwbGljYXRpb25zAAAAAAABAAAAAAAAABJhcHBsaWNhdGlvbl9lbmRfbXMAAAAAA+gAAAAGAAAAAAAAABRhcHBsaWNhdGlvbl9zdGFydF9tcwAAA+gAAAAGAAAAAAAAAAhjb250YWN0cwAAA+oAAAfQAAAAB0NvbnRhY3QAAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAA9leHBlY3RlZF9hbW91bnQAAAAACgAAAAAAAAARaXNfdmlkZW9fcmVxdWlyZWQAAAAAAAABAAAAAAAAABBtYXhfcGFydGljaXBhbnRzAAAD6AAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAA+gAAAAEAAAAAAAAAA11c2Vfd2hpdGVsaXN0AAAAAAAD6AAAAAEAAAAAAAAADXZvdGluZ19lbmRfbXMAAAAAAAAGAAAAAAAAAA92b3Rpbmdfc3RhcnRfbXMAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAEFJvdW5kQXBwbGljYXRpb24AAAAHAAAAAAAAAAxhcHBsaWNhbnRfaWQAAAATAAAAAAAAAA5hcHBsaWNhbnRfbm90ZQAAAAAAEAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAALcmV2aWV3X25vdGUAAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9tcwAAAAAGAAAAAAAAAAp1cGRhdGVkX21zAAAAAAPoAAAABg==",
        "AAAAAQAAAAAAAAAAAAAABFBhaXIAAAACAAAAAAAAAAdwYWlyX2lkAAAAAAQAAAAAAAAACHByb2plY3RzAAAD6gAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tlZFBhaXIAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAQdm90ZWRfcHJvamVjdF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tSZXN1bHQAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAADFZvdGluZ1Jlc3VsdAAAAAMAAAAAAAAABXBpY2tzAAAAAAAD6gAAB9AAAAAKUGlja1Jlc3VsdAAAAAAAAAAAAAh2b3RlZF9tcwAAAAYAAAAAAAAABXZvdGVyAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQAAAAAAwAAAAAAAAAKYWxsb2NhdGlvbgAAAAAACgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAMdm90aW5nX2NvdW50AAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0NvbnRhY3QAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAABlBheW91dAAAAAAABgAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAEbWVtbwAAABAAAAAAAAAACnBhaWRfYXRfbXMAAAAAA+gAAAAGAAAAAAAAAAxyZWNpcGllbnRfaWQAAAATAAAAAAAAAAhyb3VuZF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAC1BheW91dElucHV0AAAAAAMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAEbWVtbwAAABAAAAAAAAAADHJlY2lwaWVudF9pZAAAABM=",
        "AAAAAQAAAAAAAAAAAAAAEFBheW91dHNDaGFsbGVuZ2UAAAAGAAAAAAAAAAthZG1pbl9ub3RlcwAAAAAQAAAAAAAAAA1jaGFsbGVuZ2VyX2lkAAAAAAAAEwAAAAAAAAAKY3JlYXRlZF9hdAAAAAAABgAAAAAAAAAGcmVhc29uAAAAAAAQAAAAAAAAAAhyZXNvbHZlZAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0RlcG9zaXQAAAAACQAAAAAAAAAKZGVwb3NpdF9pZAAAAAAACgAAAAAAAAAMZGVwb3NpdGVkX2F0AAAABgAAAAAAAAAMZGVwb3NpdG9yX2lkAAAAEwAAAAAAAAAEbWVtbwAAABAAAAAAAAAACm5ldF9hbW91bnQAAAAAAAsAAAAAAAAADHByb3RvY29sX2ZlZQAAAAsAAAAAAAAADHJlZmVycmVyX2ZlZQAAAAsAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAMdG90YWxfYW1vdW50AAAACw==",
        "AAAAAgAAAAAAAAAAAAAADVByb2plY3RTdGF0dXMAAAAAAAAEAAAAAAAAAAAAAAADTmV3AAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIUmVqZWN0ZWQAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAA=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAADwAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAJpZAAAAAAACgAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1Qcm9qZWN0U3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9tcwAAAAAGAAAAAAAAAAx0ZWFtX21lbWJlcnMAAAPqAAAH0AAAABFQcm9qZWN0VGVhbU1lbWJlcgAAAAAAAAAAAAAKdXBkYXRlZF9tcwAAAAAD6AAAAAYAAAAAAAAACXZpZGVvX3VybAAAAAAAABA=",
        "AAAAAQAAAAAAAAAAAAAADlByb2plY3RDb250YWN0AAAAAAACAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFdmFsdWUAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAACAAAAAAAAABBjb250cmFjdF9hZGRyZXNzAAAAEAAAAAAAAAAEbmFtZQAAABA=",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAgAAAAAAAAAFbGFiZWwAAAAAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAALZGVub21pYXRpb24AAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJZnVuZGVkX21zAAAAAAAABgAAAAAAAAAGc291cmNlAAAAAAAQ",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAAAAAAEGZlZV9iYXNpc19wb2ludHMAAAPoAAAABAAAAAAAAAALZmVlX2FkZHJlc3MAAAAD6AAAABMAAAAA",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3JvdW5kAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAxyb3VuZF9kZXRhaWwAAAfQAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAKZ2V0X3JvdW5kcwAAAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAABAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAKZ2V0X2NvbmZpZwAAAAAAAAAAAAEAAAfQAAAABkNvbmZpZwAA",
        "AAAAAAAAAAAAAAAUY2hhbmdlX3ZvdGluZ19wZXJpb2QAAAAEAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAOcm91bmRfc3RhcnRfbXMAAAAAAAYAAAAAAAAADHJvdW5kX2VuZF9tcwAAAAYAAAAA",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FwcGxpY2F0aW9uX3BlcmlvZAAAAAAAAAQAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAABpyb3VuZF9hcHBsaWNhdGlvbl9zdGFydF9tcwAAAAAABgAAAAAAAAAYcm91bmRfYXBwbGljYXRpb25fZW5kX21zAAAABgAAAAA=",
        "AAAAAAAAAAAAAAAWY2hhbmdlX2V4cGVjdGVkX2Ftb3VudAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAA=",
        "AAAAAAAAAAAAAAATY2xvc2Vfdm90aW5nX3BlcmlvZAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAATc3RhcnRfdm90aW5nX3BlcmlvZAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAKYWRkX2FkbWlucwAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAPqAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAANcmVtb3ZlX2FkbWlucwAAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAALcm91bmRfYWRtaW4AAAAD6gAAABMAAAAA",
        "AAAAAAAAAAAAAAAKc2V0X2FkbWlucwAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAPqAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAMY2xlYXJfYWRtaW5zAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAOYXBwbHlfdG9fcm91bmQAAAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAPoAAAAEwAAAAAAAAAEbm90ZQAAA+gAAAAQAAAAAAAAAAtyZXZpZXdfbm90ZQAAAAPoAAAAEAAAAAEAAAfQAAAAEFJvdW5kQXBwbGljYXRpb24=",
        "AAAAAAAAAAAAAAAScmV2aWV3X2FwcGxpY2F0aW9uAAAAAAAFAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAARub3RlAAAD6AAAABAAAAABAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAQZGVwb3NpdF90b19yb3VuZAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAAAAAABG1lbW8AAAPoAAAAEAAAAAAAAAALcmVmZXJyZXJfaWQAAAAD6AAAABMAAAAA",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAVwaWNrcwAAAAAAA+oAAAfQAAAAClBpY2tlZFBhaXIAAAAAAAA=",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJzX3RvX3ZvdGUAAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAB9AAAAAEUGFpcg==",
        "AAAAAAAAAAAAAAAKZmxhZ192b3RlcgAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAMdW5mbGFnX3ZvdGVyAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAVZ2V0X3Jlc3VsdHNfZm9yX3JvdW5kAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAA+oAAAfQAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQA",
        "AAAAAAAAAAAAAAAPcHJvY2Vzc19wYXlvdXRzAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAOZ2V0X2FsbF92b3RlcnMAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAADFZvdGluZ1Jlc3VsdA==",
        "AAAAAAAAAAAAAAAIY2FuX3ZvdGUAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAJZ2V0X3JvdW5kAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAOaXNfdm90aW5nX2xpdmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAATaXNfYXBwbGljYXRpb25fbGl2ZQAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAaZ2V0X2FwcGxpY2F0aW9uc19mb3Jfcm91bmQAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAEFJvdW5kQXBwbGljYXRpb24=",
        "AAAAAAAAAAAAAAAPZ2V0X2FwcGxpY2F0aW9uAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAPoAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAOaXNfcGF5b3V0X2RvbmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAANdXNlcl9oYXNfdm90ZQAAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAANdG90YWxfZnVuZGluZwAAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAK",
        "AAAAAAAAAAAAAAAUYWRkX2FwcHJvdmVkX3Byb2plY3QAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALcHJvamVjdF9pZHMAAAAD6gAAAAoAAAAA",
        "AAAAAAAAAAAAAAAXcmVtb3ZlX2FwcHJvdmVkX3Byb2plY3QAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3Byb2plY3RfaWRzAAAAA+oAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAOYWRkX3doaXRlX2xpc3QAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAdhZGRyZXNzAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAWcmVtb3ZlX2Zyb21fd2hpdGVfbGlzdAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAQd2hpdGVsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAQYmxhY2tsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAXZ2V0X2FsbF9wYWlyc19mb3Jfcm91bmQAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAA+oAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJfYnlfaW5kZXgAAAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAAWY2hhbmdlX251bWJlcl9vZl92b3RlcwAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAE251bV9waWNrc19wZXJfdm90ZXIAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAYdHJhbnNmZXJfcm91bmRfb3duZXJzaGlwAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAASdW5hcHBseV9mcm9tX3JvdW5kAAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAD6AAAABMAAAABAAAH0AAAABBSb3VuZEFwcGxpY2F0aW9u",
        "AAAAAAAAAAAAAAAVdXBkYXRlX2FwcGxpY2FudF9ub3RlAAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vdGUAAAAQAAAAAQAAB9AAAAAQUm91bmRBcHBsaWNhdGlvbg==",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FsbG93X2FwcGxpY2F0aW9ucwAAAAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAABJhbGxvd19hcHBsaWNhdGlvbnMAAAAAAAEAAAAAAAAACHN0YXJ0X21zAAAD6AAAAAYAAAAAAAAABmVuZF9tcwAAAAAD6AAAAAYAAAABAAAH0AAAAAtSb3VuZERldGFpbAA=",
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
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAABYAAAAAAAAAAAAAABRQcm90b2NvbEZlZVJlY2VwaWVudAAAAAAAAAAAAAAAC1Byb3RvY29sRmVlAAAAAAAAAAAAAAAADEZhY3RvcnlPd25lcgAAAAAAAAAAAAAAC05leHRSb3VuZElkAAAAAAAAAAAAAAAADE5leHRQYXlvdXRJZAAAAAAAAAAAAAAADU5leHREZXBvc2l0SWQAAAAAAAAAAAAAAAAAABBQcm9qZWN0UGF5b3V0SWRzAAAAAAAAAAAAAAANVG9rZW5Db250cmFjdAAAAAAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAABAAAAAAAAAAlSb3VuZEluZm8AAAAAAAABAAAACgAAAAAAAAAAAAAAClBheW91dEluZm8AAAAAAAAAAAAAAAAAC0RlcG9zaXRJbmZvAAAAAAEAAAAAAAAAFVdoaXRlbGlzdEFuZEJsYWNrbGlzdAAAAAAAAAEAAAAKAAAAAQAAAAAAAAARUHJvamVjdEFwcGxpY2FudHMAAAAAAAABAAAACgAAAAEAAAAAAAAAEEFwcHJvdmVkUHJvamVjdHMAAAABAAAACgAAAAEAAAAAAAAAB1BheW91dHMAAAAAAQAAAAoAAAABAAAAAAAAABBQYXlvdXRDaGFsbGVuZ2VzAAAAAQAAAAoAAAABAAAAAAAAAAtWb3RpbmdTdGF0ZQAAAAABAAAACgAAAAEAAAAAAAAABVZvdGVzAAAAAAAAAQAAAAoAAAABAAAAAAAAABJQcm9qZWN0Vm90aW5nQ291bnQAAAAAAAEAAAAKAAAAAQAAAAAAAAAFQWRtaW4AAAAAAAABAAAACgAAAAEAAAAAAAAAB0RlcG9zaXQAAAAAAQAAAAo=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_round: this.txFromJSON<RoundDetail>,
        get_rounds: this.txFromJSON<Array<RoundDetail>>,
        upgrade: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<null>,
        get_config: this.txFromJSON<Config>,
        change_voting_period: this.txFromJSON<null>,
        change_application_period: this.txFromJSON<null>,
        change_expected_amount: this.txFromJSON<null>,
        close_voting_period: this.txFromJSON<RoundDetail>,
        start_voting_period: this.txFromJSON<RoundDetail>,
        add_admins: this.txFromJSON<null>,
        remove_admins: this.txFromJSON<null>,
        set_admins: this.txFromJSON<null>,
        clear_admins: this.txFromJSON<null>,
        apply_to_round: this.txFromJSON<RoundApplication>,
        review_application: this.txFromJSON<RoundApplication>,
        deposit_to_round: this.txFromJSON<null>,
        vote: this.txFromJSON<null>,
        get_pairs_to_vote: this.txFromJSON<Array<Pair>>,
        flag_voter: this.txFromJSON<null>,
        unflag_voter: this.txFromJSON<null>,
        get_results_for_round: this.txFromJSON<Array<ProjectVotingResult>>,
        process_payouts: this.txFromJSON<null>,
        get_all_voters: this.txFromJSON<Array<VotingResult>>,
        can_vote: this.txFromJSON<boolean>,
        get_round: this.txFromJSON<RoundDetail>,
        is_voting_live: this.txFromJSON<boolean>,
        is_application_live: this.txFromJSON<boolean>,
        get_applications_for_round: this.txFromJSON<Array<RoundApplication>>,
        get_application: this.txFromJSON<Option<RoundApplication>>,
        is_payout_done: this.txFromJSON<boolean>,
        user_has_vote: this.txFromJSON<boolean>,
        total_funding: this.txFromJSON<u128>,
        add_approved_project: this.txFromJSON<null>,
        remove_approved_project: this.txFromJSON<null>,
        add_white_list: this.txFromJSON<null>,
        remove_from_white_list: this.txFromJSON<null>,
        whitelist_status: this.txFromJSON<boolean>,
        blacklist_status: this.txFromJSON<boolean>,
        get_all_pairs_for_round: this.txFromJSON<Array<Pair>>,
        get_pair_by_index: this.txFromJSON<Pair>,
        change_number_of_votes: this.txFromJSON<null>,
        transfer_round_ownership: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>,
        unapply_from_round: this.txFromJSON<RoundApplication>,
        update_applicant_note: this.txFromJSON<RoundApplication>,
        change_allow_applications: this.txFromJSON<RoundDetail>,
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
        set_compliance_config: this.txFromJSON<RoundDetail>
  }
}