'use client'

import { getPriceCrypto } from '@/services/common'
import { IGlobalContext } from '@/types/context'
import React, { createContext, useContext, useEffect, useState } from 'react'
import PageLoading from '../components/commons/PageLoading'

const GlobalContext = createContext<IGlobalContext>({
	stellarPrice: 0,
	nearPrice: 0,
	dismissPageLoading: () => {},
	openPageLoading: () => {},
})

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
	const [stellarPrice, setStellarPrice] = useState<number>(0.0)
	const [nearPrice, setNearPrice] = useState<number>(0.0)
	const [pageLoading, setPageLoading] = useState<boolean>(false)

	const dismissPageLoading = () => {
		setPageLoading(false)
	}

	const openPageLoading = () => {
		setPageLoading(true)
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
	}, [])
	return (
		<GlobalContext.Provider
			value={{
				stellarPrice,
				nearPrice,
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
