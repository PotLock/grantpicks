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
    contractId: "CACV6DZCROHXP4D35OJM4V3CR2QWEITGEI742NMVXKM4Z3R4LIAFAO6L",
  }
} as const


export interface RoundInfo {
  contract_address: string;
  round_id: u128;
}


export interface RoundInfoWithDetail {
  contract_address: string;
  detail: RoundDetail;
  round_id: u128;
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


export interface Contact {
  name: string;
  value: string;
}

export type ContractKey = {tag: "RoundNumber", values: void} | {tag: "Rounds", values: void} | {tag: "Admin", values: void} | {tag: "Owner", values: void} | {tag: "Wasm", values: void} | {tag: "TokenContract", values: void} | {tag: "ProjectContract", values: void};


export interface RCCreateParams {
  admins: Array<string>;
  application_end_ms: u64;
  application_start_ms: u64;
  contacts: Array<RCContact>;
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


export interface RCContact {
  name: string;
  value: string;
}


export interface RoundDetail {
  admins: Array<string>;
  application_end_ms: u64;
  application_start_ms: u64;
  contacts: Array<RCContact>;
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

export const Errors = {
  
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({owner, token_address, registry_address, wasm_hash}: {owner: string, token_address: string, registry_address: string, wasm_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  create_round: ({admin, params}: {admin: string, params: CreateRoundParams}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RoundInfo>>

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
  }) => Promise<AssembledTransaction<Array<RoundInfoWithDetail>>>

  /**
   * Construct and simulate a add_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_admin: ({owner, admin}: {owner: string, admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a remove_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_admin: ({owner, admin}: {owner: string, admin: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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

}
export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAACVJvdW5kSW5mbwAAAAAAAAIAAAAAAAAAEGNvbnRyYWN0X2FkZHJlc3MAAAATAAAAAAAAAAhyb3VuZF9pZAAAAAo=",
        "AAAAAQAAAAAAAAAAAAAAE1JvdW5kSW5mb1dpdGhEZXRhaWwAAAAAAwAAAAAAAAAQY29udHJhY3RfYWRkcmVzcwAAABMAAAAAAAAABmRldGFpbAAAAAAH0AAAAAtSb3VuZERldGFpbAAAAAAAAAAACHJvdW5kX2lkAAAACg==",
        "AAAAAQAAAAAAAAAAAAAAEUNyZWF0ZVJvdW5kUGFyYW1zAAAAAAAADQAAAAAAAAAGYWRtaW5zAAAAAAPqAAAAEwAAAAAAAAASYXBwbGljYXRpb25fZW5kX21zAAAAAAAGAAAAAAAAABRhcHBsaWNhdGlvbl9zdGFydF9tcwAAAAYAAAAAAAAACGNvbnRhY3RzAAAD6gAAB9AAAAAHQ29udGFjdAAAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAD2V4cGVjdGVkX2Ftb3VudAAAAAAKAAAAAAAAABBtYXhfcGFydGljaXBhbnRzAAAD6AAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAABNudW1fcGlja3NfcGVyX3ZvdGVyAAAAA+gAAAAEAAAAAAAAAA11c2Vfd2hpdGVsaXN0AAAAAAAD6AAAAAEAAAAAAAAACXZpZGVvX3VybAAAAAAAABAAAAAAAAAADXZvdGluZ19lbmRfbXMAAAAAAAAGAAAAAAAAAA92b3Rpbmdfc3RhcnRfbXMAAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAB0NvbnRhY3QAAAAAAgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABXZhbHVlAAAAAAAAEA==",
        "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA10b2tlbl9hZGRyZXNzAAAAAAAAEwAAAAAAAAAQcmVnaXN0cnlfYWRkcmVzcwAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3JvdW5kAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAZwYXJhbXMAAAAAB9AAAAARQ3JlYXRlUm91bmRQYXJhbXMAAAAAAAABAAAH0AAAAAlSb3VuZEluZm8AAAA=",
        "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" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_round: this.txFromJSON<RoundInfo>,
        get_rounds: this.txFromJSON<Array<RoundInfoWithDetail>>,
        add_admin: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<null>,
        remove_admin: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>,
        owner: this.txFromJSON<string>
  }
}