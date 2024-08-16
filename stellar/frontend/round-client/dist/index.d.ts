/// <reference types="node" resolution-mode="require"/>
import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions } from '@stellar/stellar-sdk/contract';
import type { u32, u64, u128, i128, Option } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CA7DK6V6HIZO63PXGD43ZAC34UCE5ZR3TVPKQ576VGDM6YNNXWM3SMZQ";
    };
};
export type ApplicationStatus = {
    tag: "Pending";
    values: void;
} | {
    tag: "Approved";
    values: void;
} | {
    tag: "Rejected";
    values: void;
} | {
    tag: "Blacklisted";
    values: void;
};
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
    use_vault: Option<boolean>;
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
    use_vault: Option<boolean>;
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
    use_vault: Option<boolean>;
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
export declare const Errors: {
    5: {
        message: string;
    };
    26: {
        message: string;
    };
    31: {
        message: string;
    };
    32: {
        message: string;
    };
    38: {
        message: string;
    };
    52: {
        message: string;
    };
    0: {
        message: string;
    };
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
    8: {
        message: string;
    };
    19: {
        message: string;
    };
    20: {
        message: string;
    };
    21: {
        message: string;
    };
    22: {
        message: string;
    };
    23: {
        message: string;
    };
    27: {
        message: string;
    };
    28: {
        message: string;
    };
    29: {
        message: string;
    };
    34: {
        message: string;
    };
    35: {
        message: string;
    };
    36: {
        message: string;
    };
    37: {
        message: string;
    };
    39: {
        message: string;
    };
    40: {
        message: string;
    };
    41: {
        message: string;
    };
    44: {
        message: string;
    };
    45: {
        message: string;
    };
    46: {
        message: string;
    };
    47: {
        message: string;
    };
    48: {
        message: string;
    };
    49: {
        message: string;
    };
    50: {
        message: string;
    };
    51: {
        message: string;
    };
    53: {
        message: string;
    };
    6: {
        message: string;
    };
    7: {
        message: string;
    };
    9: {
        message: string;
    };
    12: {
        message: string;
    };
    17: {
        message: string;
    };
    18: {
        message: string;
    };
    24: {
        message: string;
    };
    25: {
        message: string;
    };
    33: {
        message: string;
    };
    10: {
        message: string;
    };
    11: {
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
    30: {
        message: string;
    };
    42: {
        message: string;
    };
    43: {
        message: string;
    };
    54: {
        message: string;
    };
};
export declare enum ProjectStatus {
    New = 0,
    Approved = 1,
    Rejected = 2,
    Completed = 3
}
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
export type ContractKey = {
    tag: "ProtocolFeeRecepient";
    values: void;
} | {
    tag: "ProtocolFee";
    values: void;
} | {
    tag: "DefaultPageSize";
    values: void;
} | {
    tag: "FactoryOwner";
    values: void;
} | {
    tag: "NextRoundId";
    values: void;
} | {
    tag: "NextPayoutId";
    values: void;
} | {
    tag: "NextDepositId";
    values: void;
} | {
    tag: "ProjectPayoutIds";
    values: void;
} | {
    tag: "TokenContract";
    values: void;
} | {
    tag: "ProjectContract";
    values: void;
} | {
    tag: "VotedRoundIds";
    values: void;
} | {
    tag: "RoundInfo";
    values: readonly [u128];
} | {
    tag: "PayoutInfo";
    values: void;
} | {
    tag: "DepositInfo";
    values: void;
} | {
    tag: "WhiteList";
    values: readonly [u128];
} | {
    tag: "BlackList";
    values: readonly [u128];
} | {
    tag: "ProjectApplicants";
    values: readonly [u128];
} | {
    tag: "ApprovedProjects";
    values: readonly [u128];
} | {
    tag: "Payouts";
    values: readonly [u128];
} | {
    tag: "PayoutChallenges";
    values: readonly [u128];
} | {
    tag: "VotingState";
    values: readonly [u128];
} | {
    tag: "Votes";
    values: readonly [u128];
} | {
    tag: "ProjectVotingCount";
    values: readonly [u128];
} | {
    tag: "Admin";
    values: readonly [u128];
} | {
    tag: "Deposit";
    values: readonly [u128];
};
export interface Client {
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    initialize: ({ caller, token_address, registry_address, protocol_fee_basis_points, protocol_fee_recipient, default_page_size }: {
        caller: string;
        token_address: string;
        registry_address: string;
        protocol_fee_basis_points: Option<u32>;
        protocol_fee_recipient: Option<string>;
        default_page_size: Option<u64>;
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
    create_round: ({ caller, round_detail }: {
        caller: string;
        round_detail: CreateRoundParams;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a get_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_rounds: ({ from_index, limit }: {
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
    }) => Promise<AssembledTransaction<Array<RoundDetail>>>;
    /**
     * Construct and simulate a upgrade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    upgrade: ({ new_wasm_hash }: {
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
    /**
     * Construct and simulate a transfer_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    transfer_ownership: ({ new_owner }: {
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
    }) => Promise<AssembledTransaction<Config>>;
    /**
     * Construct and simulate a owner_set_default_page_size transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    owner_set_default_page_size: ({ default_page_size }: {
        default_page_size: u64;
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
     * Construct and simulate a owner_set_protocol_fee_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    owner_set_protocol_fee_config: ({ protocol_fee_recipient, protocol_fee_basis_points }: {
        protocol_fee_recipient: Option<string>;
        protocol_fee_basis_points: Option<u32>;
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
     * Construct and simulate a change_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_voting_period: ({ round_id, caller, start_ms, end_ms }: {
        round_id: u128;
        caller: string;
        start_ms: u64;
        end_ms: u64;
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
     * Construct and simulate a change_application_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_application_period: ({ round_id, caller, start_ms, end_ms }: {
        round_id: u128;
        caller: string;
        start_ms: u64;
        end_ms: u64;
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
     * Construct and simulate a change_expected_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_expected_amount: ({ round_id, caller, amount }: {
        round_id: u128;
        caller: string;
        amount: u128;
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
     * Construct and simulate a close_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    close_voting_period: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a start_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    start_voting_period: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a add_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_admins: ({ round_id, round_admin }: {
        round_id: u128;
        round_admin: Array<string>;
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
     * Construct and simulate a remove_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_admins: ({ round_id, round_admin }: {
        round_id: u128;
        round_admin: Array<string>;
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
     * Construct and simulate a set_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_admins: ({ round_id, round_admin }: {
        round_id: u128;
        round_admin: Array<string>;
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
     * Construct and simulate a clear_admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    clear_admins: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a apply_to_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    apply_to_round: ({ round_id, caller, applicant, note, review_note }: {
        round_id: u128;
        caller: string;
        applicant: Option<string>;
        note: Option<string>;
        review_note: Option<string>;
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
    }) => Promise<AssembledTransaction<RoundApplication>>;
    /**
     * Construct and simulate a review_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    review_application: ({ round_id, caller, applicant, status, note }: {
        round_id: u128;
        caller: string;
        applicant: string;
        status: ApplicationStatus;
        note: Option<string>;
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
    }) => Promise<AssembledTransaction<RoundApplication>>;
    /**
     * Construct and simulate a deposit_to_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    deposit_to_round: ({ round_id, caller, amount, memo, referrer_id }: {
        round_id: u128;
        caller: string;
        amount: u128;
        memo: Option<string>;
        referrer_id: Option<string>;
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
     * Construct and simulate a vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    vote: ({ round_id, voter, picks }: {
        round_id: u128;
        voter: string;
        picks: Array<PickedPair>;
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
     * Construct and simulate a get_pairs_to_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pairs_to_vote: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<Pair>>>;
    /**
     * Construct and simulate a flag_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    flag_voters: ({ round_id, admin, voters }: {
        round_id: u128;
        admin: string;
        voters: Array<string>;
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
     * Construct and simulate a unflag_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    unflag_voters: ({ round_id, admin, voters }: {
        round_id: u128;
        admin: string;
        voters: Array<string>;
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
     * Construct and simulate a get_voting_results_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_voting_results_for_round: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<ProjectVotingResult>>>;
    /**
     * Construct and simulate a process_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    process_payouts: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
     * Construct and simulate a get_votes_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_votes_for_round: ({ round_id, skip, limit }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<VotingResult>>>;
    /**
     * Construct and simulate a can_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    can_vote: ({ round_id, voter }: {
        round_id: u128;
        voter: string;
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
     * Construct and simulate a get_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_round: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a is_voting_live transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    is_voting_live: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a is_application_live transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    is_application_live: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a get_applications_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_applications_for_round: ({ round_id, from_index, limit }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<RoundApplication>>>;
    /**
     * Construct and simulate a get_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_application: ({ round_id, applicant }: {
        round_id: u128;
        applicant: string;
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
    }) => Promise<AssembledTransaction<RoundApplication>>;
    /**
     * Construct and simulate a is_payout_done transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    is_payout_done: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a user_has_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    user_has_vote: ({ round_id, voter }: {
        round_id: u128;
        voter: string;
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
     * Construct and simulate a total_funding transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    total_funding: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a add_approved_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_approved_project: ({ round_id, admin, project_ids }: {
        round_id: u128;
        admin: string;
        project_ids: Array<u128>;
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
     * Construct and simulate a remove_approved_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_approved_project: ({ round_id, admin, project_ids }: {
        round_id: u128;
        admin: string;
        project_ids: Array<u128>;
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
     * Construct and simulate a add_whitelists transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_whitelists: ({ round_id, caller, users }: {
        round_id: u128;
        caller: string;
        users: Array<string>;
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
     * Construct and simulate a remove_from_whitelists transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_from_whitelists: ({ round_id, caller, users }: {
        round_id: u128;
        caller: string;
        users: Array<string>;
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
     * Construct and simulate a whitelist_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    whitelist_status: ({ round_id, address }: {
        round_id: u128;
        address: string;
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
     * Construct and simulate a blacklist_status transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    blacklist_status: ({ round_id, address }: {
        round_id: u128;
        address: string;
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
     * Construct and simulate a get_all_pairs_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_all_pairs_for_round: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<Pair>>>;
    /**
     * Construct and simulate a get_pair_by_index transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pair_by_index: ({ round_id, index }: {
        round_id: u128;
        index: u32;
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
    }) => Promise<AssembledTransaction<Pair>>;
    /**
     * Construct and simulate a change_number_of_votes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_number_of_votes: ({ round_id, admin, num_picks_per_voter }: {
        round_id: u128;
        admin: string;
        num_picks_per_voter: u32;
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
     * Construct and simulate a transfer_round_ownership transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    transfer_round_ownership: ({ round_id, new_owner }: {
        round_id: u128;
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
     * Construct and simulate a admins transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    admins: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a unapply_from_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    unapply_from_round: ({ round_id, caller, applicant }: {
        round_id: u128;
        caller: string;
        applicant: Option<string>;
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
    }) => Promise<AssembledTransaction<RoundApplication>>;
    /**
     * Construct and simulate a update_applicant_note transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_applicant_note: ({ round_id, caller, note }: {
        round_id: u128;
        caller: string;
        note: string;
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
    }) => Promise<AssembledTransaction<RoundApplication>>;
    /**
     * Construct and simulate a set_applications_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_applications_config: ({ round_id, caller, allow_applications, start_ms, end_ms }: {
        round_id: u128;
        caller: string;
        allow_applications: boolean;
        start_ms: Option<u64>;
        end_ms: Option<u64>;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a update_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_round: ({ caller, round_id, round_detail }: {
        caller: string;
        round_id: u128;
        round_detail: UpdateRoundParams;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a delete_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    delete_round: ({ round_id }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a apply_to_round_batch transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    apply_to_round_batch: ({ caller, round_id, review_notes, applicants }: {
        caller: string;
        round_id: u128;
        review_notes: Array<Option<string>>;
        applicants: Array<string>;
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
    }) => Promise<AssembledTransaction<Array<RoundApplication>>>;
    /**
     * Construct and simulate a get_payouts_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_payouts_for_round: ({ round_id, from_index, limit }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<Payout>>>;
    /**
     * Construct and simulate a set_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_payouts: ({ round_id, caller, payouts, clear_existing }: {
        round_id: u128;
        caller: string;
        payouts: Array<PayoutInput>;
        clear_existing: boolean;
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
    }) => Promise<AssembledTransaction<Array<Payout>>>;
    /**
     * Construct and simulate a set_round_complete transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_round_complete: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a challenge_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    challenge_payouts: ({ round_id, caller, reason }: {
        round_id: u128;
        caller: string;
        reason: string;
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
    }) => Promise<AssembledTransaction<PayoutsChallenge>>;
    /**
     * Construct and simulate a remove_payouts_challenge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_payouts_challenge: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
     * Construct and simulate a update_payouts_challenge transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    update_payouts_challenge: ({ round_id, caller, challenger_id, notes, resolve_challenge }: {
        round_id: u128;
        caller: string;
        challenger_id: string;
        notes: Option<string>;
        resolve_challenge: Option<boolean>;
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
    }) => Promise<AssembledTransaction<PayoutsChallenge>>;
    /**
     * Construct and simulate a remove_resolved_challenges transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_resolved_challenges: ({ round_id, caller }: {
        round_id: u128;
        caller: string;
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
     * Construct and simulate a get_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_payouts: ({ from_index, limit }: {
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
    }) => Promise<AssembledTransaction<Array<Payout>>>;
    /**
     * Construct and simulate a get_payout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_payout: ({ payout_id }: {
        payout_id: u32;
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
    }) => Promise<AssembledTransaction<Payout>>;
    /**
     * Construct and simulate a redistribute_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    redistribute_vault: ({ round_id, caller, memo }: {
        round_id: u128;
        caller: string;
        memo: Option<string>;
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
     * Construct and simulate a get_deposits_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_deposits_for_round: ({ round_id, from_index, limit }: {
        round_id: u128;
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
    }) => Promise<AssembledTransaction<Array<Deposit>>>;
    /**
     * Construct and simulate a set_cooldown_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_cooldown_config: ({ round_id, caller, cooldown_period_ms }: {
        round_id: u128;
        caller: string;
        cooldown_period_ms: Option<u64>;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a set_compliance_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_compliance_config: ({ round_id, caller, compliance_req_desc, compliance_period_ms }: {
        round_id: u128;
        caller: string;
        compliance_req_desc: Option<string>;
        compliance_period_ms: Option<u64>;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a blacklisted_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    blacklisted_voters: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a whitelisted_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    whitelisted_voters: ({ round_id }: {
        round_id: u128;
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
     * Construct and simulate a set_redistribution_config transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    set_redistribution_config: ({ round_id, caller, allow_remaining_dist, remaining_dist_address }: {
        round_id: u128;
        caller: string;
        allow_remaining_dist: boolean;
        remaining_dist_address: Option<string>;
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
    }) => Promise<AssembledTransaction<RoundDetail>>;
    /**
     * Construct and simulate a get_my_vote_for_round transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_my_vote_for_round: ({ round_id, voter }: {
        round_id: u128;
        voter: string;
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
    }) => Promise<AssembledTransaction<VotingResult>>;
    /**
     * Construct and simulate a get_voted_rounds transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_voted_rounds: ({ voter, from_index, limit }: {
        voter: string;
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
    }) => Promise<AssembledTransaction<Array<RoundDetail>>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        initialize: (json: string) => AssembledTransaction<null>;
        create_round: (json: string) => AssembledTransaction<RoundDetail>;
        get_rounds: (json: string) => AssembledTransaction<RoundDetail[]>;
        upgrade: (json: string) => AssembledTransaction<null>;
        transfer_ownership: (json: string) => AssembledTransaction<null>;
        get_config: (json: string) => AssembledTransaction<Config>;
        owner_set_default_page_size: (json: string) => AssembledTransaction<null>;
        owner_set_protocol_fee_config: (json: string) => AssembledTransaction<null>;
        change_voting_period: (json: string) => AssembledTransaction<null>;
        change_application_period: (json: string) => AssembledTransaction<null>;
        change_expected_amount: (json: string) => AssembledTransaction<null>;
        close_voting_period: (json: string) => AssembledTransaction<RoundDetail>;
        start_voting_period: (json: string) => AssembledTransaction<RoundDetail>;
        add_admins: (json: string) => AssembledTransaction<null>;
        remove_admins: (json: string) => AssembledTransaction<null>;
        set_admins: (json: string) => AssembledTransaction<null>;
        clear_admins: (json: string) => AssembledTransaction<null>;
        apply_to_round: (json: string) => AssembledTransaction<RoundApplication>;
        review_application: (json: string) => AssembledTransaction<RoundApplication>;
        deposit_to_round: (json: string) => AssembledTransaction<null>;
        vote: (json: string) => AssembledTransaction<null>;
        get_pairs_to_vote: (json: string) => AssembledTransaction<Pair[]>;
        flag_voters: (json: string) => AssembledTransaction<null>;
        unflag_voters: (json: string) => AssembledTransaction<null>;
        get_voting_results_for_round: (json: string) => AssembledTransaction<ProjectVotingResult[]>;
        process_payouts: (json: string) => AssembledTransaction<null>;
        get_votes_for_round: (json: string) => AssembledTransaction<VotingResult[]>;
        can_vote: (json: string) => AssembledTransaction<boolean>;
        get_round: (json: string) => AssembledTransaction<RoundDetail>;
        is_voting_live: (json: string) => AssembledTransaction<boolean>;
        is_application_live: (json: string) => AssembledTransaction<boolean>;
        get_applications_for_round: (json: string) => AssembledTransaction<RoundApplication[]>;
        get_application: (json: string) => AssembledTransaction<RoundApplication>;
        is_payout_done: (json: string) => AssembledTransaction<boolean>;
        user_has_vote: (json: string) => AssembledTransaction<boolean>;
        total_funding: (json: string) => AssembledTransaction<bigint>;
        add_approved_project: (json: string) => AssembledTransaction<null>;
        remove_approved_project: (json: string) => AssembledTransaction<null>;
        add_whitelists: (json: string) => AssembledTransaction<null>;
        remove_from_whitelists: (json: string) => AssembledTransaction<null>;
        whitelist_status: (json: string) => AssembledTransaction<boolean>;
        blacklist_status: (json: string) => AssembledTransaction<boolean>;
        get_all_pairs_for_round: (json: string) => AssembledTransaction<Pair[]>;
        get_pair_by_index: (json: string) => AssembledTransaction<Pair>;
        change_number_of_votes: (json: string) => AssembledTransaction<null>;
        transfer_round_ownership: (json: string) => AssembledTransaction<null>;
        admins: (json: string) => AssembledTransaction<string[]>;
        unapply_from_round: (json: string) => AssembledTransaction<RoundApplication>;
        update_applicant_note: (json: string) => AssembledTransaction<RoundApplication>;
        set_applications_config: (json: string) => AssembledTransaction<RoundDetail>;
        update_round: (json: string) => AssembledTransaction<RoundDetail>;
        delete_round: (json: string) => AssembledTransaction<RoundDetail>;
        apply_to_round_batch: (json: string) => AssembledTransaction<RoundApplication[]>;
        get_payouts_for_round: (json: string) => AssembledTransaction<Payout[]>;
        set_payouts: (json: string) => AssembledTransaction<Payout[]>;
        set_round_complete: (json: string) => AssembledTransaction<RoundDetail>;
        challenge_payouts: (json: string) => AssembledTransaction<PayoutsChallenge>;
        remove_payouts_challenge: (json: string) => AssembledTransaction<null>;
        update_payouts_challenge: (json: string) => AssembledTransaction<PayoutsChallenge>;
        remove_resolved_challenges: (json: string) => AssembledTransaction<null>;
        get_payouts: (json: string) => AssembledTransaction<Payout[]>;
        get_payout: (json: string) => AssembledTransaction<Payout>;
        redistribute_vault: (json: string) => AssembledTransaction<null>;
        get_deposits_for_round: (json: string) => AssembledTransaction<Deposit[]>;
        set_cooldown_config: (json: string) => AssembledTransaction<RoundDetail>;
        set_compliance_config: (json: string) => AssembledTransaction<RoundDetail>;
        blacklisted_voters: (json: string) => AssembledTransaction<string[]>;
        whitelisted_voters: (json: string) => AssembledTransaction<string[]>;
        set_redistribution_config: (json: string) => AssembledTransaction<RoundDetail>;
        get_my_vote_for_round: (json: string) => AssembledTransaction<VotingResult>;
        get_voted_rounds: (json: string) => AssembledTransaction<RoundDetail[]>;
    };
}
