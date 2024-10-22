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
import {
	getRoundApplication,
	HasVotedRoundParams,
	isHasVotedRound,
} from '@/services/stellar/round'
import { useWallet } from '@/app/providers/WalletProvider'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import useSWRInfinite from 'swr/infinite'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LIMIT_SIZE, LIMIT_SIZE_CONTRACT } from '@/constants/query'
import IconLoading from '../../svgs/IconLoading'
import Image from 'next/image'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import IconStellar from '../../svgs/IconStellar'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { usePotlockService } from '@/services/potlock'
import { GPRound } from '@/models/round'
import IconUnfoldMore from '../../svgs/IconUnfoldMore'
import Menu from '../../commons/Menu'
import { NearRound } from '@/services/near/type'

const ApplicationRoundsItem = ({
	doc,
	mutateRounds,
}: {
	doc: GPRound
	mutateRounds: any
}) => {
	const router = useRouter()
	const { selectedRoundType } = useRoundStore()
	const [showMoreVert, setShowMoreVert] = useState<boolean>(false)
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()
	const { connectedWallet, stellarPubKey, stellarKit } = useWallet()
	const [totalApprovedProjects, setTotalApprovedProjects] = useState<number>(0)
	const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
	const { setShowMenu } = useGlobalContext()
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const storage = useAppStorage()

	const fetchOnChainRound = async () => {
		if (storage.chainId == 'stellar') {
			const contracts = storage.getStellarContracts()

			if (!contracts) return

			try {
				const round = (
					await contracts.round_contract.get_round({
						round_id: BigInt(doc.on_chain_id),
					})
				).result

				let rounds = storage.roundes
				rounds.set(doc.on_chain_id.toString(), round)
				storage.setRoundes(rounds)
			} catch (error: any) {
				console.log('error fetching on chain round', error)
			}
		}
	}

	const fetchTotalApprovedProjects = async () => {
		if (storage.chainId == 'stellar') {
			const contracts = storage.getStellarContracts()

			if (!contracts) return

			try {
				const res = await contracts.round_contract.get_approved_projects({
					round_id: BigInt(doc.on_chain_id),
				})
				setTotalApprovedProjects(res.result.length)
			} catch (error: any) {
				console.log('error fetching total approved projects', error)
			}
		}
	}

	const fetchRoundApplication = async () => {
		if (storage.chainId == 'stellar') {
			if (stellarPubKey && doc.allow_applications) {
				try {
					const contracts = storage.getStellarContracts()

					if (!contracts) return

					const res = await getRoundApplication(
						{ round_id: BigInt(doc.on_chain_id), applicant: stellarPubKey },
						contracts,
					)
					//@ts-ignore
					if (!res?.error) {
						if (selectedRoundType === 'upcoming') setIsUserApplied(true)
					}
				} catch (error: any) {
					console.log('error fetch project applicant', error)
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
			if (doc.round_complete != null) {
				return `ended`
			} else {
				return `payout-pending`
			}
		}
	}

	const checkIfUserHasVoted = async () => {
		if (storage.chainId == 'stellar') {
			if (stellarPubKey) {
				try {
					const contracts = storage.getStellarContracts()

					if (!contracts) return

					const params: HasVotedRoundParams = {
						round_id: BigInt(doc.on_chain_id),
						voter: stellarPubKey,
					}
					const hasVoted = await isHasVotedRound(params, contracts)
					setHasVoted(hasVoted)
				} catch (error: any) {
					console.log('error checking if user has voted', error)
				}
			} else {
				setHasVoted(false)
			}
		}
	}

	useEffect(() => {
		fetchRoundApplication()
		checkIfUserHasVoted()
		fetchOnChainRound()
		fetchTotalApprovedProjects()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [doc.id, connectedWallet, stellarPubKey])

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
									if (!connectedWallet) {
										setShowMenu('choose-wallet')
										return
									}
									setShowMoreVert(false)
									setShowFundRoundModal(true)
								}}
							/>
						</div>
					)}
				</div>
			</div>
			<button
				onClick={() => {
					setShowDetailDrawer(true)
				}}
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
							Max. {doc.max_participants} applicant
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
									Closed {moment(new Date(doc.application_end || '')).fromNow()}
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
						{formatStroopToXlm(BigInt(doc.expected_amount))}{' '}
						<span className="text-sm font-normal text-grantpicks-black-600">
							{connectedWallet === 'near' ? 'NEAR' : 'XLM'}
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
								round_id: BigInt(doc.on_chain_id),
								roundData: doc,
							}))
						} else {
							storage.clear()
							router.push(`/application/round-result/${doc.id}`)
						}
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
					isDisabled={
						getSpecificTime() === 'upcoming' ||
						getSpecificTime() === 'upcoming-closed' ||
						(isUserApplied && getSpecificTime() == 'upcoming-open') ||
						(selectedRoundType === 'on-going' && hasVoted)
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

const ApplicationRounds = () => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	const [roundsData, setRoundsData] = useState<GPRound[]>([])
	const potlockApi = usePotlockService()
	const storage = useAppStorage()
	const { connectedWallet, nearWallet } = useWallet()
	const [showSortType, setShowSortType] = useState<boolean>(false)
	const { nearPrice } = useGlobalContext()
	const [sortType, setSortType] = useState<string>('Most Recent')

	const onFetchRounds = async (key: { url: string; page: number }) => {
		if (storage.chainId == 'stellar') {
			const res = await potlockApi.getRounds(
				key.page + 1,
				sortType === 'Vault Total Deposits'
					? 'vault_total_deposits'
					: 'deployed_at',
			)
			return res
		} else {
			const contracts = storage.getNearContracts(nearWallet)

			const rounds = await contracts?.round.getRounds(
				key.page * LIMIT_SIZE_CONTRACT,
				LIMIT_SIZE_CONTRACT,
			)

			return rounds.map((round: NearRound) => {
				return {
					...round,
					id: round.id.toString(),
					on_chain_id: round.id.toString(),
					voting_start: round.voting_start_ms,
					voting_end: round.voting_end_ms,
					factory_contract: '',
					deployed_at: '',
					cooldown_end: round.cooldown_end_ms,
					compliance_end: round.compliance_end_ms,
					application_end: round.application_end_ms,
					application_start: round.application_start_ms,
					is_video_required: round.application_requires_video,
					is_whitelist: round.use_whitelist,
					is_referral: round.use_referrals,
					is_compliance: round.use_compliance,
					compliance_req_desc: round.compliance_requirement_description,
					allow_remaining_dist: round.allow_remaining_funds_redistribution,
					remaining_dist_address:
						round.remaining_funds_redistribution_recipient,
					remaining_dist_memo: round.remaining_funds_redistribution_memo,
					remaining_dist_by: round.remaining_funds_redistributed_by,
					remaining_dist_at_ms: round.remaining_funds_redistributed_at_ms,
					vault_total_deposits: round.vault_total_deposits,
					approved_projects: [],
					name: round.name,
					description: round.description,
					current_vault_balance: round.current_vault_balance,
					vault_total_deposits_usd:
						Number(round.vault_total_deposits || 0) * nearPrice,
					use_vault: true,
					owner: {
						id: round.owner,
					},
				} as unknown as GPRound
			})
		}
	}

	const getKey = (pageIndex: number, previousPageData: GPRound[]) => {
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-rounds`,
			page: pageIndex,
			sortType,
			address: storage.my_address,
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
			let temp = [...rounds]
			if (selectedRoundType === 'upcoming') {
				temp = temp.filter(
					(t) => new Date().getTime() < new Date(t.voting_start).getTime(),
				)
			} else if (selectedRoundType === 'on-going') {
				temp = temp.filter(
					(t) =>
						new Date(t.voting_start).getTime() <= new Date().getTime() &&
						new Date().getTime() < new Date(t.voting_end).getTime(),
				)
			} else if (selectedRoundType === 'ended') {
				temp = temp.filter(
					(t) => new Date(t.voting_end).getTime() <= new Date().getTime(),
				)
			}
			setRoundsData(temp)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedRoundType, data, connectedWallet])

	useEffect(() => {
		setSize(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortType])

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
							position="right-0 left-0 -bottom-20"
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
							</div>
						</Menu>
					)}
				</div>
			</div>
			<div className="min-h-96">
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
						<div className="h-52 flex items-center justify-center w-full">
							<IconLoading size={40} className="fill-grantpicks-black-600" />
						</div>
					) : roundsData.length === 0 ? (
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
			</div>
		</div>
	)
}

export default ApplicationRounds
