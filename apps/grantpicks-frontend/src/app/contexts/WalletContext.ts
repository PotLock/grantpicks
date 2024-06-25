import { IWalletContext } from '@/types/context'
import {
	ISupportedWallet,
	StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit'
import { WalletSelector } from '@near-wallet-selector/core'
import { createContext } from 'react'

export const WalletContext = createContext<IWalletContext>({
	nearModal: null,
	nearSelector: null,
	connectedWallet: null,
	nearWallet: null,
	nearAccounts: [],
	onOpenNearWallet: () => {},
	onSignOut: () => Promise.resolve(),
	onCheckConnected: (selector: WalletSelector) => Promise.resolve(),
	//stellar
	stellarKit: null,
	stellarPubKey: '',
	onOpenStellarWallet: (onSelected?: (option: ISupportedWallet) => void) => {},
})
