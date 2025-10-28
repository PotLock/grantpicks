import { Network } from "@/types/on-chain";

export type LocalStorageSavedNetwork = {
  id: Network;
  label: string;
  horizonUrl?: string;
  rpcUrl?: string;
  passphrase?: string;
};


export interface SavedWallet {
  id: string;
  network: LocalStorageSavedNetwork;
}