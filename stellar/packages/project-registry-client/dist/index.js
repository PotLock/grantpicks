import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk';
export * as contract from '@stellar/stellar-sdk/contract';
export * as rpc from '@stellar/stellar-sdk/rpc';
if (typeof window !== 'undefined') {
    //@ts-ignore Buffer exists
    window.Buffer = window.Buffer || Buffer;
}
export const networks = {
    testnet: {
        networkPassphrase: "Test SDF Network ; September 2015",
        contractId: "CDNKCOQ3CWQR3RRJVAG6LQTFIXLW37OIZQDDHVQ3CZHLNWUDVKNPJSHX",
    }
};
export var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["New"] = 0] = "New";
    ProjectStatus[ProjectStatus["Approved"] = 1] = "Approved";
    ProjectStatus[ProjectStatus["Rejected"] = 2] = "Rejected";
    ProjectStatus[ProjectStatus["Completed"] = 3] = "Completed";
})(ProjectStatus || (ProjectStatus = {}));
export const Errors = {
    1: { message: "EmptyName" },
    2: { message: "EmptyOverview" },
    3: { message: "EmptyContacts" },
    4: { message: "EmptyAdmins" },
    5: { message: "EmptyImageUrl" },
    6: { message: "AdminOrOwnerOnly" },
    7: { message: "OwnerOnly" },
    8: { message: "ContractOwnerOnly" },
    9: { message: "AlreadyApplied" },
    10: { message: "DataNotFound" }
};
export class Client extends ContractClient {
    options;
    constructor(options) {
        super(new ContractSpec(["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",
            "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACgAAAAAAAAAJRW1wdHlOYW1lAAAAAAAAAQAAAAAAAAANRW1wdHlPdmVydmlldwAAAAAAAAIAAAAAAAAADUVtcHR5Q29udGFjdHMAAAAAAAADAAAAAAAAAAtFbXB0eUFkbWlucwAAAAAEAAAAAAAAAA1FbXB0eUltYWdlVXJsAAAAAAAABQAAAAAAAAAQQWRtaW5Pck93bmVyT25seQAAAAYAAAAAAAAACU93bmVyT25seQAAAAAAAAcAAAAAAAAAEUNvbnRyYWN0T3duZXJPbmx5AAAAAAAACAAAAAAAAAAOQWxyZWFkeUFwcGxpZWQAAAAAAAkAAAAAAAAADERhdGFOb3RGb3VuZAAAAAo=",
            "AAAAAAAAAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAQAAAAAAAAAOY29udHJhY3Rfb3duZXIAAAAAABMAAAAA",
            "AAAAAAAAAAAAAAAFYXBwbHkAAAAAAAACAAAAAAAAAAlhcHBsaWNhbnQAAAAAAAATAAAAAAAAAA5wcm9qZWN0X3BhcmFtcwAAAAAH0AAAABNDcmVhdGVQcm9qZWN0UGFyYW1zAAAAAAEAAAfQAAAAB1Byb2plY3QA",
            "AAAAAAAAAAAAAAAVY2hhbmdlX3Byb2plY3Rfc3RhdHVzAAAAAAAAAwAAAAAAAAAOY29udHJhY3Rfb3duZXIAAAAAABMAAAAAAAAACnByb2plY3RfaWQAAAAAAAoAAAAAAAAACm5ld19zdGF0dXMAAAAAB9AAAAANUHJvamVjdFN0YXR1cwAAAAAAAAA=",
            "AAAAAAAAAAAAAAAOdXBkYXRlX3Byb2plY3QAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAKcHJvamVjdF9pZAAAAAAACgAAAAAAAAASbmV3X3Byb2plY3RfcGFyYW1zAAAAAAfQAAAAE1VwZGF0ZVByb2plY3RQYXJhbXMAAAAAAA==",
            "AAAAAAAAAAAAAAAJYWRkX2FkbWluAAAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAAluZXdfYWRtaW4AAAAAAAATAAAAAA==",
            "AAAAAAAAAAAAAAAMcmVtb3ZlX2FkbWluAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAAAAAA9hZG1pbl90b19yZW1vdmUAAAAAEwAAAAA=",
            "AAAAAAAAAAAAAAARZ2V0X3Byb2plY3RfYnlfaWQAAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAB9AAAAAHUHJvamVjdAA=",
            "AAAAAAAAAAAAAAAMZ2V0X3Byb2plY3RzAAAAAgAAAAAAAAAEc2tpcAAAA+gAAAAGAAAAAAAAAAVsaW1pdAAAAAAAA+gAAAAGAAAAAQAAA+oAAAfQAAAAB1Byb2plY3QA",
            "AAAAAAAAAAAAAAASZ2V0X3Byb2plY3RfYWRtaW5zAAAAAAABAAAAAAAAAApwcm9qZWN0X2lkAAAAAAAKAAAAAQAAA+oAAAAT",
            "AAAAAAAAAAAAAAASZ2V0X3RvdGFsX3Byb2plY3RzAAAAAAAAAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAHdXBncmFkZQAAAAACAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADW5ld193YXNtX2hhc2gAAAAAAAPuAAAAIAAAAAA=",
            "AAAAAAAAAAAAAAAaZ2V0X3Byb2plY3RfZnJvbV9hcHBsaWNhbnQAAAAAAAEAAAAAAAAACWFwcGxpY2FudAAAAAAAABMAAAABAAAH0AAAAAdQcm9qZWN0AA==",
            "AAAAAgAAAAAAAAAAAAAAC0NvbnRyYWN0S2V5AAAAAAQAAAAAAAAAAAAAAA1OdW1PZlByb2plY3RzAAAAAAAAAAAAAAAAAAAIUHJvamVjdHMAAAAAAAAAAAAAAA1SZWdpc3RyeUFkbWluAAAAAAAAAAAAAAAAAAAUQXBwbGljYW50VG9Qcm9qZWN0SUQ="]), options);
        this.options = options;
    }
    fromJSON = {
        initialize: (this.txFromJSON),
        apply: (this.txFromJSON),
        change_project_status: (this.txFromJSON),
        update_project: (this.txFromJSON),
        add_admin: (this.txFromJSON),
        remove_admin: (this.txFromJSON),
        get_project_by_id: (this.txFromJSON),
        get_projects: (this.txFromJSON),
        get_project_admins: (this.txFromJSON),
        get_total_projects: (this.txFromJSON),
        upgrade: (this.txFromJSON),
        get_project_from_applicant: (this.txFromJSON)
    };
}
