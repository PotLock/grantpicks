import { PayoutTableItem } from '@/app/components/pages/round-result/EditPayoutModal'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { NearSocial } from '@/services/near/near-social'
import { RoundContract } from '@/services/near/round'
import { NearContracts } from '@/services/near/type'
import { Network } from '@/types/on-chain'
import { formatStroopToXlm } from '@/utils/helper'
import { Wallet } from '@near-wallet-selector/core'
import { Project } from 'project-registry-client'
import {
	Payout,
	PayoutInput,
	PayoutsChallenge,
	ProjectVotingResult,
	RoundApplication,
	RoundDetail,
} from 'round-client'
import { create } from 'zustand'

interface AppRepo {
	chainId: string | null
	my_address: string | null
	network: string
	projects: Map<string, Project>
	roundes: Map<string, RoundDetail>
	applications: Map<string, RoundApplication>
	current_payout_inputs: Map<string, number>
	current_manager_weight: number
	current_pairwise_weight: number
	current_round: RoundDetail | null
	current_round_payouts: Payout[]
	current_round_payout_challenges: PayoutsChallenge[]
	current_project: Project | null
	current_results: ProjectVotingResult[]
	current_remaining: number
	isAdminRound: boolean
	isAdminProject: boolean
	isPayoutDone: boolean
	setIsAdminRound: (isAdminRound: boolean) => void
	setProjects: (projects: Map<string, Project>) => void
	setRound: (round: RoundDetail) => void
	setCurrentProject: (project: Project) => void
	setMyAddress: (address: string) => void
	setIsAdminProject: (isAdminProject: boolean) => void
	setRoundes: (roundes: Map<string, RoundDetail>) => void
	setCurrentRoundPayouts: (payouts: Payout[]) => void
	setCurrentRoundPayoutChallenges: (payouts: PayoutsChallenge[]) => void
	setChainId: (chainId: string) => void
	getStellarContracts: () => Contracts | null
	getNearContracts: (wallet: Wallet | null) => NearContracts | null
	setCurrentResults: (results: ProjectVotingResult[]) => void
	getAllocation: (project_id: string) => number
	getTotalParticipants: () => number
	getTotalVoting: () => number
	getResultNotFlagged: () => ProjectVotingResult[]
	setCurrentPayoutInputs: (inputs: Map<string, number>) => void
	setCurrentManagerWeight: (weight: number) => void
	setCurrentPairwiseWeight: (weight: number) => void
	setCurrentRemaining: (remaining: number) => void
	getBannedProjectAllocations: () => number
	getPayoutTableItems: (project_id: string) => PayoutTableItem
	setPayoutDone: (isPayoutDone: boolean) => void
	clear: () => void
	setApplications: (applications: Map<string, RoundApplication>) => void
	setNetwork: (network: string) => void
}

