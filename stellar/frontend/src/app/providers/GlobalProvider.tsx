'use client'

import { getPriceCrypto } from '@/services/common'
import { IGlobalContext } from '@/types/context'
import React, { createContext, useContext, useEffect, useState } from 'react'
import PageLoading from '../components/commons/PageLoading'
import { Livepeer } from 'livepeer'
import { envVarConfigs } from '@/configs/env-var'
import { localStorageConfigs } from '@/configs/local-storage'

const GlobalContext = createContext<IGlobalContext>({
	stellarPrice: 0,
	nearPrice: 0,
	dismissPageLoading: () => { },
	openPageLoading: () => { },
	livepeer: null,
	showMenu: null,
	setShowMenu: () => { },
})

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
	const [stellarPrice, setStellarPrice] = useState<number>(0.0)
	const [nearPrice, setNearPrice] = useState<number>(0.0)
	const [pageLoading, setPageLoading] = useState<boolean>(false)
	const [livepeer, setLivepeer] = useState<Livepeer | null>(null)
	const [showMenu, setShowMenu] = useState<'choose-wallet' | 'user' | null>(
		null,
	)

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

	// Capture referredBy from URL and save to localStorage
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search)
			const referredBy = urlParams.get('referredBy')
			if (referredBy) {
				// Get logged-in user's address from localStorage
				const loggedInAddress = localStorage.getItem(
					localStorageConfigs.STELLAR_PUBLIC_KEY,
				)
				// Only save if referredBy is different from logged-in address
				if (referredBy !== loggedInAddress) {
					localStorage.setItem(localStorageConfigs.REFERRED_BY, referredBy)
				} else {
					// If referredBy matches logged-in address, remove any existing saved referrer
					localStorage.removeItem(localStorageConfigs.REFERRED_BY)
				}
			}
		}
	}, [])

	// Clear saved referrer if it matches logged-in address (when user logs in)
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const checkAndClearReferrer = () => {
				const loggedInAddress = localStorage.getItem(
					localStorageConfigs.STELLAR_PUBLIC_KEY,
				)
				const savedReferrer = localStorage.getItem(
					localStorageConfigs.REFERRED_BY,
				)
				// If logged-in address matches saved referrer, remove it
				if (loggedInAddress && savedReferrer && loggedInAddress === savedReferrer) {
					localStorage.removeItem(localStorageConfigs.REFERRED_BY)
				}
			}

			// Check on mount
			checkAndClearReferrer()

			// Listen for storage changes (when user logs in/out in other tabs)
			window.addEventListener('storage', checkAndClearReferrer)

			// Also check periodically in case storage event doesn't fire for same-tab changes
			// Check every 2 seconds to catch login events
			const interval = setInterval(checkAndClearReferrer, 2000)

			return () => {
				window.removeEventListener('storage', checkAndClearReferrer)
				clearInterval(interval)
			}
		}
	}, [])

	return (
		<GlobalContext.Provider
			value={{
				stellarPrice,
				nearPrice,
				livepeer,
				showMenu,
				dismissPageLoading,
				openPageLoading,
				setShowMenu,
			}}
		>
			{children}
			<PageLoading isOpen={pageLoading} />
		</GlobalContext.Provider>
	)
}

export const useGlobalContext = () => useContext(GlobalContext)

export default GlobalProvider
