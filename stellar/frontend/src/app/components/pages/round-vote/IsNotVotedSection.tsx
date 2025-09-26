import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import Button from '../../commons/Button'
import IconArrowLeft from '../../svgs/IconArrowLeft'
import IconArrowRight from '../../svgs/IconArrowRight'
import { Pair } from 'round-client'
import RoundVotePairItem from './RoundVotePairItem'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { voteRound, VoteRoundParams } from '@/services/stellar/round'
import { useParams } from 'next/navigation'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { IProjectDetailOwner } from '@/app/rounds/round-vote/[roundId]/page'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NearPair, NearPick } from '@/services/near/type'

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
	const desktopScrollerRef = useRef<HTMLDivElement>(null)
	const [selectedVotes, setSeletedVotes] = useState<string[]>([])
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const { stellarKit } = useWallet()
	const storage = useAppStorage()

	const onPreviousBoxing = (currIdx: number) => {
		if (currIdx > 0) {
			setCurrBoxing(currIdx - 1)
			// mobile vertical scroll
			document.getElementById(`boxing-m-${currIdx - 1}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
			// desktop horizontal scroll
			if (desktopScrollerRef.current) {
				const child = desktopScrollerRef.current.children[
					currIdx - 1
				] as HTMLElement
				child?.scrollIntoView({
					behavior: 'smooth',
					inline: 'start',
					block: 'nearest',
				})
			}
		}
	}

	const onNextBoxing = (currIdx: number) => {
		if (currIdx < pairsData.length - 1) {
			setCurrBoxing(currIdx + 1)
			// mobile vertical scroll
			document.getElementById(`boxing-m-${currIdx + 1}`)?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			})
			// desktop horizontal scroll
			if (desktopScrollerRef.current) {
				const child = desktopScrollerRef.current.children[
					currIdx + 1
				] as HTMLElement
				child?.scrollIntoView({
					behavior: 'smooth',
					inline: 'start',
					block: 'nearest',
				})
			}
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

				const stellarPair = pairsData as Pair[]
				const voteParams: VoteRoundParams = {
					round_id: BigInt(params.roundId),
					voter: storage.my_address || '',
					picks: selectedVotes.map((selected, index) => ({
						pair_id: stellarPair[index].pair_id as number,
						voted_project_id: BigInt(selected),
					})),
				}

				const txVoteProject = await voteRound(voteParams, contracts)

				await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txVoteProject.toXDR(),
					storage.my_address || '',
				)
				if (txVoteProject) {
					toast.success('Round is voted successfully', {
						style: toastOptions.success.style,
					})
					setHasVoted(true)
				}
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const nearPairs = pairsData as NearPair[]

				const picks: NearPick[] = selectedVotes.map((selected, index) => ({
					pair_id: nearPairs[index].id,
					voted_project: selected,
				}))

				const txVote = await contracts.round.castVote(
					Number(params.roundId),
					picks,
				)

				if (txVote) {
					toast.success('Round is voted successfully', {
						style: toastOptions.success.style,
					})
					setHasVoted(true)
				}
			}

			dismissPageLoading()
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
				className="text-xs md:text-base font-bold cursor-pointer"
				onClick={() => setShowEvalGuide(true)}
			>
				See Evaluation guide
			</span>
			<p className="text-xs md:text-sm text-grantpicks-black-600 mb-10 md:mb-12 lg:mb-16">
				You need to vote for more than one pair. Voted:{' '}
				{selectedVotes.filter(Boolean).length} / {pairsData.length}
			</p>
			{/* Mobile vertical stack with snap */}
			<div className="flex md:hidden flex-col w-full space-y-6 px-4 mb-8 snap-y snap-mandatory overflow-y-auto h-[70vh]">
				{pairsData.map((doc, idx) => (
					<div
						key={`m-${idx}`}
						id={`boxing-m-${idx}`}
						className="w-full snap-start"
					>
						<RoundVotePairItem
							index={idx}
							data={doc}
							setShowProjectDetailDrawer={setShowProjectDetailDrawer}
							selectedPairs={selectedVotes}
							setSelectedPairs={setSeletedVotes}
							onSelect={() => setCurrBoxing(idx)}
						/>
					</div>
				))}
			</div>

			{/* Desktop horizontal scroller */}
			<div
				ref={desktopScrollerRef}
				className="hidden md:flex items-center snap-x snap-mandatory overflow-x-auto mb-10 md:mb-12 lg:mb-16 no-scrollbar max-w-full space-x-4 md:space-x-6"
			>
				{pairsData.map((doc, idx) => (
					<div key={`d-${idx}`} className="snap-start min-w-full">
						<RoundVotePairItem
							index={idx}
							data={doc}
							setShowProjectDetailDrawer={setShowProjectDetailDrawer}
							selectedPairs={selectedVotes}
							setSelectedPairs={setSeletedVotes}
							onSelect={() => setCurrBoxing(idx)}
						/>
					</div>
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
