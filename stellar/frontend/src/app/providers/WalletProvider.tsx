'use client'

import React, { useContext, useEffect, useState } from 'react'
import { WalletContext } from '../contexts/WalletContext'
import { envVarConfigs } from '@/configs/env-var'
// import {
// 	Wallet,
// 	WalletSelector,
// } from '@near-wallet-selector/core'
// import type { WalletSelectorModal } from '@near-wallet-selector/modal-ui'
import { localStorageConfigs } from '@/configs/local-storage'
// import {
// 	Account,
// 	SignMessageMethod,
// 	// WalletModuleFactory,
// } from '@near-wallet-selector/core/src/lib/wallet'
import {
	xBullModule,
	FreighterModule,
	ISupportedWallet,
	HotWalletModule,
	XBULL_ID,
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
// import { distinctUntilChanged, map } from 'rxjs'
import CMDWallet from '@/lib/wallet'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { IAccount } from '@/types/account'
import { usePotlockService } from '@/services/potlock'
// import { formatNearAmount } from 'near-api-js/lib/utils/format'
import toast from 'react-hot-toast'

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [connectedWallet, setConnectedWallet] = useState<
		'near' | 'stellar' | null
	>(null)
	const [profileData, setProfileData] = useState<IAccount>()
	const potlockService = usePotlockService()
	// near (disabled)
	// const [nearSelector, setNearSelector] = useState<WalletSelector | null>(null)
	// const [nearModal, setNearModal] = useState<WalletSelectorModal | null>(null)
	// const [nearWallet, setNearWallet] = useState<(Wallet & SignMessageMethod) | null>(null)
	// const [nearAccounts, setNearAccounts] = useState<Account[]>([])
	// stellar
	const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null)
	const [stellarPubKey, setStellarPubKey] = useState<string>('')
	const [currentBalance, setCurrentBalance] = useState<number | null>()
	const [isInit, setIsInit] = useState<boolean>(true)
	const store = useAppStorage()

	// const onInitNear = async () => { /* disabled */ }

	const createKit = () => {
		return new StellarWalletsKit({
			network:
				envVarConfigs.NETWORK_ENV === 'testnet'
					? WalletNetwork.TESTNET
					: WalletNetwork.PUBLIC,
			selectedWalletId:
				localStorage.getItem(localStorageConfigs.LAST_STELLAR_WALLET_ID) ||
				XBULL_ID,
			modules: [
				new FreighterModule(),
				new xBullModule(),
				...(envVarConfigs.NETWORK_ENV !== 'testnet' ? [new HotWalletModule()] : []),
			],
		})
	}

	const onInitStellar = async () => {
		try {
			const kit: StellarWalletsKit = createKit()
			setStellarKit(kit)
			if (kit) {
				onCheckConnected(kit)
			}
		} catch (error: any) {
			console.log('error', error)
			toast.error('Error initializing Stellar wallet, please try again')
			localStorage.removeItem(localStorageConfigs.LAST_STELLAR_WALLET_ID)
			localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
			localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
			setConnectedWallet(null)
			setStellarPubKey('')
			store.clear()
		}
	}

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

			const pubKey = (await kit?.getAddress()).address
			setConnectedWallet('stellar')
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
			setStellarPubKey(localStellarPubKey || pubKey)
			localStorage.setItem(
				localStorageConfigs.STELLAR_PUBLIC_KEY,
				localStellarPubKey || pubKey,
			)

			let cmdWallet = new CMDWallet({
				stellarPubKey: localStellarPubKey,
			})
			const filterXLM = (await cmdWallet.getBalances()).filter(
				(xlm) => xlm.asset_type === 'native',
			)
			const balances = parseInt(filterXLM[0].balance)
			setCurrentBalance(balances)

			store.setMyAddress(localStellarPubKey || pubKey)
			store.setChainId('stellar')
			store.setNetwork(envVarConfigs.NETWORK_ENV === 'testnet' ? 'testnet' : 'mainnet')
			return
		} else {
			store.clear()
			setConnectedWallet(null)
		}
	}

	// const onOpenNearWallet = () => { /* disabled */ }

	const onOpenStellarWallet = (
		onSelected?: (option: ISupportedWallet) => void,
	) => {
		// ensure kit exists before opening modal
		const kit = stellarKit ?? createKit()
		if (!stellarKit) setStellarKit(kit)
		kit.openModal({
			onWalletSelected: async (option: ISupportedWallet) => {
				try {
					kit.setWallet(option.id)
					localStorage.setItem(
						localStorageConfigs.LAST_STELLAR_WALLET_ID,
						option.id,
					)

					const appNetwork = envVarConfigs.NETWORK_ENV
					const currentAppNetwork = appNetwork === 'testnet' ? 'TESTNET' : 'PUBLIC'
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
					localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
					toast.error('Error connecting to Stellar wallet, Please make sure your wallet is Valid')
					localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
					setConnectedWallet(null)
					setStellarPubKey('')
					store.clear()
				}
			},
		})
	}

	const onSignOut = async () => {
		if (connectedWallet === 'stellar') {
			localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
			localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
			setConnectedWallet(null)
			setStellarPubKey('')
			store.clear()
		}
	}

	useEffect(() => {
		const initialization = async () => {
			setIsInit(true)
			// onInitNear() // disabled
			onInitStellar()
			setIsInit(false)
		}
		initialization()
	}, [])

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
