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
import { RoundApplication } from 'round-client'
import { Project } from 'project-registry-client'
import { GPRound } from '@/models/round'

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
	currentBalance: number | undefined | null
	stellarKit: StellarWalletsKit | null
	stellarPubKey: string
	onOpenStellarWallet: (onSelected?: (option: ISupportedWallet) => void) => void
}

export interface IModalContextProps {
	isOpen: boolean
}

export interface IVoteConfirmationModalContextProps extends IModalContextProps {
	doc?: GPRound
}

export interface IVideoPlayerModalProps extends IModalContextProps {
	videoUrl?: string
}

export interface ISuccessCreateRoundModalProps extends IModalContextProps {
	createRoundRes: GPRound | undefined
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
	doc: GPRound | undefined
	txHash?: string
	amount: string
}

export interface IApplyProjectToRoundModalProps extends IModalContextProps {
	round_id: bigint | undefined
	roundData: GPRound | undefined
}

export interface ISuccessAppplyProjectToRoundModalProps
	extends IModalContextProps {
	applyProjectRes: RoundApplication | undefined
	roundData?: GPRound
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
	setVoteConfirmationProps: Dispatch<
		SetStateAction<IVoteConfirmationModalContextProps>
	>
	setCreateProjectFormMainProps: Dispatch<SetStateAction<IModalContextProps>>
	setVideoPlayerProps: Dispatch<SetStateAction<IVideoPlayerModalProps>>
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
	showMenu: 'choose-wallet' | 'user' | null
	setShowMenu: Dispatch<SetStateAction<'choose-wallet' | 'user' | null>>
}

export interface IMyProjectContext {
	projectData?: Project
	projectDataModel?: Project
	fetchProjectApplicant: () => Promise<void>
}
