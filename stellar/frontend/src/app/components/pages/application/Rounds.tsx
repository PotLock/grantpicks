import useRoundStore from '@/stores/zustand/useRoundStore'
import clsx from 'clsx'
import React, { useEffect, useMemo, useState } from 'react'
import { useWallet } from '@/app/providers/WalletProvider'
import useSWRInfinite from 'swr/infinite'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LIMIT_SIZE } from '@/constants/query'
import IconLoading from '../../svgs/IconLoading'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { usePotlockService } from '@/services/potlock'
import { GPRound } from '@/models/round'
import IconUnfoldMore from '../../svgs/IconUnfoldMore'
import Menu from '../../commons/Menu'
import { TSelectedRoundType } from '@/types/round'
import useSWR from 'swr'
import { RoundCard } from './RoundCard'
import Button from '../../commons/Button'

const ApplicationRounds = () => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	const [roundsData, setRoundsData] = useState<GPRound[]>([])
	const potlockApi = usePotlockService()
	const { connectedWallet } = useWallet()
	const [showSortType, setShowSortType] = useState<boolean>(false)
	const [sortType, setSortType] = useState<string>('Most Recent')
	const storage = useAppStorage()
	const router = useRouter()
	const searchParams = useSearchParams()
	const { nearAccounts, stellarPubKey } = useWallet()
	const [myRoundsData, setMyRoundsData] = useState<GPRound[]>([])

	const filterRoundsByType = (rounds: GPRound[], type: string) => {
		switch (type) {
			case 'upcoming':
				return rounds.filter(
					(t) => new Date().getTime() < new Date(t.voting_start).getTime(),
				)
			case 'on-going':
				return rounds.filter(
					(t) =>
						new Date(t.voting_start).getTime() <= new Date().getTime() &&
						new Date().getTime() < new Date(t.voting_end).getTime() &&
						t.approved_projects.length > 0
				)
			case 'ended':
				return rounds.filter(
					(t) => new Date(t.voting_end).getTime() <= new Date().getTime(),
				)
			default:
				return rounds
		}
	}


	const onFetchRounds = async (key: { url: string; page: number }) => {
		let beChainId = null

		switch (storage.chainId) {
			case 'near':
				beChainId = '1'
				break
			case 'ethereum':
				beChainId = '2'
				break
			case 'stellar':
				beChainId = '3'
				break
		}

		const res = await potlockApi.getRounds(
			key.page + 1,
			sortType === 'Vault Total Deposits'
				? 'vault_total_deposits'
				: 'deployed_at',
			beChainId,
		)
		return res
	}

	const getKey = (pageIndex: number, previousPageData: GPRound[]) => {
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-rounds`,
			page: pageIndex,
			sortType,
			chainId: storage.chainId,
		}
	}
	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchRounds(key), {
			revalidateFirstPage: false,
		})
	const rounds = data
		? ([] as GPRound[]).concat(...(data as any as GPRound[]))
		: []
	const hasMore = data ? data.length >= LIMIT_SIZE : false


	useEffect(() => {
		if (data) {
			const temp = filterRoundsByType([...rounds], selectedRoundType)
			setRoundsData(temp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedRoundType, data, connectedWallet])

	const onFetchMyRounds = async (accountId: string) => {
		const res = await potlockApi.getMyRounds(accountId)
		return res
	}

	const {
		data: dataMyRounds,
		isLoading: isLoadingMyRounds,
		mutate: mutateMyRounds,
	} = useSWR(`get-my-rounds`, () =>
		onFetchMyRounds(
			connectedWallet === 'near' ? nearAccounts[0]?.accountId : stellarPubKey,
		),
	)

	useEffect(() => {
		if (dataMyRounds) {
			const temp = filterRoundsByType([...dataMyRounds], selectedRoundType)
			setMyRoundsData(temp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedRoundType, dataMyRounds, connectedWallet])

	useEffect(() => {
		setSize(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortType])

	useEffect(() => {
		const roundTypeFromQuery = searchParams.get('round_type')
		const validRoundTypes: TSelectedRoundType[] = [
			'on-going',
			'upcoming',
			'ended',
		]

		if (
			roundTypeFromQuery &&
			validRoundTypes.includes(roundTypeFromQuery as TSelectedRoundType)
		) {
			setSelectedRoundType(roundTypeFromQuery as TSelectedRoundType)
		} else {
			setSelectedRoundType('on-going')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	const LoadingRoundState = () => (
		<div className="h-52 flex items-center justify-center w-full">
			<IconLoading size={40} className="fill-grantpicks-black-600" />
		</div>
	)

	const EmptyRoundState = () => (
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
	)

	return (
		<div>
			<div className="flex items-center md:justify-center md:space-x-4 space-x-2 overflow-x-auto mb-6 md:mb-7 lg:mb-8">
				<button
					onClick={() => {
						setSelectedRoundType('on-going')
						const url = new URL(window.location.href)
						url.searchParams.delete('round_type')
						router.replace(url.toString(), { scroll: false })
					}}
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
					onClick={() => {
						setSelectedRoundType('upcoming')
						router.push(`?round_type=upcoming`, { scroll: false })
					}}
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
					onClick={() => {
						setSelectedRoundType('ended')
						router.push(`?round_type=ended`, { scroll: false })
					}}
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
			<div className="mb-6 md:mb-7 lg:mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8">
				<div className="relative flex items-center gap-4 justify-end col-span-3">
					<div
						onClick={() => setShowSortType(!showSortType)}
						className="border border-grantpicks-black-200 rounded-full py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
					>
						<p className="text-sm font-normal text-grantpicks-black-950">
							{sortType}
						</p>
						<IconUnfoldMore size={24} className="fill-grantpicks-black-400" />
					</div>
					{showSortType && (
						<Menu
							isOpen={showSortType}
							onClose={() => setShowSortType(false)}
							position="top-14 md:right-24 right-0"
						>
							<div className="border border-black/10 p-3 w-52 rounded-xl space-y-3 bg-white">
								<p
									onClick={() => {
										setSortType('Most Recent')
										setShowSortType(false)
									}}
									className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
								>
									Most Recent
								</p>
								<p
									onClick={() => {
										setSortType('Vault Total Deposits')
										setShowSortType(false)
									}}
									className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
								>
									Vault Total Deposits
								</p>
								<p
									onClick={() => {
										setSortType('My Rounds')
										setShowSortType(false)
									}}
									className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
								>
									My Rounds
								</p>
							</div>
						</Menu>
					)}
					<Button
						onClick={() => {
							router.push('/rounds/create-round')
						}}
					>
						Create Round
					</Button>
				</div>
			</div>
			<div className="min-h-96">
				{sortType === 'My Rounds' ? (
					isLoadingMyRounds ? (
						<LoadingRoundState />
					) : myRoundsData.length === 0 ? (
						<EmptyRoundState />
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
							{myRoundsData.map((doc, idx) => (
								<RoundCard
									key={idx}
									doc={doc}
									mutateRounds={mutateMyRounds}
								/>
							))}
						</div>
					)
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
						{isLoading ? (
							<LoadingRoundState />
						) : roundsData.length === 0 ? (
							<EmptyRoundState />
						) : (
							<div className="grid grid-cols-1 z-10 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
								{roundsData?.map((doc, idx) => (
									<RoundCard
										key={idx}
										doc={doc}
										mutateRounds={mutate}
									/>
								))}
							</div>
						)}
					</InfiniteScroll>
				)}
			</div>
		</div>
	)
}

export default ApplicationRounds
