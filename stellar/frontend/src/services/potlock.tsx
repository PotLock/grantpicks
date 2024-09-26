import axios, { AxiosInstance } from 'axios'
import React from 'react'

export class PotlockService {
	private _axios: AxiosInstance | null = null
	constructor() {
		this._axios = axios.create({
			baseURL: process.env.NEXT_PUBLIC_POTLOCK_API_URL || '',
		})
	}

	async getRounds(skip: number = 0, limit: number = 0) {
    
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
