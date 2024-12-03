'use client'

import Button from '@/app/components/commons/Button'
import ApplicationsDrawer from '@/app/components/pages/application/ApplicationsDrawer'
import FundRoundModal from '@/app/components/pages/application/FundRoundModal'
import MoreVertMenu from '@/app/components/pages/application/MoreVertMenu'
import MyVotesLayout from '@/app/components/pages/application/my-vote/MyVotesLayout'
import RoundDetailDrawer from '@/app/components/pages/application/RoundDetailDrawer'
import IconClock from '@/app/components/svgs/IconClock'
import IconCube from '@/app/components/svgs/IconCube'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconLoading from '@/app/components/svgs/IconLoading'
import IconMoreVert from '@/app/components/svgs/IconMoreVert'
import IconNear from '@/app/components/svgs/IconNear'
import IconStellar from '@/app/components/svgs/IconStellar'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { LIMIT_SIZE_CONTRACT } from '@/constants/query'
import { GPRound } from '@/models/round'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { IGetRoundsResponse } from '@/types/on-chain'
import clsx from 'clsx'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSWRInfinite from 'swr/infinite'

const ApplicationRoundsItem = ({
	doc,
	mutateRounds,
}: {
	doc: GPRound
	mutateRounds: any
}) => {
	const router = useRouter()
	const [showMoreVert, setShowMoreVert] = useState<boolean>(false)
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()
	const { connectedWallet } = useWallet()

	const getSpecificTime = () => {
		if (new Date().getTime() < new Date(doc.voting_end || '').getTime()) {
			return `on-going`
		} else if (doc.round_complete) {
			return `ended`
		} else {
			return `payout-pending`
		}
	}

	return (
		<div className="p-4 md:p-5 rounded-2xl border border-black/10 bg-white">
			<div className="flex items-center justify-between mb-4 md:mb-6">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
					{connectedWallet === 'near' ? (
						<IconNear size={16} className="fill-grantpicks-black-950" />
					) : (
						<IconStellar size={16} className="fill-grantpicks-black-950" />
					)}
				</div>
				<div className="flex items-center space-x-2">
					<div
						className={clsx(
							`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
							getSpecificTime() === 'on-going'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: getSpecificTime() == 'ended'
									? `border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50`
									: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{getSpecificTime() === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : getSpecificTime() === 'ended' ? (
							<IconDollar size={18} className="fill-grantpicks-black-950" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{getSpecificTime() === 'on-going'
								? `voting open`
								: getSpecificTime() === 'ended'
									? `completed`
									: `payout pending`}
						</p>
					</div>
					{getSpecificTime() === 'on-going' && (
						<div className="relative">
							<IconMoreVert
								size={24}
								className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70 transition"
								onClick={() => setShowMoreVert(true)}
							/>
							<MoreVertMenu
								isOpen={showMoreVert}
								data={doc}
								onClose={() => setShowMoreVert(false)}
								onViewDetails={() => {
									setShowMoreVert(false)
									setShowDetailDrawer(true)
								}}
								onViewApps={() => {
									setShowMoreVert(false)
									setShowAppsDrawer(true)
								}}
								onFundRound={() => {
									setShowMoreVert(false)
									setShowFundRoundModal(true)
								}}
							/>
						</div>
					)}
				</div>
			</div>
			<p className="font-semibold text-base md:text-lg lg:text-xl max-w-60 mb-4 text-grantpicks-black-950">
				{doc.name}
			</p>
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-1">
					<IconCube size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						{doc.num_picks_per_voter} Vote
						{doc.num_picks_per_voter > 1 && `s`} per person
					</p>
				</div>

				<div className="flex items-center space-x-1">
					<IconClock size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						Ends{` `}
						{moment(new Date(doc.voting_end)).fromNow()}
					</p>
				</div>
			</div>
			<div className="w-full">
				<Button
					onClick={() => {
						router.push(
							`/application/round-vote/${doc.on_chain_id}?is_voted=true`,
						)
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
				>
					View Votes
				</Button>
			</div>
			<RoundDetailDrawer
				isOpen={showDetailDrawer}
				onClose={() => setShowDetailDrawer(false)}
				onOpenFundRound={() => setShowFundRoundModal(true)}
				onApplyRound={() => {
					setApplyProjectInitProps((prev) => ({
						...prev,
						isOpen: true,
					}))
				}}
				onVote={() => {
					setVoteConfirmationProps((prev) => ({
						...prev,
						isOpen: true,
						doc: doc,
					}))
				}}
				doc={doc}
			/>
			<ApplicationsDrawer
				isOpen={showAppsDrawer}
				onClose={() => setShowAppsDrawer(false)}
				doc={doc}
			/>
			<FundRoundModal
				isOpen={showFundRoundModal}
				doc={doc}
				mutateRounds={mutateRounds}
				onClose={() => setShowFundRoundModal(false)}
			/>
		</div>
	)
}

const MyVotesPage = () => {
	const { connectedWallet } = useWallet()
	const storage = useAppStorage()

	const onFetchMyVotedRounds = async (key: {
		url: string
		skip: number
		limit: number
	}) => {
		if (storage.chainId === 'stellar') {
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			let result: GPRound[] = []

			const res = (
				await contracts.round_contract.get_voted_rounds({
					voter: storage.my_address || '',
					from_index: BigInt(key.skip),
					limit: BigInt(key.limit),
				})
			).result

			for (let i = 0; i < res.length; i++) {
				let round = res[i]
				let roundId = Number(round.id)
				let roundDetail = {
					...round,
					on_chain_id: roundId,
					id: roundId,
					voting_start: new Date(
						Number(round.voting_start_ms || ''),
					).toISOString(),
					voting_end: new Date(Number(round.voting_end_ms || '')).toISOString(),
					application_start: new Date(
						Number(round.application_start_ms || ''),
					).toISOString(),
					application_end: new Date(
						Number(round.application_end_ms || ''),
					).toISOString(),
				} as unknown as GPRound

				result.push(roundDetail)
			}

			return result
		} else {
			let contracts = storage.getNearContracts(null)

			if (!contracts) {
				return
			}

			let result: GPRound[] = []

			const rounds = await contracts.round.getVotedRound(
				storage.my_address || '',
			)

			for (let i = 0; i < rounds.length; i++) {
				let round = rounds[i]
				let roundId = Number(round.id)
				let roundDetail = {
					...round,
					on_chain_id: roundId,
					id: roundId,
					voting_start: new Date(round.voting_start_ms).toISOString(),
					voting_end: new Date(round.voting_end_ms).toISOString(),
					application_start: new Date(
						round.application_start_ms || '',
					).toISOString(),
					application_end: new Date(
						round.application_end_ms || '',
					).toISOString(),
				} as unknown as GPRound

				result.push(roundDetail)
			}

			return result
		}
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetRoundsResponse[],
	) => {
		return {
			url: `get-my-voted-rounds`,
			skip: pageIndex,
			limit: LIMIT_SIZE_CONTRACT,
			chainId: storage.chainId,
			address: storage.my_address,
		}
	}
	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchMyVotedRounds(key), {
			revalidateFirstPage: false,
		})
	const rounds = data
		? ([] as GPRound[]).concat(...(data as any as GPRound[]))
		: []
	const hasMore = data ? data.length >= LIMIT_SIZE_CONTRACT : false

	return (
		<MyVotesLayout>
			<div className="flex flex-col">
				<p className="text-[44px] md:text-[50px] lg:text-[62px] font-black text-grantpicks-black-950 uppercase mb-8 md:mb-10 lg:mb-12">
					My Votes
				</p>
				{!connectedWallet || rounds.length === 0 ? (
					<div>
						<div className="mt-8 flex items-center justify-center">
							<Image
								src="/assets/images/empty-state.png"
								alt=""
								className="object-fill animate-bounce duration-1000"
								width={100}
								height={100}
							/>
						</div>
						<p className="text-base font-bold text-grantpicks-black-950 text-center">
							There are no Votes yet.
						</p>
					</div>
				) : isLoading || isValidating ? (
					<div className="h-52 flex items-center justify-center w-full">
						<IconLoading size={40} className="fill-grantpicks-black-600" />
					</div>
				) : (
					<InfiniteScroll
						dataLength={rounds.length}
						next={() => !isValidating && setSize(size + 1)}
						hasMore={hasMore}
						style={{ display: 'flex', flexDirection: 'column' }}
						loader={
							<div className="my-2 flex items-center justify-center">
								<IconLoading size={24} className="fill-grantpicks-black-600" />
							</div>
						}
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
							{rounds.map((doc, idx) => (
								<ApplicationRoundsItem
									key={idx}
									doc={doc}
									mutateRounds={mutate}
								/>
							))}
						</div>
					</InfiniteScroll>
				)}
			</div>
		</MyVotesLayout>
	)
}

export default MyVotesPage
