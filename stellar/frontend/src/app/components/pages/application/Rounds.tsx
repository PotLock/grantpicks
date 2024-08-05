import useRoundStore from '@/stores/zustand/useRoundStore'
import clsx from 'clsx'
import React, { useEffect, useMemo, useState } from 'react'
import IconNear from '../../svgs/IconNear'
import IconCube from '../../svgs/IconCube'
import IconProject from '../../svgs/IconProject'
import IconDollar from '../../svgs/IconDollar'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import Button from '../../commons/Button'
import IconMoreVert from '../../svgs/IconMoreVert'
import MoreVertMenu from './MoreVertMenu'
import RoundDetailDrawer from './RoundDetailDrawer'
import ApplicationsDrawer from './ApplicationsDrawer'
import FundRoundModal from './FundRoundModal'
import { useModalContext } from '@/app/providers/ModalProvider'
import { getRounds } from '@/services/on-chain/round'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { useWallet } from '@/app/providers/WalletProvider'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import useSWRInfinite from 'swr/infinite'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LIMIT_SIZE } from '@/constants/query'
import IconLoading from '../../svgs/IconLoading'
import Image from 'next/image'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import IconStellar from '../../svgs/IconStellar'

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
	const { setApplyProjectInitProps } = useModalContext()
	const { connectedWallet } = useWallet()

	return (
		<div className="p-4 md:p-5 rounded-xl border border-black/10">
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
							selectedRoundType === 'on-going' ||
								selectedRoundType === 'upcoming'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{selectedRoundType === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : selectedRoundType === 'upcoming' ? (
							<IconProject size={18} className="fill-grantpicks-green-400" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{selectedRoundType === 'on-going'
								? `voting open`
								: selectedRoundType === 'upcoming'
									? `application open`
									: `payout pending`}
						</p>
					</div>
					{(selectedRoundType === 'on-going' ||
						selectedRoundType === 'upcoming') && (
						<div className="relative">
							<IconMoreVert
								size={24}
								className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70 transition"
								onClick={() => setShowMoreVert(true)}
							/>
							<MoreVertMenu
								isOpen={showMoreVert}
								doc={doc}
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
					<div className="flex items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Closes{' '}
							{moment(
								new Date(Number(doc.application_start_ms) as number),
							).fromNow()}
						</p>
					</div>
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
						} else if (selectedRoundType === 'upcoming') {
							setApplyProjectInitProps((prev) => ({
								...prev,
								isOpen: true,
								round_id: doc.id,
								roundData: doc,
							}))
						} else {
						}
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
				>
					{selectedRoundType === 'on-going'
						? 'Vote'
						: selectedRoundType === 'upcoming'
							? 'Apply'
							: 'View Result'}
				</Button>
			</div>
			<RoundDetailDrawer
				isOpen={showDetailDrawer}
				onClose={() => setShowDetailDrawer(false)}
				onOpenFundRound={() => setShowFundRoundModal(true)}
				onApplyRound={() => setShowFundRoundModal(true)}
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

const ApplicationRounds = () => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	const { stellarPubKey, connectedWallet } = useWallet()
	const [roundsData, setRoundsData] = useState<IGetRoundsResponse[]>([])

	const onFetchRounds = async (key: {
		url: string
		skip: number
		limit: number
	}) => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		const res = await getRounds({ skip: key.skip, limit: key.limit }, contracts)
		return res
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetRoundsResponse[],
	) => {
		if (!connectedWallet) return null
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-rounds`,
			skip: pageIndex,
			limit: LIMIT_SIZE,
		}
	}
	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchRounds(key), {
			revalidateFirstPage: false,
		})
	const rounds = data ? ([] as IGetRoundsResponse[]).concat(...data) : []
	const hasMore = data ? data[data.length - 1].length >= LIMIT_SIZE : false

	useEffect(() => {
		if (data) {
			let temp = [...rounds]
			if (selectedRoundType === 'upcoming') {
				temp = temp.filter(
					(t) => Number(t.application_start_ms) > new Date().getTime(),
				)
			} else if (selectedRoundType === 'on-going') {
				temp = temp.filter(
					(t) =>
						Number(t.application_start_ms) <= new Date().getTime() &&
						Number(t.application_end_ms) > new Date().getTime(),
				)
			} else if (selectedRoundType === 'ended') {
				temp = temp.filter(
					(t) => Number(t.application_end_ms) <= new Date().getTime(),
				)
			}
			setRoundsData(temp)
		}
	}, [selectedRoundType, data])

	return (
		<div>
			<div className="flex items-center md:justify-center md:space-x-4 space-x-2 overflow-x-auto mb-6 md:mb-7 lg:mb-8">
				<button
					onClick={() => setSelectedRoundType('on-going')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'on-going'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Ongoing rounds
				</button>
				<button
					onClick={() => setSelectedRoundType('upcoming')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'upcoming'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Upcoming rounds
				</button>
				<button
					onClick={() => setSelectedRoundType('ended')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'ended'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Round results
				</button>
			</div>
			{!connectedWallet || roundsData.length === 0 ? (
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
						There are no Rounds yet.
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
						{roundsData?.map((doc, idx) => (
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
	)
}

export default ApplicationRounds
