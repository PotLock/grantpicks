'use client'

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { WalletContext } from '../contexts/WalletContext'
import { envVarConfigs } from '@/configs/env-var'
import { localStorageConfigs } from '@/configs/local-storage'

import {
	FreighterModule,
	ISupportedWallet,
	AlbedoModule,
	HotWalletModule,
	StellarWalletsKit,
	WalletNetwork,
	LobstrModule,
	xBullModule,
	HanaModule,
	RabetModule,
} from '@creit.tech/stellar-wallets-kit'
import CMDWallet from '@/lib/wallet'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { IAccount } from '@/types/account'
import { usePotlockService } from '@/services/potlock'
import toast from 'react-hot-toast'
import { LedgerModule } from "@creit.tech/stellar-wallets-kit/modules/ledger.module";
import { SavedWallet } from './types'
import { localStorageSavedWallet } from '@/utils/helper'
import { Network } from '@/types/on-chain'


const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [connectedWallet, setConnectedWallet] = useState<
		'stellar' | null
	>(null)
	const [profileData, setProfileData] = useState<IAccount>()
	const potlockService = usePotlockService()

	// stellar
	const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null)
	const [stellarPubKey, setStellarPubKey] = useState<string>('')
	const [currentBalance, setCurrentBalance] = useState<number | null>()
	const [savedWallet, setSavedWallet] = useState<SavedWallet | null>(null)
	const [hasAttemptedAutoConnect, setHasAttemptedAutoConnect] = useState<boolean>(false)
	const [isInit, setIsInit] = useState<boolean>(true)
	const store = useAppStorage()

	useEffect(() => {
		const localSavedWallet = localStorageSavedWallet.get()
		if (localSavedWallet && localSavedWallet.network.id === envVarConfigs.NETWORK_ENV) {
			setSavedWallet(localSavedWallet)
		}
	}, [])

	const createKit = useMemo(() => {
		const localSavedWallet = localStorageSavedWallet.get()
		return new StellarWalletsKit({
			network:
				envVarConfigs.NETWORK_ENV === 'testnet'
					? WalletNetwork.TESTNET
					: WalletNetwork.PUBLIC,
			selectedWalletId:
				localSavedWallet?.id ||
				"",
			modules: [
				new FreighterModule(),
				new AlbedoModule(),
				new xBullModule(),
				new LobstrModule(),
				new RabetModule(),
				new HanaModule(),
				new LedgerModule(),
				...(envVarConfigs.NETWORK_ENV !== 'testnet'
					? [new HotWalletModule()]
					: []),
			],
		})
	}, [savedWallet])

	const onInitStellar = useCallback(async () => {
		try {
			const kit: StellarWalletsKit = createKit
			setStellarKit(kit)
			if (kit) {
				onCheckConnected(kit)
			}
		} catch (error: any) {
			toast.error('Error initializing Stellar wallet, please try again')
			onSignOut()
		}
	}, [createKit])

	const checkNetworkValidation = async () => {
		const appNetwork = envVarConfigs.NETWORK_ENV
		if (stellarKit) {
			const currentAppNetwork = appNetwork === 'testnet' ? 'TESTNET' : 'PUBLIC'
			try {
				const info = await stellarKit.getNetwork()
				if (![currentAppNetwork, 'mainnet'].includes(info.network)) {
					toast.error(
						`Network Mismatch: Your Stellar wallet is set to ${info.network} but this app is running on ${currentAppNetwork}. Please switch networks in your wallet.`,
						{ duration: 6000 },
					)
					return false
				}
				return true
			} catch {
				return true
			}
		}
		return true
	}
	const handleSetWalletAddress = async (kit: StellarWalletsKit, opts?: { skipRequestAccess?: boolean }) => {
		try {
			const addressRes = await kit.getAddress({ skipRequestAccess: Boolean(opts?.skipRequestAccess) })
			const pubKey = addressRes?.address
			if (!pubKey) return false

			setConnectedWallet('stellar')
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
			setStellarPubKey(pubKey)
			localStorage.setItem(localStorageConfigs.STELLAR_PUBLIC_KEY, pubKey)
			store.setMyAddress(pubKey)
			store.setChainId('stellar')
			store.setNetwork(envVarConfigs.NETWORK_ENV === 'testnet' ? 'testnet' : 'mainnet')

			let cmdWallet = new CMDWallet({ stellarPubKey: pubKey })
			const filterXLM = (await cmdWallet.getBalances()).filter((xlm) => xlm.asset_type === 'native')
			if (filterXLM?.[0]?.balance) {
				setCurrentBalance(parseInt(filterXLM[0].balance))
			}
			return true
		} catch {
			return false
		}
	}

	useEffect(() => {
		let t: any
		if (
			!connectedWallet &&
			!hasAttemptedAutoConnect &&
			savedWallet?.id &&
			![undefined as any, 'false', 'wallet_connect'].includes(savedWallet.id as any) &&
			savedWallet.network.id === envVarConfigs.NETWORK_ENV &&
			stellarKit
		) {
			t = setTimeout(async () => {
				try {
					stellarKit.setWallet(savedWallet.id)
					const success = await handleSetWalletAddress(stellarKit, { skipRequestAccess: true })
					if (!success) {
						setHasAttemptedAutoConnect(true)
					}
				} catch {
					setHasAttemptedAutoConnect(true)
				}
			}, 750)
		}
		return () => clearTimeout(t)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [savedWallet?.id, stellarKit, connectedWallet, hasAttemptedAutoConnect])





	const onCheckConnected = async (kit?: StellarWalletsKit) => {
		const localStellarPubKey = localStorage.getItem(
			localStorageConfigs.STELLAR_PUBLIC_KEY,
		)
		if (kit && localStellarPubKey) {
			const isNetworkValid = await checkNetworkValidation()
			if (!isNetworkValid) {
				localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
				localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
				setConnectedWallet(null)
				setStellarPubKey('')
				store.clear()
				return
			}

			// Use cached public key directly to avoid wallet prompts on refresh
			setConnectedWallet('stellar')
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
			setStellarPubKey(localStellarPubKey)
			localStorage.setItem(
				localStorageConfigs.STELLAR_PUBLIC_KEY,
				localStellarPubKey,
			)

			let cmdWallet = new CMDWallet({
				stellarPubKey: localStellarPubKey,
			})
			const filterXLM = (await cmdWallet.getBalances()).filter(
				(xlm) => xlm.asset_type === 'native',
			)
			const balances = parseInt(filterXLM[0].balance)
			setCurrentBalance(balances)

			store.setMyAddress(localStellarPubKey)
			store.setChainId('stellar')
			store.setNetwork(
				envVarConfigs.NETWORK_ENV === 'testnet' ? 'testnet' : 'mainnet',
			)
			return
		} else {
			store.clear()
			setConnectedWallet(null)
		}
	}

	const onOpenStellarWallet = (
		onSelected?: (option: ISupportedWallet) => void,
	) => {
		// ensure kit exists before opening modal
		const kit = stellarKit ?? createKit
		if (!stellarKit) setStellarKit(kit)
		kit.openModal({
			onWalletSelected: async (option: ISupportedWallet) => {
				try {
					kit.setWallet(option.id)
					localStorage.setItem(
						localStorageConfigs.LAST_STELLAR_WALLET_ID,
						option.id,
					)
					localStorageSavedWallet.set({
						id: option.id,
						network: {
							id: envVarConfigs.NETWORK_ENV as Network,
							label: option.name,
						},
					})

					const appNetwork = envVarConfigs.NETWORK_ENV
					const currentAppNetwork =
						appNetwork === 'testnet' ? 'TESTNET' : 'PUBLIC'
					try {
						const info = await kit.getNetwork()
						if (![currentAppNetwork, 'mainnet'].includes(info.network)) {
							toast.error(
								`Network Mismatch: Your Stellar wallet is set to ${info.network} but this app is running on ${currentAppNetwork}. Please switch networks in your wallet.`,
								{ duration: 6000 },
							)
							return
						}
					} catch { }

					const pubKey = (await kit.getAddress()).address
					let cmdWallet = new CMDWallet({
						stellarPubKey: pubKey,
					})
					const filterXLM = (await cmdWallet.getBalances()).filter(
						(xlm) => xlm.asset_type === 'native',
					)
					setConnectedWallet('stellar')
					localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
					setStellarPubKey(pubKey)
					store.setMyAddress(pubKey)
					localStorage.setItem(localStorageConfigs.STELLAR_PUBLIC_KEY, pubKey)
					const balances = parseInt(filterXLM[0].balance)
					setCurrentBalance(balances)

					onSelected?.(option)
				} catch (error: any) {
					toast.error(
						'Error connecting to Stellar wallet, Your account is inactive (deposit XLM tokens to activate it)',
					)
					onSignOut()
				}
			},
		})
	}

	const onSignOut = async () => {
		localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
		localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
		setConnectedWallet(null)
		localStorageSavedWallet.remove()
		setStellarPubKey('')
		store.clear()
	}

	useEffect(() => {
		const initialization = async () => {
			setIsInit(true)
			// onInitNear() // disabled
			onInitStellar()
			setIsInit(false)
		}
		initialization()
	}, [onInitStellar])


	// NEAR effect subscription disabled

	const fetchProfileData = async () => {
		try {
			const profileData = await potlockService.getAccounts(stellarPubKey)
			setProfileData(profileData)
		} catch {
			// ignore missing account
		}
	}

	useEffect(() => {
		fetchProfileData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stellarPubKey])

	if (!isInit) {
		return (
			<WalletContext.Provider
				value={{
					connectedWallet,
					onSignOut,
					stellarKit,
					stellarPubKey,
					onOpenStellarWallet,
					currentBalance,
					profileData,
				}}
			>
				{children}
			</WalletContext.Provider>
		)
	}
}

export const useWallet = () => {
	return useContext(WalletContext)
}

export default WalletProvider
