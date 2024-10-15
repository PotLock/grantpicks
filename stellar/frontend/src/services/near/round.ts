import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { Wallet } from '@near-wallet-selector/core'
import { providers, utils, Contract } from 'near-api-js'
import {
	CodeResult,
	FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import { NearCreateRoundParams, NearRound } from './type'

export interface ViewMethodParams {
	contractId: string
	method: string
	args: Object
}

export interface CallMethodParams {
	contractId: string
	method: string
	args: any
	gas: string
	deposit: string
}

export class RoundContract {
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

		console.log(res)

		return JSON.parse(Buffer.from((res as CodeResult).result).toString())
	}

	async callMethod({
		contractId,
		method,
		args,
		gas = THIRTY_TGAS,
		deposit = NO_DEPOSIT,
	}: CallMethodParams) {
		const outcome = await this._wallet?.signAndSendTransaction({
			receiverId: contractId,
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

		return providers.getTransactionLastResult(outcome as FinalExecutionOutcome)
	}

	async createRound(params: NearCreateRoundParams): Promise<NearRound> {
		const result = await this.callMethod({
			contractId: this.contractId,
			method: 'create_round',
			args: {
				round_detail: params,
			} as any,
			deposit: NO_DEPOSIT,
			gas: THIRTY_TGAS,
		})

		return result
	}

	async getRounds(from_index: number, limit: number) {
		const result = await this.viewMethod({
			contractId: this.contractId,
			method: 'get_rounds',
			args: {
				from_index,
				limit,
			},
		})

		return result
	}
}
