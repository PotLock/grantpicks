'use client'

import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import FlagProjectModal from '@/app/components/pages/round-result/FlagProjectModal'
import RoundResultLayout from '@/app/components/pages/round-result/RoundResultLayout'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconArrowRight from '@/app/components/svgs/IconArrowRight'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconDot from '@/app/components/svgs/IconDot'
import IconProject from '@/app/components/svgs/IconProject'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { LIMIT_SIZE } from '@/constants/query'
import { GPVotingResult } from '@/models/voting'
import {
	nearProjectToGPProject,
	NearProjectVotingResult,
} from '@/services/near/type'
import { usePotlockService } from '@/services/potlock'
import { projectToGPProject } from '@/services/stellar/type'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { extractChainId, prettyTruncate } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import clsx from 'clsx'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import useSWRInfinite from 'swr/infinite'
import Image from 'next/image'
import { GPProject } from '@/models/project'
import IconCheck from '@/app/components/svgs/IconCheck'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'

const VoteItem = ({ index, data }: { index: number; data: any }) => {
	const store = useAppStorage()
	let [firstProjectData, setFirstProjectData] = useState<GPProject | null>(null)
	let [secondProjectData, setSecondProjectData] = useState<GPProject | null>(
		null,
	)

	const fetchProjectData = async () => {
		const firstProjectData = await store.getProjectByOwner(
			data.pair[0].project_id,
		)
		const secondProjectData = await store.getProjectByOwner(
			data.pair[1].project_id,
		)

		setFirstProjectData(firstProjectData)
		setSecondProjectData(secondProjectData)
	}

	useEffect(() => {
		fetchProjectData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data])

	return (
		<div key={index} className="rounded-2xl border-grantpicks-black-100 border">
			<div className="flex p-2 md:p-3  items-center bg-grantpicks-black-100 rounded-t-2xl">
				<Image
					src={`https://www.tapback.co/api/avatar/${data.voter.id}`}
					alt="Voter"
					className={'w-10 h-10 rounded-full'}
					width={40}
					height={40}
				/>

				<p className="text-sm font-semibold text-grantpicks-black-950 ml-2">
					@{prettyTruncate(data.voter.id, 10, 'address')}
				</p>
			</div>
			<div className="relative justify-center flex items-center gap-x-4 md:gap-x-6 mb-4 md:mb-6 mt-3">
				<div className="flex items-center flex-col mt-5">
					<Image
						className={clsx(
							`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
							data.winner.project_id === data.pair[0].project_id
								? 'border-4 border-grantpicks-purple-500'
								: 'border-4 border-grantpicks-red-400',
						)}
						src={`https://www.tapback.co/api/avatar/${firstProjectData?.owner?.id}`}
						alt="Project 1"
						width={112}
						height={112}
					/>
					{data.winner.project_id === data.pair[0].project_id ? (
						<IconCheckCircle size={24} className="fill-grantpicks-purple-400" />
					) : (
						<IconCloseFilled size={24} className="fill-grantpicks-red-400" />
					)}
				</div>
				<div className="flex items-center flex-col mt-5">
					<Image
						className={clsx(
							`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
							data.winner.project_id === data.pair[1].project_id
								? 'border-4 border-grantpicks-purple-500'
								: 'border-4 border-grantpicks-red-400',
						)}
						src={`https://www.tapback.co/api/avatar/${secondProjectData?.owner?.id}`}
						alt="Project 2"
						width={112}
						height={112}
					/>
					{data.winner.project_id === data.pair[1].project_id ? (
						<IconCheckCircle size={24} className="fill-grantpicks-purple-400" />
					) : (
						<IconCloseFilled size={24} className="fill-grantpicks-red-400" />
					)}
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="rounded-full w-16 h-16 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center">
						<p className="text-[32px] font-black text-white">VS</p>
					</div>
				</div>
			</div>
		</div>
	)
}

const RoundResultProjectDetailPage = () => {
	const [pairFilter, setPairFilter] = useState<'all' | 'won' | 'lost'>('all')
	const global = useGlobalContext()
	const params = useParams<{ roundId: string; projectId: string }>()
	const { stellarKit, nearWallet } = useWallet()
	const [showFlagModal, setShowFlagModal] = useState(false)
	const [numberOfProjects, setNumberOfProjects] = useState(0)
	const [owner, setOwner] = useState<string | null>(null)
	const storage = useAppStorage()
	const potlockService = usePotlockService()

	const fetchVotingResultRound = async () => {
		if (storage.current_round) {
			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const votingResults = (
					await contracts.round_contract.get_voting_results_for_round({
						round_id: BigInt(storage.current_round.on_chain_id || 0),
					})
				).result

				if (votingResults) {
					const gprVotingResults: GPVotingResult[] = votingResults.map(
						(votingResult) => {
							return {
								project: votingResult.project_id.toString(),
								votes: Number(votingResult.voting_count.toString()),
								flag: votingResult.is_flagged,
							} as GPVotingResult
						},
					)
					storage.setCurrentResults(gprVotingResults)
					const projectInfoAll = storage.projects
					votingResults.forEach(async (votingResult) => {
						const project = storage.projects.get(
							votingResult.project_id.toString(),
						)
						if (!project) {
							const projectInfo = (
								await contracts.project_contract.get_project_by_id({
									project_id: votingResult.project_id,
								})
							).result

							if (projectInfo) {
								projectInfoAll.set(
									votingResult.project_id.toString(),
									projectToGPProject(projectInfo),
								)

								if (params.projectId === votingResult.project_id.toString()) {
									storage.setCurrentProject(projectToGPProject(projectInfo))
									setOwner(projectInfo.owner)
								}

								storage.setProjects(projectInfoAll)
							}
						} else {
							if (params.projectId === votingResult.project_id.toString()) {
								storage.setCurrentProject(project)
								setOwner(project.owner?.id || '')
							}
						}
					})

					setNumberOfProjects(votingResults.length)
				}
			} else {
				const contract = storage.getNearContracts(null)

				if (!contract) {
					return
				}

				const votingResults = await contract.round.getVotingResults(
					storage.current_round.on_chain_id,
				)

				if (votingResults) {
					const gprVotingResults: GPVotingResult[] = votingResults.map(
						(votingResult: NearProjectVotingResult) => {
							return {
								project: votingResult.project,
								votes: Number(votingResult.voting_count.toString()),
								flag: votingResult.is_flagged,
							} as GPVotingResult
						},
					)
					storage.setCurrentResults(gprVotingResults)
					const projectInfoAll = storage.projects
					votingResults.forEach(async (votingResult) => {
						const project = storage.projects.get(votingResult.project)
						if (!project) {
							const data = await contract.near_social.getProjectData(
								votingResult.project,
							)
							const json =
								data[`${votingResult.project}`]['profile']['gp_project'] || '{}'
							const projectInfo = JSON.parse(json)

							if (projectInfo) {
								projectInfoAll.set(
									votingResult.project,
									nearProjectToGPProject(projectInfo),
								)

								if (params.projectId === votingResult.project) {
									storage.setCurrentProject(projectToGPProject(projectInfo))
									setOwner(projectInfo.owner)
								}

								storage.setProjects(projectInfoAll)
							}
						} else {
							if (params.projectId === votingResult.project.toString()) {
								storage.setCurrentProject(project)
								setOwner(project.owner?.id || '')
							}
						}
					})

					setNumberOfProjects(votingResults.length)
				}
			}
		}
	}

	const fetchRoundInfo = async () => {
		if (params.roundId) {
			let isOwner = false
			let isAdmin = false

			const roundInfo = await potlockService.getRound(Number(params.roundId))
			const chainId = extractChainId(roundInfo)

			storage.setRound(roundInfo)
			storage.roundes.set(roundInfo.id.toString(), roundInfo)
			storage.setChainId(chainId)

			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const admins = (
					await contracts.round_contract.admins({
						round_id: BigInt(roundInfo?.on_chain_id || 0),
					})
				).result

				if (roundInfo) {
					isOwner = roundInfo.owner === storage.my_address
					isAdmin = admins.includes(storage.my_address || '')

					const isAdminOrOwner = isAdmin || isOwner

					storage.setIsAdminRound(isAdminOrOwner)

					const isPayoutDone = (
						await contracts.round_contract.is_payout_done({
							round_id: BigInt(roundInfo.on_chain_id || 0),
						})
					).result

					storage.setPayoutDone(isPayoutDone)
				}
			} else {
				const contracts = storage.getNearContracts(null)
				if (!contracts) {
					return
				}

				if (roundInfo) {
					isOwner = roundInfo.owner === storage.my_address
					isAdmin = roundInfo.admins.includes(storage.my_address || '')

					const isAdminOrOwner = isAdmin || isOwner

					storage.setIsAdminRound(isAdminOrOwner)

					const isPayoutDone = await contracts.round.isPayoutDone(
						roundInfo.on_chain_id,
					)

					storage.setPayoutDone(isPayoutDone)
				}
			}
		}
	}

	const unflagProject = async () => {
		try {
			global.openPageLoading()

			if (storage.chainId === 'stellar') {
				const contract = storage.getStellarContracts()
				if (!contract) return

				const unflagTx = await contract.round_contract.unflag_project({
					round_id: BigInt(storage.current_round?.on_chain_id || 0),
					project_id: BigInt(params.projectId),
					caller: storage.my_address || '',
				})

				const txHash = await contract.signAndSendTx(
					stellarKit as StellarWalletsKit,
					unflagTx.toXDR(),
					storage.my_address || '',
				)

				if (!txHash) {
					toast.error('Failed to unflag project')
				} else {
					fetchVotingResultRound()
					toast.success('Project unflagged successfully')
				}
			} else {
				const contracts = storage.getNearContracts(nearWallet)

				if (!contracts) {
					return
				}

				await contracts.round.unflagProject(
					storage.current_round?.on_chain_id || 0,
					params.projectId,
				)

				fetchVotingResultRound()
				toast.success('Project unflagged successfully')
			}

			global.dismissPageLoading()
		} catch (e) {
			console.error(e)
			toast.error('Failed to unflag project')
		}
	}

	const initPage = async () => {
		global.openPageLoading()
		await Promise.all([fetchVotingResultRound(), fetchRoundInfo()])
		global.dismissPageLoading()
	}

	const roundData = storage.current_round
	const projectData = storage.projects.get(params.projectId)
	let totalVoting = 0

	for (const votingResult of storage.current_results) {
		totalVoting += Number(votingResult.votes.toString())
	}

	const votingData = storage.current_results.find(
		(result) => result.project === params.projectId,
	)

	const allocation = storage.getAllocation(params.projectId)

	useEffect(() => {
		if (storage.my_address) {
			initPage()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.roundId, params.projectId, storage.my_address])

	const onFetchVotes = async (key: { url: string; page: number }) => {
		const votes = await potlockService.getVotes(
			storage.current_round?.id || 0,
			owner || '',
			key.page + 1,
		)

		return votes
	}

	const getKey = (pageIndex: number, previousPageData: any[]) => {
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-votes`,
			page: pageIndex,
			round_id: storage.current_round?.id,
			project_id: owner,
		}
	}

	const { data, size, setSize, isValidating, isLoading, mutate } =
		useSWRInfinite(getKey, async (key) => await onFetchVotes(key), {
			revalidateFirstPage: false,
		})
	let votes = data ? ([] as any[]).concat(...(data as any as any[])) : []

	if (pairFilter !== 'all') {
		if (pairFilter === 'won') {
			votes = votes.filter((vote: any) => {
				return vote.winner.project_id === owner
			})
		} else {
			votes = votes.filter((vote: any) => {
				return vote.winner.project_id !== owner
			})
		}
	}

	const hasMore = data ? data.length >= LIMIT_SIZE : false

	return (
		<RoundResultLayout>
			<div className="bg-grantpicks-black-50 flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-6 mt-3 md:mt-4 rounded-xl">
				<div className="flex items-center space-x-2">
					<IconArrowLeft
						size={24}
						className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70"
						onClick={() =>
							(location.href = `/application/round-result/${params.roundId}`)
						}
					/>
					<p className="text-base font-bold text-grantpicks-black-950">
						{projectData?.name}
					</p>
				</div>
				<div className="flex items-center space-x-4">
					<div className="hidden md:flex items-center space-x-3">
						<p className="text-grantpicks-black-600 text-base font-normal">
							Round
						</p>
						<IconArrowRight size={24} className="fill-grantpicks-black-400" />
						<p className="text-grantpicks-black-950 text-base font-normal">
							{roundData?.name}
						</p>
					</div>
					{!storage.isPayoutDone && (
						<div
							className={clsx(
								`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
								`border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
							)}
						>
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
							<p className="uppercase">payout pending</p>
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-col md:flex-row items-center w-full justify-between my-12 md:my-16">
				{votingData?.flag && (
					<div className="w-full my-2">
						<div className="flex justify-between items-center">
							<div className="text-black text-4xl font-bold my-4">
								THIS PROJECT <br /> HAS BEEN FLAGGED
							</div>
							{storage.isAdminRound &&
								votingData?.flag &&
								!storage.isPayoutDone && (
									<div>
										<Button
											color="white"
											className="!border !border-black/10 !rounded-full !px-8 min-w-10"
											onClick={unflagProject}
										>
											Unflag Project
										</Button>
									</div>
								)}
						</div>

						<div className="w-1/2">
							This project is flagged. Their donations was removed when
							calculating payouts for this Round.
						</div>
					</div>
				)}
				{!votingData?.flag && (
					<div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
						<div className="flex items-center space-x-2 md:space-x-4">
							<div className="border border-black/10 p-2 rounded-full">
								<IconProject size={24} className="fill-grantpicks-black-400" />
							</div>
							<div>
								<p className="text-[25px] font-normal">
									{votingData ? votingData.votes : 0}
								</p>
								<p className="text-xs font-semibold text-grantpicks-black-600">
									VOTES OUT OF {totalVoting} MATCHES
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2 md:space-x-4">
							<div className="border border-black/10 p-2 rounded-full">
								<IconDollar size={24} className="fill-grantpicks-black-400" />
							</div>
							<div>
								<p className="text-[25px] font-normal">
									USD{' '}
									{storage.chainId === 'stellar'
										? (global.stellarPrice * allocation).toFixed(2)
										: (global.nearPrice * allocation).toFixed(2)}{' '}
									<span className="text-base font-normal text-gray-600">
										{allocation}{' '}
										{storage.chainId === 'stellar' ? 'XLM' : 'NEAR'}
									</span>{' '}
								</p>
								<p className="text-xs font-semibold text-grantpicks-black-600">
									ALLOCATED{' '}
								</p>
							</div>
						</div>
					</div>
				)}
				{storage.isAdminRound && !votingData?.flag && !storage.isPayoutDone && (
					<Button
						color="white"
						className="!border !border-black/10 !rounded-full !px-8 mt-5 md:mt-0"
						onClick={() => setShowFlagModal(true)}
					>
						Flag Project
					</Button>
				)}
			</div>
			<div className="flex items-center space-x-2 md:space-x-3">
				<Button
					color={pairFilter === 'all' ? `black` : `alpha-50`}
					className="!rounded-full !px-4"
					onClick={() => setPairFilter('all')}
				>
					All Matches
				</Button>
				<Button
					color={pairFilter === 'won' ? `black` : `alpha-50`}
					className="!rounded-full !px-4"
					onClick={() => setPairFilter('won')}
				>
					Matches Won
				</Button>
				<Button
					color={pairFilter === 'lost' ? `black` : `alpha-50`}
					className="!rounded-full !px-4"
					onClick={() => setPairFilter('lost')}
				>
					Matches Lost
				</Button>
			</div>

			<div className="my-4 md:my-6 flex items-center justify-between w-full">
				<div className="flex items-center space-x-2">
					<IconDot size={8} className="fill-black" />
					<p className="text-sm font-bold text-grantpicks-black-950">
						{votes.length}
						{` `}
						<span className="text-xs font-semibold text-grantpicks-black-600">
							MATCHES
						</span>
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
				{votes?.map((item, index) => {
					return <VoteItem key={index} index={index} data={item} />
				})}
			</div>

			<FlagProjectModal
				isOpen={showFlagModal}
				onClose={() => {
					global.openPageLoading()
					setShowFlagModal(false)
					fetchVotingResultRound()
					global.dismissPageLoading()
				}}
			/>
		</RoundResultLayout>
	)
}

export default RoundResultProjectDetailPage
