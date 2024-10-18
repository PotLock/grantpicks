import { Wallet } from '@near-wallet-selector/core'
import { providers } from 'near-api-js'
import { CodeResult } from 'near-api-js/lib/providers/provider'

export interface ViewMethodParams {
	contractId: string
	method: string
	args: object
}

export interface CallMethodParams {
	contractId: string
	method: string
	args: object
	gas: string
	deposit: string
}

export class ListsContract {
	private _wallet: Wallet | null
	private networkId: string
	private contractId: string
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		this._wallet = wallet
		this.networkId = network
		this.contractId = contractId
	}

	async viewMethod({ contractId, method, args }: ViewMethodParams) {
		const url = `https://rpc.${this.networkId}.near.org`

		const provider = new providers.JsonRpcProvider({ url })

		const res = await provider.query({
			request_type: 'call_function',
			account_id: contractId,
			method_name: method,
			args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
			finality: 'optimistic',
		})

		return JSON.parse(Buffer.from((res as CodeResult).result).toString())
	}

	async getLists(from_index: number, limit: number) {
		const result = await this.viewMethod({
			contractId: this.contractId,
			method: 'get_lists',
			args: {
				from_index,
				limit,
			},
		})

		return result
	}
}
