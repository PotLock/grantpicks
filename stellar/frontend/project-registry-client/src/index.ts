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
    contractId: "CA56XSY7YEZ7CJ5FYG7YODQIWE3JNRGZ5S7E7VJAQ675KDS4BLZJ5NJH",
  }
} as const


export interface Project {
  admins: Array<string>;
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  funding_histories: Array<ProjectFundingHistory>;
  id: u128;
  image_url: string;
  name: string;
  overview: string;
  owner: string;
  repositories: Array<ProjectRepository>;
  submited_ms: u64;
  team_members: Array<ProjectTeamMember>;
  updated_ms: Option<u64>;
  video_url: string;
}


export interface CreateProjectParams {
  admins: Array<string>;
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  fundings: Array<ProjectFundingHistory>;
  image_url: string;
  name: string;
  overview: string;
  repositories: Array<ProjectRepository>;
  team_members: Array<ProjectTeamMember>;
  video_url: string;
}


export interface UpdateProjectParams {
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
  fundings: Array<ProjectFundingHistory>;
  image_url: string;
  name: string;
  overview: string;
  repositories: Array<ProjectRepository>;
  team_members: Array<ProjectTeamMember>;
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
  denomination: string;
  description: string;
  funded_ms: u64;
  source: string;
}


export interface RoundPreCheck {
  applicant: string;
  has_video: boolean;
  project_id: u128;
}

export const Errors = {
  1: {message:"EmptyName"},

  2: {message:"EmptyOverview"},

  3: {message:"EmptyContacts"},

  4: {message:"EmptyAdmins"},

  5: {message:"EmptyImageUrl"},

  6: {message:"AdminOrOwnerOnly"},

  7: {message:"OwnerOnly"},

  8: {message:"ContractOwnerOnly"},

  9: {message:"AlreadyApplied"},

  10: {message:"DataNotFound"},

  11: {message:"AlreadyInitialized"}
}
export type ContractKey = {tag: "NumOfProjects", values: void} | {tag: "Projects", values: void} | {tag: "Project", values: readonly [u128]} | {tag: "RegistryAdmin", values: void} | {tag: "ApplicantToProjectID", values: readonly [string]};


