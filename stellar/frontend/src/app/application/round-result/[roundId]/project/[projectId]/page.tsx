'use client'

import Button from '@/app/components/commons/Button'
import FlagProjectModal from '@/app/components/pages/round-result/FlagProjectModal'
import RoundResultLayout from '@/app/components/pages/round-result/RoundResultLayout'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconArrowRight from '@/app/components/svgs/IconArrowRight'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconProject from '@/app/components/svgs/IconProject'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const RoundResultProjectDetailPage = () => {
	const router = useRouter()
	// const [pairFilter, setPairFilter] = useState<'all' | 'won' | 'lost'>('all')
	const global = useGlobalContext()
	const params = useParams<{ roundId: string; projectId: string }>()
	const { stellarPubKey, stellarKit } = useWallet()
	const [showFlagModal, setShowFlagModal] = useState(false)
	const storage = useAppStorage()

	const fetchVotingResultRound = async () => {
		if (params.roundId) {
			const roundId = BigInt(params.roundId)

			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const votingResults = (
					await contracts.round_contract.get_voting_results_for_round({
						round_id: roundId,
					})
				).result

				if (votingResults) {
					storage.setCurrentResults(votingResults)
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
									projectInfo,
								)

								if (params.projectId === votingResult.project_id.toString()) {
									storage.setCurrentProject(projectInfo)
								}

								storage.setProjects(projectInfoAll)
							}
						}
					})
				}
			}
		}
	}

	const fetchRoundInfo = async () => {
		if (params.roundId) {
			const roundId = BigInt(params.roundId)
			const isExsist = storage.roundes.has(roundId.toString())
			let isOwner = false
			let isAdmin = false
			if (!isExsist && storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const roundInfo = (
					await contracts.round_contract.get_round({ round_id: roundId })
				).result

				const admins = (
					await contracts.round_contract.admins({
						round_id: roundId,
					})
				).result

				if (roundInfo) {
					storage.setRound(roundInfo)
					storage.roundes.set(roundId.toString(), roundInfo)
					isOwner = roundInfo.owner === stellarPubKey
					isAdmin = admins.includes(stellarPubKey)

					const isAdminOrOwner = isAdmin || isOwner

					storage.setIsAdminRound(isAdminOrOwner)

					const isPayoutDone = (
						await contracts.round_contract.is_payout_done({
							round_id: roundId,
						})
					).result

					storage.setPayoutDone(isPayoutDone)
				}
			}
		}
	}

	const unflagProject = async () => {
		try {
			const contract = storage.getStellarContracts()
			if (!contract) return

			const unflagTx = await contract.round_contract.unflag_project({
				round_id: storage.current_round?.id || BigInt(0),
				project_id: storage.current_project?.id || BigInt(0),
				caller: stellarPubKey,
			})

			const txHash = await contract.signAndSendTx(
				stellarKit as StellarWalletsKit,
				unflagTx,
				stellarPubKey,
			)

			if (!txHash) {
				toast.error('Failed to unflag project')
			} else {
				fetchVotingResultRound()
			}
		} catch (e) {
			console.error(e)
			toast.error('Failed to unflag project')
		}
	}

	const roundData = storage.current_round
	const projectData = storage.projects.get(params.projectId)
	let totalVoting = 0

	for (const votingResult of storage.current_results) {
		totalVoting += Number(votingResult.voting_count.toString())
	}

	const votingData = storage.current_results.find(
		(result) => result.project_id.toString() === params.projectId,
	)

	const allocation = storage.getAllocation(params.projectId)

	useEffect(() => {
		if (params && stellarPubKey) {
			fetchVotingResultRound()
			fetchRoundInfo()
		}
	}, [params, stellarPubKey])

	return (
		<RoundResultLayout>
			<div className="bg-grantpicks-black-50 flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-6 mt-3 md:mt-4 rounded-xl">
				<div className="flex items-center space-x-2">
					<IconArrowLeft
						size={24}
						className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70"
						onClick={() => router.back()}
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
				{votingData?.is_flagged && (
					<div className="w-full my-2">
						<div className="text-black text-4xl w-full font-bold my-4">
							THIS PROJECT <br /> HAS BEEN FLAGGED
						</div>
						<div className="flex">
							<div className="w-1/2">
								This project is flagged. Their donations was removed when
								calculating payouts for this Round.
							</div>
							{storage.isAdminRound &&
								votingData?.is_flagged &&
								!storage.isPayoutDone && (
									<div>
										<Button
											color="white"
											className="!border !border-black/10 !rounded-full !px-8"
											onClick={unflagProject}
										>
											Unflag Project
										</Button>
									</div>
								)}
						</div>
					</div>
				)}
				{!votingData?.is_flagged && (
					<div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
						<div className="flex items-center space-x-2 md:space-x-4">
							<div className="border border-black/10 p-2 rounded-full">
								<IconProject size={24} className="fill-grantpicks-black-400" />
							</div>
							<div>
								<p className="text-[25px] font-normal">
									{votingData?.voting_count.toString()}
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
									USD {(global.stellarPrice * allocation).toFixed(2)}
									<span className="text-base font-normal text-gray-600">
										{allocation} XLM
									</span>{' '}
								</p>
								<p className="text-xs font-semibold text-grantpicks-black-600">
									ALLOCATED{' '}
								</p>
							</div>
						</div>
					</div>
				)}
				{storage.isAdminRound &&
					!votingData?.is_flagged &&
					!storage.isPayoutDone && (
						<Button
							color="white"
							className="!border !border-black/10 !rounded-full !px-8 mt-5 md:mt-0"
							onClick={() => setShowFlagModal(true)}
						>
							Flag Project
						</Button>
					)}
			</div>
			{/* 
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
						900{` `}{' '}
						<span className="text-xs font-semibold text-grantpicks-black-600">
							MATCHES
						</span>
					</p>
				</div>
				<div className="w-[50%]">
					<InputText
						placeholder="Search account"
						preffixIcon={
							<IconSearch className="fill-grantpicks-black-400" size={18} />
						}
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6"></div> */}

			<FlagProjectModal
				isOpen={showFlagModal}
				onClose={() => {
					setShowFlagModal(false)
					fetchVotingResultRound()
				}}
			/>
		</RoundResultLayout>
	)
}

export default RoundResultProjectDetailPage
