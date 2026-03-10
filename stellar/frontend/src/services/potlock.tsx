'use client'

import { envVarConfigs } from '@/configs/env-var'
import { GPApplication } from '@/models/application'
import { GPRound } from '@/models/round'
import axios, { AxiosInstance } from 'axios'
import React from 'react'

export class PotlockService {
	private _axios: AxiosInstance | null = null
	constructor() {
		this._axios = axios.create({
			baseURL: envVarConfigs.API_BASE_URL || '',
		})
	}

	async getRounds(
		page: number = 1,
		sort: string = 'deployed_at',
	) {
		let url = `/rounds?sort=${sort}&page=${page}`
		const result = await this._axios?.get(url)
		return result?.data.results
	}

	async getRound(
		roundId: number,
	): Promise<Omit<GPRound, 'admins'> & { admins: { id: string }[] }> {
		const result = await this._axios?.get(`/round/${roundId}`)
		return result?.data
	}

	async getApplications(roundId: number): Promise<GPApplication[]> {
		const result = await this._axios?.get(`/rounds/${roundId}/applications`)
		return result?.data.results
	}

	async getVotes(roundId: number, owner: string, page: number = 1) {
		const result = await this._axios?.get(
			`/round/${roundId}/${owner}/votes?page=${page}`,
		)
		return result?.data.results
	}

	async getRoundVotes(roundId: number, page: number = 1, limit: number = 20) {
		const result = await this._axios?.get(
			`/round/${roundId}/votes?page=${page}&limit=${limit}`,
		)
		return result?.data
	}

	async getProjects(skip: number, limit: number) {
		const result = await this._axios?.get(
			`/projects?skip=${skip}&limit=${limit}`,
		)
		return result?.data.results
	}

	async getProjectByOwner(owner: string) {
		const result = await this._axios?.get(`/projects?owner=${owner}`)
		return result?.data.results && result?.data.results.length > 0
			? result?.data.results[0]
			: null
	}

	async getProjectById(projectId: string) {
		const result = await this._axios?.get(`/${projectId}/projects`)
		return result?.data
	}

	async getLists(chain: string = 'stellar') {
		const result = await this._axios?.get(`/lists?chain=${chain}`)
		return result?.data.results
	}

	async getList(listId: number) {
		const result = await this._axios?.get(`/lists/${listId}?chain=stellar`)
		return result?.data
	}

	async getProjectStats(owner: string) {
		try {
			const result = await this._axios?.get(`/${owner}/project-stats`)
			return (
				result?.data || {
					total_funds_received: 0,
					rounds_participated: 0,
					total_votes: 0,
				}
			)
		} catch (error) {
			console.log('error getProjectStats', error)
			return {
				total_funds_received: 0,
				rounds_participated: 0,
				total_votes: 0,
			}
		}
	}

	async syncProject(projectId: number) {
		try {
			const result = await this._axios?.post(`/grantpicks/projects/${projectId}/sync`)
			return result?.data
		} catch (error) {
			console.log('error syncProject', error)
		}
	}

	async syncRound(roundId: number) {
		try {
			const result = await this._axios?.post(`/grantpicks/rounds/${roundId}/sync`)
			return result?.data
		} catch (error) {
			console.log('error syncRound', error)
		}
	}

	async syncRoundApplications(roundId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/rounds/${roundId}/applications/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncRoundApplications', error)
		}
	}

	async syncApplicationReview(
		roundId: number,
		applicantId: string,
		reviewerId: string,
	) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/rounds/${roundId}/applications/review/sync`,
				{ applicant_id: applicantId, reviewer_id: reviewerId },
			)
			return result?.data
		} catch (error) {
			console.log('error syncApplicationReview', error)
		}
	}

	async syncApprovedProjects(roundId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/rounds/${roundId}/approved-projects/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncApprovedProjects', error)
		}
	}

	async syncRoundDeposits(roundId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/rounds/${roundId}/deposits/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncRoundDeposits', error)
		}
	}

	async syncRoundVotes(roundId: number) {
		try {
			const result = await this._axios?.post(`/grantpicks/rounds/${roundId}/votes/sync`)
			return result?.data
		} catch (error) {
			console.log('error syncRoundVotes', error)
		}
	}

	async syncRoundPayouts(roundId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/rounds/${roundId}/payouts/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncRoundPayouts', error)
		}
	}

	async syncList(listId: number) {
		try {
			const result = await this._axios?.post(`/grantpicks/lists/${listId}/sync`)
			return result?.data
		} catch (error) {
			console.log('error syncList', error)
		}
	}

	async syncListRegistrations(listId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/lists/${listId}/registrations/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncListRegistrations', error)
		}
	}

	async syncSingleRegistration(listId: number, registrantId: string) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/lists/${listId}/registrations/${registrantId}/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncSingleRegistration', error)
		}
	}

	async syncListDelete(listId: number) {
		try {
			const result = await this._axios?.post(
				`/grantpicks/lists/${listId}/delete/sync`,
			)
			return result?.data
		} catch (error) {
			console.log('error syncListDelete', error)
		}
	}

	async getAccounts(accountId: string) {
		const result = await this._axios?.get(`/accounts/${accountId}`)
		return result?.data
	}

	async getMyRounds(accountId: string) {
		const result = await this._axios?.get(`/accounts/${accountId}/rounds`)
		return result?.data.results
	}
}

export const PotlockServiceContext = React.createContext<PotlockService>(
	new PotlockService(),
)

export const PotlockServiceProvider = ({
	children,
}: {
	children: React.ReactNode
}) => {
	const potlockService = new PotlockService()

	return (
		<PotlockServiceContext.Provider value={potlockService}>
			{children}
		</PotlockServiceContext.Provider>
	)
}

export const usePotlockService = () => React.useContext(PotlockServiceContext)
