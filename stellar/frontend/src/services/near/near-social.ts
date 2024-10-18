import { Wallet } from '@near-wallet-selector/core'
import { BaseContract } from './contract'
import { NO_DEPOSIT, THIRTY_TGAS } from '@/constants/near'
import { parseNearAmount } from 'near-api-js/lib/utils/format'

export type NearSocialGPProject = {
	name: string
	overview: string
	video_url: string
	image_url: string
	owner: string
	payout_address: string
	contacts: NearProjectContact[]
	contracts: NearProjectContract[]
	team_members: string[]
	repositories: NearProjectRepository[]
	fundings: NearProjectFundingHistory[]
}

export type NearProjectContact = {
	name: string
	value: string
}

export type NearProjectContract = {
	name: string
	contract_address: string
}

export type NearProjectRepository = {
	label: string
	url: string
}

export type NearSocialGPUser = {
	id: number
	name: string
	email: string
	avatar: string
	bio: string
}

export type NearProjectFundingHistory = {
	amount: string
	denomination: string
	description: string
	funded_ms: number
	source: string
}

export class NearSocial extends BaseContract {
	constructor(wallet: Wallet | null, network: string, contractId: string) {
		super(wallet, network, contractId)
	}

	async getProfile(accountId: string) {
		const result = await this.viewMethod({
			method: 'get',
			args: {
				keys: [`${accountId}/profile/**`],
			},
		})
		return result
	}

	async getProjectData(accountId: string) {
		const result = await this.viewMethod({
			method: 'get',
			args: {
				keys: [`${accountId}/gp_project`],
			},
		})
		return result
	}

	async setProjectData(accountId: string, projectData: NearSocialGPProject) {
		const result = await this.callMethod({
			method: 'set',
			args: {
				keys: [`${accountId}/gp_project`],
				data: projectData,
			},
			deposit: parseNearAmount('0.1') || NO_DEPOSIT,
			gas: THIRTY_TGAS,
		})

		return result
	}
}
