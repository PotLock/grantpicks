import { Wallet } from '@near-wallet-selector/core'
import { BaseContract } from './contract'
import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'

export class ListsContract extends BaseContract {
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		super(wallet, network, contractId)
	}

	async getLists(from_index: number, limit: number) {
		const result = await this.viewMethod({
			method: 'get_lists',
			args: {
				from_index,
				limit,
			},
		})

		return result
	}

	async registerList(listId: string, txOnly: boolean = false) {
		if (!txOnly) {
			const result = await this.callMethod({
				method: 'register_batch',
				args: {
					list_id: parseInt(listId),
				} as any,
				deposit: NO_DEPOSIT,
				gas: THIRTY_TGAS,
			})

			return result
		} else {
			return await this.generateTxOnly({
				method: 'register_batch',
				args: {
					list_id: parseInt(listId),
				} as any,
				deposit: '17830000000000000000000',
				gas: THIRTY_TGAS,
			})
		}
	}

	async getRegistrations(
		listId: string,
		from_index: number,
		limit: number,
	): Promise<any> {
		const result = await this.viewMethod({
			method: 'get_registrations_for_list',
			args: {
				list_id: parseInt(listId),
				from_index,
				limit,
			},
		})

		return result
	}
}
