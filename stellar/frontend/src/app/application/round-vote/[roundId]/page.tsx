'use client'

import EvaluationGuideModal from '@/app/components/pages/round-vote/EvaluationGuideModal'
import IsNotVotedSection from '@/app/components/pages/round-vote/IsNotVotedSection'
import IsVotedSection from '@/app/components/pages/round-vote/IsVotedSection'
import ProjectDetailDrawer from '@/app/components/pages/round-vote/ProjectDetailDrawer'
import RoundVoteLayout from '@/app/components/pages/round-vote/RoundVoteLayout'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import {
	AvailableVoteRoundParams,
	getPairsRound,
	getRoundInfo,
	HasVotedRoundParams,
	isAvailableVoteRound,
	isHasVotedRound,
} from '@/services/on-chain/round'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { Network } from '@/types/on-chain'
import { useParams, useRouter } from 'next/navigation'
import { Project } from 'project-registry-client'
import React, { useEffect, useRef, useState } from 'react'
import { Pair } from 'round-client'

export interface IProjectDetailOwner {
	isOpen: boolean
	project: Project | null
}

const RoundVotePage = () => {
	const params = useParams<{ roundId: string }>()
	const router = useRouter()
	const [showEvalGuide, setShowEvalGuide] = useState<boolean>(false)
	const [showProjectDetailDrawer, setShowProjectDetailDrawer] =
		useState<IProjectDetailOwner>({ isOpen: false, project: null })
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const { stellarPubKey } = useWallet()
	const [isEligible, setIsEligible] = useState<boolean>(true)
	const [pairsData, setPairsData] = useState<Pair[]>([])
	const storage = useAppStorage()

	const checkVoterIsEligible = async () => {
		try {
			if (!stellarPubKey) return
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const txParams: AvailableVoteRoundParams = {
				round_id: BigInt(params.roundId),
				voter: stellarPubKey,
			}
			const isEligibleRes = await isAvailableVoteRound(txParams, contracts)
			setIsEligible(isEligibleRes)
			if (!isEligibleRes) {
				router.back()
			} else {
				await checkVoterHasVoted()
			}
		} catch (error: any) {
			console.log('error check eligible vote', error)
		}
	}

	const checkVoterHasVoted = async () => {
		try {
			if (!stellarPubKey) return
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const txParams: HasVotedRoundParams = {
				round_id: BigInt(params.roundId),
				voter: stellarPubKey,
			}
			const isHasVotedRes = await isHasVotedRound(txParams, contracts)
			setHasVoted(isHasVotedRes || false)
			await fetchPairsRound()
		} catch (error: any) {
			console.log('error check has voted', error)
		}
	}

	const fetchPairsRound = async () => {
		try {
			if (!stellarPubKey) return
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const roundRes = await getRoundInfo(
				{ round_id: BigInt(params.roundId) },
				contracts,
			)
			const pairs = await getPairsRound(BigInt(params.roundId), contracts)
			setPairsData(pairs.slice(0, roundRes.num_picks_per_voter))
		} catch (error: any) {
			console.log('error fetch pairs', error)
		}
	}

	useEffect(() => {
		setShowEvalGuide(true)
		checkVoterIsEligible()
	}, [stellarPubKey, params.roundId])

	return (
		<RoundVoteLayout>
			{!hasVoted ? (
				<IsNotVotedSection
					setShowEvalGuide={setShowEvalGuide}
					setShowProjectDetailDrawer={setShowProjectDetailDrawer}
					setHasVoted={setHasVoted}
					pairsData={pairsData}
				/>
			) : (
				<IsVotedSection hasVoted={hasVoted} pairsData={pairsData} />
			)}
			<ProjectDetailDrawer
				isOpen={showProjectDetailDrawer?.isOpen || false}
				onClose={() =>
					setShowProjectDetailDrawer((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
				projectData={showProjectDetailDrawer.project || undefined}
			/>
			<EvaluationGuideModal
				isOpen={showEvalGuide}
				onClose={() => setShowEvalGuide(false)}
			/>
		</RoundVoteLayout>
	)
}

export default RoundVotePage
