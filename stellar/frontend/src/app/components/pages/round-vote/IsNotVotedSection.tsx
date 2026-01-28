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
	const totalPairs = pairsData.length
	const selectedCount = selectedVotes.filter(Boolean).length
	const remainingCount = Math.max(totalPairs - selectedCount, 0)
	const progressPercent = totalPairs
		? Math.round((selectedCount / totalPairs) * 100)
		: 0

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
			<div className="w-full max-w-4xl px-4 md:px-6">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
					<div>
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 uppercase tracking-[0.2em]">
							Voting Progress
						</p>
						<p className="text-2xl md:text-3xl lg:text-4xl font-black text-grantpicks-black-950 mt-2">
							Choose a winner for each pair
						</p>
						<p className="text-sm md:text-base text-grantpicks-black-600 mt-2">
							Select one project per pair. You can vote for multiple pairs before
							finishing.
						</p>
					</div>
					<button
						className="text-sm font-semibold text-grantpicks-black-900 hover:text-grantpicks-black-950 underline underline-offset-4"
						onClick={() => setShowEvalGuide(true)}
						type="button"
					>
						See evaluation guide
					</button>
				</div>

				<div className="bg-white border border-black/10 rounded-2xl p-4 md:p-5 mb-6 shadow-sm">
					<div className="flex items-center justify-between">
						<p className="text-sm font-semibold text-grantpicks-black-800">
							Pair {currBoxing + 1} of {totalPairs}
						</p>
						<p className="text-sm text-grantpicks-black-600">
							{selectedCount}/{totalPairs} selected
						</p>
					</div>
					<div className="mt-3 h-2 w-full rounded-full bg-grantpicks-black-100 overflow-hidden">
						<div
							className="h-full rounded-full bg-grantpicks-green-600 transition-all"
							style={{ width: `${progressPercent}%` }}
						/>
					</div>
					<p className="text-xs md:text-sm text-grantpicks-black-600 mt-3">
						{remainingCount === 0
							? 'All pairs selected. You can review before finishing.'
							: `${remainingCount} ${remainingCount === 1 ? 'pair' : 'pairs'} left to vote.`}
					</p>
				</div>
			</div>
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
			<div className="w-full max-w-4xl px-4 md:px-6">
				<div
					ref={desktopScrollerRef}
					className="hidden md:flex items-center snap-x snap-mandatory overflow-x-auto mb-8 no-scrollbar max-w-full space-x-6"
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
			</div>

			<div className="w-full sticky bottom-0 bg-white/90 backdrop-blur border-t border-grantpicks-black-100 py-4">
				<div className="max-w-4xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
					<div className="text-xs md:text-sm text-grantpicks-black-600">
						{remainingCount === 0
							? 'Ready to submit your vote.'
							: `Select ${remainingCount} more ${remainingCount === 1 ? 'pair' : 'pairs'} to finish.`}
					</div>
					<div className="flex items-center space-x-3 md:space-x-4">
						{currBoxing > 0 && (
							<Button color="alpha-50" onClick={() => onPreviousBoxing(currBoxing)}>
								<div className="flex items-center space-x-2">
									<IconArrowLeft size={18} className="fill-grantpicks-black-400" />
									<p className="text-sm font-semibold">Previous</p>
								</div>
							</Button>
						)}
						{currBoxing < totalPairs - 1 ? (
							<Button color="alpha-50" onClick={() => onNextBoxing(currBoxing)}>
								<div className="flex items-center space-x-2">
									<IconArrowRight size={18} className="fill-grantpicks-black-400" />
									<p className="text-sm font-semibold">Next</p>
								</div>
							</Button>
						) : (
							<Button
								color="black"
								onClick={async () => await onVotePair()}
								isDisabled={selectedCount < totalPairs}
							>
								<p className="text-sm font-semibold text-white">Submit Votes</p>
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default IsNotVotedSection
