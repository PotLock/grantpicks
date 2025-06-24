'use client'

import React, { useContext, useEffect, useState } from 'react'
import { WalletContext } from '../contexts/WalletContext'
import { envVarConfigs } from '@/configs/env-var'
import {
	NetworkId,
	setupWalletSelector,
	Wallet,
	WalletSelector,
} from '@near-wallet-selector/core'
import { setupModal, WalletSelectorModal } from '@near-wallet-selector/modal-ui'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import { setupHereWallet } from '@near-wallet-selector/here-wallet'
import { setupOKXWallet } from '@near-wallet-selector/okx-wallet'
import { setupCoin98Wallet } from '@near-wallet-selector/coin98-wallet'
import { setupSender } from '@near-wallet-selector/sender'
import { setupBitgetWallet } from '@near-wallet-selector/bitget-wallet'
import { setupMathWallet } from '@near-wallet-selector/math-wallet'
import { setupNightly } from '@near-wallet-selector/nightly'
import { setupNarwallets } from '@near-wallet-selector/narwallets'
import { setupWelldoneWallet } from '@near-wallet-selector/welldone-wallet'
import { setupLedger } from '@near-wallet-selector/ledger'
import { setupWalletConnect } from '@near-wallet-selector/wallet-connect'
import { setupNeth } from '@near-wallet-selector/neth'
import { setupXDEFI } from '@near-wallet-selector/xdefi'
import { setupRamperWallet } from '@near-wallet-selector/ramper-wallet'
import { setupNearMobileWallet } from '@near-wallet-selector/near-mobile-wallet'
import { setupMintbaseWallet } from '@near-wallet-selector/mintbase-wallet'
import { setupBitteWallet } from '@near-wallet-selector/bitte-wallet'
import { localStorageConfigs } from '@/configs/local-storage'
import {
	Account,
	SignMessageMethod,
	WalletModuleFactory,
} from '@near-wallet-selector/core/src/lib/wallet'
import {
	xBullModule,
	FreighterModule,
	LobstrModule,
	HanaModule,
	ISupportedWallet,
	HotWalletModule,
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { distinctUntilChanged, map } from 'rxjs'
import CMDWallet from '@/lib/wallet'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { IAccount } from '@/types/account'
import { usePotlockService } from '@/services/potlock'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import toast from 'react-hot-toast'

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [connectedWallet, setConnectedWallet] = useState<
		'near' | 'stellar' | null
	>(null)
	const [profileData, setProfileData] = useState<IAccount>()
	const potlockService = usePotlockService()
	//near
	const [nearSelector, setNearSelector] = useState<WalletSelector | null>(null)
	const [nearModal, setNearModal] = useState<WalletSelectorModal | null>(null)
	const [nearWallet, setNearWallet] = useState<
		(Wallet & SignMessageMethod) | null
	>(null)
	const [nearAccounts, setNearAccounts] = useState<Account[]>([])
	//stellar
	const [stellarKit, setStellarKit] = useState<StellarWalletsKit | null>(null)
	const [stellarPubKey, setStellarPubKey] = useState<string>('')
	const [currentBalance, setCurrentBalance] = useState<number | null>()
	const [isInit, setIsInit] = useState<boolean>(true)
	const store = useAppStorage()

	const onInitNear = async () => {
		try {
			const selector = await setupWalletSelector({
				network: envVarConfigs.NETWORK_ENV as NetworkId,
				modules: [
					setupMyNearWallet() as WalletModuleFactory,
					setupMeteorWallet() as WalletModuleFactory,
					setupSender() as WalletModuleFactory,
					setupHereWallet() as WalletModuleFactory<Wallet>,
					setupOKXWallet() as WalletModuleFactory<Wallet>,
					setupCoin98Wallet() as WalletModuleFactory<Wallet>,
					setupBitgetWallet() as WalletModuleFactory<Wallet>,
					setupMathWallet() as WalletModuleFactory<Wallet>,
					setupNightly() as WalletModuleFactory<Wallet>,
					setupNarwallets() as WalletModuleFactory<Wallet>,
					setupWelldoneWallet() as WalletModuleFactory<Wallet>,
					setupLedger() as WalletModuleFactory<Wallet>,
					setupNeth() as WalletModuleFactory<Wallet>,
					setupXDEFI() as WalletModuleFactory<Wallet>,
					setupRamperWallet() as WalletModuleFactory<Wallet>,
					setupWalletConnect({
						projectId: 'c4f79cc...',
						metadata: {
							name: 'NEAR Wallet Selector',
							description: 'Example dApp used by NEAR Wallet Selector',
							url: 'https://github.com/near/wallet-selector',
							icons: ['https://avatars.githubusercontent.com/u/37784886'],
						},
					}) as WalletModuleFactory<Wallet>,
					setupNearMobileWallet() as WalletModuleFactory<Wallet>,
					setupMintbaseWallet({
						walletUrl: 'https://wallet.mintbase.xyz',
						callbackUrl: 'https://www.mywebsite.com',
						deprecated: false,
					}) as WalletModuleFactory<Wallet>,
					setupBitteWallet({
						walletUrl: 'https://wallet.bitte.ai',
						callbackUrl: 'https://www.mywebsite.com',
						deprecated: false,
					}) as WalletModuleFactory<Wallet>,
				],
			})

			const modal = setupModal(selector, {
				contractId: process.env.NEAR_ROUND_CONTRACT_ID || '',
			})

			setNearSelector(selector)
			setNearModal(modal)

			if (selector && selector.isSignedIn()) {
				await onCheckConnected(selector)
			}
		} catch (error: any) {
			console.log('error', error)
		}
	}

	const onInitStellar = async () => {
		try {
			const kit: StellarWalletsKit = new StellarWalletsKit({
				network:
					envVarConfigs.NETWORK_ENV === 'testnet'
						? WalletNetwork.TESTNET
						: WalletNetwork.FUTURENET,
				selectedWalletId:
					localStorage.getItem(localStorageConfigs.LAST_STELLAR_WALLET_ID) ||
					'freighter',
				modules: [
					new FreighterModule(),
					new xBullModule(),
					new HotWalletModule(),
					new LobstrModule(),
					new HanaModule(),
				],
			})
			setStellarKit(kit)
			if (kit) {
				onCheckConnected(undefined, kit)
			}
		} catch (error: any) {
			console.log('error', error)
		}
	}

	const onCheckConnected = async (
		selector?: WalletSelector,
		kit?: StellarWalletsKit,
	) => {
		const localStellarPubKey = localStorage.getItem(
			localStorageConfigs.STELLAR_PUBLIC_KEY,
		)
		if (selector && selector.isSignedIn()) {
			setConnectedWallet('near')
			//sign out stellar
			localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)

			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'near')
			const wallet = await selector.wallet()
			const accounts = await wallet.getAccounts()
			setNearWallet(wallet as Wallet & SignMessageMethod)
			setNearAccounts(accounts)

			store.setMyAddress(accounts[0]?.accountId || '')
			store.setChainId('near')
			store.setNetwork('testnet')

			const account = await store
				.getNearContracts(null)
				?.round.getBalance(accounts[0]?.accountId)

			setCurrentBalance(
				Number(formatNearAmount(account?.amount || '0', 2).replace(',', '')),
			)

			return
		} else if (kit && localStellarPubKey) {
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
			store.setNetwork('testnet')

			return
		} else {
			store.clear()
			setConnectedWallet(null)
		}
	}

	const onOpenNearWallet = () => {
		try {
			nearModal?.show()
		} catch (error: any) {
			console.log('error', error)
		}
	}

	const onOpenStellarWallet = (
		onSelected?: (option: ISupportedWallet) => void,
	) => {
		stellarKit?.openModal({
			onWalletSelected: async (option: ISupportedWallet) => {
				try {
					stellarKit.setWallet(option.id)
					localStorage.setItem(
						localStorageConfigs.LAST_STELLAR_WALLET_ID,
						option.id,
					)
					const pubKey = (await stellarKit?.getAddress()).address
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


					//sign out near
					const wallet = await nearSelector?.wallet()
					await wallet?.signOut()
					setNearWallet(null)
					setNearAccounts([])
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
		if (connectedWallet === 'near') {
			const wallet = await nearSelector?.wallet()
			localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
			await wallet?.signOut()
			setConnectedWallet(null)
			setNearWallet(null)
			setNearAccounts([])
			store.clear()
		} else if (connectedWallet === 'stellar') {
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
			onInitNear()
			onInitStellar()
			setIsInit(false)
		}
		initialization()
	}, [])

	useEffect(() => {
		if (!nearSelector) {
			return
		}
		const subscription = nearSelector.store.observable
			.pipe(
				// @ts-ignore - Type mismatch between different RxJS versions
				map((state) => state.accounts),
				// @ts-ignore - Type mismatch between different RxJS versions
				distinctUntilChanged(),
			)
			.subscribe(async (nextAccounts) => {
				try {
					setNearAccounts(nextAccounts)
					if (nearSelector && nearSelector?.isSignedIn()) {
						await onCheckConnected(nearSelector)
					}
				} catch (error: any) {
					console.log('error', error)
				}
			})
		const onHideSubscription = nearModal?.on('onHide', ({ hideReason }) => {
			console.log(`Reason ${hideReason}`)
		})
		return () => {
			subscription.unsubscribe()
			onHideSubscription?.remove()
		}
	}, [nearSelector])

	const fetchProfileData = async () => {
		try {
			const profileData = await potlockService.getAccounts(
				connectedWallet === 'near' ? nearAccounts[0]?.accountId : stellarPubKey,
			)
			setProfileData(profileData)
		} catch {
			// console.log('Account not found')
		}
	}

	useEffect(() => {
		fetchProfileData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stellarPubKey, nearAccounts])

	if (!isInit) {
		return (
			<WalletContext.Provider
				value={{
					nearSelector,
					nearModal,
					connectedWallet,
					nearWallet,
					nearAccounts,
					onOpenNearWallet,
					onSignOut,
					onCheckConnected,
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
