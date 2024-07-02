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
    contractId: "CBIUXTSMVYCWXOUOYHTCMG4JENHVSA4YJ64PZNFWRE4JVWLO6E4DKCIJ",
  }
} as const

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
  submited_at: u64;
  team_members: Array<ProjectTeamMember>;
  updated_at: Option<u64>;
}


export interface ProjectParams {
  admins: Array<string>;
  contacts: Array<ProjectContact>;
  contracts: Array<ProjectContract>;
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
  image_url: string;
  name: string;
  role: string;
}


export interface ProjectRepository {
  label: string;
  url: string;
}

export type ContractKey = {tag: "NumOfProjects", values: void} | {tag: "Projects", values: void} | {tag: "RegistryAdmin", values: void};

export const Errors = {
  
}

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
  apply: ({applicant, project_params}: {applicant: string, project_params: ProjectParams}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a change_project_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  change_project_status: ({contract_owner, project_id, new_status}: {contract_owner: string, project_id: u128, new_status: ProjectStatus}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  add_admin: ({admin, project_id, new_admin}: {admin: string, project_id: u128, new_admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  remove_admin: ({admin, project_id, admin_to_remove}: {admin: string, project_id: u128, admin_to_remove: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  }) => Promise<AssembledTransaction<Option<Project>>>

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
   * Construct and simulate a owner_get transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.   *
   * Returns the owner of the contract
   */
  owner_get: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<string>>>

  /**
   * Construct and simulate a owner_set transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.   *
   * Sets the owner of the contract. If one already set it transfers it to the new owner, if signed by owner.
   */
  owner_set: ({new_owner}: {new_owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a redeploy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.   *
   * Redeploy the contract to a Wasm hash
   */
  redeploy: ({wasm_hash}: {wasm_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAgAAAAAAAAAAAAAADVByb2plY3RTdGF0dXMAAAAAAAAEAAAAAAAAAAAAAAADTmV3AAAAAAAAAAAAAAAACEFwcHJvdmVkAAAAAAAAAAAAAAAIUmVqZWN0ZWQAAAAAAAAAAAAAAAlDb21wbGV0ZWQAAAA=",
        "AAAAAQAAAAAAAAAAAAAAB1Byb2plY3QAAAAADgAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAJpZAAAAAAACgAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAACG92ZXJ2aWV3AAAAEAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAABnN0YXR1cwAAAAAH0AAAAA1Qcm9qZWN0U3RhdHVzAAAAAAAAAAAAAAtzdWJtaXRlZF9hdAAAAAAGAAAAAAAAAAx0ZWFtX21lbWJlcnMAAAPqAAAH0AAAABFQcm9qZWN0VGVhbU1lbWJlcgAAAAAAAAAAAAAKdXBkYXRlZF9hdAAAAAAD6AAAAAY=",
        "AAAAAQAAAAAAAAAAAAAADVByb2plY3RQYXJhbXMAAAAAAAAJAAAAAAAAAAZhZG1pbnMAAAAAA+oAAAATAAAAAAAAAAhjb250YWN0cwAAA+oAAAfQAAAADlByb2plY3RDb250YWN0AAAAAAAAAAAACWNvbnRyYWN0cwAAAAAAA+oAAAfQAAAAD1Byb2plY3RDb250cmFjdAAAAAAAAAAACWltYWdlX3VybAAAAAAAABAAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAhvdmVydmlldwAAABAAAAAAAAAADnBheW91dF9hZGRyZXNzAAAAAAATAAAAAAAAAAxyZXBvc2l0b3JpZXMAAAPqAAAH0AAAABFQcm9qZWN0UmVwb3NpdG9yeQAAAAAAAAAAAAAMdGVhbV9tZW1iZXJzAAAD6gAAB9AAAAARUHJvamVjdFRlYW1NZW1iZXIAAAA=",
        "AAAAAQAAAAAAAAAAAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAACAAAAAAAAAAIY29udGFjdHMAAAPqAAAH0AAAAA5Qcm9qZWN0Q29udGFjdAAAAAAAAAAAAAljb250cmFjdHMAAAAAAAPqAAAH0AAAAA9Qcm9qZWN0Q29udHJhY3QAAAAAAAAAAAlpbWFnZV91cmwAAAAAAAAQAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAIb3ZlcnZpZXcAAAAQAAAAAAAAAA5wYXlvdXRfYWRkcmVzcwAAAAAAEwAAAAAAAAAMcmVwb3NpdG9yaWVzAAAD6gAAB9AAAAARUHJvamVjdFJlcG9zaXRvcnkAAAAAAAAAAAAADHRlYW1fbWVtYmVycwAAA+oAAAfQAAAAEVByb2plY3RUZWFtTWVtYmVyAAAA",
        "AAAAAQAAAAAAAAAAAAAADlByb2plY3RDb250YWN0AAAAAAACAAAAAAAAAARuYW1lAAAAEAAAAAAAAAAFdmFsdWUAAAAAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAD1Byb2plY3RDb250cmFjdAAAAAACAAAAAAAAABBjb250cmFjdF9hZGRyZXNzAAAAEwAAAAAAAAAEbmFtZQAAABA=",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RUZWFtTWVtYmVyAAAAAAAAAwAAAAAAAAAJaW1hZ2VfdXJsAAAAAAAAEAAAAAAAAAAEbmFtZQAAABAAAAAAAAAABHJvbGUAAAAQ",
        "AAAAAQAAAAAAAAAAAAAAEVByb2plY3RSZXBvc2l0b3J5AAAAAAAAAgAAAAAAAAAFbGFiZWwAAAAAAAAQAAAAAAAAAAN1cmwAAAAAEA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAOY29udHJhY3Rfb3duZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAFYXBwbHkAAAAAAAACAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAA5wcm9qZWN0X3BhcmFtcwAAAAAH0AAAAA1Qcm9qZWN0UGFyYW1zAAAAAAAAAQAAB9AAAAAHUHJvamVjdAA=",
        "AAAAAAAAAAAAAAAVY2hhbmdlX3Byb2plY3Rfc3RhdHVzAAAAAAAAAwAAAAAAAAAOY29udHJhY3Rfb3duZXIAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAACm5ld19zdGF0dXMAAAAAB9AAAAANUHJvamVjdFN0YXR1cwAAAAAAAAA=",
        "AAAAAAAAAAAAAAAOdXBkYXRlX3Byb2plY3QAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAASbmV3X3Byb2plY3RfcGFyYW1zAAAAAAfQAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAAAA==",
        "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAA9hZG1pbl90b19yZW1vdmUAAAAAEwAAAAA=",
        "AAAAAAAAAAAAAAARZ2V0X3Byb2plY3RfYnlfaWQAAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAA+gAAAfQAAAAB1Byb2plY3QA",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAB1Byb2plY3QA",
        "AAAAAAAAAAAAAAASZ2V0X3Byb2plY3RfYWRtaW5zAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAA+oAAAAT",
        "AAAAAAAAAAAAAAASZ2V0X3RvdGFsX3Byb2plY3RzAAAAAAAAAAAAAQAAAAQ=",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAAMAAAAAAAAAAAAAAA1OdW1PZlByb2plY3RzAAAAAAAAAAAAAAAAAAAIUHJvamVjdHMAAAAAAAAAAAAAAA1SZWdpc3RyeUFkbWluAAAA",
        "AAAAAAAAACFSZXR1cm5zIHRoZSBvd25lciBvZiB0aGUgY29udHJhY3QAAAAAAAAJb3duZXJfZ2V0AAAAAAAAAAAAAAEAAAPoAAAAEw==",
        "AAAAAAAAAGhTZXRzIHRoZSBvd25lciBvZiB0aGUgY29udHJhY3QuIElmIG9uZSBhbHJlYWR5IHNldCBpdCB0cmFuc2ZlcnMgaXQgdG8gdGhlIG5ldyBvd25lciwgaWYgc2lnbmVkIGJ5IG93bmVyLgAAAAlvd25lcl9zZXQAAAAAAAABAAAAAAAAAAluZXdfb3duZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAACRSZWRlcGxveSB0aGUgY29udHJhY3QgdG8gYSBXYXNtIGhhc2gAAAAIcmVkZXBsb3kAAAABAAAAAAAAAAl3YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        apply: this.txFromJSON<Project>,
        change_project_status: this.txFromJSON<null>,
        update_project: this.txFromJSON<null>,
        add_admin: this.txFromJSON<null>,
        remove_admin: this.txFromJSON<null>,
        get_project_by_id: this.txFromJSON<Option<Project>>,
        get_projects: this.txFromJSON<Array<Project>>,
        get_project_admins: this.txFromJSON<Array<string>>,
        get_total_projects: this.txFromJSON<u32>,
        owner_get: this.txFromJSON<Option<string>>,
        owner_set: this.txFromJSON<null>,
        redeploy: this.txFromJSON<null>
  }
}