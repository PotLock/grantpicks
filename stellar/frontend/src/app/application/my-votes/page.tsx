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
import IconGroup from '@/app/components/svgs/IconGroup'
import IconLoading from '@/app/components/svgs/IconLoading'
import IconMoreVert from '@/app/components/svgs/IconMoreVert'
import IconNear from '@/app/components/svgs/IconNear'
import IconProject from '@/app/components/svgs/IconProject'
import IconStellar from '@/app/components/svgs/IconStellar'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { LIMIT_SIZE } from '@/constants/query'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import {
	getMyVotedRounds,
	getRoundApplication,
	getRounds,
	HasVotedRoundParams,
	isHasVotedRound,
} from '@/services/on-chain/round'
import useRoundStore from '@/stores/zustand/useRoundStore'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { formatStroopToXlm } from '@/utils/helper'
import clsx from 'clsx'
import moment from 'moment'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSWRInfinite from 'swr/infinite'

const ApplicationRoundsItem = ({
	doc,
	mutateRounds,
}: {
	doc: IGetRoundsResponse
	mutateRounds: any
}) => {
	const { selectedRoundType } = useRoundStore()
	const [showMoreVert, setShowMoreVert] = useState<boolean>(false)
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()
	const { connectedWallet, stellarPubKey } = useWallet()
	const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
	const [hasVoted, setHasVoted] = useState<boolean>(false)

	// const fetchRoundApplication = async () => {
	// 	try {
	// 		let cmdWallet = new CMDWallet({
	// 			stellarPubKey: stellarPubKey,
	// 		})
	// 		const contracts = new Contracts(
	// 			process.env.NETWORK_ENV as Network,
	// 			cmdWallet,
	// 		)
	// 		const res = await getRoundApplication(
	// 			{ round_id: doc.id as bigint, applicant: stellarPubKey },
	// 			contracts,
	// 		)
	// 		//@ts-ignore
	// 		if (!res?.error) {
	// 			if (selectedRoundType === 'upcoming') setIsUserApplied(true)
	// 		}
	// 	} catch (error: any) {
	// 		console.log('error fetch project applicant', error)
	// 	}
	// }

	const getSpecificTime = () => {
		if (selectedRoundType === 'upcoming') {
			if (new Date().getTime() < Number(doc.application_start_ms)) {
				return `upcoming`
			} else if (
				Number(doc.application_start_ms) <= new Date().getTime() &&
				new Date().getTime() < Number(doc.application_end_ms)
			) {
				return `upcoming-open`
			} else if (
				Number(doc.application_end_ms) <= new Date().getTime() &&
				new Date().getTime() < Number(doc.voting_start_ms)
			) {
				return `upcoming-closed`
			}
		} else if (selectedRoundType === 'on-going') {
			return `on-going`
		} else {
			return `ended`
		}
	}

	// const checkVoterHasVoted = async () => {
	// 	try {
	// 		if (!stellarPubKey) return
	// 		let cmdWallet = new CMDWallet({
	// 			stellarPubKey: stellarPubKey,
	// 		})
	// 		const contracts = new Contracts(
	// 			process.env.NETWORK_ENV as Network,
	// 			cmdWallet,
	// 		)
	// 		const txParams: HasVotedRoundParams = {
	// 			round_id: BigInt(doc.id),
	// 			voter: stellarPubKey,
	// 		}
	// 		const isHasVotedRes = await isHasVotedRound(txParams, contracts)
	// 		setHasVoted(isHasVotedRes)
	// 	} catch (error: any) {
	// 		console.log('error check has voted', error)
	// 	}
	// }

	// useEffect(() => {
	// 	fetchRoundApplication()
	// }, [])

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
							getSpecificTime() === 'upcoming-open' ||
								getSpecificTime() === 'on-going'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: getSpecificTime() === 'upcoming' ||
									  getSpecificTime() === 'upcoming-closed'
									? `border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50`
									: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{selectedRoundType === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : getSpecificTime() === 'upcoming-open' ? (
							<IconProject size={18} className="fill-grantpicks-green-400" />
						) : getSpecificTime() === 'upcoming' ||
						  getSpecificTime() === 'upcoming-closed' ? (
							<IconProject size={18} className="fill-grantpicks-black-950" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{getSpecificTime() === 'on-going'
								? `voting open`
								: getSpecificTime() === 'upcoming'
									? `application closed`
									: getSpecificTime() === 'upcoming-open'
										? `application open`
										: getSpecificTime() === 'upcoming-closed'
											? `application closed`
											: `payout pending`}
						</p>
					</div>
					{(getSpecificTime() === 'on-going' ||
						getSpecificTime() === 'upcoming' ||
						getSpecificTime() === 'upcoming-open' ||
						getSpecificTime() === 'upcoming-closed') && (
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
				{selectedRoundType === 'on-going' ? (
					<div className="flex items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{doc.num_picks_per_voter} Vote{doc.num_picks_per_voter > 1 && `s`}{' '}
							per person
						</p>
					</div>
				) : selectedRoundType === 'upcoming' ? (
					<div className="flex items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{doc.max_participants} Participating
						</p>
					</div>
				) : (
					<div className="flex items-center space-x-1">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							999 Projects
						</p>
					</div>
				)}
				{selectedRoundType === 'on-going' ? (
					<div className="flex items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends{` `}
							{moment(
								new Date(Number(doc.application_end_ms) as number),
							).fromNow()}
						</p>
					</div>
				) : selectedRoundType === 'upcoming' ? (
					<>
						{getSpecificTime() === 'upcoming' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Open{' '}
									{moment(
										new Date(Number(doc.application_start_ms) as number),
									).fromNow()}
								</p>
							</div>
						)}
						{getSpecificTime() === 'upcoming-open' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Closed{' '}
									{moment(
										new Date(Number(doc.application_end_ms) as number),
									).fromNow()}
								</p>
							</div>
						)}
						{getSpecificTime() === 'upcoming-closed' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Closed{' '}
								</p>
							</div>
						)}
					</>
				) : (
					<p className="text-lg md:text-xl font-normal text-grantpicks-black-950">
						{formatStroopToXlm(doc.expected_amount)}{' '}
						<span className="text-sm font-normal text-grantpicks-black-600">
							NEAR
						</span>
					</p>
				)}
			</div>
			<div className="w-full">
				<Button
					onClick={() => {
						if (selectedRoundType === 'on-going') {
							setVoteConfirmationProps((prev) => ({
								...prev,
								isOpen: true,
								doc: doc,
							}))
						} else if (
							selectedRoundType === 'upcoming' &&
							getSpecificTime() === 'upcoming-open'
						) {
							setApplyProjectInitProps((prev) => ({
								...prev,
								isOpen: true,
								round_id: doc.id,
								roundData: doc,
							}))
						}
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
					isDisabled={
						getSpecificTime() === 'upcoming' ||
						getSpecificTime() === 'upcoming-closed' ||
						isUserApplied
					}
				>
					{isUserApplied
						? `You're already a part of this round.`
						: getSpecificTime() === 'on-going'
							? 'Vote'
							: getSpecificTime() === 'upcoming'
								? 'No application allowed'
								: getSpecificTime() === 'upcoming-open'
									? 'Apply'
									: getSpecificTime() === 'upcoming-closed'
										? 'Application Closed'
										: 'View Result'}
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
	const { stellarPubKey, connectedWallet } = useWallet()
	const [roundsData, setRoundsData] = useState<IGetRoundsResponse[]>([])

	const onFetchMyVotedRounds = async (key: {
		url: string
		skip: number
		limit: number
	}) => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		const res = await getMyVotedRounds(
			{ from_index: key.skip, limit: key.limit, voter: stellarPubKey },
			contracts,
		)
		return res
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetRoundsResponse[],
	) => {
		if (!connectedWallet) return null
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-my-voted-rounds`,
			skip: pageIndex,
			limit: LIMIT_SIZE,
		}
	}
	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchMyVotedRounds(key), {
			revalidateFirstPage: false,
		})
	const rounds = data ? ([] as IGetRoundsResponse[]).concat(...data) : []
	const hasMore = data ? data[data.length - 1].length >= LIMIT_SIZE : false

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
