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
    contractId: "CDU4HQHX4QBUBCALG4OAS3NI2D2ENLKACLYKVS6RMUWKUD4YFLUYLUWK",
  }
} as const

export type ApplicationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void};


export interface RoundDetail {
  application_end_ms: u64;
  application_start_ms: u64;
  contacts: Array<Contact>;
  description: string;
  expected_amount: u128;
  id: u128;
  is_completed: boolean;
  max_participants: u32;
  name: string;
  num_picks_per_voter: u32;
  owner: string;
  use_whitelist: boolean;
  vault_balance: u128;
  video_url: string;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface CreateRoundParams {
  admins: Array<string>;
  application_end_ms: u64;
  application_start_ms: u64;
  contacts: Array<Contact>;
  description: string;
  expected_amount: u128;
  max_participants: Option<u32>;
  name: string;
  num_picks_per_voter: Option<u32>;
  use_whitelist: Option<boolean>;
  video_url: string;
  voting_end_ms: u64;
  voting_start_ms: u64;
}


export interface ProjectApplication {
  applicant: string;
  application_id: u128;
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
}


export interface ProjectParams {
  admins: Array<string>;
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  fundings: Array<ProjectFundingHistory>;
  image_url: string;
  name: string;
  overview: string;
  payout_address: string;
  repositories: Array<ProjectRepository>;
  team_members: Array<ProjectTeamMember>;
}


export interface UpdateProjectParams {
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  fundings: Array<ProjectFundingHistory>;
  image_url: string;
  name: string;
  overview: string;
  payout_address: string;
  repositories: Array<ProjectRepository>;
  team_members: Array<ProjectTeamMember>;
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

export type ContractKey = {tag: "FactoryOwner", values: void} | {tag: "RoundNumber", values: void} | {tag: "TokenContract", values: void} | {tag: "ProjectContract", values: void} | {tag: "RoundInfo", values: readonly [u128]} | {tag: "WhitelistAndBlacklist", values: readonly [u128]} | {tag: "ProjectApplicants", values: readonly [u128]} | {tag: "ApprovedProjects", values: readonly [u128]} | {tag: "ApplicationNumber", values: readonly [u128]} | {tag: "VotingState", values: readonly [u128]} | {tag: "Votes", values: readonly [u128]} | {tag: "ProjectVotingCount", values: readonly [u128]} | {tag: "Admin", values: readonly [u128]};

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
  create_round: ({owner, round_detail}: {owner: string, round_detail: CreateRoundParams}, options?: {
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
  upgrade: ({owner, new_wasm_hash}: {owner: string, new_wasm_hash: Buffer}, options?: {
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
  transfer_ownership: ({owner, new_owner}: {owner: string, new_owner: string}, options?: {
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
  change_voting_period: ({round_id, admin, round_start_ms, round_end_ms}: {round_id: u128, admin: string, round_start_ms: u64, round_end_ms: u64}, options?: {
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
  change_application_period: ({round_id, admin, round_application_start_ms, round_application_end_ms}: {round_id: u128, admin: string, round_application_start_ms: u64, round_application_end_ms: u64}, options?: {
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
  change_amount: ({round_id, admin, amount}: {round_id: u128, admin: string, amount: u128}, options?: {
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
   * Construct and simulate a complete_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  complete_vote: ({round_id, admin}: {round_id: u128, admin: string}, options?: {
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
   * Construct and simulate a add_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_admin: ({round_id, admin, round_admin}: {round_id: u128, admin: string, round_admin: string}, options?: {
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
  remove_admin: ({round_id, admin, round_admin}: {round_id: u128, admin: string, round_admin: string}, options?: {
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
   * Construct and simulate a apply_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply_project: ({round_id, project_id, applicant}: {round_id: u128, project_id: u128, applicant: string}, options?: {
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
   * Construct and simulate a review_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  review_application: ({round_id, admin, application_id, status, note}: {round_id: u128, admin: string, application_id: u128, status: ApplicationStatus, note: Option<string>}, options?: {
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
   * Construct and simulate a calculate_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  calculate_results: ({round_id}: {round_id: u128}, options?: {
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
   * Construct and simulate a round_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  round_info: ({round_id}: {round_id: u128}, options?: {
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
   * Construct and simulate a get_all_applications transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_all_applications: ({round_id, skip, limit}: {round_id: u128, skip: Option<u64>, limit: Option<u64>}, options?: {
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
  }) => Promise<AssembledTransaction<Array<ProjectApplication>>>

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
  transfer_round_ownership: ({round_id, owner, new_owner}: {round_id: u128, owner: string, new_owner: string}, options?: {
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

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAAEUFwcGxpY2F0aW9uU3RhdHVzAAAAAAAAAwAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAIQXBwcm92ZWQAAAAAAAAAAAAAAAhSZWplY3RlZA==",
        "AAAAAQAAAAAAAAAAAAAAC1JvdW5kRGV0YWlsAAAAABAAAAAAAAAAEmFwcGxpY2F0aW9uX2VuZF9tcwAAAAAABgAAAAAAAAAUYXBwbGljYXRpb25fc3RhcnRfbXMAAAAGAAAAAAAAAAhjb250YWN0cwAAA+oAAAfQAAAAB0NvbnRhY3QAAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAA9leHBlY3RlZF9hbW91bnQAAAAACgAAAAAAAAACaWQAAAAAAAoAAAAAAAAADGlzX2NvbXBsZXRlZAAAAAEAAAAAAAAAEG1heF9wYXJ0aWNpcGFudHMAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAATbnVtX3BpY2tzX3Blcl92b3RlcgAAAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADXVzZV93aGl0ZWxpc3QAAAAAAAABAAAAAAAAAA12YXVsdF9iYWxhbmNlAAAAAAAACgAAAAAAAAAJdmlkZW9fdXJsAAAAAAAAEAAAAAAAAAANdm90aW5nX2VuZF9tcwAAAAAAAAYAAAAAAAAAD3ZvdGluZ19zdGFydF9tcwAAAAAG",
        "AAAAAQAAAAAAAAAAAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAADQAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAASYXBwbGljYXRpb25fZW5kX21zAAAAAAAGAAAAAAAAABRhcHBsaWNhdGlvbl9zdGFydF9tcwAAAAYAAAAAAAAACGNvbnRhY3RzAAAD6gAAB9AAAAAHQ29udGFjdAAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAD2V4cGVjdGVkX2Ftb3VudAAAAAAKAAAAAAAAABBtYXhfcGFydGljaXBhbnRzAAAD6AAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAA+gAAAAEAAAAAAAAAA11c2Vfd2hpdGVsaXN0AAAAAAAD6AAAAAEAAAAAAAAACXZpZGVvX3VybAAAAAAAABAAAAAAAAAADXZvdGluZ19lbmRfbXMAAAAAAAAGAAAAAAAAAA92b3Rpbmdfc3RhcnRfbXMAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAElByb2plY3RBcHBsaWNhdGlvbgAAAAAABwAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAAAAAAOYXBwbGljYXRpb25faWQAAAAAAAoAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAAC3Jldmlld19ub3RlAAAAABAAAAAAAAAABnN0YXR1cwAAAAAH0AAAABFBcHBsaWNhdGlvblN0YXR1cwAAAAAAAAAAAAALc3VibWl0ZWRfbXMAAAAABgAAAAAAAAAKdXBkYXRlZF9tcwAAAAAD6AAAAAY=",
        "AAAAAQAAAAAAAAAAAAAABFBhaXIAAAACAAAAAAAAAAdwYWlyX2lkAAAAAAQAAAAAAAAACHByb2plY3RzAAAD6gAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tlZFBhaXIAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAQdm90ZWRfcHJvamVjdF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAClBpY2tSZXN1bHQAAAAAAAIAAAAAAAAAB3BhaXJfaWQAAAAABAAAAAAAAAAKcHJvamVjdF9pZAAAAAAACg==",
        "AAAAAQAAAAAAAAAAAAAADFZvdGluZ1Jlc3VsdAAAAAMAAAAAAAAABXBpY2tzAAAAAAAD6gAAB9AAAAAKUGlja1Jlc3VsdAAAAAAAAAAAAAh2b3RlZF9tcwAAAAYAAAAAAAAABXZvdGVyAAAAAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQAAAAAAwAAAAAAAAAKYWxsb2NhdGlvbgAAAAAACgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAMdm90aW5nX2NvdW50AAAACg==",
        "AAAAAQAAAAAAAAAAAAAAB0NvbnRhY3QAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAgAAAAAAAAAAAAAADVByb2plY3RTdGF0dXMAAAAAAAAEAAAAAAAAAAAAAAADTmV3AAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIUmVqZWN0ZWQAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAA=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAADgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAJpZAAAAAAACgAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1Qcm9qZWN0U3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9tcwAAAAAGAAAAAAAAAAx0ZWFtX21lbWJlcnMAAAPqAAAH0AAAABFQcm9qZWN0VGVhbU1lbWJlcgAAAAAAAAAAAAAKdXBkYXRlZF9tcwAAAAAD6AAAAAY=",
        "AAAAAQAAAAAAAAAAAAAADVByb2plY3RQYXJhbXMAAAAAAAAKAAAAAAAAAAZhZG1pbnMAAAAAA+oAAAATAAAAAAAAAAhjb250YWN0cwAAA+oAAAfQAAAADlByb2plY3RDb250YWN0AAAAAAAAAAAACWNvbnRyYWN0cwAAAAAAA+oAAAfQAAAAD1Byb2plY3RDb250cmFjdAAAAAAAAAAACGZ1bmRpbmdzAAAD6gAAB9AAAAAVUHJvamVjdEZ1bmRpbmdIaXN0b3J5AAAAAAAAAAAAAAlpbWFnZV91cmwAAAAAAAAQAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAIb3ZlcnZpZXcAAAAQAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAADHRlYW1fbWVtYmVycwAAA+oAAAfQAAAAEVByb2plY3RUZWFtTWVtYmVyAAAA",
        "AAAAAQAAAAAAAAAAAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAACQAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAhmdW5kaW5ncwAAA+oAAAfQAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAOcGF5b3V0X2FkZHJlc3MAAAAAABMAAAAAAAAADHJlcG9zaXRvcmllcwAAA+oAAAfQAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAAAAAAx0ZWFtX21lbWJlcnMAAAPqAAAH0AAAABFQcm9qZWN0VGVhbU1lbWJlcgAAAA==",
        "AAAAAQAAAAAAAAAAAAAADlByb2plY3RDb250YWN0AAAAAAACAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFdmFsdWUAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAACAAAAAAAAABBjb250cmFjdF9hZGRyZXNzAAAAEAAAAAAAAAAEbmFtZQAAABA=",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAgAAAAAAAAAFbGFiZWwAAAAAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAALZGVub21pYXRpb24AAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJZnVuZGVkX21zAAAAAAAABgAAAAAAAAAGc291cmNlAAAAAAAQ",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAA",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3JvdW5kAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAxyb3VuZF9kZXRhaWwAAAfQAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAKZ2V0X3JvdW5kcwAAAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADW5ld193YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACW5ld19vd25lcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAUY2hhbmdlX3ZvdGluZ19wZXJpb2QAAAAEAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAOcm91bmRfc3RhcnRfbXMAAAAAAAYAAAAAAAAADHJvdW5kX2VuZF9tcwAAAAYAAAAA",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FwcGxpY2F0aW9uX3BlcmlvZAAAAAAAAAQAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABpyb3VuZF9hcHBsaWNhdGlvbl9zdGFydF9tcwAAAAAABgAAAAAAAAAYcm91bmRfYXBwbGljYXRpb25fZW5kX21zAAAABgAAAAA=",
        "AAAAAAAAAAAAAAANY2hhbmdlX2Ftb3VudAAAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAoAAAAA",
        "AAAAAAAAAAAAAAANY29tcGxldGVfdm90ZQAAAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3JvdW5kX2FkbWluAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3JvdW5kX2FkbWluAAAAABMAAAAA",
        "AAAAAAAAAAAAAAANYXBwbHlfcHJvamVjdAAAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAAK",
        "AAAAAAAAAAAAAAAScmV2aWV3X2FwcGxpY2F0aW9uAAAAAAAFAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAOYXBwbGljYXRpb25faWQAAAAAAAoAAAAAAAAABnN0YXR1cwAAAAAH0AAAABFBcHBsaWNhdGlvblN0YXR1cwAAAAAAAAAAAAAEbm90ZQAAA+gAAAAQAAAAAA==",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABWFjdG9yAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFdm90ZXIAAAAAAAATAAAAAAAAAAVwaWNrcwAAAAAAA+oAAAfQAAAAClBpY2tlZFBhaXIAAAAAAAA=",
        "AAAAAAAAAAAAAAAQZ2V0X3BhaXJfdG9fdm90ZQAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAPqAAAH0AAAAARQYWly",
        "AAAAAAAAAAAAAAAKZmxhZ192b3RlcgAAAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAMdW5mbGFnX3ZvdGVyAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAARY2FsY3VsYXRlX3Jlc3VsdHMAAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAB9AAAAATUHJvamVjdFZvdGluZ1Jlc3VsdAA=",
        "AAAAAAAAAAAAAAAPdHJpZ2dlcl9wYXlvdXRzAAAAAAIAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAOZ2V0X2FsbF92b3RlcnMAAAAAAAMAAAAAAAAACHJvdW5kX2lkAAAACgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAADFZvdGluZ1Jlc3VsdA==",
        "AAAAAAAAAAAAAAAIY2FuX3ZvdGUAAAACAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAKcm91bmRfaW5mbwAAAAAAAQAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAQAAB9AAAAALUm91bmREZXRhaWwA",
        "AAAAAAAAAAAAAAAOaXNfdm90aW5nX2xpdmUAAAAAAAEAAAAAAAAACHJvdW5kX2lkAAAACgAAAAEAAAAB",
        "AAAAAAAAAAAAAAATaXNfYXBwbGljYXRpb25fbGl2ZQAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAUZ2V0X2FsbF9hcHBsaWNhdGlvbnMAAAADAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAAAAAAABHNraXAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAABJQcm9qZWN0QXBwbGljYXRpb24AAA==",
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
        "AAAAAAAAAAAAAAAYdHJhbnNmZXJfcm91bmRfb3duZXJzaGlwAAAAAwAAAAAAAAAIcm91bmRfaWQAAAAKAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACW5ld19vd25lcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAABAAAAAAAAAAhyb3VuZF9pZAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAA0AAAAAAAAAAAAAAAxGYWN0b3J5T3duZXIAAAAAAAAAAAAAAAtSb3VuZE51bWJlcgAAAAAAAAAAAAAAAA1Ub2tlbkNvbnRyYWN0AAAAAAAAAAAAAAAAAAAPUHJvamVjdENvbnRyYWN0AAAAAAEAAAAAAAAACVJvdW5kSW5mbwAAAAAAAAEAAAAKAAAAAQAAAAAAAAAVV2hpdGVsaXN0QW5kQmxhY2tsaXN0AAAAAAAAAQAAAAoAAAABAAAAAAAAABFQcm9qZWN0QXBwbGljYW50cwAAAAAAAAEAAAAKAAAAAQAAAAAAAAAQQXBwcm92ZWRQcm9qZWN0cwAAAAEAAAAKAAAAAQAAAAAAAAARQXBwbGljYXRpb25OdW1iZXIAAAAAAAABAAAACgAAAAEAAAAAAAAAC1ZvdGluZ1N0YXRlAAAAAAEAAAAKAAAAAQAAAAAAAAAFVm90ZXMAAAAAAAABAAAACgAAAAEAAAAAAAAAElByb2plY3RWb3RpbmdDb3VudAAAAAAAAQAAAAoAAAABAAAAAAAAAAVBZG1pbgAAAAAAAAEAAAAK" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_round: this.txFromJSON<RoundDetail>,
        get_rounds: this.txFromJSON<Array<RoundDetail>>,
        upgrade: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<null>,
        change_voting_period: this.txFromJSON<null>,
        change_application_period: this.txFromJSON<null>,
        change_amount: this.txFromJSON<null>,
        complete_vote: this.txFromJSON<null>,
        add_admin: this.txFromJSON<null>,
        remove_admin: this.txFromJSON<null>,
        apply_project: this.txFromJSON<u128>,
        review_application: this.txFromJSON<null>,
        deposit: this.txFromJSON<null>,
        vote: this.txFromJSON<null>,
        get_pair_to_vote: this.txFromJSON<Array<Pair>>,
        flag_voter: this.txFromJSON<null>,
        unflag_voter: this.txFromJSON<null>,
        calculate_results: this.txFromJSON<Array<ProjectVotingResult>>,
        trigger_payouts: this.txFromJSON<null>,
        get_all_voters: this.txFromJSON<Array<VotingResult>>,
        can_vote: this.txFromJSON<boolean>,
        round_info: this.txFromJSON<RoundDetail>,
        is_voting_live: this.txFromJSON<boolean>,
        is_application_live: this.txFromJSON<boolean>,
        get_all_applications: this.txFromJSON<Array<ProjectApplication>>,
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
        admins: this.txFromJSON<Array<string>>
  }
}