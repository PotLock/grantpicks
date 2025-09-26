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
		chainId: string | null = null,
	) {
		let url = `/rounds?sort=${sort}&page=${page}`
		if (chainId) {
			url += `&chain=${chainId}`
		}
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

	async getLists(chain: string = 'stellar') {
		const result = await this._axios?.get(`/lists?chain=${chain}`)
		return result?.data.results
	}

	async getList(listId: number) {
		const result = await this._axios?.get(`/lists/${listId}?chain=stellar`)
		return result?.data
	}

	async getProjectStats(owner: string) {
		const result = await this._axios?.get(`/${owner}/project-stats`)
		return result?.data
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
