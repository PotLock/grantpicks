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
		// try {
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
		// } catch (error: any) {
		// 	console.log(error)
		// }
	}

	const onInitStellar = () => {
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
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'near')
			const wallet = await selector.wallet()
			const accounts = await wallet.getAccounts()
			setNearWallet(wallet as Wallet & SignMessageMethod)
			setNearAccounts(accounts)
			return
		} else if (kit && localStellarPubKey) {
			setConnectedWallet('stellar')
			localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
			setStellarPubKey(localStellarPubKey)
			return
		} else {
			setConnectedWallet(null)
		}
	}

	const onOpenNearWallet = () => {
		nearModal?.show()
	}

	const onOpenStellarWallet = (
		onSelected?: (option: ISupportedWallet) => void,
	) => {
		stellarKit?.openModal({
			onWalletSelected: async (option: ISupportedWallet) => {
				try {
					stellarKit.setWallet(option.id)
					const publicKey = await stellarKit.getPublicKey()
					setConnectedWallet('stellar')
					setStellarPubKey(publicKey)
					localStorage.setItem(localStorageConfigs.CONNECTED_WALLET, 'stellar')
					localStorage.setItem(
						localStorageConfigs.STELLAR_PUBLIC_KEY,
						publicKey,
					)
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
