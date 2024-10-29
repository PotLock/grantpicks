import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions } from '@stellar/stellar-sdk/contract';
import type { u64, u128, Option } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CCHMRUHY7YNHTNBA72GG4HBBKB73R5HINOLG3ER74JHUZAS6GSBOXJMA";
    };
};
export type RegistrationStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Approved";
    values: void;
} | {
    tag: "Rejected";
    values: void;
} | {
    tag: "Graylisted";
    values: void;
} | {
    tag: "Blacklisted";
    values: void;
};
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
export type ContractKey = {
    tag: "ContractOwner";
    values: void;
} | {
    tag: "ListsNumber";
    values: void;
} | {
    tag: "Lists";
    values: readonly [u128];
} | {
    tag: "ListAdmins";
    values: readonly [u128];
} | {
    tag: "OwnedList";
    values: readonly [string];
} | {
    tag: "RegistrantList";
    values: readonly [string];
} | {
    tag: "RegistrationsNumber";
    values: void;
} | {
    tag: "Registrations";
    values: readonly [u128];
} | {
    tag: "ListRegistration";
    values: readonly [u128];
} | {
    tag: "RegistrationsIDs";
    values: readonly [string];
} | {
    tag: "Upvotes";
    values: readonly [u128];
} | {
    tag: "UserUpvotes";
    values: readonly [string];
};
export declare const Errors: {
    1: {
        message: string;
    };
    2: {
        message: string;
    };
    3: {
        message: string;
    };
    4: {
        message: string;
    };
    5: {
        message: string;
    };
    6: {
        message: string;
    };
    7: {
        message: string;
    };
    8: {
        message: string;
    };
    9: {
        message: string;
    };
    10: {
        message: string;
    };
    11: {
        message: string;
    };
    12: {
        message: string;
    };
    13: {
        message: string;
    };
    14: {
        message: string;
    };
    15: {
        message: string;
    };
    16: {
        message: string;
    };
    17: {
        message: string;
    };
};
export interface Client {
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    initialize: ({ owner }: {
        owner: string;
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
     * Construct and simulate a create_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_list: ({ owner, name, default_registration_status, description, cover_image_url, admins, admin_only_registrations }: {
        owner: string;
        name: string;
        default_registration_status: RegistrationStatus;
        description: Option<string>;
        cover_image_url: Option<string>;
        admins: Option<Array<string>>;
        admin_only_registrations: Option<boolean>;
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
    }) => Promise<AssembledTransaction<ListExternal>>;
    /**
     * Construct and simulate a update_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_list: ({ list_id, name, description, cover_image_url, remove_cover_image, default_registration_status, admin_only_registrations }: {
        list_id: u128;
        name: Option<string>;
        description: Option<string>;
        cover_image_url: Option<string>;
        remove_cover_image: Option<boolean>;
        default_registration_status: Option<RegistrationStatus>;
        admin_only_registrations: Option<boolean>;
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
    }) => Promise<AssembledTransaction<ListExternal>>;
    /**
     * Construct and simulate a delete_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    delete_list: ({ list_id }: {
        list_id: u128;
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
     * Construct and simulate a upvote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upvote: ({ voter, list_id }: {
        voter: string;
        list_id: u128;
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
     * Construct and simulate a remove_upvote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_upvote: ({ voter, list_id }: {
        voter: string;
        list_id: u128;
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
    transfer_ownership: ({ list_id, new_owner_id }: {
        list_id: u128;
        new_owner_id: string;
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
    }) => Promise<AssembledTransaction<string>>;
    /**
     * Construct and simulate a add_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_admins: ({ list_id, admins }: {
        list_id: u128;
        admins: Array<string>;
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
    }) => Promise<AssembledTransaction<Array<string>>>;
    /**
     * Construct and simulate a remove_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_admins: ({ list_id, admins }: {
        list_id: u128;
        admins: Array<string>;
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
    }) => Promise<AssembledTransaction<Array<string>>>;
    /**
     * Construct and simulate a clear_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    clear_admins: ({ list_id }: {
        list_id: u128;
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
     * Construct and simulate a register_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    register_batch: ({ submitter, list_id, notes, registrations }: {
        submitter: string;
        list_id: u128;
        notes: Option<string>;
        registrations: Option<Array<RegistrationInput>>;
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
    }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>;
    /**
     * Construct and simulate a unregister transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    unregister: ({ submitter, list_id, registration_id }: {
        submitter: string;
        list_id: Option<u128>;
        registration_id: Option<u128>;
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
     * Construct and simulate a update_registration transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_registration: ({ submitter, list_id, registration_id, status, notes }: {
        submitter: string;
        list_id: u128;
        registration_id: u128;
        status: RegistrationStatus;
        notes: Option<string>;
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
    }) => Promise<AssembledTransaction<RegistrationExternal>>;
    /**
     * Construct and simulate a get_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_list: ({ list_id }: {
        list_id: u128;
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
    }) => Promise<AssembledTransaction<ListExternal>>;
    /**
     * Construct and simulate a get_lists transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_lists: ({ from_index, limit }: {
        from_index: Option<u64>;
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
    }) => Promise<AssembledTransaction<Array<ListExternal>>>;
    /**
     * Construct and simulate a get_lists_for_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_lists_for_owner: ({ owner_id }: {
        owner_id: string;
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
    }) => Promise<AssembledTransaction<Array<ListExternal>>>;
    /**
     * Construct and simulate a get_lists_for_registrant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_lists_for_registrant: ({ registrant_id }: {
        registrant_id: string;
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
    }) => Promise<AssembledTransaction<Array<ListExternal>>>;
    /**
     * Construct and simulate a get_upvotes_for_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_upvotes_for_list: ({ list_id, from_index, limit }: {
        list_id: u128;
        from_index: Option<u64>;
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
    }) => Promise<AssembledTransaction<Array<string>>>;
    /**
     * Construct and simulate a get_upvoted_lists_for_account transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_upvoted_lists_for_account: ({ user, from_index, limit }: {
        user: string;
        from_index: Option<u64>;
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
    }) => Promise<AssembledTransaction<Array<ListExternal>>>;
    /**
     * Construct and simulate a get_registration transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_registration: ({ registration_id }: {
        registration_id: u128;
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
    }) => Promise<AssembledTransaction<RegistrationExternal>>;
    /**
     * Construct and simulate a get_registrations_for_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_registrations_for_list: ({ list_id, required_status, from_index, limit }: {
        list_id: u128;
        required_status: Option<RegistrationStatus>;
        from_index: Option<u64>;
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
    }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>;
    /**
     * Construct and simulate a get_registrations_for_registrant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_registrations_for_registrant: ({ registrant_id, required_status, from_index, limit }: {
        registrant_id: string;
        required_status: Option<RegistrationStatus>;
        from_index: Option<u64>;
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
    }) => Promise<AssembledTransaction<Array<RegistrationExternal>>>;
    /**
     * Construct and simulate a is_registered transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    is_registered: ({ list_id, registrant_id, required_status }: {
        list_id: Option<u128>;
        registrant_id: string;
        required_status: Option<RegistrationStatus>;
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
    }) => Promise<AssembledTransaction<boolean>>;
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
    upgrade: ({ wasm_hash }: {
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
     * Construct and simulate a admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    admins: ({ list_id }: {
        list_id: u128;
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
    }) => Promise<AssembledTransaction<Array<string>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        initialize: (json: string) => AssembledTransaction<null>;
        create_list: (json: string) => AssembledTransaction<ListExternal>;
        update_list: (json: string) => AssembledTransaction<ListExternal>;
        delete_list: (json: string) => AssembledTransaction<null>;
        upvote: (json: string) => AssembledTransaction<null>;
        remove_upvote: (json: string) => AssembledTransaction<null>;
        transfer_ownership: (json: string) => AssembledTransaction<string>;
        add_admins: (json: string) => AssembledTransaction<string[]>;
        remove_admins: (json: string) => AssembledTransaction<string[]>;
        clear_admins: (json: string) => AssembledTransaction<null>;
        register_batch: (json: string) => AssembledTransaction<RegistrationExternal[]>;
        unregister: (json: string) => AssembledTransaction<null>;
        update_registration: (json: string) => AssembledTransaction<RegistrationExternal>;
        get_list: (json: string) => AssembledTransaction<ListExternal>;
        get_lists: (json: string) => AssembledTransaction<ListExternal[]>;
        get_lists_for_owner: (json: string) => AssembledTransaction<ListExternal[]>;
        get_lists_for_registrant: (json: string) => AssembledTransaction<ListExternal[]>;
        get_upvotes_for_list: (json: string) => AssembledTransaction<string[]>;
        get_upvoted_lists_for_account: (json: string) => AssembledTransaction<ListExternal[]>;
        get_registration: (json: string) => AssembledTransaction<RegistrationExternal>;
        get_registrations_for_list: (json: string) => AssembledTransaction<RegistrationExternal[]>;
        get_registrations_for_registrant: (json: string) => AssembledTransaction<RegistrationExternal[]>;
        is_registered: (json: string) => AssembledTransaction<boolean>;
        owner: (json: string) => AssembledTransaction<string>;
        upgrade: (json: string) => AssembledTransaction<null>;
        admins: (json: string) => AssembledTransaction<string[]>;
    };
}
