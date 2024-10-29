import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { Transaction, Wallet } from '@near-wallet-selector/core'
import { providers } from 'near-api-js'
import {
	AccountView,
	FinalExecutionOutcome,
} from 'near-api-js/lib/providers/provider'
import {
	NearConfig,
	NearCreateRoundParams,
	NearPair,
	NearPick,
	NearProjectApplication,
	NearRound,
	NearUpdateRoundParams,
} from './type'
import { BaseContract } from './contract'
import { parseNearAmount } from 'near-api-js/lib/utils/format'

export class RoundContract extends BaseContract {
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		super(wallet, network, contractId)
	}

	async createRound(
		params: NearCreateRoundParams,
		txOnly: boolean = false,
	): Promise<
		| {
				result: NearRound
				outcome: FinalExecutionOutcome
		  }
		| Transaction
	> {
		if (!txOnly) {
			const result = await this.callMethod({
				method: 'create_round',
				args: {
					round_detail: params,
				} as any,
				deposit: parseNearAmount('0.085') || NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})

			return result
		} else {
			return await this.generateTxOnly({
				method: 'create_round',
				args: {
					round_detail: params,
				} as any,
				deposit: parseNearAmount('0.085') || NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})
		}
	}

	async editRound(
		params: NearUpdateRoundParams,
		txOnly: boolean = false,
	): Promise<
		| {
				result: NearRound
				outcome: FinalExecutionOutcome
		  }
		| Transaction
	> {
		if (!txOnly) {
			const result = await this.callMethod({
				method: 'update_round',
				args: params as any,
				deposit: NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})

			return result
		} else {
			return await this.generateTxOnly({
				method: 'update_round',
				args: params as any,
				deposit: NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})
		}
	}

	async deposit(
		roundId: number,
		amount: string | null,
		txOnly: boolean = false,
	): Promise<
		| {
				result: any
				outcome: FinalExecutionOutcome
		  }
		| Transaction
	> {
		if (!txOnly) {
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
		} else {
			return await this.generateTxOnly({
				method: 'deposit_to_round',
				args: {
					round_id: parseInt(roundId.toString()),
					memo: undefined,
					referral_id: undefined,
				},
				deposit: amount || NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})
		}
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

	async applyProjectToRound(
		roundId: number,
		note: string,
		videoUrl: string,
		accountId?: string,
	) {
		const result = await this.callMethod({
			method: 'apply_to_round',
			args: {
				round_id: parseInt(roundId.toString()),
				note,
				video_url: videoUrl,
				review_note: accountId
					? `Added By Admin/Owner ${accountId}`
					: undefined,
				applicant: accountId ? accountId : undefined,
			},
			deposit: NO_DEPOSIT,
			gas: THIRTY_TGAS,
		})

		return result
	}

	async getApplicationsForRound(
		roundId: number,
		skip: number,
		limit: number,
	): Promise<NearProjectApplication[]> {
		const result = await this.viewMethod({
			method: 'get_applications_for_round',
			args: {
				round_id: parseInt(roundId.toString()),
				skip,
				limit,
			},
		})

		return result
	}

	async getApplicationForRound(
		roundId: number,
		accountId: string,
	): Promise<NearProjectApplication | undefined> {
		const result = await this.viewMethod({
			method: 'get_application',
			args: {
				round_id: parseInt(roundId.toString()),
				applicant_id: accountId,
			},
		})

		return result
	}

	async addProjectsToRound(
		roundId: number,
		addresses: string[],
		txOnly: boolean = false,
	) {
		if (!txOnly) {
			const result = await this.callMethod({
				method: 'apply_to_round_batch',
				args: {
					round_id: parseInt(roundId.toString()),
					applicants: addresses,
					review_notes: addresses.map(() => 'Added By Admin/Owner'),
				},
				deposit: NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})

			return result
		} else {
			return await this.generateTxOnly({
				method: 'apply_to_round_batch',
				args: {
					round_id: parseInt(roundId.toString()),
					applicants: addresses,
					review_notes: addresses.map(() => 'Added By Admin/Owner'),
				},
				deposit: NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})
		}
	}

	async reviewApplication(
		roundId: number,
		applicantId: string,
		note: string,
		status: string,
	) {
		const result = await this.callMethod({
			method: 'review_application',
			args: {
				round_id: parseInt(roundId.toString()),
				applicant: applicantId,
				note,
				status,
			},
			deposit: NO_DEPOSIT,
			gas: THIRTY_TGAS,
		})

		return result
	}

	async canVote(roundId: number, accountId: string): Promise<boolean> {
		const result = await this.viewMethod({
			method: 'can_vote',
			args: {
				round_id: parseInt(roundId.toString()),
				voter: accountId,
			},
		})

		return result
	}

	async hasVote(roundId: number, accountId: string): Promise<boolean> {
		const result = await this.viewMethod({
			method: 'has_voted',
			args: {
				round_id: parseInt(roundId.toString()),
				voter: accountId,
			},
		})

		return result
	}

	async getPairsRound(roundId: number): Promise<NearPair[]> {
		const result = await this.viewMethod({
			method: 'get_pairs_to_vote',
			args: {
				round_id: parseInt(roundId.toString()),
			},
		})

		return result
	}

	async castVote(roundId: number, picks: NearPick[]) {
		const result = await this.callMethod({
			method: 'vote',
			args: {
				round_id: parseInt(roundId.toString()),
				picks: picks,
			},
			deposit: NO_DEPOSIT,
			gas: THIRTY_TGAS,
		})

		return result
	}

	async getVotedRound(accountId: string) {
		const result = await this.viewMethod({
			method: 'get_voted_round',
			args: {
				voter: accountId,
			},
		})

		return result
	}
}
