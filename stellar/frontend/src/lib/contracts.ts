import { Client as ListClient } from 'lists-client'
import { Client as ProjectClient } from 'project-registry-client'
import { Client as RoundClient } from 'round-client'
import {
	AssembledTransaction,
	ClientOptions,
} from '@stellar/stellar-sdk/contract'
import CMDWallet from './wallet'
import { Network } from '@/types/on-chain'
import { envVarConfigs } from '@/configs/env-var'
import {
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { getSorobanConfig, getSorobanServer, submitTx } from '@/utils/helper'

class Contracts {
	private _lists_contract: ListClient
	private _project_contract: ProjectClient
	private _round_contract: RoundClient
	private _template_config: ClientOptions
	private _wallet: CMDWallet
	constructor(network: Network, wallet: CMDWallet) {
		const config: ClientOptions =
			network == 'testnet'
				? {
						contractId: '',
						networkPassphrase: 'Test SDF Network ; September 2015',
						rpcUrl: 'https://soroban-testnet.stellar.org',
						publicKey: wallet.account.publicKey,
					}
				: {
						contractId: '',
						networkPassphrase: 'Public Global Stellar Network ; September 2015',
						rpcUrl: 'https://soroban.stellar.org',
						publicKey: wallet.account.publicKey,
					}
		config.signAuthEntry = wallet.signAuth.bind(wallet)
		config.signTransaction = wallet.signTransaction.bind(wallet)

		this._template_config = config
		this._wallet = wallet

		let lists_contract_id = envVarConfigs.LISTS_CONTRACT_ID || ''
		let project_registry_contract_id =
			envVarConfigs.PROJECT_REGISTRY_CONTRACT_ID || ''
		let round_contract_id = envVarConfigs.ROUND_CONTRACT_ID || ''

		this._lists_contract = new ListClient({
			...config,
			contractId: lists_contract_id,
		})

		this._project_contract = new ProjectClient({
			...config,
			contractId: project_registry_contract_id,
		})

		this._round_contract = new RoundClient({
			...config,
			contractId: round_contract_id,
		})
	}

	get lists_contract() {
		return this._lists_contract
	}

	get project_contract() {
		return this._project_contract
	}

	get round_contract() {
		return this._round_contract
	}

	get wallet() {
		return this._wallet
	}

	async signAndSendTx(
		kit: StellarWalletsKit,
		tx: AssembledTransaction<null | any> | undefined,
		publicKey: string,
	) {
		let signedXdr
		const signedRes = await kit?.signTx({
			xdr: tx?.toXDR() as string,
			publicKeys: [publicKey],
			network:
				envVarConfigs.NETWORK_ENV === 'testnet'
					? WalletNetwork.TESTNET
					: WalletNetwork.FUTURENET,
		})
		signedXdr = signedRes?.result
		if (signedXdr) {
			const server = getSorobanServer()
			const txHash = await submitTx({
				signedXDR: signedXdr,
				networkPassphrase: getSorobanConfig(envVarConfigs.NETWORK_ENV as string)
					?.network_passphrase as string,
				server,
			})
			return txHash
		}
	}

	// round_contract(contractId: string) {
	// 	return new RoundClient({
	// 		...this._template_config,
	// 		contractId,
	// 	})
	// }
}

export default Contracts
