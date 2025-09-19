import { IWalletContext } from '@/types/context'
import {
	ISupportedWallet,
	StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit'
import { createContext } from 'react'

export const WalletContext = createContext<IWalletContext>({
	connectedWallet: null,
	// stellar
	currentBalance: null,
	stellarKit: null,
	stellarPubKey: '',
	onOpenStellarWallet: (onSelected?: (option: ISupportedWallet) => void) => {},
	profileData: undefined,
	onSignOut: () => Promise.resolve(),
})
