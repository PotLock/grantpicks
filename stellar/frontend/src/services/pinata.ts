"server-only";

import { envVarConfigs } from "@/configs/env-var";
import { type KeyResponse, type PinResponse, PinataSDK } from "pinata-web3";

const identity = <T>(x: T): T => x;

export const sdk = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: envVarConfigs.IPFS_GATEWAY_URL,
});

export type FileUploadParams = {
  file: File;
};

export const upload = ({ file }: FileUploadParams): Promise<PinResponse> =>
  fetch("/api/pinata/get-auth-key")
    .then((response) => response.json())
    .then(({ JWT }: KeyResponse) => sdk.upload.file(file).key(JWT).then(identity));

export type FileUploadResult = {
  ipfsHash: string;
  url: string;
};

export const uploadFile = (file: File): Promise<FileUploadResult> =>
  upload({ file }).then(({ IpfsHash: ipfsHash }) =>
    sdk.gateways.convert(ipfsHash).then((url) => ({ ipfsHash, url })),
  );
