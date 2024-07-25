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
    contractId: "CCTAQ33VD7HBEFE7G6LCA3D4VDWFH2HIQ2XWJFP7G65JT3POF76U7RXF",
  }
} as const

export type ApplicationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void};


export interface RoundDetailInternal {
  allow_applications: boolean;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  contacts: Array<Contact>;
  description: string;
  expected_amount: u128;
  id: u128;
  is_video_required: boolean;
  max_participants: u32;
  name: string;
  num_picks_per_voter: u32;
  owner: string;
  use_whitelist: boolean;
  vault_balance: u128;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface RoundDetailExternal {
  allow_applications: boolean;
  application_end_ms: Option<u64>;
  application_start_ms: Option<u64>;
  contacts: Array<Contact>;
  description: string;
  expected_amount: u128;
  id: u128;
  is_video_required: boolean;
  max_participants: u32;
  name: string;
  num_picks_per_voter: u32;
  owner: string;
  use_whitelist: boolean;
  vault_balance: u128;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface CreateRoundParams {
  admins: Array<string>;
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
  owner: string;
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


export interface RoundApplicationInternal {
  applicant_id: string;
  applicant_note: string;
  project_id: u128;
  review_note: string;
  status: ApplicationStatus;
  submited_ms: u64;
  updated_ms: Option<u64>;
}


export interface RoundApplicationExternal {
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
  address: string;
  amount: i128;
  paid_at_ms: u64;
  project_id: u128;
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

export type ContractKey = {tag: "FactoryOwner", values: void} | {tag: "RoundNumber", values: void} | {tag: "TokenContract", values: void} | {tag: "ProjectContract", values: void} | {tag: "RoundInfo", values: readonly [u128]} | {tag: "WhitelistAndBlacklist", values: readonly [u128]} | {tag: "ProjectApplicants", values: readonly [u128]} | {tag: "ApprovedProjects", values: readonly [u128]} | {tag: "Payouts", values: readonly [u128]} | {tag: "VotingState", values: readonly [u128]} | {tag: "Votes", values: readonly [u128]} | {tag: "ProjectVotingCount", values: readonly [u128]} | {tag: "Admin", values: readonly [u128]};

export const Errors = {

}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({owner, token_address, registry_address}: {owner: string, token_address: string, registry_address: string}, options?: {
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
  }) => Promise<AssembledTransaction<RoundDetailExternal>>

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
  }) => Promise<AssembledTransaction<Array<RoundDetailExternal>>>

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
   * Construct and simulate a change_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_amount: ({round_id, caller, amount}: {round_id: u128, caller: string, amount: u128}, options?: {
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
  }) => Promise<AssembledTransaction<RoundDetailExternal>>

  /**
   * Construct and simulate a add_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_admin: ({round_id, round_admin}: {round_id: u128, round_admin: string}, options?: {
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
   * Construct and simulate a remove_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_admin: ({round_id, round_admin}: {round_id: u128, round_admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<RoundApplicationExternal>>

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
  }) => Promise<AssembledTransaction<RoundApplicationExternal>>

  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  deposit: ({round_id, actor, amount}: {round_id: u128, actor: string, amount: u128}, options?: {
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
   * Construct and simulate a get_pair_to_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pair_to_vote: ({round_id}: {round_id: u128}, options?: {
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
   * Construct and simulate a trigger_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  trigger_payouts: ({round_id, admin}: {round_id: u128, admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<RoundDetailExternal>>

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
  }) => Promise<AssembledTransaction<Array<RoundApplicationExternal>>>

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
  }) => Promise<AssembledTransaction<Option<RoundApplicationExternal>>>

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
   * Construct and simulate a get_pairs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_pairs: ({round_id, admin}: {round_id: u128, admin: string}, options?: {
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
  }) => Promise<AssembledTransaction<RoundApplicationExternal>>

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
  }) => Promise<AssembledTransaction<RoundApplicationExternal>>

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
  }) => Promise<AssembledTransaction<RoundDetailExternal>>

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
  }) => Promise<AssembledTransaction<RoundDetailExternal>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "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",
        "AAAAAQAAAAAAAAAAAAAAGFJvdW5kQXBwbGljYXRpb25JbnRlcm5hbAAAAAcAAAAAAAAADGFwcGxpY2FudF9pZAAAABMAAAAAAAAADmFwcGxpY2FudF9ub3RlAAAAAAAQAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAAtyZXZpZXdfbm90ZQAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAARQXBwbGljYXRpb25TdGF0dXMAAAAAAAAAAAAAC3N1Ym1pdGVkX21zAAAAAAYAAAAAAAAACnVwZGF0ZWRfbXMAAAAAA+gAAAAG",
        "AAAAAQAAAAAAAAAAAAAAGFJvdW5kQXBwbGljYXRpb25FeHRlcm5hbAAAAAcAAAAAAAAADGFwcGxpY2FudF9pZAAAABMAAAAAAAAADmFwcGxpY2FudF9ub3RlAAAAAAAQAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAAtyZXZpZXdfbm90ZQAAAAAQAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAARQXBwbGljYXRpb25TdGF0dXMAAAAAAAAAAAAAC3N1Ym1pdGVkX21zAAAAAAYAAAAAAAAACnVwZGF0ZWRfbXMAAAAAA+gAAAAG",
        "AAAAAQAAAAAAAAAAAAAABFBhaXIAAAACAAAAAAAAAAdwYWlyX2lkAAAAAAQAAAAAAAAACHByb2plY3RzAAAD6gAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tlZFBhaXIAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAQdm90ZWRfcHJvamVjdF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tSZXN1bHQAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAADFZvdGluZ1Jlc3VsdAAAAAMAAAAAAAAABXBpY2tzAAAAAAAD6gAAB9AAAAAKUGlja1Jlc3VsdAAAAAAAAAAAAAh2b3RlZF9tcwAAAAYAAAAAAAAABXZvdGVyAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQAAAAAAwAAAAAAAAAKYWxsb2NhdGlvbgAAAAAACgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAMdm90aW5nX2NvdW50AAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0NvbnRhY3QAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAABlBheW91dAAAAAAABAAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAACnBhaWRfYXRfbXMAAAAAAAYAAAAAAAAACnByb2plY3RfaWQAAAAAAAo=",
        "AAAAAgAAAAAAAAAAAAAADVByb2plY3RTdGF0dXMAAAAAAAAEAAAAAAAAAAAAAAADTmV3AAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIUmVqZWN0ZWQAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAA=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAADwAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAJpZAAAAAAACgAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1Qcm9qZWN0U3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9tcwAAAAAGAAAAAAAAAAx0ZWFtX21lbWJlcnMAAAPqAAAH0AAAABFQcm9qZWN0VGVhbU1lbWJlcgAAAAAAAAAAAAAKdXBkYXRlZF9tcwAAAAAD6AAAAAYAAAAAAAAACXZpZGVvX3VybAAAAAAAABA=",
        "AAAAAQAAAAAAAAAAAAAADlByb2plY3RDb250YWN0AAAAAAACAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFdmFsdWUAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAACAAAAAAAAABBjb250cmFjdF9hZGRyZXNzAAAAEAAAAAAAAAAEbmFtZQAAABA=",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAgAAAAAAAAAFbGFiZWwAAAAAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAALZGVub21pYXRpb24AAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJZnVuZGVkX21zAAAAAAAABgAAAAAAAAAGc291cmNlAAAAAAAQ",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAA",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3JvdW5kAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAxyb3VuZF9kZXRhaWwAAAfQAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAAQAAB9AAAAATUm91bmREZXRhaWxFeHRlcm5hbAA=",
        "AAAAAAAAAAAAAAAKZ2V0X3JvdW5kcwAAAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAE1JvdW5kRGV0YWlsRXh0ZXJuYWwA",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAABAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAUY2hhbmdlX3ZvdGluZ19wZXJpb2QAAAAEAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAOcm91bmRfc3RhcnRfbXMAAAAAAAYAAAAAAAAADHJvdW5kX2VuZF9tcwAAAAYAAAAA",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FwcGxpY2F0aW9uX3BlcmlvZAAAAAAAAAQAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAABpyb3VuZF9hcHBsaWNhdGlvbl9zdGFydF9tcwAAAAAABgAAAAAAAAAYcm91bmRfYXBwbGljYXRpb25fZW5kX21zAAAABgAAAAA=",
        "AAAAAAAAAAAAAAANY2hhbmdlX2Ftb3VudAAAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAA",
        "AAAAAAAAAAAAAAATY2xvc2Vfdm90aW5nX3BlcmlvZAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAEAAAfQAAAAE1JvdW5kRGV0YWlsRXh0ZXJuYWwA",
        "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAOYXBwbHlfdG9fcm91bmQAAAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAPoAAAAEwAAAAAAAAAEbm90ZQAAA+gAAAAQAAAAAAAAAAtyZXZpZXdfbm90ZQAAAAPoAAAAEAAAAAEAAAfQAAAAGFJvdW5kQXBwbGljYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAAScmV2aWV3X2FwcGxpY2F0aW9uAAAAAAAFAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAAAAAARub3RlAAAD6AAAABAAAAABAAAH0AAAABhSb3VuZEFwcGxpY2F0aW9uRXh0ZXJuYWw=",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFjdG9yAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAVwaWNrcwAAAAAAA+oAAAfQAAAAClBpY2tlZFBhaXIAAAAAAAA=",
        "AAAAAAAAAAAAAAAQZ2V0X3BhaXJfdG9fdm90ZQAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAPqAAAH0AAAAARQYWly",
        "AAAAAAAAAAAAAAAKZmxhZ192b3RlcgAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAMdW5mbGFnX3ZvdGVyAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAVZ2V0X3Jlc3VsdHNfZm9yX3JvdW5kAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAA+oAAAfQAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQA",
        "AAAAAAAAAAAAAAAPdHJpZ2dlcl9wYXlvdXRzAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAOZ2V0X2FsbF92b3RlcnMAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAADFZvdGluZ1Jlc3VsdA==",
        "AAAAAAAAAAAAAAAIY2FuX3ZvdGUAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAJZ2V0X3JvdW5kAAAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAB9AAAAATUm91bmREZXRhaWxFeHRlcm5hbAA=",
        "AAAAAAAAAAAAAAAOaXNfdm90aW5nX2xpdmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAATaXNfYXBwbGljYXRpb25fbGl2ZQAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAaZ2V0X2FwcGxpY2F0aW9uc19mb3Jfcm91bmQAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAGFJvdW5kQXBwbGljYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAAPZ2V0X2FwcGxpY2F0aW9uAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAPoAAAH0AAAABhSb3VuZEFwcGxpY2F0aW9uRXh0ZXJuYWw=",
        "AAAAAAAAAAAAAAAOaXNfcGF5b3V0X2RvbmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAANdXNlcl9oYXNfdm90ZQAAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAANdG90YWxfZnVuZGluZwAAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAK",
        "AAAAAAAAAAAAAAAUYWRkX2FwcHJvdmVkX3Byb2plY3QAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAALcHJvamVjdF9pZHMAAAAD6gAAAAoAAAAA",
        "AAAAAAAAAAAAAAAXcmVtb3ZlX2FwcHJvdmVkX3Byb2plY3QAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3Byb2plY3RfaWRzAAAAA+oAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAOYWRkX3doaXRlX2xpc3QAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAdhZGRyZXNzAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAWcmVtb3ZlX2Zyb21fd2hpdGVfbGlzdAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAQd2hpdGVsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAQYmxhY2tsaXN0X3N0YXR1cwAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAJZ2V0X3BhaXJzAAAAAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAABAAAD6gAAB9AAAAAEUGFpcg==",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJfYnlfaW5kZXgAAAAAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAAWY2hhbmdlX251bWJlcl9vZl92b3RlcwAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAE251bV9waWNrc19wZXJfdm90ZXIAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAYdHJhbnNmZXJfcm91bmRfb3duZXJzaGlwAAAAAgAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAASdW5hcHBseV9mcm9tX3JvdW5kAAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJYXBwbGljYW50AAAAAAAD6AAAABMAAAABAAAH0AAAABhSb3VuZEFwcGxpY2F0aW9uRXh0ZXJuYWw=",
        "AAAAAAAAAAAAAAAVdXBkYXRlX2FwcGxpY2FudF9ub3RlAAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABG5vdGUAAAAQAAAAAQAAB9AAAAAYUm91bmRBcHBsaWNhdGlvbkV4dGVybmFs",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FsbG93X2FwcGxpY2F0aW9ucwAAAAAAAAUAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAABJhbGxvd19hcHBsaWNhdGlvbnMAAAAAAAEAAAAAAAAACHN0YXJ0X21zAAAD6AAAAAYAAAAAAAAABmVuZF9tcwAAAAAD6AAAAAYAAAABAAAH0AAAABNSb3VuZERldGFpbEV4dGVybmFsAA==",
        "AAAAAAAAAAAAAAAMdXBkYXRlX3JvdW5kAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAADHJvdW5kX2RldGFpbAAAB9AAAAARVXBkYXRlUm91bmRQYXJhbXMAAAAAAAABAAAH0AAAABNSb3VuZERldGFpbEV4dGVybmFsAA==",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAA0AAAAAAAAAAAAAAAxGYWN0b3J5T3duZXIAAAAAAAAAAAAAAAtSb3VuZE51bWJlcgAAAAAAAAAAAAAAAA1Ub2tlbkNvbnRyYWN0AAAAAAAAAAAAAAAAAAAPUHJvamVjdENvbnRyYWN0AAAAAAEAAAAAAAAACVJvdW5kSW5mbwAAAAAAAAEAAAAKAAAAAQAAAAAAAAAVV2hpdGVsaXN0QW5kQmxhY2tsaXN0AAAAAAAAAQAAAAoAAAABAAAAAAAAABFQcm9qZWN0QXBwbGljYW50cwAAAAAAAAEAAAAKAAAAAQAAAAAAAAAQQXBwcm92ZWRQcm9qZWN0cwAAAAEAAAAKAAAAAQAAAAAAAAAHUGF5b3V0cwAAAAABAAAACgAAAAEAAAAAAAAAC1ZvdGluZ1N0YXRlAAAAAAEAAAAKAAAAAQAAAAAAAAAFVm90ZXMAAAAAAAABAAAACgAAAAEAAAAAAAAAElByb2plY3RWb3RpbmdDb3VudAAAAAAAAQAAAAoAAAABAAAAAAAAAAVBZG1pbgAAAAAAAAEAAAAK" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_round: this.txFromJSON<RoundDetailExternal>,
        get_rounds: this.txFromJSON<Array<RoundDetailExternal>>,
        upgrade: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<null>,
        change_voting_period: this.txFromJSON<null>,
        change_application_period: this.txFromJSON<null>,
        change_amount: this.txFromJSON<null>,
        close_voting_period: this.txFromJSON<RoundDetailExternal>,
        add_admin: this.txFromJSON<null>,
        remove_admin: this.txFromJSON<null>,
        apply_to_round: this.txFromJSON<RoundApplicationExternal>,
        review_application: this.txFromJSON<RoundApplicationExternal>,
        deposit: this.txFromJSON<null>,
        vote: this.txFromJSON<null>,
        get_pair_to_vote: this.txFromJSON<Array<Pair>>,
        flag_voter: this.txFromJSON<null>,
        unflag_voter: this.txFromJSON<null>,
        get_results_for_round: this.txFromJSON<Array<ProjectVotingResult>>,
        trigger_payouts: this.txFromJSON<null>,
        get_all_voters: this.txFromJSON<Array<VotingResult>>,
        can_vote: this.txFromJSON<boolean>,
        get_round: this.txFromJSON<RoundDetailExternal>,
        is_voting_live: this.txFromJSON<boolean>,
        is_application_live: this.txFromJSON<boolean>,
        get_applications_for_round: this.txFromJSON<Array<RoundApplicationExternal>>,
        get_application: this.txFromJSON<Option<RoundApplicationExternal>>,
        is_payout_done: this.txFromJSON<boolean>,
        user_has_vote: this.txFromJSON<boolean>,
        total_funding: this.txFromJSON<u128>,
        add_approved_project: this.txFromJSON<null>,
        remove_approved_project: this.txFromJSON<null>,
        add_white_list: this.txFromJSON<null>,
        remove_from_white_list: this.txFromJSON<null>,
        whitelist_status: this.txFromJSON<boolean>,
        blacklist_status: this.txFromJSON<boolean>,
        get_pairs: this.txFromJSON<Array<Pair>>,
        get_pair_by_index: this.txFromJSON<Pair>,
        change_number_of_votes: this.txFromJSON<null>,
        transfer_round_ownership: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>,
        unapply_from_round: this.txFromJSON<RoundApplicationExternal>,
        update_applicant_note: this.txFromJSON<RoundApplicationExternal>,
        change_allow_applications: this.txFromJSON<RoundDetailExternal>,
        update_round: this.txFromJSON<RoundDetailExternal>
  }
}