export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({contract_owner}: {contract_owner: string}, options?: {
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
   * Construct and simulate a apply transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  apply: ({applicant, project_params}: {applicant: string, project_params: CreateProjectParams}, options?: {
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
  }) => Promise<AssembledTransaction<Project>>

  /**
   * Construct and simulate a update_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_project: ({admin, project_id, new_project_params}: {admin: string, project_id: u128, new_project_params: UpdateProjectParams}, options?: {
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
  add_admin: ({project_id, new_admin}: {project_id: u128, new_admin: string}, options?: {
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
  remove_admin: ({project_id, admin_to_remove}: {project_id: u128, admin_to_remove: string}, options?: {
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
   * Construct and simulate a get_project_by_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project_by_id: ({project_id}: {project_id: u128}, options?: {
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
  }) => Promise<AssembledTransaction<Project>>

  /**
   * Construct and simulate a get_projects transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_projects: ({skip, limit}: {skip: Option<u64>, limit: Option<u64>}, options?: {
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
  }) => Promise<AssembledTransaction<Array<Project>>>

  /**
   * Construct and simulate a get_project_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project_admins: ({project_id}: {project_id: u128}, options?: {
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
   * Construct and simulate a get_total_projects transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_projects: (options?: {
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
  }) => Promise<AssembledTransaction<u32>>

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
   * Construct and simulate a get_project_from_applicant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_project_from_applicant: ({applicant}: {applicant: string}, options?: {
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
  }) => Promise<AssembledTransaction<Project>>

  /**
   * Construct and simulate a owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  owner: (options?: {
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
  }) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_precheck transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_precheck: ({applicant}: {applicant: string}, options?: {
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
  }) => Promise<AssembledTransaction<Option<RoundPreCheck>>>

  /**
   * Construct and simulate a get_precheck_by_id transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_precheck_by_id: ({project_id}: {project_id: u128}, options?: {
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
  }) => Promise<AssembledTransaction<Option<RoundPreCheck>>>

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAADgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAABFmdW5kaW5nX2hpc3RvcmllcwAAAAAAA+oAAAfQAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAAAAAACaWQAAAAAAAoAAAAAAAAACWltYWdlX3VybAAAAAAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAhvdmVydmlldwAAABAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAAC3N1Ym1pdGVkX21zAAAAAAYAAAAAAAAADHRlYW1fbWVtYmVycwAAA+oAAAfQAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAAAAAAp1cGRhdGVkX21zAAAAAAPoAAAABgAAAAAAAAAJdmlkZW9fdXJsAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAE0NyZWF0ZVByb2plY3RQYXJhbXMAAAAACgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAhmdW5kaW5ncwAAA+oAAAfQAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAADHRlYW1fbWVtYmVycwAAA+oAAAfQAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAAAAAAl2aWRlb191cmwAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAACQAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAhmdW5kaW5ncwAAA+oAAAfQAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAADHRlYW1fbWVtYmVycwAAA+oAAAfQAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAAAAAAl2aWRlb191cmwAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAADlByb2plY3RDb250YWN0AAAAAAACAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFdmFsdWUAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAACAAAAAAAAABBjb250cmFjdF9hZGRyZXNzAAAAEAAAAAAAAAAEbmFtZQAAABA=",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAgAAAAAAAAAFbGFiZWwAAAAAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAQAAAAAAAAAAAAAAFVByb2plY3RGdW5kaW5nSGlzdG9yeQAAAAAAAAUAAAAAAAAABmFtb3VudAAAAAAACgAAAAAAAAAMZGVub21pbmF0aW9uAAAAEAAAAAAAAAALZGVzY3JpcHRpb24AAAAAEAAAAAAAAAAJZnVuZGVkX21zAAAAAAAABgAAAAAAAAAGc291cmNlAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAADVJvdW5kUHJlQ2hlY2sAAAAAAAADAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAAloYXNfdmlkZW8AAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAK",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAAJRW1wdHlOYW1lAAAAAAAAAQAAAAAAAAANRW1wdHlPdmVydmlldwAAAAAAAAIAAAAAAAAADUVtcHR5Q29udGFjdHMAAAAAAAADAAAAAAAAAAtFbXB0eUFkbWlucwAAAAAEAAAAAAAAAA1FbXB0eUltYWdlVXJsAAAAAAAABQAAAAAAAAAQQWRtaW5Pck93bmVyT25seQAAAAYAAAAAAAAACU93bmVyT25seQAAAAAAAAcAAAAAAAAAEUNvbnRyYWN0T3duZXJPbmx5AAAAAAAACAAAAAAAAAAOQWxyZWFkeUFwcGxpZWQAAAAAAAkAAAAAAAAADERhdGFOb3RGb3VuZAAAAAoAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAACw==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAOY29udHJhY3Rfb3duZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAFYXBwbHkAAAAAAAACAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAA5wcm9qZWN0X3BhcmFtcwAAAAAH0AAAABNDcmVhdGVQcm9qZWN0UGFyYW1zAAAAAAEAAAfQAAAAB1Byb2plY3QA",
        "AAAAAAAAAAAAAAAOdXBkYXRlX3Byb2plY3QAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAASbmV3X3Byb2plY3RfcGFyYW1zAAAAAAfQAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAAAA==",
        "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAJbmV3X2FkbWluAAAAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAgAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAAPYWRtaW5fdG9fcmVtb3ZlAAAAABMAAAAA",
        "AAAAAAAAAAAAAAARZ2V0X3Byb2plY3RfYnlfaWQAAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAB9AAAAAHUHJvamVjdAA=",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAB1Byb2plY3QA",
        "AAAAAAAAAAAAAAASZ2V0X3Byb2plY3RfYWRtaW5zAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAA+oAAAAT",
        "AAAAAAAAAAAAAAASZ2V0X3RvdGFsX3Byb2plY3RzAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAABAAAAAAAAAA1uZXdfd2FzbV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAAaZ2V0X3Byb2plY3RfZnJvbV9hcHBsaWNhbnQAAAAAAAEAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAABAAAH0AAAAAdQcm9qZWN0AA==",
        "AAAAAAAAAAAAAAAFb3duZXIAAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAAMZ2V0X3ByZWNoZWNrAAAAAQAAAAAAAAAJYXBwbGljYW50AAAAAAAAEwAAAAEAAAPoAAAH0AAAAA1Sb3VuZFByZUNoZWNrAAAA",
        "AAAAAAAAAAAAAAASZ2V0X3ByZWNoZWNrX2J5X2lkAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAA+gAAAfQAAAADVJvdW5kUHJlQ2hlY2sAAAA=",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAAUAAAAAAAAAAAAAAA1OdW1PZlByb2plY3RzAAAAAAAAAAAAAAAAAAAIUHJvamVjdHMAAAABAAAAAAAAAAdQcm9qZWN0AAAAAAEAAAAKAAAAAAAAAAAAAAANUmVnaXN0cnlBZG1pbgAAAAAAAAEAAAAAAAAAFEFwcGxpY2FudFRvUHJvamVjdElEAAAAAQAAABM=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        apply: this.txFromJSON<Project>,
        update_project: this.txFromJSON<null>,
        add_admin: this.txFromJSON<null>,
        remove_admin: this.txFromJSON<null>,
        get_project_by_id: this.txFromJSON<Project>,
        get_projects: this.txFromJSON<Array<Project>>,
        get_project_admins: this.txFromJSON<Array<string>>,
        get_total_projects: this.txFromJSON<u32>,
        upgrade: this.txFromJSON<null>,
        get_project_from_applicant: this.txFromJSON<Project>,
        owner: this.txFromJSON<string>,
        get_precheck: this.txFromJSON<Option<RoundPreCheck>>,
        get_precheck_by_id: this.txFromJSON<Option<RoundPreCheck>>
  }
}