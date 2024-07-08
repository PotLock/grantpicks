/// <reference types="node" resolution-mode="require"/>
import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, u128, Option } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CCAMKPINOH75XFIZK5GKHWZJ5S45ZWFPL4O7L26QGS7ZYBCM62FU6EGX";
    };
};
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
export type ContractKey = {
    tag: "RoundNumber";
    values: void;
} | {
    tag: "Rounds";
    values: void;
} | {
    tag: "Admin";
    values: void;
} | {
    tag: "Owner";
    values: void;
} | {
    tag: "Wasm";
    values: void;
} | {
    tag: "TokenContract";
    values: void;
} | {
    tag: "ProjectContract";
    values: void;
};
export declare const Errors: {};
export interface Client {
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    initialize: ({ owner, token_address, registry_address, wasm_hash }: {
        owner: string;
        token_address: string;
        registry_address: string;
        wasm_hash: Buffer;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a create_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_round: ({ admin, params }: {
        admin: string;
        params: CreateRoundParams;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<RoundInfo>>;
    /**
     * Construct and simulate a get_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_rounds: ({ skip, limit }: {
        skip: Option<u64>;
        limit: Option<u64>;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<Array<RoundInfoWithDetail>>>;
    /**
     * Construct and simulate a add_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_admin: ({ owner, admin }: {
        owner: string;
        admin: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a transfer_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    transfer_ownership: ({ owner, new_owner }: {
        owner: string;
        new_owner: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a remove_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_admin: ({ owner, admin }: {
        owner: string;
        admin: string;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
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
    }) => Promise<AssembledTransaction<Array<string>>>;
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ owner, new_wasm_hash }: {
        owner: string;
        new_wasm_hash: Buffer;
    }, options?: {
        /**
         * The fee to pay for the transaction. Default: BASE_FEE
         */
        fee?: number;
        /**
         * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
         */
        timeoutInSeconds?: number;
        /**
         * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
         */
        simulate?: boolean;
    }) => Promise<AssembledTransaction<null>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        initialize: (json: string) => AssembledTransaction<null>;
        create_round: (json: string) => AssembledTransaction<RoundInfo>;
        get_rounds: (json: string) => AssembledTransaction<RoundInfoWithDetail[]>;
        add_admin: (json: string) => AssembledTransaction<null>;
        transfer_ownership: (json: string) => AssembledTransaction<null>;
        remove_admin: (json: string) => AssembledTransaction<null>;
        admins: (json: string) => AssembledTransaction<string[]>;
        owner: (json: string) => AssembledTransaction<string>;
        upgrade: (json: string) => AssembledTransaction<null>;
    };
}
