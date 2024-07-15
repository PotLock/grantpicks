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
    contractId: "CDJQCGNDMB7OVPRD7NLIUKTGUAMADKFYWPORHIPPF4FCPJIZOPPPRA4O",
  }
} as const

export type RegistrationStatus = {tag: "Pending", values: void} | {tag: "Approved", values: void} | {tag: "Rejected", values: void} | {tag: "Graylisted", values: void} | {tag: "Blacklisted", values: void};


export interface ListInternal {
  admin_only_registration: boolean;
  cover_image_url: string;
  created_ms: u64;
  default_registration_status: RegistrationStatus;
  description: string;
  id: u128;
  name: string;
  owner: string;
  updated_ms: u64;
}


export interface RegistrationInternal {
  admin_notes: string;
  id: u128;
  list_id: u128;
  registered_by: string;
  registrant_id: string;
  registrant_notes: string;
  status: RegistrationStatus;
  submited_ms: u64;
  updated_ms: u64;
}


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


export interface RegistrationExternal {
  admin_notes: string;
  id: u128;
  list_id: u128;
  registered_by: string;
  registrant_id: string;
  registrant_notes: string;
  status: RegistrationStatus;
  submitted_ms: u64;
  updated_ms: u64;
}


export interface RegistrationInput {
  notes: string;
  registrant: string;
  status: RegistrationStatus;
  submitted_ms: Option<u64>;
  updated_ms: Option<u64>;
}

export type ContractKey = {tag: "ContractOwner", values: void} | {tag: "ListsNumber", values: void} | {tag: "Lists", values: void} | {tag: "ListAdmins", values: void} | {tag: "OwnedList", values: void} | {tag: "RegistrantList", values: void} | {tag: "RegistrationsNumber", values: void} | {tag: "Registrations", values: void} | {tag: "ListRegistration", values: void} | {tag: "RegistrationsIDs", values: void} | {tag: "Upvotes", values: void} | {tag: "UserUpvotes", values: void};

export const Errors = {
  
}

