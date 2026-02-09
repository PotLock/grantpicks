import useRoundStore from '@/stores/zustand/useRoundStore'
import clsx from 'clsx'
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import IconSearch from '../../svgs/IconSearch'
import IconClose from '../../svgs/IconClose'

const ApplicationRounds = () => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	const [roundsData, setRoundsData] = useState<GPRound[]>([])
	const potlockApi = usePotlockService()
	const { connectedWallet } = useWallet()
	const [showSortType, setShowSortType] = useState<boolean>(false)
	const router = useRouter()
	const searchParams = useSearchParams()
	const storage = useAppStorage()
	const { stellarPubKey } = useWallet()
	const [myRoundsData, setMyRoundsData] = useState<GPRound[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const sortButtonRef = useRef<HTMLDivElement>(null)
	const [isMobile, setIsMobile] = useState<boolean>(false)
	const isUpdatingSortFromClick = useRef<boolean>(false)

	// Initialize sortType from URL or default to 'Most Recent'
	const [sortType, setSortType] = useState<string>(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search)
			const sortTypeFromQuery = urlParams.get('sort')
			const validSortTypes = ['Most Recent', 'Total Funds Raised', 'My Rounds']
			// Only allow "My Rounds" if user is logged in (check will happen in useEffect)
			if (sortTypeFromQuery && validSortTypes.includes(sortTypeFromQuery)) {
				return sortTypeFromQuery
			}
		}
		return 'Most Recent'
	})

	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768)
		checkMobile()
		window.addEventListener('resize', checkMobile)
		return () => window.removeEventListener('resize', checkMobile)
	}, [])

	const filterRoundsByType = (rounds: GPRound[], type: string) => {
		switch (type) {
			case 'upcoming':
				return rounds.filter((t) => {
					const now = new Date().getTime()
					const votingStart = new Date(t.voting_start).getTime()
					const appStart = t.application_start ? new Date(t.application_start).getTime() : null
					const appEnd = t.application_end ? new Date(t.application_end).getTime() : null

					// Only show in upcoming if voting hasn't started
					if (now >= votingStart) return false

					// If application exists and has ended, don't show in upcoming (should be in on-going)
					if (appEnd && now >= appEnd) return false

					// If no application dates exist, don't show in upcoming (should be in on-going)
					if (!appStart && !appEnd) return false

					// If application exists and hasn't started, show in upcoming
					if (appStart && now < appStart) return true

					// If application exists and is open, show in upcoming
					if (appStart && appEnd && now >= appStart && now < appEnd) return true

					return false
				})
			case 'on-going':
				return rounds.filter((t) => {
					const now = new Date().getTime()
					const votingStart = new Date(t.voting_start).getTime()
					const votingEnd = new Date(t.voting_end).getTime()
					const appEnd = t.application_end ? new Date(t.application_end).getTime() : null
					const appStart = t.application_start ? new Date(t.application_start).getTime() : null

					// Case 1: Voting has started (normal on-going case)
					if (now >= votingStart && now < votingEnd && t.approved_projects.length > 0) {
						return true
					}

					// Case 2: Voting hasn't started BUT application has ended
					if (now < votingStart && appEnd && now >= appEnd) {
						return true
					}

					// Case 3: Voting hasn't started AND application doesn't exist
					if (now < votingStart && !appStart && !appEnd) {
						return true
					}

					return false
				})
			case 'ended':
				return rounds.filter(
					(t) => new Date(t.voting_end).getTime() <= new Date().getTime(),
				)
			default:
				return rounds
		}
	}

	const onFetchRounds = async (key: { url: string; page: number }) => {

		const res = await potlockApi.getRounds(
			key.page + 1,
			sortType === 'Total Funds Raised'
				? 'vault_total_deposits'
				: 'deployed_at',
		)
		return res
	}

	const getKey = (pageIndex: number, previousPageData: GPRound[]) => {
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-rounds`,
			page: pageIndex,
			sortType,
		}
	}
	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchRounds(key), {
			revalidateFirstPage: true,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			revalidateOnMount: true,
			persistSize: false,
			keepPreviousData: false,
			dedupingInterval: 0,
		})
	const hasMore = data ? data.length >= LIMIT_SIZE : false

	useEffect(() => {
		if (data) {
			const rounds = data
				? ([] as GPRound[]).concat(...(data as any as GPRound[]))
				: []
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
	} = useSWR(
		() => {
			if (!connectedWallet) return null

			return stellarPubKey ? `get-my-rounds:${stellarPubKey}` : null
		},
		() => onFetchMyRounds(stellarPubKey),
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
		}
		// If no query param, keep current selection to avoid flicker
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams])

	// Update sortType from URL params (only when URL changes externally, not from our own clicks)
	useEffect(() => {
		// Skip if we're updating from a user click to avoid race conditions
		if (isUpdatingSortFromClick.current) {
			isUpdatingSortFromClick.current = false
			return
		}

		const sortTypeFromQuery = searchParams.get('sort')
		const validSortTypes = ['Most Recent', 'Total Funds Raised', 'My Rounds']

		// If user is not logged in and tries to access "My Rounds", reset to default
		if (sortTypeFromQuery === 'My Rounds' && !stellarPubKey) {
			const currentParams = new URLSearchParams(searchParams.toString())
			currentParams.delete('sort')
			router.replace(`?${currentParams.toString()}`, { scroll: false })
			setSortType('Most Recent')
			return
		}

		// If user logs out while viewing "My Rounds", reset to default
		if (sortType === 'My Rounds' && !stellarPubKey) {
			const currentParams = new URLSearchParams(searchParams.toString())
			currentParams.delete('sort')
			router.replace(`?${currentParams.toString()}`, { scroll: false })
			setSortType('Most Recent')
			return
		}

		if (sortTypeFromQuery && validSortTypes.includes(sortTypeFromQuery)) {
			if (sortTypeFromQuery !== sortType) {
				setSortType(sortTypeFromQuery)
			}
		} else if (!sortTypeFromQuery && sortType !== 'Most Recent') {
			// If URL param is removed, reset to default
			setSortType('Most Recent')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, stellarPubKey])

	// Client-side search filters
	const filteredRounds = useMemo(() => {
		const q = (searchQuery || '').trim().toLowerCase()
		if (!q) return roundsData
		return roundsData.filter((r) => {
			const name = (r.name || '').toLowerCase()
			const desc = (r.description || '').toLowerCase()
			return name.includes(q) || desc.includes(q)
		})
	}, [roundsData, searchQuery])

	const filteredMyRounds = useMemo(() => {
		const q = (searchQuery || '').trim().toLowerCase()
		if (!q) return myRoundsData
		return myRoundsData.filter((r) => {
			const name = (r.name || '').toLowerCase()
			const desc = (r.description || '').toLowerCase()
			return name.includes(q) || desc.includes(q)
		})
	}, [myRoundsData, searchQuery])

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

	const EmptyMyRoundsState = () => (
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
				I have not created any rounds.
			</p>
		</div>
	)

	return (
		<div className="space-y-8">
			{/* Filter Tabs */}
			<div className="flex items-center md:justify-center md:space-x-3 space-x-2 overflow-x-auto pb-2">
				<button
					onClick={() => {
						setSelectedRoundType('on-going')
						const url = new URL(window.location.href)
						url.searchParams.delete('round_type')
						router.replace(url.toString(), { scroll: false })
					}}
					className={clsx(
						`rounded-xl px-6 py-3.5 flex-shrink-0 md:flex-shrink text-sm font-bold cursor-pointer shadow-sm`,
						selectedRoundType === 'on-going'
							? `bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105`
							: `bg-white text-grantpicks-black-700 border-2 border-grantpicks-black-100 hover:border-grantpicks-black-200 hover:shadow-md`,
					)}
				>
					Ongoing Rounds
				</button>
				<button
					onClick={() => {
						setSelectedRoundType('upcoming')
						router.push(`?round_type=upcoming`, { scroll: false })
					}}
					className={clsx(
						`rounded-xl px-6 py-3.5 flex-shrink-0 md:flex-shrink text-sm font-bold cursor-pointer shadow-sm`,
						selectedRoundType === 'upcoming'
							? `bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105`
							: `bg-white text-grantpicks-black-700 border-2 border-grantpicks-black-100 hover:border-grantpicks-black-200 hover:shadow-md`,
					)}
				>
					Upcoming Rounds
				</button>
				<button
					onClick={() => {
						setSelectedRoundType('ended')
						router.push(`?round_type=ended`, { scroll: false })
					}}
					className={clsx(
						`rounded-xl px-6 py-3.5 flex-shrink-0 md:flex-shrink text-sm font-bold cursor-pointer shadow-sm`,
						selectedRoundType === 'ended'
							? `bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30 scale-105`
							: `bg-white text-grantpicks-black-700 border-2 border-grantpicks-black-100 hover:border-grantpicks-black-200 hover:shadow-md`,
					)}
				>
					Past Rounds
				</button>
			</div>

			{/* Search and Filters */}
			<div className="bg-white rounded-2xl p-4 md:p-6 border-2 border-grantpicks-black-100 shadow-sm">
				<div className="flex w-full flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="flex-1 w-full">
						<div className="flex h-14 items-center gap-x-3 rounded-xl px-4 border-2 border-grantpicks-black-100 bg-grantpicks-black-50/50 w-full focus-within:border-grantpicks-black-200 focus-within:bg-white transition-all">
							<IconSearch size={22} color="#656565" />
							<input
								type="text"
								placeholder="Search rounds by name or description..."
								className="flex-1 text-grantpicks-black-950 placeholder:text-grantpicks-black-400 outline-none bg-transparent font-medium"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Escape') {
										setSearchQuery('')
									}
								}}
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="p-1.5 hover:bg-grantpicks-black-100 rounded-lg transition-colors"
									title="Clear search"
								>
									<IconClose size={18} color="#656565" />
								</button>
							)}
						</div>
					</div>
					<div className="flex w-full flex-row items-center justify-end gap-3 md:w-auto">
						<div className="relative flex-shrink-0">
							<div
								ref={sortButtonRef}
								onClick={() => setShowSortType(!showSortType)}
								className="border-2 border-grantpicks-black-100 bg-white rounded-xl py-3 px-4 flex items-center justify-between cursor-pointer hover:border-grantpicks-black-200 hover:shadow-md transition-all min-w-[180px]"
							>
								<p className="text-sm font-semibold text-grantpicks-black-950">
									{sortType}
								</p>
								<IconUnfoldMore size={20} className="fill-grantpicks-black-400" />
							</div>
							{showSortType && (
								<Menu
									isOpen={showSortType}
									onClose={() => setShowSortType(false)}
									position="top-14 right-0"
									buttonRef={isMobile ? sortButtonRef : undefined}
									mobileAsPortal={isMobile}
								>
									<div className="border-2 border-grantpicks-black-100 p-2 w-56 rounded-xl space-y-1 bg-white shadow-xl">
										<p
											onClick={() => {
												const newSortType = 'Most Recent'
												isUpdatingSortFromClick.current = true
												setSortType(newSortType)
												setShowSortType(false)
												const currentParams = new URLSearchParams(searchParams.toString())
												currentParams.set('sort', newSortType)
												router.push(`?${currentParams.toString()}`, { scroll: false })
											}}
											className="text-sm font-medium text-grantpicks-black-950 hover:bg-grantpicks-black-50 cursor-pointer transition px-3 py-2 rounded-lg"
										>
											Most Recent
										</p>
										<p
											onClick={() => {
												const newSortType = 'Total Funds Raised'
												isUpdatingSortFromClick.current = true
												setSortType(newSortType)
												setShowSortType(false)
												const currentParams = new URLSearchParams(searchParams.toString())
												currentParams.set('sort', newSortType)
												router.push(`?${currentParams.toString()}`, { scroll: false })
											}}
											className="text-sm font-medium text-grantpicks-black-950 hover:bg-grantpicks-black-50 cursor-pointer transition px-3 py-2 rounded-lg"
										>
											Total Funds Raised
										</p>
										{stellarPubKey && (
											<p
												onClick={() => {
													const newSortType = 'My Rounds'
													isUpdatingSortFromClick.current = true
													setSortType(newSortType)
													setShowSortType(false)
													const currentParams = new URLSearchParams(searchParams.toString())
													currentParams.set('sort', newSortType)
													router.push(`?${currentParams.toString()}`, { scroll: false })
												}}
												className="text-sm font-medium text-grantpicks-black-950 hover:bg-grantpicks-black-50 cursor-pointer transition px-3 py-2 rounded-lg"
											>
												My Rounds
											</p>
										)}
									</div>
								</Menu>
							)}
						</div>
						{stellarPubKey && (
							<div className="flex justify-end flex-shrink-0">
								<Button
									onClick={() => {
										router.push('/rounds/create-round')
									}}
									className="!px-6 !py-3 !font-bold shadow-lg hover:shadow-xl transition-all"
								>
									Create Round
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="min-h-96">
				{sortType === 'My Rounds' ? (
					isLoadingMyRounds ? (
						<LoadingRoundState />
					) : filteredMyRounds.length === 0 ? (
						<EmptyMyRoundsState />
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
							{filteredMyRounds.map((doc, idx) => (
								<RoundCard key={idx} doc={doc} mutateRounds={mutateMyRounds} />
							))}
						</div>
					)
				) : (
					<InfiniteScroll
						dataLength={filteredRounds.length}
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
						) : filteredRounds.length === 0 ? (
							<EmptyRoundState />
						) : (
							<div className="grid grid-cols-1 z-10 md:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
								{filteredRounds?.map((doc, idx) => (
									<RoundCard key={idx} doc={doc} mutateRounds={mutate} />
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
