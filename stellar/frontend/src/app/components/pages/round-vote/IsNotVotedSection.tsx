import clsx from 'clsx'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import IconPlay from '../../svgs/IconPlay'
import IconPause from '../../svgs/IconPause'
import { useModalContext } from '@/app/providers/ModalProvider'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'
import IconArrowLeft from '../../svgs/IconArrowLeft'
import IconArrowRight from '../../svgs/IconArrowRight'
import { Pair } from 'round-client'
import RoundVotePairItem from './RoundVotePairItem'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import CMDWallet from '@/lib/wallet'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import { voteRound, VoteRoundParams } from '@/services/stellar/round'
import { useParams } from 'next/navigation'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { IProjectDetailOwner } from '@/app/round-vote/[roundId]/page'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NearPair } from '@/services/near/type'

const IsNotVotedSection = ({
	setShowEvalGuide,
	setShowProjectDetailDrawer,
	setHasVoted,
	pairsData,
}: {
	setShowEvalGuide: Dispatch<SetStateAction<boolean>>
	setShowProjectDetailDrawer: Dispatch<SetStateAction<IProjectDetailOwner>>
	setHasVoted: Dispatch<SetStateAction<boolean>>
	pairsData: Pair[] | NearPair[]
}) => {
	const params = useParams<{ roundId: string }>()
	const [currBoxing, setCurrBoxing] = useState<number>(0)
	const [selectedVotes, setSeletedVotes] = useState<string[]>([])
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const { stellarPubKey, stellarKit } = useWallet()
	const storage = useAppStorage()

	const onPreviousBoxing = (currIdx: number) => {
		if (currIdx > 0) {
			setCurrBoxing(currIdx - 1)
			const el = document.getElementById(`boxing-${currIdx - 1}`)
			el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	const onNextBoxing = (currIdx: number) => {
		if (currIdx < pairsData.length - 1) {
			setCurrBoxing(currIdx + 1)
			const el = document.getElementById(`boxing-${currIdx + 1}`)
			el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	const onVotePair = async () => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const voteParams: VoteRoundParams = {
					round_id: BigInt(params.roundId),
					voter: stellarPubKey,
					picks: selectedVotes.map((selected, index) => ({
						pair_id: pairsData[index].pair_id as number,
						voted_project_id: BigInt(selected),
					})),
				}
				console.log('vote params', voteParams)
				const txVoteProject = await voteRound(voteParams, contracts)

				await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txVoteProject.toXDR(),
					stellarPubKey,
				)
				if (txVoteProject) {
					dismissPageLoading()
					toast.success('Round is voted successfully', {
						style: toastOptions.success.style,
					})
					setHasVoted(true)
				}
			}
		} catch (error: any) {
			dismissPageLoading()
			setHasVoted(false)
			toast.error('Vote round is failed', { style: toastOptions.error.style })
			console.log('error apply project to round', error)
		}
	}

	return (
		<div className="flex flex-col items-center text-grantpicks-black-950">
			<p className="text-xl md:text-[26px] lg:text-[32px] font-black text-grantpicks-black-300 mb-5 md:mb-8">
				PAIR {currBoxing + 1} OF {pairsData.length}
			</p>
			<p className="text-3xl md:text-4xl lg:text-[50px] font-black text-center mb-5 w-96 leading-[50px]">
				WHICH ONE DO YOU CHOOSE?
			</p>
			<p className="text-center text-sm md:text-base font-normal">
				Ensure you’re reviewing each in consideration of public impact.{' '}
			</p>
			<span
				className="text-xs md:text-base font-bold cursor-pointer mb-10 md:mb-12 lg:mb-16"
				onClick={() => setShowEvalGuide(true)}
			>
				See Evaluation guide
			</span>
			<div className="hidden md:flex items-center snap-x snap-mandatory overflow-x-auto mb-10 md:mb-12 lg:mb-16 no-scrollbar overflow-hidden max-w-full space-x-4 md:space-x-6">
				{pairsData.map((doc, idx) => (
					<RoundVotePairItem
						key={idx}
						index={idx}
						data={doc}
						setShowProjectDetailDrawer={setShowProjectDetailDrawer}
						selectedPairs={selectedVotes}
						setSelectedPairs={setSeletedVotes}
					/>
				))}
			</div>
			<div className="flex items-center justify-center space-x-6 md:space-x-10">
				{currBoxing > 0 && (
					<Button color="alpha-50" onClick={() => onPreviousBoxing(currBoxing)}>
						<div className="flex items-center space-x-2">
							<IconArrowLeft size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Previous</p>
						</div>
					</Button>
				)}
				{currBoxing < pairsData.length - 1 ? (
					<Button color="alpha-50" onClick={() => onNextBoxing(currBoxing)}>
						<div className="flex items-center space-x-2">
							<IconArrowRight size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Next</p>
						</div>
					</Button>
				) : (
					<Button color="alpha-50" onClick={async () => await onVotePair()}>
						<p className="text-sm font-semibold">Finish</p>
					</Button>
				)}
			</div>
		</div>
	)
}

export default IsNotVotedSection
