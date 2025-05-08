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
import RoundDetailDrawer from './RoundDetailDrawer'
import ApplicationsDrawer from './ApplicationsDrawer'
import FundRoundModal from './FundRoundModal'
import { useModalContext } from '@/app/providers/ModalProvider'
import {
	getRoundApplication,
	HasVotedRoundParams,
	isHasVotedRound,
} from '@/services/stellar/round'
import { useWallet } from '@/app/providers/WalletProvider'
import useSWRInfinite from 'swr/infinite'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LIMIT_SIZE } from '@/constants/query'
import IconLoading from '../../svgs/IconLoading'
import Image from 'next/image'
import moment from 'moment'
import { extractChainId, formatStroopToXlm } from '@/utils/helper'
import IconStellar from '../../svgs/IconStellar'
import { useRouter, useSearchParams } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { usePotlockService } from '@/services/potlock'
import { GPRound } from '@/models/round'
import IconUnfoldMore from '../../svgs/IconUnfoldMore'
import Menu from '../../commons/Menu'
import { TSelectedRoundType } from '@/types/round'
import RoundMenu from './RoundMenu'
import useSWR from 'swr'

const ApplicationRoundsItem = ({
	doc,
	mutateRounds,
}: {
	doc: GPRound
	mutateRounds: any
}) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { selectedRoundType } = useRoundStore()
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()
	const { connectedWallet, stellarPubKey } = useWallet()
	const [totalApprovedProjects, setTotalApprovedProjects] = useState<number>(0)
	const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
	const { setShowMenu } = useGlobalContext()
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const chainId = extractChainId(doc)
	const storage = useAppStorage()

	const fetchTotalApprovedProjects = async () => {
		if (chainId === 'stellar') {
			const contracts = storage.getStellarContracts()

			if (!contracts) return

			try {
				const res = await contracts.round_contract.get_approved_projects({
					round_id: BigInt(doc.on_chain_id),
				})
				setTotalApprovedProjects(res.result.length)
			} catch (error: any) {
				console.log('error fetching total approved projects')
			}
		} else {
			const contracts = storage.getNearContracts(null)

			if (!contracts) {
				return
			}

			const results = await contracts.round.getVotingResults(
				Number(doc.on_chain_id),
			)
			setTotalApprovedProjects(results.length)
		}
	}

	const fetchRoundApplication = async () => {
		if (selectedRoundType === 'upcoming') {
			if (chainId == 'stellar') {
				try {
					const contracts = storage.getStellarContracts()

					if (!contracts) return

					const res = await getRoundApplication(
						{
							round_id: BigInt(doc.on_chain_id),
							applicant: storage.my_address || '',
						},
						contracts,
					)
					//@ts-ignore
					if (!res?.error) {
						if (selectedRoundType === 'upcoming') setIsUserApplied(true)
					}
				} catch (error: any) {
					console.log('error fetch project applicant')
					setIsUserApplied(false)
				}
			} else {
				try {
					const contracts = storage.getNearContracts(null)

					if (!contracts) {
						return
					}

					const application = await contracts.round.getApplicationForRound(
						Number(doc.on_chain_id),
						storage.my_address || '',
					)

					if (application) {
						setIsUserApplied(true)
					}
				} catch (error: any) {
					console.log('error fetch project applicant')
					setIsUserApplied(false)
				}
			}
		}
	}

	const getSpecificTime = () => {
		if (selectedRoundType === 'upcoming') {
			if (
				new Date().getTime() >=
				new Date(doc.application_start || '').getTime() &&
				new Date().getTime() < new Date(doc.application_end || '').getTime()
			) {
				return `upcoming-open`
			} else if (
				new Date().getTime() >= new Date(doc.application_end || '').getTime() &&
				new Date().getTime() < new Date(doc.voting_start).getTime()
			) {
				return `upcoming-closed`
			} else if (doc.allow_applications) {
				return `upcoming`
			} else {
				return `upcoming-closed`
			}
		} else if (selectedRoundType === 'on-going') {
			return `on-going`
		} else {
			if (doc.round_complete) {
				return `ended`
			} else {
				return `payout-pending`
			}
		}
	}

	const checkIfUserHasVoted = async () => {
		if (selectedRoundType === 'on-going') {
			if (chainId == 'stellar') {
				try {
					const contracts = storage.getStellarContracts()

					if (!contracts) return

					const params: HasVotedRoundParams = {
						round_id: BigInt(doc.on_chain_id),
						voter: storage.my_address || '',
					}
					const hasVoted = await isHasVotedRound(params, contracts)
					setHasVoted(hasVoted)
				} catch (error: any) {
					console.log('error checking if user has voted', error)
				}
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const hasVoted = await contracts.round.hasVote(
					Number(doc.on_chain_id),
					storage.my_address || '',
				)

				setHasVoted(hasVoted)
			}
		}
	}

	useEffect(() => {
		fetchRoundApplication()
		checkIfUserHasVoted()
		fetchTotalApprovedProjects()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [doc.on_chain_id, connectedWallet, stellarPubKey])

	useEffect(() => {
		if (searchParams.get('round_id') === doc.on_chain_id.toString()) {
			setShowDetailDrawer(true)
		}
	}, [searchParams, doc.on_chain_id])

	const handleOpenDetailDrawer = () => {
		setShowDetailDrawer(true)
		router.push(
			`?round_type=${selectedRoundType}&round_id=${doc.on_chain_id}`,
			{ scroll: false },
		)
	}

	const handleCloseDetailDrawer = () => {
		setShowDetailDrawer(false)
		const url = new URL(window.location.href)
		url.searchParams.delete('round_id')
		router.replace(url.toString(), { scroll: false })
	}

	return (
		<div className="p-4 md:p-5 rounded-xl border border-black/10">
			<div className="flex items-center justify-between mb-4 md:mb-6">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
					{chainId === 'near' ? (
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
									getSpecificTime() === 'upcoming-closed' ||
									getSpecificTime() == 'ended'
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
						) : getSpecificTime() === 'ended' ? (
							<IconDollar size={18} className="fill-grantpicks-black-950" />
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
											: getSpecificTime() === 'ended'
												? `completed`
												: `payout pending`}
						</p>
					</div>
				</div>
			</div>
			<button
				onClick={handleOpenDetailDrawer}
				className="font-semibold text-base md:text-lg lg:text-xl max-w-60 mb-4 text-grantpicks-black-950 text-left"
			>
				{doc.name}
			</button>
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
							Max. {doc.max_participants}{' '}
							{doc.max_participants > 1 ? 'applicants' : 'applicant'}
						</p>
					</div>
				) : (
					<div className="flex items-center space-x-1">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{totalApprovedProjects} Projects
						</p>
					</div>
				)}
				{selectedRoundType === 'on-going' ? (
					<div className="flex items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends{` `}
							{moment(new Date(doc.voting_end)).fromNow()}
						</p>
					</div>
				) : selectedRoundType === 'upcoming' ? (
					<>
						{getSpecificTime() === 'upcoming' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Open {moment(new Date(doc.application_start || '')).fromNow()}
								</p>
							</div>
						)}
						{getSpecificTime() === 'upcoming-open' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Closing{' '}
									{moment(new Date(doc.application_end || '')).fromNow()}
								</p>
							</div>
						)}
						{getSpecificTime() === 'upcoming-closed' && (
							<div className="flex items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Voting {moment(new Date(doc.voting_start)).fromNow()}
								</p>
							</div>
						)}
					</>
				) : (
					<p className="text-lg md:text-xl font-normal text-grantpicks-black-950">
						{chainId === 'stellar'
							? formatStroopToXlm(BigInt(doc.expected_amount))
							: doc.expected_amount}{' '}
						<span className="text-sm font-normal text-grantpicks-black-600">
							{chainId === 'near' ? 'NEAR' : 'XLM'}
						</span>
					</p>
				)}
			</div>
			<div className="w-full">
				<Button
					onClick={() => {
						if (selectedRoundType === 'on-going') {
							if (hasVoted) {
								router.push(
									`/rounds/round-vote/${doc.on_chain_id}?is_voted=true`,
								)
							} else {
								setVoteConfirmationProps((prev) => ({
									...prev,
									isOpen: true,
									doc: doc,
								}))
							}
						} else if (
							selectedRoundType === 'upcoming' &&
							getSpecificTime() === 'upcoming-open'
						) {
							setApplyProjectInitProps((prev) => ({
								...prev,
								isOpen: true,
								round_id: BigInt(doc.on_chain_id),
								roundData: doc,
							}))
						} else {
							router.push(`/rounds/round-result/${doc.id}`)
						}
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
					isDisabled={
						((getSpecificTime() === 'ended' ||
							getSpecificTime() === 'payout-pending') &&
							totalApprovedProjects == 0) ||
						getSpecificTime() === 'upcoming' ||
						getSpecificTime() === 'upcoming-closed' ||
						(isUserApplied && getSpecificTime() == 'upcoming-open')
					}
				>
					{isUserApplied && getSpecificTime() === 'upcoming-open'
						? `You're already a part of this round.`
						: getSpecificTime() === 'on-going'
							? hasVoted
								? `You've voted in this round`
								: 'Vote'
							: getSpecificTime() === 'upcoming'
								? 'No application allowed'
								: getSpecificTime() === 'upcoming-open'
									? 'Apply'
									: getSpecificTime() === 'upcoming-closed'
										? 'Application Closed'
										: !storage.my_address
											? 'Connect Wallet'
											: totalApprovedProjects == 0
												? 'No projects Participated'
												: 'View Result'}
				</Button>
			</div>
			{(getSpecificTime() === 'on-going' ||
				getSpecificTime() === 'upcoming' ||
				getSpecificTime() === 'upcoming-open' ||
				getSpecificTime() === 'upcoming-closed') && (
					<div className="mt-6">
						<RoundMenu
							data={doc}
							onViewDetails={() => {
								setShowDetailDrawer(true)
								router.push(
									`?round_type=${selectedRoundType}&round_id=${doc.on_chain_id}`,
									{ scroll: false },
								)
							}}
							onViewApps={() => {
								setShowAppsDrawer(true)
							}}
							onFundRound={() => {
								if (!connectedWallet) {
									setShowMenu('choose-wallet')
									return
								}
								setShowFundRoundModal(true)
							}}
						/>
					</div>
				)}

			<RoundDetailDrawer
				isOpen={showDetailDrawer}
				onClose={handleCloseDetailDrawer}
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
						t.approved_projects.length > 0,
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
			<div className="mb-6 md:mb-7 lg:mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-8">
				<div className="md:col-span-2 lg:col-span-3" />
				<div className="relative">
					<div
						onClick={() => setShowSortType(true)}
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
							position="right-0 left-0 -bottom-28"
						>
							<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white">
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
								<ApplicationRoundsItem
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
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
								{roundsData?.map((doc, idx) => (
									<ApplicationRoundsItem
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
