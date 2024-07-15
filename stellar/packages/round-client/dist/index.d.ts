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
        readonly contractId: "CA4XSZM255322M4GKEE5DUJC4HV3O5ZAMOIJHM3NMFNNRKDZJHXZLLYF";
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
};
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
export type ProjectStatus = {
    tag: "New";
    values: void;
} | {
    tag: "Approved";
    values: void;
} | {
    tag: "Rejected";
    values: void;
} | {
    tag: "Completed";
    values: void;
};
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
export type ContractKey = {
    tag: "FactoryOwner";
    values: void;
} | {
    tag: "RoundNumber";
    values: void;
} | {
    tag: "TokenContract";
    values: void;
} | {
    tag: "ProjectContract";
    values: void;
} | {
    tag: "RoundInfo";
    values: readonly [u128];
} | {
    tag: "WhitelistAndBlacklist";
    values: readonly [u128];
} | {
    tag: "ProjectApplicants";
    values: readonly [u128];
} | {
    tag: "ApprovedProjects";
    values: readonly [u128];
} | {
    tag: "ApplicationNumber";
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
};
export declare const Errors: {};
export interface Client {
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    initialize: ({ owner, token_address, registry_address }: {
        owner: string;
        token_address: string;
        registry_address: string;
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
    create_round: ({ owner, round_detail }: {
        owner: string;
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
    }) => Promise<AssembledTransaction<Array<RoundDetail>>>;
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
    /**
     * Construct and simulate a change_voting_period transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_voting_period: ({ round_id, admin, round_start_ms, round_end_ms }: {
        round_id: u128;
        admin: string;
        round_start_ms: u64;
        round_end_ms: u64;
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
    change_application_period: ({ round_id, admin, round_application_start_ms, round_application_end_ms }: {
        round_id: u128;
        admin: string;
        round_application_start_ms: u64;
        round_application_end_ms: u64;
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
     * Construct and simulate a change_amount transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    change_amount: ({ round_id, admin, amount }: {
        round_id: u128;
        admin: string;
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
     * Construct and simulate a complete_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    complete_vote: ({ round_id, admin }: {
        round_id: u128;
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
     * Construct and simulate a add_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_admin: ({ round_id, admin, round_admin }: {
        round_id: u128;
        admin: string;
        round_admin: string;
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
    remove_admin: ({ round_id, admin, round_admin }: {
        round_id: u128;
        admin: string;
        round_admin: string;
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
     * Construct and simulate a apply_project transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    apply_project: ({ round_id, project_id, applicant }: {
        round_id: u128;
        project_id: u128;
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
    }) => Promise<AssembledTransaction<u128>>;
    /**
     * Construct and simulate a review_application transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    review_application: ({ round_id, admin, application_id, status, note }: {
        round_id: u128;
        admin: string;
        application_id: u128;
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
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    deposit: ({ round_id, actor, amount }: {
        round_id: u128;
        actor: string;
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
     * Construct and simulate a get_pair_to_vote transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pair_to_vote: ({ round_id }: {
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
     * Construct and simulate a flag_voter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    flag_voter: ({ round_id, admin, voter }: {
        round_id: u128;
        admin: string;
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
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a unflag_voter transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    unflag_voter: ({ round_id, admin, voter }: {
        round_id: u128;
        admin: string;
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
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a calculate_results transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    calculate_results: ({ round_id }: {
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
     * Construct and simulate a trigger_payouts transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    trigger_payouts: ({ round_id, admin }: {
        round_id: u128;
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
     * Construct and simulate a get_all_voters transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_all_voters: ({ round_id, skip, limit }: {
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
     * Construct and simulate a round_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    round_info: ({ round_id }: {
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
     * Construct and simulate a get_all_applications transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_all_applications: ({ round_id, skip, limit }: {
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
    }) => Promise<AssembledTransaction<Array<ProjectApplication>>>;
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
     * Construct and simulate a add_white_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    add_white_list: ({ round_id, admin, address }: {
        round_id: u128;
        admin: string;
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
    }) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a remove_from_white_list transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    remove_from_white_list: ({ round_id, admin, address }: {
        round_id: u128;
        admin: string;
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
     * Construct and simulate a get_pairs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_pairs: ({ round_id, admin }: {
        round_id: u128;
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
    transfer_round_ownership: ({ round_id, owner, new_owner }: {
        round_id: u128;
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
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        initialize: (json: string) => AssembledTransaction<null>;
        create_round: (json: string) => AssembledTransaction<RoundDetail>;
        get_rounds: (json: string) => AssembledTransaction<RoundDetail[]>;
        upgrade: (json: string) => AssembledTransaction<null>;
        change_voting_period: (json: string) => AssembledTransaction<null>;
        change_application_period: (json: string) => AssembledTransaction<null>;
        change_amount: (json: string) => AssembledTransaction<null>;
        complete_vote: (json: string) => AssembledTransaction<null>;
        add_admin: (json: string) => AssembledTransaction<null>;
        remove_admin: (json: string) => AssembledTransaction<null>;
        apply_project: (json: string) => AssembledTransaction<bigint>;
        review_application: (json: string) => AssembledTransaction<null>;
        deposit: (json: string) => AssembledTransaction<null>;
        vote: (json: string) => AssembledTransaction<null>;
        get_pair_to_vote: (json: string) => AssembledTransaction<Pair[]>;
        flag_voter: (json: string) => AssembledTransaction<null>;
        unflag_voter: (json: string) => AssembledTransaction<null>;
        calculate_results: (json: string) => AssembledTransaction<ProjectVotingResult[]>;
        trigger_payouts: (json: string) => AssembledTransaction<null>;
        get_all_voters: (json: string) => AssembledTransaction<VotingResult[]>;
        can_vote: (json: string) => AssembledTransaction<boolean>;
        round_info: (json: string) => AssembledTransaction<RoundDetail>;
        is_voting_live: (json: string) => AssembledTransaction<boolean>;
        is_application_live: (json: string) => AssembledTransaction<boolean>;
        get_all_applications: (json: string) => AssembledTransaction<ProjectApplication[]>;
        is_payout_done: (json: string) => AssembledTransaction<boolean>;
        user_has_vote: (json: string) => AssembledTransaction<boolean>;
        total_funding: (json: string) => AssembledTransaction<bigint>;
        add_approved_project: (json: string) => AssembledTransaction<null>;
        remove_approved_project: (json: string) => AssembledTransaction<null>;
        add_white_list: (json: string) => AssembledTransaction<null>;
        remove_from_white_list: (json: string) => AssembledTransaction<null>;
        whitelist_status: (json: string) => AssembledTransaction<boolean>;
        blacklist_status: (json: string) => AssembledTransaction<boolean>;
        get_pairs: (json: string) => AssembledTransaction<Pair[]>;
        get_pair_by_index: (json: string) => AssembledTransaction<Pair>;
        change_number_of_votes: (json: string) => AssembledTransaction<null>;
        transfer_round_ownership: (json: string) => AssembledTransaction<null>;
        admins: (json: string) => AssembledTransaction<string[]>;
    };
}
