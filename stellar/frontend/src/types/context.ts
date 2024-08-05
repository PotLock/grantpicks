import {
	ISupportedWallet,
	StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit'
import { Wallet, WalletSelector } from '@near-wallet-selector/core'
import {
	Account,
	SignMessageMethod,
} from '@near-wallet-selector/core/src/lib/wallet'
import { WalletSelectorModal } from '@near-wallet-selector/modal-ui'
import { Dispatch, SetStateAction } from 'react'
import { IGetRoundsResponse } from './on-chain'
import { Livepeer } from 'livepeer'
import { Project } from 'round-client'

export interface IWalletContext {
	connectedWallet: 'near' | 'stellar' | null
	//near
	nearSelector: WalletSelector | null
	nearModal: WalletSelectorModal | null
	nearWallet: (Wallet & SignMessageMethod) | null
	nearAccounts: Account[]
	onOpenNearWallet: () => void
	onSignOut: () => Promise<void>
	onCheckConnected: (selector: WalletSelector) => Promise<void>
	//stellar
	stellarKit: StellarWalletsKit | null
	stellarPubKey: string
	onOpenStellarWallet: (onSelected?: (option: ISupportedWallet) => void) => void
}

export interface IModalContextProps {
	isOpen: boolean
}

export interface ISuccessCreateRoundModalProps extends IModalContextProps {
	createRoundRes: IGetRoundsResponse | undefined
	txHash?: string
}

export interface ISuccessCreateProjectModalProps extends IModalContextProps {
	createProjectRes: Project | undefined
	txHash?: string
}

export interface ISuccessUpdateRoundModalProps extends IModalContextProps {
	updateRoundRes: IGetRoundsResponse | undefined
	txHash?: string
}

export interface ISuccessFundRoundModalProps extends IModalContextProps {
	doc: IGetRoundsResponse | undefined
	txHash?: string
	amount: string
}

export interface IApplyProjectToRoundModalProps extends IModalContextProps {
	round_id: bigint | undefined
	roundData: IGetRoundsResponse | undefined
}

export interface ISuccessAppplyProjectToRoundModalProps
	extends IModalContextProps {
	applyProjectRes: Project | undefined
	roundData?: IGetRoundsResponse
	txHash?: string
}

export interface IModalContext {
	successFundRoundModalProps: ISuccessFundRoundModalProps
	setSuccessCreateRoundModalProps: Dispatch<
		SetStateAction<ISuccessCreateRoundModalProps>
	>
	setSuccessUpdateRoundModalProps: Dispatch<
		SetStateAction<ISuccessUpdateRoundModalProps>
	>
	setSuccessCreateProjectModalProps: Dispatch<
		SetStateAction<ISuccessCreateProjectModalProps>
	>
	setSuccessFundRoundModalProps: Dispatch<
		SetStateAction<ISuccessFundRoundModalProps>
	>
	setApplyProjectInitProps: Dispatch<
		SetStateAction<IApplyProjectToRoundModalProps>
	>
	setSuccessApplyProjectInitProps: Dispatch<
		SetStateAction<ISuccessAppplyProjectToRoundModalProps>
	>
	setCreateProjectFormMainProps: Dispatch<SetStateAction<IModalContextProps>>
}

export interface ICreateProjectForm {
	title: string
	project_id: string
	description: string
	considering_desc: string
	team_member: string[]
	smart_contracts: {
		chain: string
		address: string
	}[]
	is_open_source: boolean
	github_urls: string[]
	contacts: {
		platform: string
		link_url: string
	}[]
	funding_histories: {
		source: string
		date: Date
		denomination: string
		amount: string
		description: string
	}[]
	is_havent_raised: boolean
	video: {
		url: string
		file?: File
	}
}

export interface ICreateProjectFormContext {
	data: ICreateProjectForm
	setData: Dispatch<SetStateAction<ICreateProjectForm>>
	step: number
	setStep: Dispatch<SetStateAction<number>>
	onClose: () => void
	onProceedApply: () => Promise<void>
}

export interface IGlobalContext {
	stellarPrice: number
	nearPrice: number
	dismissPageLoading: () => void
	openPageLoading: () => void
	livepeer: Livepeer | null
}
