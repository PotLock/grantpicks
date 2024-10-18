import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { Wallet } from '@near-wallet-selector/core'
import { providers } from 'near-api-js'
import {
	CodeResult,
	FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'

export interface ViewMethodParams {
	method: string
	args: object
}

export interface CallMethodParams {
	method: string
	args: object
	gas: string
	deposit: string
}

export class BaseContract {
	private _wallet: Wallet | null
	public networkId: string
	public contractId: string
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		this._wallet = wallet
		this.networkId = network
		this.contractId = contractId
	}

	async viewMethod({ method, args }: ViewMethodParams) {
		const url = `https://rpc.${this.networkId}.near.org`

		const provider = new providers.JsonRpcProvider({ url })

		const res = await provider.query({
			request_type: 'call_function',
			account_id: this.contractId,
			method_name: method,
			args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
			finality: 'optimistic',
		})

		return JSON.parse(Buffer.from((res as CodeResult).result).toString())
	}

	async callMethod({
		method,
		args,
		gas = THIRTY_TGAS,
		deposit = NO_DEPOSIT,
	}: CallMethodParams) {
		const outcome = await this._wallet?.signAndSendTransaction({
			receiverId: this.contractId,
			actions: [
				{
					type: 'FunctionCall',
					params: {
						methodName: method,
						args,
						gas,
						deposit,
					},
				},
			],
		})

		return {
			result: providers.getTransactionLastResult(
				outcome as FinalExecutionOutcome,
			),
			outcome: outcome as FinalExecutionOutcome,
		}
	}
}
