'use client'

import { getPriceCrypto } from '@/services/common'
import { IGlobalContext } from '@/types/context'
import React, { createContext, useContext, useEffect, useState } from 'react'

const GlobalContext = createContext<IGlobalContext>({
	stellarPrice: 0,
	nearPrice: 0,
})

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
	const [stellarPrice, setStellarPrice] = useState<number>(0.0)
	const [nearPrice, setNearPrice] = useState<number>(0.0)

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
			}}
		>
			{children}
		</GlobalContext.Provider>
	)
}

export const useGlobalContext = () => useContext(GlobalContext)

export default GlobalProvider