const useAppStorage = create<AppRepo>((set, get) => ({
	projects: new Map(),
	setProjects: (projects: Map<string, Project>) => set(() => ({ projects })),
	current_round: null,
	setRound: (round: RoundDetail) => set(() => ({ current_round: round })),
	current_project: null,
	setCurrentProject: (project: Project) =>
		set(() => ({ current_project: project })),
	my_address: null,
	setMyAddress: (address: string) => set(() => ({ my_address: address })),
	isAdminRound: false,
	setIsAdminRound: (isAdminRound: boolean) =>
		set(() => ({ isAdminRound: isAdminRound })),
	isAdminProject: false,
	setIsAdminProject: (isAdminProject: boolean) =>
		set(() => ({ isAdminProject: isAdminProject })),
	roundes: new Map(),
	setRoundes: (roundes: Map<string, RoundDetail>) => set(() => ({ roundes })),
	current_round_payouts: [],
	setCurrentRoundPayouts: (payouts: Payout[]) =>
		set(() => ({ current_round_payouts: payouts })),
	current_round_payout_challenges: [],
	setCurrentRoundPayoutChallenges: (payouts: PayoutsChallenge[]) =>
		set(() => ({ current_round_payout_challenges: payouts })),
	chainId: null,
	setChainId: (chainId: string) => set(() => ({ chainId })),
	getStellarContracts: () => {
		const chainId = get().chainId
		if (chainId === 'stellar') {
			const network = get().network
			const myAddress = get().my_address
			if (myAddress) {
				let cmdWallet = new CMDWallet({
					stellarPubKey: myAddress,
				})

				const contracts = new Contracts(network as Network, cmdWallet)
				return contracts
			} else {
				return new Contracts('testnet', undefined)
			}
		}
		return null
	},
	clear: () =>
		set(() => ({
			applications: new Map(),
			projects: new Map(),
			current_round: null,
			current_project: null,
			my_address: null,
			isAdminRound: false,
			isAdminProject: false,
			roundes: new Map(),
			current_round_payouts: [],
			current_round_payout_challenges: [],
			current_results: [],
			chainId: null,
		})),
	current_results: [],
	setCurrentResults: (results: ProjectVotingResult[]) =>
		set(() => ({ current_results: results })),
	getAllocation: (project_id: string) => {
		const project = get().projects.get(project_id)

		if (project) {
			let amountToDistribute = 0

			const payout = get().current_round_payouts.find(
				(p) => p.recipient_id === project?.owner,
			)
			if (payout) {
				amountToDistribute = Number(formatStroopToXlm(payout.amount))
			} else {
				amountToDistribute = 0
			}

			return amountToDistribute
		}

		return 0
	},
	getTotalParticipants: () => {
		const totalVoting = get().current_results.reduce(
			(acc, result) => acc + Number(result.voting_count.toString()),
			0,
		)

		const num_picks = get().current_round?.num_picks_per_voter || 1

		return totalVoting > 0 ? totalVoting / num_picks : 1
	},
	getTotalVoting: () =>
		get().current_results.reduce(
			(acc, result) => acc + Number(result.voting_count.toString()),
			0,
		),
	getResultNotFlagged: () =>
		get().current_results.filter((result) => !result.is_flagged),
	current_payout_inputs: new Map(),
	setCurrentPayoutInputs: (inputs: Map<string, number>) =>
		set(() => ({ current_payout_inputs: inputs })),
	current_manager_weight: 0,
	setCurrentManagerWeight: (weight: number) =>
		set(() => ({ current_manager_weight: weight })),
	current_pairwise_weight: 0,
	setCurrentPairwiseWeight: (weight: number) =>
		set(() => ({ current_pairwise_weight: weight })),
	current_remaining: 0,
	setCurrentRemaining: (remaining: number) =>
		set(() => ({ current_remaining: remaining })),
	getBannedProjectAllocations: () => {
		const flaggedProjects = get().current_results.filter(
			(result) => result.is_flagged,
		)

		let totalVoting = get().getTotalVoting()
		let totalFlagged = flaggedProjects.reduce(
			(acc, result) => acc + Number(result.voting_count.toString()),
			0,
		)

		if (totalFlagged === 0) {
			return 0
		}
		return totalFlagged / totalVoting
	},
	getPayoutTableItems: (project_id: string) => {
		const data = get().current_results.find(
			(result) => result.project_id.toString() === project_id,
		)

		const roundData = get().current_round

		if (!data || !roundData) {
			return {
				actual_amount: 0,
				assigned_weight: 0,
				assigned_calculated: 0,
				amount_override: 0,
				final_calculation: 0,
				pairwise_weight_adjusted: 0,
			} as PayoutTableItem
		}

		let finalCalculation = 0
		let assignedWeight = 0
		let assignedWeightCalculated = 0
		let totalVoting = get().getTotalVoting()
		const myVote = (Number(data.voting_count) / totalVoting) * 100
		const amountToDistribute =
			(Number(formatStroopToXlm(roundData?.vault_total_deposits || BigInt(0))) *
				myVote) /
			100
		let pairWiseCoin = 0
		if (get().current_pairwise_weight > 0) {
			pairWiseCoin =
				(get().current_pairwise_weight / 100) *
				Number(
					formatStroopToXlm(
						get().current_round?.current_vault_balance || BigInt(0),
					),
				)
		}
		const amountOverride = get().current_payout_inputs.get(project_id) || 0
		const pairWiseAdjusted = pairWiseCoin * (myVote / 100)
		assignedWeight =
			((pairWiseAdjusted + amountOverride) /
				Number(
					formatStroopToXlm(
						get().current_round?.current_vault_balance || BigInt(0),
					),
				)) *
			100
		assignedWeightCalculated = pairWiseAdjusted + amountOverride
		finalCalculation = pairWiseAdjusted + amountOverride

		return {
			actual_amount: amountToDistribute,
			assigned_weight: assignedWeight,
			assigned_calculated: assignedWeightCalculated,
			amount_override: amountOverride,
			final_calculation: finalCalculation,
			pairwise_weight_adjusted: pairWiseAdjusted,
		} as PayoutTableItem
	},
	isPayoutDone: false,
	setPayoutDone: (isPayoutDone: boolean) => set(() => ({ isPayoutDone })),
	applications: new Map(),
	setApplications: (applications: Map<string, RoundApplication>) =>
		set(() => ({ applications: applications })),
	network: 'testnet',
	setNetwork: (network: string) => set(() => ({ network })),
	getNearContracts: (wallet: Wallet | null) => {
		const chainId = get().chainId
		if (chainId === 'near') {
			const network = get().network
			const roundContractId = process.env.NEAR_ROUND_CONTRACT_ID || ''
			const nearSocialContractId = process.env.NEAR_SOCIAL_CONTRACT_ID || ''
			const roundContract = new RoundContract(wallet, network, roundContractId)
			const nearSocialContract = new NearSocial(
				wallet,
				network,
				nearSocialContractId,
			)

			const nearContracts: NearContracts = {
				round: roundContract,
				near_social: nearSocialContract,
			}

			return nearContracts
		}
		return null
	},
}))

export default useAppStorage
