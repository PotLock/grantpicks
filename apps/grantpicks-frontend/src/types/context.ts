import {
	ISupportedWallet,
	StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit'
import { Wallet, WalletSelector } from '@near-wallet-selector/core'
import {
	Account,
	SignMessageMethod,
} from '@near-wallet-selector/core/src/lib/wallet'
import { WalletSelectorModal } from '@near-wallet-selector/modal-ui'

export interface IWalletContext {
	connectedWallet: 'near' | 'stellar' | null
	//near
	nearSelector: WalletSelector | null
	nearModal: WalletSelectorModal | null
	nearWallet: (Wallet & SignMessageMethod) | null
	nearAccounts: Account[]
	onOpenNearWallet: () => void
	onSignOut: () => Promise<void>
	onCheckConnected: (selector: WalletSelector) => Promise<void>
	//stellar
	stellarKit: StellarWalletsKit | null
	stellarPubKey: string
	onOpenStellarWallet: (onSelected?: (option: ISupportedWallet) => void) => void
}
