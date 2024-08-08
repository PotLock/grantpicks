import { Keypair, Horizon, Transaction, Networks } from '@stellar/stellar-sdk'
import { Network } from './type.js'

export type WalletProps = {
	network: Network
	secret: string
}
class CMDWallet {
	private network: Network = 'testnet'
	private pubKey
	private keypair: Keypair
	private server: Horizon.Server
	public static Wallet: CMDWallet
	constructor({ network, secret }: WalletProps) {
		this.network = network
		this.keypair = Keypair.fromSecret(secret)
		this.pubKey = this.keypair.publicKey()
		if (network == 'testnet') {
			this.server = new Horizon.Server('https://horizon-testnet.stellar.org')
		} else {
			this.server = new Horizon.Server('https://horizon.stellar.org')
		}
		this.server.loadAccount(this.pubKey)
		CMDWallet.Wallet = this
	}

	async getBalances() {
		const account = await this.server.loadAccount(this.pubKey)
		return account.balances
	}

	async status() {
		return true
	}

	async allowance() {
		return true
	}

	get account() {
		return {
			publicKey: this.pubKey,
			network: this.network,
		}
	}

	async signTx(tx: Transaction, options: Horizon.Server.SubmitTransactionOptions | undefined) {
		tx.sign(this.keypair)
		return tx.toEnvelope().toXDR('base64')
	}

	async signAuth() {
		return ''
	}

	isConnected() {
		return CMDWallet.Wallet.status()
	}

	isAllowed() {
		return CMDWallet.Wallet.allowance()
	}

	getUserInfo() {
		return CMDWallet.Wallet.account
	}

	signTransaction(
		tx: string,
		opts?:
			| {
					network?: string | undefined
					networkPassphrase?: string | undefined
					accountToSign?: string | undefined
			  }
			| undefined
	) {
		if (!opts) {
			const defaultTransaction = new Transaction(
				tx,
				this.network == 'testnet' ? Networks.TESTNET : Networks.PUBLIC
			)
			return CMDWallet.Wallet.signTx(defaultTransaction, undefined)
		}

		const transaction = new Transaction(tx, opts.networkPassphrase as string)
		return CMDWallet.Wallet.signTx(transaction, opts as Horizon.Server.SubmitTransactionOptions)
	}
	signAuthEntry(entryXdr: string, opts?: { accountToSign?: string | undefined } | undefined) {
		return CMDWallet.Wallet.signAuth()
	}

	wallet() {
		return {
			isConnected: this.isConnected,
			isAllowed: this.isAllowed,
			getUserInfo: this.getUserInfo,
			signTransaction: this.signTransaction,
			signAuthEntry: this.signAuthEntry,
		}
	}
}

export default CMDWallet
