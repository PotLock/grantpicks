'use client'

import Button from '@/app/components/commons/Button'
import ChallengePayoutModal from '@/app/components/pages/round-result/ChallengePayoutModal'
import RoundResultLayout from '@/app/components/pages/round-result/RoundResultLayout'
import ViewChallengeDrawer from '@/app/components/pages/round-result/ViewChallengeDrawer'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconNear from '@/app/components/svgs/IconNear'
import IconProject from '@/app/components/svgs/IconProject'
import IconStellar from '@/app/components/svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import { formatStroopToXlm } from '@/utils/helper'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import TimerEnd from '@/app/components/commons/TimerEnd'
import IconEdit from '@/app/components/svgs/IconEdit'
import useAppStorage from '@/stores/zustand/useAppStorage'
import ResultItem from '@/app/components/commons/ResultItem'
import { Payout, PayoutsChallenge, ProjectVotingResult } from 'round-client'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import EditPayoutModal from '@/app/components/pages/round-result/EditPayoutModal'
import toast from 'react-hot-toast'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import {
	projectToGPProject,
	roundDetailToGPRound,
} from '@/services/stellar/type'
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format'
import {
	NearPayout,
	nearProjectToGPProject,
	NearProjectVotingResult,
	nearRoundToGPRound,
} from '@/services/near/type'
import { GPVotingResult } from '@/models/voting'
import { GPPayout } from '@/models/payout'
import { LIMIT_SIZE_CONTRACT } from '@/constants/query'

