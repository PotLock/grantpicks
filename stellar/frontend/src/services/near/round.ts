import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { Wallet } from '@near-wallet-selector/core'
import { providers } from 'near-api-js'
import {
	AccountView,
	FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import { NearConfig, NearCreateRoundParams, NearRound } from './type'
import { BaseContract } from './contract'

export class RoundContract extends BaseContract {
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		super(wallet, network, contractId)
	}

	async createRound(params: NearCreateRoundParams): Promise<{
		result: NearRound
		outcome: FinalExecutionOutcome
	}> {
		const result = await this.callMethod({
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
			method: 'get_round',
			args: {
				round_id: parseInt(roundId.toString()),
			},
		})

		return result
	}

	async getConfig(): Promise<NearConfig> {
		const result = await this.viewMethod({
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
