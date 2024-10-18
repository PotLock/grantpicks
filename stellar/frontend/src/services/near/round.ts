import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { Wallet } from '@near-wallet-selector/core'
import { providers } from 'near-api-js'
import {
	AccountView,
	CodeResult,
	FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import { NearConfig, NearCreateRoundParams, NearRound } from './type'

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

		return {
			result: providers.getTransactionLastResult(
				outcome as FinalExecutionOutcome,
			),
			outcome: outcome as FinalExecutionOutcome,
		}
	}

	async createRound(params: NearCreateRoundParams): Promise<{
		result: NearRound
		outcome: FinalExecutionOutcome
	}> {
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

	async deposit(
		roundId: number,
		amount: string | null,
	): Promise<{
		result: any
		outcome: FinalExecutionOutcome
	}> {
		const result = await this.callMethod({
			contractId: this.contractId,
			method: 'deposit_to_round',
			args: {
				round_id: parseInt(roundId.toString()),
				memo: undefined,
				referral_id: undefined,
			},
			deposit: amount || NO_DEPOSIT,
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

	async getRoundById(roundId: number): Promise<NearRound> {
		const result = await this.viewMethod({
			contractId: this.contractId,
			method: 'get_round',
			args: {
				round_id: parseInt(roundId.toString()),
			},
		})

		return result
	}

	async getConfig(): Promise<NearConfig> {
		const result = await this.viewMethod({
			contractId: this.contractId,
			method: 'get_config',
			args: {},
		})

		return result
	}

	async getBalance(accountId: string): Promise<AccountView> {
		const url = `https://rpc.${this.networkId}.near.org`

		const provider = new providers.JsonRpcProvider({ url })

		const res = await provider.query({
			request_type: 'view_account',
			account_id: accountId,
			finality: 'final',
		})

		return res as AccountView
	}
}
