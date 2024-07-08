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
    contractId: "CCHYGRMAI6QGU56OIR5NFAFIQJKJ5JMMPSYDRWSY3BKBRVHLAAVXTBMZ",
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
  id: u128;
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

export type ContractKey = {tag: "RoundInfo", values: void} | {tag: "WhitelistAndBlacklist", values: void} | {tag: "ProjectApplicants", values: void} | {tag: "ApprovedProjects", values: void} | {tag: "ApplicationNumber", values: void} | {tag: "TokenContract", values: void} | {tag: "ProjectContract", values: void} | {tag: "VotingState", values: void} | {tag: "Votes", values: void} | {tag: "ProjectVotingCount", values: void} | {tag: "Admin", values: void};

export const Errors = {
  
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({owner, token_address, registry_address, round_detail}: {owner: string, token_address: string, registry_address: string, round_detail: CreateRoundParams}, options?: {
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
  change_voting_period: ({admin, round_start_ms, round_end_ms}: {admin: string, round_start_ms: u64, round_end_ms: u64}, options?: {
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
  change_application_period: ({admin, round_application_start_ms, round_application_end_ms}: {admin: string, round_application_start_ms: u64, round_application_end_ms: u64}, options?: {
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
  change_amount: ({admin, amount}: {admin: string, amount: u128}, options?: {
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
  complete_vote: ({admin}: {admin: string}, options?: {
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
  add_admin: ({admin, round_admin}: {admin: string, round_admin: string}, options?: {
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
  remove_admin: ({admin, round_admin}: {admin: string, round_admin: string}, options?: {
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
  apply_project: ({project_id, applicant}: {project_id: u128, applicant: string}, options?: {
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
  review_application: ({admin, application_id, status, note}: {admin: string, application_id: u128, status: ApplicationStatus, note: Option<string>}, options?: {
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
  deposit: ({actor, amount}: {actor: string, amount: u128}, options?: {
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
  vote: ({voter, picks}: {voter: string, picks: Array<PickedPair>}, options?: {
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
  get_pair_to_vote: (options?: {
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
  flag_voter: ({admin, voter}: {admin: string, voter: string}, options?: {
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
  unflag_voter: ({admin, voter}: {admin: string, voter: string}, options?: {
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
  calculate_results: (options?: {
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
  trigger_payouts: ({admin}: {admin: string}, options?: {
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
  get_all_voters: ({skip, limit}: {skip: Option<u64>, limit: Option<u64>}, options?: {
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
  can_vote: ({voter}: {voter: string}, options?: {
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
  round_info: (options?: {
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
  is_voting_live: (options?: {
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
  is_application_live: (options?: {
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
  get_all_applications: ({skip, limit}: {skip: Option<u64>, limit: Option<u64>}, options?: {
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
  is_payout_done: (options?: {
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
  user_has_vote: ({voter}: {voter: string}, options?: {
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
  total_funding: (options?: {
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
  add_approved_project: ({admin, project_ids}: {admin: string, project_ids: Array<u128>}, options?: {
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
  remove_approved_project: ({admin, project_ids}: {admin: string, project_ids: Array<u128>}, options?: {
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
  add_white_list: ({admin, address}: {admin: string, address: string}, options?: {
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
  remove_from_white_list: ({admin, address}: {admin: string, address: string}, options?: {
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
  whitelist_status: ({address}: {address: string}, options?: {
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
  blacklist_status: ({address}: {address: string}, options?: {
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
  get_pairs: ({admin}: {admin: string}, options?: {
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
  get_pair_by_index: ({index}: {index: u32}, options?: {
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
  change_number_of_votes: ({admin, num_picks_per_voter}: {admin: string, num_picks_per_voter: u32}, options?: {
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
   * Construct and simulate a admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  admins: (options?: {
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
        "AAAAAQAAAAAAAAAAAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAADgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAASYXBwbGljYXRpb25fZW5kX21zAAAAAAAGAAAAAAAAABRhcHBsaWNhdGlvbl9zdGFydF9tcwAAAAYAAAAAAAAACGNvbnRhY3RzAAAD6gAAB9AAAAAHQ29udGFjdAAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAD2V4cGVjdGVkX2Ftb3VudAAAAAAKAAAAAAAAAAJpZAAAAAAACgAAAAAAAAAQbWF4X3BhcnRpY2lwYW50cwAAA+gAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAATbnVtX3BpY2tzX3Blcl92b3RlcgAAAAPoAAAABAAAAAAAAAANdXNlX3doaXRlbGlzdAAAAAAAA+gAAAABAAAAAAAAAAl2aWRlb191cmwAAAAAAAAQAAAAAAAAAA12b3RpbmdfZW5kX21zAAAAAAAABgAAAAAAAAAPdm90aW5nX3N0YXJ0X21zAAAAAAY=",
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
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAAAAAADHJvdW5kX2RldGFpbAAAB9AAAAARQ3JlYXRlUm91bmRQYXJhbXMAAAAAAAAA",
        "AAAAAAAAAAAAAAAUY2hhbmdlX3ZvdGluZ19wZXJpb2QAAAADAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADnJvdW5kX3N0YXJ0X21zAAAAAAAGAAAAAAAAAAxyb3VuZF9lbmRfbXMAAAAGAAAAAA==",
        "AAAAAAAAAAAAAAAZY2hhbmdlX2FwcGxpY2F0aW9uX3BlcmlvZAAAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAacm91bmRfYXBwbGljYXRpb25fc3RhcnRfbXMAAAAAAAYAAAAAAAAAGHJvdW5kX2FwcGxpY2F0aW9uX2VuZF9tcwAAAAYAAAAA",
        "AAAAAAAAAAAAAAANY2hhbmdlX2Ftb3VudAAAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAANY29tcGxldGVfdm90ZQAAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAtyb3VuZF9hZG1pbgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAANYXBwbHlfcHJvamVjdAAAAAAAAAIAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAABAAAACg==",
        "AAAAAAAAAAAAAAAScmV2aWV3X2FwcGxpY2F0aW9uAAAAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAADmFwcGxpY2F0aW9uX2lkAAAAAAAKAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAARQXBwbGljYXRpb25TdGF0dXMAAAAAAAAAAAAABG5vdGUAAAPoAAAAEAAAAAA=",
        "AAAAAAAAAAAAAAAHZGVwb3NpdAAAAAACAAAAAAAAAAVhY3RvcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACgAAAAA=",
        "AAAAAAAAAAAAAAAEdm90ZQAAAAIAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAFcGlja3MAAAAAAAPqAAAH0AAAAApQaWNrZWRQYWlyAAAAAAAA",
        "AAAAAAAAAAAAAAAQZ2V0X3BhaXJfdG9fdm90ZQAAAAAAAAABAAAD6gAAB9AAAAAEUGFpcg==",
        "AAAAAAAAAAAAAAAKZmxhZ192b3RlcgAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAMdW5mbGFnX3ZvdGVyAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAARY2FsY3VsYXRlX3Jlc3VsdHMAAAAAAAAAAAAAAQAAA+oAAAfQAAAAE1Byb2plY3RWb3RpbmdSZXN1bHQA",
        "AAAAAAAAAAAAAAAPdHJpZ2dlcl9wYXlvdXRzAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAOZ2V0X2FsbF92b3RlcnMAAAAAAAIAAAAAAAAABHNraXAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAAAxWb3RpbmdSZXN1bHQ=",
        "AAAAAAAAAAAAAAAIY2FuX3ZvdGUAAAABAAAAAAAAAAV2b3RlcgAAAAAAABMAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAKcm91bmRfaW5mbwAAAAAAAAAAAAEAAAfQAAAAC1JvdW5kRGV0YWlsAA==",
        "AAAAAAAAAAAAAAAOaXNfdm90aW5nX2xpdmUAAAAAAAAAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAATaXNfYXBwbGljYXRpb25fbGl2ZQAAAAAAAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAUZ2V0X2FsbF9hcHBsaWNhdGlvbnMAAAACAAAAAAAAAARza2lwAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAASUHJvamVjdEFwcGxpY2F0aW9uAAA=",
        "AAAAAAAAAAAAAAAOaXNfcGF5b3V0X2RvbmUAAAAAAAAAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAANdXNlcl9oYXNfdm90ZQAAAAAAAAEAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAANdG90YWxfZnVuZGluZwAAAAAAAAAAAAABAAAACg==",
        "AAAAAAAAAAAAAAAUYWRkX2FwcHJvdmVkX3Byb2plY3QAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3Byb2plY3RfaWRzAAAAA+oAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAAXcmVtb3ZlX2FwcHJvdmVkX3Byb2plY3QAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAtwcm9qZWN0X2lkcwAAAAPqAAAACgAAAAA=",
        "AAAAAAAAAAAAAAAOYWRkX3doaXRlX2xpc3QAAAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAWcmVtb3ZlX2Zyb21fd2hpdGVfbGlzdAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAdhZGRyZXNzAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAQd2hpdGVsaXN0X3N0YXR1cwAAAAEAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAQYmxhY2tsaXN0X3N0YXR1cwAAAAEAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAEAAAAB",
        "AAAAAAAAAAAAAAAJZ2V0X3BhaXJzAAAAAAAAAQAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAQAAA+oAAAfQAAAABFBhaXI=",
        "AAAAAAAAAAAAAAARZ2V0X3BhaXJfYnlfaW5kZXgAAAAAAAABAAAAAAAAAAVpbmRleAAAAAAAAAQAAAABAAAH0AAAAARQYWly",
        "AAAAAAAAAAAAAAAWY2hhbmdlX251bWJlcl9vZl92b3RlcwAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAAAQAAAAA",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACW5ld19vd25lcgAAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADW5ld193YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAAAAAAAAQAAA+oAAAAT",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAAsAAAAAAAAAAAAAAAlSb3VuZEluZm8AAAAAAAAAAAAAAAAAABVXaGl0ZWxpc3RBbmRCbGFja2xpc3QAAAAAAAAAAAAAAAAAABFQcm9qZWN0QXBwbGljYW50cwAAAAAAAAAAAAAAAAAAEEFwcHJvdmVkUHJvamVjdHMAAAAAAAAAAAAAABFBcHBsaWNhdGlvbk51bWJlcgAAAAAAAAAAAAAAAAAADVRva2VuQ29udHJhY3QAAAAAAAAAAAAAAAAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAAAAAALVm90aW5nU3RhdGUAAAAAAAAAAAAAAAAFVm90ZXMAAAAAAAAAAAAAAAAAABJQcm9qZWN0Vm90aW5nQ291bnQAAAAAAAAAAAAAAAAABUFkbWluAAAA" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
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
        transfer_ownership: this.txFromJSON<null>,
        upgrade: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>
  }
}