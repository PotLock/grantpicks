/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import EvaluationGuideModal from '@/app/components/pages/round-vote/EvaluationGuideModal'
import IsNotVotedSection from '@/app/components/pages/round-vote/IsNotVotedSection'
import IsVotedSection from '@/app/components/pages/round-vote/IsVotedSection'
import ProjectDetailDrawer from '@/app/components/pages/round-vote/ProjectDetailDrawer'
import RoundVoteLayout from '@/app/components/pages/round-vote/RoundVoteLayout'
import { toastOptions } from '@/constants/style'
import { NearPair } from '@/services/near/type'
import {
	AvailableVoteRoundParams,
	getPairsRound,
	getRoundInfo,
	HasVotedRoundParams,
	isAvailableVoteRound,
	isHasVotedRound,
} from '@/services/stellar/round'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Project } from 'project-registry-client'
import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Pair } from 'round-client'

export interface IProjectDetailOwner {
	isOpen: boolean
	project: Project | null
}

const RoundVotePage = () => {
	const params = useParams<{ roundId: string }>()
	const searchParams = useSearchParams()
	const router = useRouter()
	const [showEvalGuide, setShowEvalGuide] = useState<boolean>(false)
	const [showProjectDetailDrawer, setShowProjectDetailDrawer] =
		useState<IProjectDetailOwner>({ isOpen: false, project: null })
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const [isEligible, setIsEligible] = useState<boolean>(true)
	const [pairsData, setPairsData] = useState<Pair[] | NearPair[]>([])
	const storage = useAppStorage()

	const checkVoterIsEligible = async () => {
		try {
			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const txParams: AvailableVoteRoundParams = {
					round_id: BigInt(params.roundId),
					voter: storage.my_address || '',
				}
				const isEligibleRes = await isAvailableVoteRound(txParams, contracts)
				setIsEligible(isEligibleRes)
				if (!isEligibleRes) {
					router.back()
				} else {
					await checkVoterHasVoted()
				}
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const canVote = await contracts.round.canVote(
					Number(params.roundId),
					storage.my_address || '',
				)

				setIsEligible(canVote)

				await checkVoterHasVoted()
			}
		} catch (error: any) {
			console.log('error check eligible vote', error)
		}
	}

	const checkVoterHasVoted = async () => {
		try {
			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const txParams: HasVotedRoundParams = {
					round_id: BigInt(params.roundId),
					voter: storage.my_address || '',
				}
				const isHasVotedRes = await isHasVotedRound(txParams, contracts)
				setHasVoted(isHasVotedRes || false)
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const hasVoted = await contracts.round.hasVote(
					Number(params.roundId),
					storage.my_address || '',
				)

				if (hasVoted) {
					setShowEvalGuide(false)
				}

				setHasVoted(hasVoted)
			}

			await fetchPairsRound()
		} catch (error: any) {
			console.log('error check has voted', error)
		}
	}

	const fetchPairsRound = async () => {
		try {
			if (storage.chainId === 'stellar') {
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
			} else {
				const contracts = storage.getNearContracts(null)
				if (!contracts) {
					return
				}

				const roundData = await contracts.round.getRoundById(
					Number(params.roundId),
				)

				const pairs = await contracts.round.getPairsRound(
					Number(params.roundId),
				)

				setPairsData(pairs.slice(0, roundData.num_picks_per_voter))
			}
		} catch (error: any) {
			console.log('error fetch pairs', error)
		}
	}

	useEffect(() => {
		if (!searchParams.get('is_voted')) {
			setShowEvalGuide(true)
			checkVoterIsEligible()
		} else {
			setHasVoted(true)
		}
	}, [storage.chainId, storage.my_address, params.roundId])

	useEffect(() => {
		if (!storage.chainId) {
			router.push('/rounds')
			toast.error('Please connect your wallet to vote', {
				style: toastOptions.error.style,
			})
		}
	}, [])

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
				<IsVotedSection
					setShowProjectDetailDrawer={setShowProjectDetailDrawer}
				/>
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