export interface Client {
  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  initialize: ({owner}: {owner: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a create_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_list: ({owner, name, default_registration_status, description, cover_image_url, admins, admin_only_registrations}: {owner: string, name: string, default_registration_status: RegistrationStatus, description: Option<string>, cover_image_url: Option<string>, admins: Option<Array<string>>, admin_only_registrations: Option<boolean>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<ListExternal>>

  /**
   * Construct and simulate a update_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_list: ({owner, list_id, name, description, cover_image_url, remove_cover_image, default_registration_status, admin_only_registrations}: {owner: string, list_id: u128, name: Option<string>, description: Option<string>, cover_image_url: Option<string>, remove_cover_image: Option<boolean>, default_registration_status: Option<RegistrationStatus>, admin_only_registrations: Option<boolean>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<ListExternal>>

  /**
   * Construct and simulate a delete_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  delete_list: ({owner, list_id}: {owner: string, list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a upvote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upvote: ({voter, list_id}: {voter: string, list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a remove_upvote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_upvote: ({voter, list_id}: {voter: string, list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  transfer_ownership: ({owner, list_id, new_owner_id}: {owner: string, list_id: u128, new_owner_id: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a add_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  add_admins: ({owner, list_id, admins}: {owner: string, list_id: u128, admins: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a remove_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_admins: ({owner, list_id, admins}: {owner: string, list_id: u128, admins: Array<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a clear_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  clear_admins: ({owner, list_id}: {owner: string, list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a register_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  register_batch: ({submitter, list_id, notes, registrations}: {submitter: string, list_id: u128, notes: Option<string>, registrations: Option<Array<RegistrationInput>>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>

  /**
   * Construct and simulate a unregister transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  unregister: ({submitter, list_id, registration_id}: {submitter: string, list_id: Option<u128>, registration_id: Option<u128>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a update_registration transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  update_registration: ({submitter, list_id, registration_id, status, notes}: {submitter: string, list_id: u128, registration_id: u128, status: RegistrationStatus, notes: Option<string>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RegistrationExternal>>

  /**
   * Construct and simulate a get_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_list: ({list_id}: {list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<ListExternal>>

  /**
   * Construct and simulate a get_lists transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_lists: ({from_index, limit}: {from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ListExternal>>>

  /**
   * Construct and simulate a get_lists_for_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_lists_for_owner: ({owner_id}: {owner_id: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ListExternal>>>

  /**
   * Construct and simulate a get_lists_for_registrant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_lists_for_registrant: ({registrant_id}: {registrant_id: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ListExternal>>>

  /**
   * Construct and simulate a get_upvotes_for_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_upvotes_for_list: ({list_id, from_index, limit}: {list_id: u128, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a get_upvoted_lists_for_account transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_upvoted_lists_for_account: ({user, from_index, limit}: {user: string, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ListExternal>>>

  /**
   * Construct and simulate a get_registration transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_registration: ({registration_id}: {registration_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<RegistrationExternal>>

  /**
   * Construct and simulate a get_registrations_for_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_registrations_for_list: ({list_id, required_status, from_index, limit}: {list_id: u128, required_status: Option<RegistrationStatus>, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>

  /**
   * Construct and simulate a get_registrations_for_registrant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_registrations_for_registrant: ({registrant_id, required_status, from_index, limit}: {registrant_id: string, required_status: Option<RegistrationStatus>, from_index: Option<u64>, limit: Option<u64>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>

  /**
   * Construct and simulate a is_registered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  is_registered: ({list_id, registrant_id, required_status}: {list_id: Option<u128>, registrant_id: string, required_status: Option<RegistrationStatus>}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
   * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  upgrade: ({owner, wasm_hash}: {owner: string, wasm_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
  admins: ({list_id}: {list_id: u128}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
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
      new ContractSpec([ "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",
        "AAAAAAAAAAAAAAALZGVsZXRlX2xpc3QAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAAA",
        "AAAAAAAAAAAAAAAGdXB2b3RlAAAAAAACAAAAAAAAAAV2b3RlcgAAAAAAABMAAAAAAAAAB2xpc3RfaWQAAAAACgAAAAA=",
        "AAAAAAAAAAAAAAANcmVtb3ZlX3Vwdm90ZQAAAAAAAAIAAAAAAAAABXZvdGVyAAAAAAAAEwAAAAAAAAAHbGlzdF9pZAAAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAASdHJhbnNmZXJfb3duZXJzaGlwAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAB2xpc3RfaWQAAAAACgAAAAAAAAAMbmV3X293bmVyX2lkAAAAEwAAAAEAAAAT",
        "AAAAAAAAAAAAAAAKYWRkX2FkbWlucwAAAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAAAAAAABmFkbWlucwAAAAAD6gAAABMAAAABAAAD6gAAABM=",
        "AAAAAAAAAAAAAAANcmVtb3ZlX2FkbWlucwAAAAAAAAMAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAHbGlzdF9pZAAAAAAKAAAAAAAAAAZhZG1pbnMAAAAAA+oAAAATAAAAAQAAA+oAAAAT",
        "AAAAAAAAAAAAAAAMY2xlYXJfYWRtaW5zAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAAA",
        "AAAAAAAAAAAAAAAOcmVnaXN0ZXJfYmF0Y2gAAAAAAAQAAAAAAAAACXN1Ym1pdHRlcgAAAAAAABMAAAAAAAAAB2xpc3RfaWQAAAAACgAAAAAAAAAFbm90ZXMAAAAAAAPoAAAAEAAAAAAAAAANcmVnaXN0cmF0aW9ucwAAAAAAA+gAAAPqAAAH0AAAABFSZWdpc3RyYXRpb25JbnB1dAAAAAAAAAEAAAPqAAAH0AAAABRSZWdpc3RyYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAAKdW5yZWdpc3RlcgAAAAAAAwAAAAAAAAAJc3VibWl0dGVyAAAAAAAAEwAAAAAAAAAHbGlzdF9pZAAAAAPoAAAACgAAAAAAAAAPcmVnaXN0cmF0aW9uX2lkAAAAA+gAAAAKAAAAAA==",
        "AAAAAAAAAAAAAAATdXBkYXRlX3JlZ2lzdHJhdGlvbgAAAAAFAAAAAAAAAAlzdWJtaXR0ZXIAAAAAAAATAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAAAAAAAD3JlZ2lzdHJhdGlvbl9pZAAAAAAKAAAAAAAAAAZzdGF0dXMAAAAAB9AAAAASUmVnaXN0cmF0aW9uU3RhdHVzAAAAAAAAAAAABW5vdGVzAAAAAAAD6AAAABAAAAABAAAH0AAAABRSZWdpc3RyYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAAIZ2V0X2xpc3QAAAABAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAABAAAH0AAAAAxMaXN0RXh0ZXJuYWw=",
        "AAAAAAAAAAAAAAAJZ2V0X2xpc3RzAAAAAAAAAgAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAAMTGlzdEV4dGVybmFs",
        "AAAAAAAAAAAAAAATZ2V0X2xpc3RzX2Zvcl9vd25lcgAAAAABAAAAAAAAAAhvd25lcl9pZAAAABMAAAABAAAD6gAAB9AAAAAMTGlzdEV4dGVybmFs",
        "AAAAAAAAAAAAAAAYZ2V0X2xpc3RzX2Zvcl9yZWdpc3RyYW50AAAAAQAAAAAAAAANcmVnaXN0cmFudF9pZAAAAAAAABMAAAABAAAD6gAAB9AAAAAMTGlzdEV4dGVybmFs",
        "AAAAAAAAAAAAAAAUZ2V0X3Vwdm90ZXNfZm9yX2xpc3QAAAADAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAAAAAAACmZyb21faW5kZXgAAAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAAT",
        "AAAAAAAAAAAAAAAdZ2V0X3Vwdm90ZWRfbGlzdHNfZm9yX2FjY291bnQAAAAAAAADAAAAAAAAAAR1c2VyAAAAEwAAAAAAAAAKZnJvbV9pbmRleAAAAAAD6AAAAAYAAAAAAAAABWxpbWl0AAAAAAAD6AAAAAYAAAABAAAD6gAAB9AAAAAMTGlzdEV4dGVybmFs",
        "AAAAAAAAAAAAAAAQZ2V0X3JlZ2lzdHJhdGlvbgAAAAEAAAAAAAAAD3JlZ2lzdHJhdGlvbl9pZAAAAAAKAAAAAQAAB9AAAAAUUmVnaXN0cmF0aW9uRXh0ZXJuYWw=",
        "AAAAAAAAAAAAAAAaZ2V0X3JlZ2lzdHJhdGlvbnNfZm9yX2xpc3QAAAAAAAQAAAAAAAAAB2xpc3RfaWQAAAAACgAAAAAAAAAPcmVxdWlyZWRfc3RhdHVzAAAAA+gAAAfQAAAAElJlZ2lzdHJhdGlvblN0YXR1cwAAAAAAAAAAAApmcm9tX2luZGV4AAAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAABRSZWdpc3RyYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAAgZ2V0X3JlZ2lzdHJhdGlvbnNfZm9yX3JlZ2lzdHJhbnQAAAAEAAAAAAAAAA1yZWdpc3RyYW50X2lkAAAAAAAAEwAAAAAAAAAPcmVxdWlyZWRfc3RhdHVzAAAAA+gAAAfQAAAAElJlZ2lzdHJhdGlvblN0YXR1cwAAAAAAAAAAAApmcm9tX2luZGV4AAAAAAPoAAAABgAAAAAAAAAFbGltaXQAAAAAAAPoAAAABgAAAAEAAAPqAAAH0AAAABRSZWdpc3RyYXRpb25FeHRlcm5hbA==",
        "AAAAAAAAAAAAAAANaXNfcmVnaXN0ZXJlZAAAAAAAAAMAAAAAAAAAB2xpc3RfaWQAAAAD6AAAAAoAAAAAAAAADXJlZ2lzdHJhbnRfaWQAAAAAAAATAAAAAAAAAA9yZXF1aXJlZF9zdGF0dXMAAAAD6AAAB9AAAAASUmVnaXN0cmF0aW9uU3RhdHVzAAAAAAABAAAAAQ==",
        "AAAAAAAAAAAAAAAFb3duZXIAAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACXdhc21faGFzaAAAAAAAA+4AAAAgAAAAAA==",
        "AAAAAAAAAAAAAAAGYWRtaW5zAAAAAAABAAAAAAAAAAdsaXN0X2lkAAAAAAoAAAABAAAD6gAAABM=",
        "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAAwAAAAAAAAAAAAAAA1Db250cmFjdE93bmVyAAAAAAAAAAAAAAAAAAALTGlzdHNOdW1iZXIAAAAAAAAAAAAAAAAFTGlzdHMAAAAAAAAAAAAAAAAAAApMaXN0QWRtaW5zAAAAAAAAAAAAAAAAAAlPd25lZExpc3QAAAAAAAAAAAAAAAAAAA5SZWdpc3RyYW50TGlzdAAAAAAAAAAAAAAAAAATUmVnaXN0cmF0aW9uc051bWJlcgAAAAAAAAAAAAAAAA1SZWdpc3RyYXRpb25zAAAAAAAAAAAAAAAAAAAQTGlzdFJlZ2lzdHJhdGlvbgAAAAAAAAAAAAAAEFJlZ2lzdHJhdGlvbnNJRHMAAAAAAAAAAAAAAAdVcHZvdGVzAAAAAAAAAAAAAAAAC1VzZXJVcHZvdGVzAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    initialize: this.txFromJSON<null>,
        create_list: this.txFromJSON<ListExternal>,
        update_list: this.txFromJSON<ListExternal>,
        delete_list: this.txFromJSON<null>,
        upvote: this.txFromJSON<null>,
        remove_upvote: this.txFromJSON<null>,
        transfer_ownership: this.txFromJSON<string>,
        add_admins: this.txFromJSON<Array<string>>,
        remove_admins: this.txFromJSON<Array<string>>,
        clear_admins: this.txFromJSON<null>,
        register_batch: this.txFromJSON<Array<RegistrationExternal>>,
        unregister: this.txFromJSON<null>,
        update_registration: this.txFromJSON<RegistrationExternal>,
        get_list: this.txFromJSON<ListExternal>,
        get_lists: this.txFromJSON<Array<ListExternal>>,
        get_lists_for_owner: this.txFromJSON<Array<ListExternal>>,
        get_lists_for_registrant: this.txFromJSON<Array<ListExternal>>,
        get_upvotes_for_list: this.txFromJSON<Array<string>>,
        get_upvoted_lists_for_account: this.txFromJSON<Array<ListExternal>>,
        get_registration: this.txFromJSON<RegistrationExternal>,
        get_registrations_for_list: this.txFromJSON<Array<RegistrationExternal>>,
        get_registrations_for_registrant: this.txFromJSON<Array<RegistrationExternal>>,
        is_registered: this.txFromJSON<boolean>,
        owner: this.txFromJSON<string>,
        upgrade: this.txFromJSON<null>,
        admins: this.txFromJSON<Array<string>>
  }
}