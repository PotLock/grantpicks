'use client'

import { GPRound } from '@/models/round'
import axios, { AxiosInstance } from 'axios'
import React from 'react'

export class PotlockService {
	private _axios: AxiosInstance | null = null
	constructor() {
		this._axios = axios.create({
			baseURL: process.env.NEXT_PUBLIC_POTLOCK_API_URL || '',
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

	async getRound(roundId: number): Promise<GPRound> {
		const result = await this._axios?.get(`/round/${roundId}`)
		return result?.data
	}

	async getApplications(roundId: number, page: number = 1) {
		const result = await this._axios?.get(
			`/rounds/${roundId}/applications?page=${page}`,
		)
		return result?.data.results
	}

	async getVotes(roundId: number, project_id: number, page: number = 1) {
		const result = await this._axios?.get(
			`/round/${roundId}/${project_id}/votes?page=${page}`,
		)
		return result?.data.results
	}

	async getProjectByOwner(owner: string) {
		const result = await this._axios?.get(`/projects?owner=${owner}`)
		return result?.data.results && result?.data.results.length > 0
			? result?.data.results[0]
			: null
	}

	async getProjectStats(projectId: number, owner: string) {
		const result = await this._axios?.get(
			`/${owner}/${projectId}/project-stats`,
		)
		return result?.data
	}

	async getAccounts(accountId: string) {
		const result = await this._axios?.get(`/accounts/${accountId}`)
		return result?.data
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