const RoundResultPage = () => {
	const { connectedWallet, stellarPubKey, stellarKit } = useWallet()
	const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false)
	const global = useGlobalContext()
	const [showViewChallengeDrawer, setShowViewChallengeDrawer] =
		useState<boolean>(false)
	const [showEditPayoutModal, setShowEditPayoutModal] = useState<boolean>(false)
	const params = useParams<{ roundId: string }>()
	const storage = useAppStorage()
	const router = useRouter()

	const fetchRoundInfo = async () => {
		if (params.roundId) {
			const roundId = BigInt(params.roundId)
			const isExsist = storage.roundes.has(roundId.toString())
			let isOwner = false
			let isAdmin = false
			if (storage.chainId === 'stellar') {
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
					storage.setRound(roundDetailToGPRound(roundInfo))
					storage.roundes.set(
						roundId.toString(),
						roundDetailToGPRound(roundInfo),
					)
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

					let fetch = true
					let newPayouts: GPPayout[] = []

					while (fetch) {
						const payouts = (
							await contracts.round_contract.get_payouts_for_round({
								round_id: roundId,
								from_index: BigInt(newPayouts.length),
								limit: BigInt(5),
							})
						).result

						payouts.forEach((p: Payout) => {
							newPayouts.push({
								recipient: p.recipient_id,
								amount: p.amount.toString(),
							})
						})

						if (payouts.length < 5) {
							fetch = false
						}

						storage.setCurrentRoundPayouts(newPayouts)
					}
				}
			} else {
				const contracts = storage.getNearContracts(null)
				if (!contracts) {
					return
				}

				const roundInfo = await contracts.round.getRoundById(
					parseInt(params.roundId),
				)

				if (roundInfo) {
					storage.setRound(nearRoundToGPRound(roundInfo))
					storage.roundes.set(roundId.toString(), nearRoundToGPRound(roundInfo))
					isOwner = roundInfo.owner === storage.my_address
					isAdmin = roundInfo.admins.includes(storage.my_address || '')

					const isAdminOrOwner = isAdmin || isOwner

					storage.setIsAdminRound(isAdminOrOwner)

					const isPayoutDone = false

					storage.setPayoutDone(isPayoutDone)

					let fetch = true
					let newPayouts: GPPayout[] = []

					while (fetch) {
						const payouts = await contracts.round.getPayouts(
							Number(roundId.toString()),
							newPayouts.length,
							LIMIT_SIZE_CONTRACT,
						)

						payouts.forEach((p: NearPayout) => {
							newPayouts.push({
								recipient: p.recipient_id,
								amount: p.amount,
							})
						})

						if (payouts.length < LIMIT_SIZE_CONTRACT) {
							fetch = false
						}

						storage.setCurrentRoundPayouts(newPayouts)
					}
				}
			}
		}
	}

	const fetchPayoutChallenge = async () => {
		if (params.roundId) {
			const roundId = BigInt(params.roundId)

			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				let challenges: PayoutsChallenge[] = []
				let fetch = true

				while (fetch) {
					const payoutChallenges = (
						await contracts.round_contract.get_challenges_payout({
							round_id: roundId,
							from_index: BigInt(challenges.length),
							limit: BigInt(5),
						})
					).result

					challenges = challenges.concat(payoutChallenges)

					if (payoutChallenges.length < 5) {
						fetch = false
					}
				}

				if (challenges.length > 0) {
					storage.setCurrentRoundPayoutChallenges(challenges)
				}
			}
		}
	}

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
					const gpVotingResults: GPVotingResult[] = votingResults.map(
						(v: ProjectVotingResult) =>
							({
								project: v.project_id.toString(),
								votes: Number(v.voting_count.toString()),
								flag: v.is_flagged,
							}) as GPVotingResult,
					)

					storage.setCurrentResults(gpVotingResults)
					const projectInfoAll = storage.projects
					for (const votingResult of gpVotingResults) {
						const project = storage.projects.get(
							votingResult.project.toString(),
						)
						if (!project) {
							const projectInfo = (
								await contracts.project_contract.get_project_by_id({
									project_id: BigInt(votingResult.project),
								})
							).result

							if (projectInfo) {
								projectInfoAll.set(
									votingResult.project.toString(),
									projectToGPProject(projectInfo),
								)

								storage.setProjects(projectInfoAll)
							}
						}
					}
				}
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const votingResults = await contracts.round.getVotingResults(
					Number(params.roundId),
				)

				if (votingResults) {
					const gpVotingResults: GPVotingResult[] = votingResults.map(
						(v: NearProjectVotingResult) =>
							({
								project: v.project,
								votes: v.voting_count,
								flag: false,
							}) as GPVotingResult,
					)

					storage.setCurrentResults(gpVotingResults)
					const projectInfoAll = storage.projects

					for (const votingResult of gpVotingResults) {
						const data = await contracts.near_social.getProjectData(
							votingResult.project,
						)

						const json =
							data[`${votingResult.project}`]['profile']['gp_project'] || '{}'
						const project = JSON.parse(json)

						if (project.fundings) {
							project.funding_histories = project.fundings
						}

						projectInfoAll.set(
							votingResult.project.toString(),
							nearProjectToGPProject(project),
						)

						storage.setProjects(projectInfoAll)
					}
				}
			}
		}
	}

	const processPayout = async () => {
		global.openPageLoading()

		try {
			if (storage.chainId === 'stellar') {
				const contract = storage.getStellarContracts()
				if (!contract) return
				const payoutTx = await contract.round_contract.process_payouts({
					round_id: BigInt(storage.current_round?.id || 0),
					caller: storage.my_address || '',
				})

				const txHash = await contract.signAndSendTx(
					stellarKit as StellarWalletsKit,
					payoutTx.toXDR(),
					storage.my_address || stellarPubKey,
				)

				if (!txHash) {
					toast.error('Error processing payout')
					return
				} else {
					toast.success('Payout processed successfully')
					await fetchRoundInfo()
					global.dismissPageLoading()
				}
			}
		} catch (e) {
			console.error(e)
			toast.error('Error processing payout')
			global.dismissPageLoading()
		}
	}

	const setRoundCompleted = async () => {
		global.openPageLoading()

		try {
			if (storage.chainId === 'stellar') {
				const contract = storage.getStellarContracts()
				if (!contract) return
				const txRoundCompleted =
					await contract.round_contract.set_round_complete({
						round_id: BigInt(storage.current_round?.id || 0),
						caller: storage.my_address || '',
					})
				txRoundCompleted.simulate()
				const txHash = await contract.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txRoundCompleted.toXDR(),
					storage.my_address || stellarPubKey,
				)

				if (!txHash) {
					toast.error('Error Set Round Completed')
					return
				} else {
					toast.success('Round Completed successfully')
					await fetchRoundInfo()
					global.dismissPageLoading()
				}
			}
		} catch (e) {
			console.error(e)
			toast.error('Error Set Round Completed')
			global.dismissPageLoading()
		}
	}

	const distributedRemainingFund = async () => {
		if (!storage.current_round?.allow_remaining_dist) {
			toast.error('Remaining Fund Distribution is disabled in this round')
			return
		}

		if (storage.current_round?.current_vault_balance === '0') {
			toast.error('No Remaining Fund to distribute')
			return
		}

		global.openPageLoading()

		try {
			if (storage.chainId === 'stellar') {
				const contract = storage.getStellarContracts()
				if (!contract) return

				const distributeRemainingTx =
					await contract.round_contract.redistribute_vault({
						round_id: BigInt(storage.current_round?.id || 0),
						caller: storage.my_address || stellarPubKey,
						memo: 'Distribute Remaining Fund',
					})

				const txHash = await contract.signAndSendTx(
					stellarKit as StellarWalletsKit,
					distributeRemainingTx.toXDR(),
					storage.my_address || stellarPubKey,
				)

				if (!txHash) {
					toast.error('Error Distribute Remaining Fund')
					return
				} else {
					toast.success('Remaining Fund Distributed successfully')
					await fetchRoundInfo()
					global.dismissPageLoading()
				}
			}
		} catch (e) {
			console.error(e)
			toast.error('Error Distribute Remaining Fund')
			global.dismissPageLoading()
		}
	}

	const initPage = async () => {
		if (params.roundId) {
			global.openPageLoading()
			await Promise.all([
				fetchRoundInfo(),
				fetchVotingResultRound(),
				fetchPayoutChallenge(),
			])
			global.dismissPageLoading()
		}
	}

	const roundData = storage.current_round
	let showCompliance = false
	let showCooldownChallenge = false
	let endOfChallenge = new Date()
	let endOfCompliance = new Date()

	if (roundData?.cooldown_end) {
		endOfChallenge = new Date(Number(roundData?.cooldown_end?.toString()) || 0)
		showCooldownChallenge =
			endOfChallenge.getTime() > new Date().getTime() &&
			!roundData?.round_complete
	}

	if (roundData?.compliance_end) {
		endOfCompliance = new Date(roundData?.compliance_end?.toString() || 0)

		showCompliance =
			endOfCompliance.getTime() > new Date().getTime() &&
			!roundData?.round_complete
	}

	const canRedistribute =
		storage.current_round &&
		storage.isPayoutDone &&
		Number(storage.current_round?.current_vault_balance) > 0 &&
		storage.current_round?.allow_remaining_dist

	useEffect(() => {
		initPage()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.my_address, params.roundId])

	return (
		<RoundResultLayout>
			<div className="bg-white flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-0 md:my-8 lg:my-4 rounded-xl">
				<div
					className="flex items-center space-x-2"
					onClick={() => {
						router.push('/application')
					}}
				>
					<IconArrowLeft size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-semibold">Round Results</p>
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

			<div className="w-full flex flex-col items-center justify-center mb-4 md:mb-6 lg:mb-8">
				<div className="bg-grantpicks-black-100 p-3 md:p-5 rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6">
					{storage.chainId === 'stellar' ? (
						<IconStellar size={24} className="fill-grantpicks-black-950" />
					) : (
						<IconNear size={24} className="fill-grantpicks-black-950" />
					)}
				</div>
				<p className="text-[40px] font-black">{roundData?.name}</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconProject size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							{storage.current_results.length}
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							PROJECTS
						</p>
					</div>
				</div>
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						{storage.chainId === 'stellar' ? (
							<IconStellar size={24} className="fill-grantpicks-black-400" />
						) : (
							<IconNear size={24} className="fill-grantpicks-black-400" />
						)}
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							{storage.chainId === 'stellar'
								? formatStroopToXlm(BigInt(roundData?.expected_amount || 0))
								: roundData?.expected_amount}{' '}
							{storage.chainId === 'stellar' ? 'XLM' : 'NEAR'}{' '}
							<span className="text-xs md:text-base font-normal text-grantpicks-black-600">
								{storage.chainId === 'stellar'
									? (
											Number(
												formatStroopToXlm(
													BigInt(roundData?.expected_amount || 0),
												),
											) * global.stellarPrice
										).toFixed(2)
									: Number(roundData?.expected_amount) * global.nearPrice}{' '}
								USD
							</span>
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							EXPECTED FUNDS{' '}
						</p>
					</div>
				</div>
				{(roundData?.use_vault || storage.chainId === 'near') && (
					<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
						<div className="border border-black/10 p-2 rounded-full">
							{storage.chainId === 'stellar' ? (
								<IconStellar size={24} className="fill-grantpicks-black-400" />
							) : (
								<IconNear size={24} className="fill-grantpicks-black-400" />
							)}
						</div>
						<div>
							<p className="text-[25px] font-normal text-grantpicks-black-950">
								{storage.chainId === 'stellar'
									? formatStroopToXlm(
											BigInt(roundData?.vault_total_deposits || 0),
										)
									: formatNearAmount(
											roundData?.vault_total_deposits || '0',
										)}{' '}
								{storage.chainId === 'stellar' ? 'XLM' : 'NEAR'}{' '}
								<span className="text-xs md:text-base font-normal text-grantpicks-black-600">
									{storage.chainId === 'stellar'
										? (
												Number(
													formatStroopToXlm(
														BigInt(roundData?.vault_total_deposits || 0),
													),
												) * global.stellarPrice
											).toFixed(2)
										: Number(
												formatNearAmount(
													roundData?.vault_total_deposits || '0',
												).replace(',', ''),
											) * global.nearPrice}{' '}
									USD
								</span>
							</p>
							<p className="text-xs font-semibold text-grantpicks-black-600">
								AVAILABLE FUNDS{' '}
							</p>
						</div>
					</div>
				)}
			</div>

			{showCooldownChallenge && !storage.isPayoutDone && (
				<div className="p-3 md:p-5 rounded-2xl bg-grantpicks-purple-100 w-full my-4 md:my-8 flex flex-col">
					<div className="text-grantpicks-purple-800 text-base font-semibold pb-4 border-b border-grantpicks-purple-200">
						{storage.current_round_payout_challenges.length} Payout Challenges.{' '}
						{` `}{' '}
						<span className="text-base font-normal">
							There will be no payout until all Challenges are resolved.
						</span>{' '}
					</div>
					<div className="md:flex">
						<div className="text-grantpicks-purple-800 text-[25px] font-semibold w-full md:w-3/4 float-left">
							<TimerEnd expiryTime={endOfChallenge.getTime()} running />
							{` `}
							<span className="text-sm font-normal">Left till payout</span>{' '}
						</div>
						<div className="w-full md:w-1/4 lg:w-1/4 float-left">
							<div className="relative w-full md:w-1/2 float-left mt-2">
								<Button
									color="transparent"
									className="!border !border-grantpicks-black-400 w-full"
									onClick={() => setShowViewChallengeDrawer(true)}
								>
									{storage.current_round_payout_challenges.length > 0
										? 'View Challenge'
										: 'View Challenges'}
								</Button>
								<div className="absolute -top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-grantpicks-purple-800 text-white">
									{storage.current_round_payout_challenges.length}
								</div>
							</div>
							<Button
								color="transparent"
								className="!border !border-grantpicks-black-400  w-full md:w-1/2 float-left mt-2"
								onClick={() => setShowChallengeModal(true)}
							>
								Challenge Payout
							</Button>
						</div>
					</div>
				</div>
			)}

			{showCompliance && !storage.isPayoutDone && (
				<div className="p-3 md:p-5 rounded-2xl bg-grantpicks-amber-50 w-full my-4 md:my-8">
					<p className="text-grantpicks-amber-800 text-[25px] font-semibold pb-4 border-b border-grantpicks-amber-200">
						<TimerEnd expiryTime={endOfCompliance.getTime()} running />
						<span className="text-sm font-normal">
							Left to Complete KYC
						</span>{' '}
					</p>
					<p className="text-grantpicks-black-950 text-base font-normal pt-4">
						{roundData?.compliance_req_desc}
					</p>
				</div>
			)}

			<div className="w-full bg-grantpicks-black-50 rounded-2xl p-4">
				{/* 
        <!-- Search project NEED API & INDEXER-->
        <div className="py-3 px-4">
					<InputText
						placeholder="Search project"
						className="!border-none !w-full !outline-none placeholder-grantpicks-black-600 !bg-grantpicks-black-50"
						suffixIcon={
							<IconSearch size={18} className="fill-grantpicks-black-400" />
						}
					/>
				</div> */}
				<div className="py-3 px-4 flex items-center w-full">
					<div className="flex items-center w-[10%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center">
							Rank
						</p>
					</div>
					<div className="flex items-center w-[60%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
							Projects
						</p>
					</div>
					<div className="flex items-center w-[12%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
							Amount Allocated
						</p>
					</div>
					<div className="flex items-center justify-end w-[12%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
							Score
						</p>
					</div>
					<div className="flex items-center justify-end w-[12%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
							Votes
						</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl flex flex-col divide-y divide-black/10">
					{storage.current_results.map((voted, index) => (
						<ResultItem key={index} index={index} data={voted} />
					))}
				</div>
				{storage.isAdminRound && (
					<div className="pt-4 flex items-center w-full justify-between">
						{!storage.isPayoutDone && (
							<div
								className="flex items-center space-x-2 cursor-pointer"
								onClick={() => {
									let pairWiseCoin = 0

									if (storage.chainId === 'stellar') {
										pairWiseCoin = Number(
											formatStroopToXlm(
												BigInt(roundData?.current_vault_balance || 0),
											),
										)
									}

									if (storage.chainId === 'stellar') {
										const bannedAllocation =
											storage.getBannedProjectAllocations() * pairWiseCoin
										storage.setCurrentRemaining(bannedAllocation)
									} else {
										storage.setCurrentRemaining(0)
									}
									storage.setCurrentManagerWeight(0)
									storage.setCurrentPairwiseWeight(100)
									storage.setCurrentPayoutInputs(new Map())
									setShowEditPayoutModal(true)
								}}
							>
								<IconEdit size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									{storage.current_round_payouts.length > 0
										? 'Edit Payout'
										: 'Set New Payout'}
								</p>
							</div>
						)}

						{!storage.isPayoutDone && (
							<Button
								color="black"
								className="!rounded-full !px-4"
								onClick={() => {
									if (storage.current_round_payouts.length === 0) {
										toast.error('Please set payout first')
										return
									} else {
										processPayout()
									}
								}}
							>
								<div className="flex items-center space-x-2">
									<IconDollar size={18} className="fill-white" />
									<p className="text-sm font-semibold text-white">
										Process Payout
									</p>
								</div>
							</Button>
						)}

						{storage.isPayoutDone && !roundData?.round_complete && (
							<>
								{canRedistribute && (
									<Button
										color="white"
										className="!rounded-full !px-4"
										onClick={distributedRemainingFund}
									>
										<div className="flex items-center space-x-2">
											<p className="text-sm font-semibold text-black">
												Distribute Remaining Fund
											</p>
										</div>
									</Button>
								)}

								{!canRedistribute && <div className="flex w-10"></div>}

								<Button
									color="black"
									className="!rounded-full !px-4"
									onClick={setRoundCompleted}
								>
									<div className="flex items-center space-x-2">
										<p className="text-sm font-semibold text-white">
											Set Round Completed
										</p>
									</div>
								</Button>
							</>
						)}
					</div>
				)}
			</div>
			{roundData && (
				<ChallengePayoutModal
					isOpen={showChallengeModal}
					onClose={async () => {
						setShowChallengeModal(false)
						global.openPageLoading()
						await fetchPayoutChallenge()
						global.dismissPageLoading()
					}}
					roundData={roundData}
				/>
			)}

			<ViewChallengeDrawer
				isOpen={showViewChallengeDrawer}
				onClose={() => setShowViewChallengeDrawer(false)}
				endOfChallenge={endOfChallenge.getTime()}
			/>

			<EditPayoutModal
				isOpen={showEditPayoutModal}
				onClose={async () => {
					setShowEditPayoutModal(false)
					global.openPageLoading()
					await Promise.all([fetchRoundInfo(), fetchPayoutChallenge()])
					global.dismissPageLoading()
				}}
			/>
		</RoundResultLayout>
	)
}

export default RoundResultPage
