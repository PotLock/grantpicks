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
import { setupNearWallet } from '@near-wallet-selector/near-wallet'
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet'
import { setupMeteorWallet } from '@near-wallet-selector/meteor-wallet'
import { setupHereWallet } from '@near-wallet-selector/here-wallet'
import { setupSender } from '@near-wallet-selector/sender'
import { localStorageConfigs } from '@/configs/local-storage'
import {
	Account,
	SignMessageMethod,
} from '@near-wallet-selector/core/src/lib/wallet'
import {
	allowAllModules,
	ISupportedWallet,
	StellarWalletsKit,
	WalletNetwork,
} from '@creit.tech/stellar-wallets-kit'
import { distinctUntilChanged, map } from 'rxjs'

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
	const [connectedWallet, setConnectedWallet] = useState<
		'near' | 'stellar' | null
	>(null)
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

	const onInitNear = async () => {
		try {
			const selector = await setupWalletSelector({
				network: envVarConfigs.NETWORK_ENV as NetworkId,
				modules: [
					setupNearWallet(),
					setupMyNearWallet(),
					setupMeteorWallet(),
					setupSender(),
					setupHereWallet(),
				],
			})

			const modal = setupModal(selector, {
				contractId: 'test.testnet',
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
				selectedWalletId: 'xbull',
				modules: allowAllModules(),
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
			return
		} else if (kit && localStellarPubKey) {
			const pubKey = await kit?.getPublicKey()
			setConnectedWallet('stellar')
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
			setStellarPubKey(localStellarPubKey || pubKey)
			localStorage.setItem(
				localStorageConfigs.STELLAR_PUBLIC_KEY,
				localStellarPubKey || pubKey,
			)
			return
		} else {
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
					const pubKey = await stellarKit?.getPublicKey()
					setConnectedWallet('stellar')
					localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
					setStellarPubKey(pubKey)
					localStorage.setItem(localStorageConfigs.STELLAR_PUBLIC_KEY, pubKey)
					//sign out near
					const wallet = await nearSelector?.wallet()
					await wallet?.signOut()
					setNearWallet(null)
					setNearAccounts([])
					onSelected?.(option)
				} catch (error: any) {
					console.log('error connect stellar', error)
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
		} else if (connectedWallet === 'stellar') {
			localStorage.removeItem(localStorageConfigs.CONNECTED_WALLET)
			localStorage.removeItem(localStorageConfigs.STELLAR_PUBLIC_KEY)
			setConnectedWallet(null)
			setStellarPubKey('')
		}
	}

	useEffect(() => {
		onInitNear()
		onInitStellar()
	}, [])

	useEffect(() => {
		if (!nearSelector) {
			return
		}
		const subscription = nearSelector.store.observable
			.pipe(
				map((state) => state.accounts),
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
			}}
		>
			{children}
		</WalletContext.Provider>
	)
}

export const useWallet = () => {
	return useContext(WalletContext)
}

export default WalletProvider
