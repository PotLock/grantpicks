'use client'

import { getPriceCrypto } from '@/services/common'
import { IGlobalContext } from '@/types/context'
import React, { createContext, useContext, useEffect, useState } from 'react'
import PageLoading from '../components/commons/PageLoading'
import { Livepeer } from 'livepeer'
import { envVarConfigs } from '@/configs/env-var'

const GlobalContext = createContext<IGlobalContext>({
	stellarPrice: 0,
	nearPrice: 0,
	dismissPageLoading: () => {},
	openPageLoading: () => {},
	livepeer: null,
})

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
	const [stellarPrice, setStellarPrice] = useState<number>(0.0)
	const [nearPrice, setNearPrice] = useState<number>(0.0)
	const [pageLoading, setPageLoading] = useState<boolean>(false)
	const [livepeer, setLivepeer] = useState<Livepeer | null>(null)

	const dismissPageLoading = () => {
		setPageLoading(false)
	}

	const openPageLoading = () => {
		setPageLoading(true)
	}

	const initLivePeer = () => {
		const livepeer = new Livepeer({ apiKey: envVarConfigs.LIVEPEER_API_KEY })
		setLivepeer(livepeer)
	}

	useEffect(() => {
		const getPriceStellarToUsd = async () => {
			const res = await getPriceCrypto('XLM', 'USD')
			setStellarPrice(res?.data['USD'] || 0)
		}
		const getPriceNearToUsd = async () => {
			const res = await getPriceCrypto('NEAR', 'USD')
			setNearPrice(res?.data['USD'] || 0)
		}
		getPriceStellarToUsd()
		getPriceNearToUsd()
		initLivePeer()
	}, [])
	return (
		<GlobalContext.Provider
			value={{
				stellarPrice,
				nearPrice,
				livepeer,
				dismissPageLoading,
				openPageLoading,
			}}
		>
			{children}
			<PageLoading isOpen={pageLoading} />
		</GlobalContext.Provider>
	)
}

export const useGlobalContext = () => useContext(GlobalContext)

export default GlobalProvider
