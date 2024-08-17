'use client'

import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import ChallengePayoutModal from '@/app/components/pages/round-result/ChallengePayoutModal'
import RoundResultLayout from '@/app/components/pages/round-result/RoundResultLayout'
import ViewChallengeDrawer from '@/app/components/pages/round-result/ViewChallengeDrawer'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconNear from '@/app/components/svgs/IconNear'
import IconProject from '@/app/components/svgs/IconProject'
import IconSearch from '@/app/components/svgs/IconSearch'
import IconStarBronze from '@/app/components/svgs/IconStarBronze'
import IconStarGold from '@/app/components/svgs/IconStarGold'
import IconStarSilver from '@/app/components/svgs/IconStarSilver'
import IconStellar from '@/app/components/svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import { LIMIT_SIZE } from '@/constants/query'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { getProject } from '@/services/on-chain/project-registry'
import {
	getChallengesPayoutRound,
	getRoundApplications,
	getRoundInfo,
	getVotingResultsRound,
} from '@/services/on-chain/round'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
	Network,
} from '@/types/on-chain'
import { formatStroopToXlm, parseToStroop } from '@/utils/helper'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { PayoutsChallenge, Project, ProjectVotingResult } from 'round-client'
import { useTimer } from 'react-timer-hook'
import TimerEnd from '@/app/components/commons/TimerEnd'
import IconEdit from '@/app/components/svgs/IconEdit'

const ResultItem = ({
	index,
	data,
	roundData,
	votingResultData,
}: {
	index: number
	data: ProjectVotingResult
	roundData?: IGetRoundsResponse
	votingResultData?: ProjectVotingResult[]
}) => {
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const router = useRouter()
	const { stellarPubKey } = useWallet()
	const fetchProjectDetail = async () => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		const projectDetail = await getProject(
			{ project_id: data.project_id },
			contracts,
		)
		setProjectData(projectDetail)
	}

	useEffect(() => {
		fetchProjectDetail()
	}, [])
	return (
		<div
			className="flex items-center w-full px-4 py-4 cursor-pointer bg-white hover:bg-black/10 transition rounded-2xl"
			onClick={() => {
				router.push(
					`/application/round-result/${roundData?.id.toString()}/project/${data.project_id.toString()}`,
				)
			}}
		>
			<div className="flex items-center w-[10%]">
				{index === 0 && <IconStarGold size={24} />}
				{index === 1 && <IconStarSilver size={24} />}
				{index === 2 && <IconStarBronze size={24} />}
			</div>
			<div className="flex items-center w-[60%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
					{projectData?.name}
				</p>
			</div>
			<div className="flex items-center w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-950 text-right mr-1">
					{(
						Number(formatStroopToXlm(roundData?.expected_amount || BigInt(0))) /
						(votingResultData?.length || 0)
					).toFixed(3)}
				</p>
				<IconStellar size={14} className="fill-grantpicks-black-600" />
			</div>
			<div className="flex items-center justify-end w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
					15%
				</p>
			</div>
			<div className="flex items-center justify-end w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
					{data.voting_count.toString()}
				</p>
			</div>
		</div>
	)
}

const RoundResultPage = () => {
	const { connectedWallet, stellarPubKey } = useWallet()
	const [showChallengeModal, setShowChallengeModal] = useState<boolean>(false)
	const [showViewChallengeDrawer, setShowViewChallengeDrawer] =
		useState<boolean>(false)
	const params = useParams<{ roundId: string }>()
	const [roundData, setRoundData] = useState<IGetRoundsResponse | undefined>(
		undefined,
	)
	const [challengesData, setChallengesData] = useState<PayoutsChallenge[]>([])
	const isFetchedChallengeRef = useRef<boolean>(false)
	const [roundAppData, setRoundAppData] = useState<
		IGetRoundApplicationsResponse[]
	>([])
	const [votingResultData, setVotingResultData] = useState<
		ProjectVotingResult[]
	>([])

	const fetchRoundInfo = async () => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		const resRoundInfo = await getRoundInfo(
			{ round_id: BigInt(params.roundId) },
			contracts,
		)
		setRoundData(resRoundInfo)
		return resRoundInfo
	}

	const fetchRoundApplications = async () => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		let skip: number = 0
		let resRoundApps: IGetRoundApplicationsResponse[] = []
		const stopLooping = setInterval(async () => {
			const _resRoundApps = await getRoundApplications(
				{ round_id: BigInt(params.roundId), skip, limit: LIMIT_SIZE },
				contracts,
			)
			resRoundApps = [...resRoundApps, ..._resRoundApps]
			if (resRoundApps.length < LIMIT_SIZE) {
				setRoundAppData(resRoundApps)
				clearInterval(stopLooping)
				return
			}
			skip += LIMIT_SIZE
		}, 300)
	}

	const fetchChallengePayouts = async () => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		let skip: number = 0
		let resChallenges: PayoutsChallenge[] = []
		const stopLooping = setInterval(async () => {
			const _resChallenges = await getChallengesPayoutRound(
				{
					round_id: BigInt(params.roundId),
					from_index: BigInt(skip),
					limit: BigInt(LIMIT_SIZE),
				},
				contracts,
			)
			console.log('debug res chall', _resChallenges)
			resChallenges = [...resChallenges, ..._resChallenges]
			if (_resChallenges.length < LIMIT_SIZE) {
				setChallengesData(resChallenges)
				clearInterval(stopLooping)
				isFetchedChallengeRef.current = true
				return
			}
			skip += LIMIT_SIZE
		}, 2000)
	}

	const fetchVotingResultRound = async () => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		const resVotingResultRound = await getVotingResultsRound(
			BigInt(params.roundId),
			contracts,
		)
		if (resVotingResultRound) {
			setVotingResultData(resVotingResultRound)
		}
	}

	const endOfChallenge =
		new Date(Number(roundData?.cooldown_end_ms?.toString()) || 0).getTime() +
		(roundData?.cooldown_period_ms
			? new Date(
					Number(roundData?.cooldown_period_ms?.toString()) || 0,
				).getTime()
			: 0)

	const endOfCompliance =
		new Date(Number(roundData?.compliance_end_ms?.toString()) || 0).getTime() +
		(roundData?.compliance_period_ms
			? new Date(
					Number(roundData?.compliance_period_ms?.toString()) || 0,
				).getTime()
			: 0)

	const showCooldownChallenge = endOfChallenge > new Date().getTime()

	const showCompliance = endOfCompliance > new Date().getTime()

	useEffect(() => {
		if (!roundData && stellarPubKey) {
			fetchRoundInfo()
			fetchRoundApplications()
			fetchVotingResultRound()
			if (!isFetchedChallengeRef.current) fetchChallengePayouts()
		}
	}, [stellarPubKey])

	return (
		<RoundResultLayout>
			<div className="bg-white flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-0 md:my-8 lg:my-4 rounded-xl">
				<div className="flex items-center space-x-2">
					<IconArrowLeft size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-semibold">Round Results</p>
				</div>
				<div
					className={clsx(
						`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
						`border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
					)}
				>
					<IconDollar size={18} className="fill-grantpicks-amber-400" />
					<p className="uppercase">payout pending</p>
				</div>
			</div>

			<div className="w-full flex flex-col items-center justify-center mb-4 md:mb-6 lg:mb-8">
				<div className="bg-grantpicks-black-100 p-3 md:p-5 rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6">
					{connectedWallet === 'near' ? (
						<IconNear size={24} className="fill-grantpicks-black-950" />
					) : (
						<IconStellar size={24} className="fill-grantpicks-black-950" />
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
							{roundAppData.length}
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							ROUNDS PARTICIPATED
						</p>
					</div>
				</div>
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconStellar size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							{connectedWallet === 'stellar'
								? `${formatStroopToXlm(roundData?.expected_amount || BigInt(0))} XLM`
								: ''}
							{` `}
							<span className="text-xs md:text-base font-normal text-grantpicks-black-600">
								~ USD
							</span>
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							EXTECTED FUNDS{' '}
						</p>
					</div>
				</div>
				<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
					<div className="border border-black/10 p-2 rounded-full">
						<IconStellar size={24} className="fill-grantpicks-black-400" />
					</div>
					<div>
						<p className="text-[25px] font-normal text-grantpicks-black-950">
							{connectedWallet === 'stellar'
								? `${formatStroopToXlm(roundData?.vault_total_deposits || BigInt(0))} XLM`
								: ''}
						</p>
						<p className="text-xs font-semibold text-grantpicks-black-600">
							AVAILABLE FUNDS{' '}
						</p>
					</div>
				</div>
			</div>

			{showCooldownChallenge && (
				<div className="p-3 md:p-5 rounded-2xl bg-grantpicks-purple-100 w-full my-4 md:my-8">
					<p className="text-grantpicks-purple-800 text-base font-semibold pb-4 border-b border-grantpicks-purple-200">
						{challengesData.length} Payout Challenges. {` `}{' '}
						<span className="text-base font-normal">
							There will be no payout until all Challenges are resolved.
						</span>{' '}
					</p>
					<div className="flex items-center justify-between pt-4">
						<p className="text-grantpicks-purple-800 text-[25px] font-semibold">
							<TimerEnd expiryTime={endOfChallenge} />
							{` `}
							<span className="text-sm font-normal">Left till payout</span>{' '}
						</p>
						<div className="flex items-center space-x-4">
							<div className="relative">
								<Button
									color="transparent"
									className="!border !border-grantpicks-black-400"
									onClick={() => setShowViewChallengeDrawer(true)}
								>
									View Challenge
								</Button>
								<div className="absolute -top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-grantpicks-purple-800 text-white">
									{challengesData.length}
								</div>
							</div>
							<Button
								color="transparent"
								className="!border !border-grantpicks-black-400"
								onClick={() => setShowChallengeModal(true)}
							>
								Challenge Payout
							</Button>
						</div>
					</div>
				</div>
			)}

			{showCompliance && (
				<div className="p-3 md:p-5 rounded-2xl bg-grantpicks-amber-50 w-full my-4 md:my-8">
					<p className="text-grantpicks-amber-800 text-[25px] font-semibold pb-4 border-b border-grantpicks-amber-200">
						<TimerEnd expiryTime={endOfCompliance} />
						{` `}
						<span className="text-sm font-normal">
							Left to Complete KYC
						</span>{' '}
					</p>
					<p className="text-grantpicks-black-950 text-base font-normal pt-4">
						All Projects participating in this Round must complete KYC via
						{` `}
						<span className="font-bold">www.examplekyc.org</span>{' '}
					</p>
				</div>
			)}

			<div className="w-full bg-grantpicks-black-50 rounded-2xl p-4">
				<div className="py-3 px-4">
					<InputText
						placeholder="Search project"
						className="!border-none !w-full !outline-none placeholder-grantpicks-black-600 !bg-grantpicks-black-50"
						suffixIcon={
							<IconSearch size={18} className="fill-grantpicks-black-400" />
						}
					/>
				</div>
				<div className="py-3 px-4 flex items-center w-full">
					<div className="flex items-center w-[10%]">
						<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
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
					{votingResultData.map((voted, index) => (
						<ResultItem
							key={index}
							index={index}
							data={voted}
							roundData={roundData}
							votingResultData={votingResultData}
						/>
					))}
				</div>
				<div className="pt-4 flex items-center w-full justify-between">
					<div className="flex items-center space-x-2">
						<IconEdit size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-semibold text-grantpicks-black-950">
							Set New Payout
						</p>
					</div>
					<Button
						isDisabled
						color="black"
						className="!rounded-full !px-4"
						onClick={() => {}}
					>
						<div className="flex items-center space-x-2">
							<IconDollar size={18} className="fill-white" />
							<p className="text-sm font-semibold text-white">Process Payout</p>
						</div>
					</Button>
				</div>
			</div>
			<ChallengePayoutModal
				isOpen={showChallengeModal}
				onClose={() => setShowChallengeModal(false)}
				roundData={roundData}
			/>
			<ViewChallengeDrawer
				isOpen={showViewChallengeDrawer}
				challengesData={challengesData}
				onClose={() => setShowViewChallengeDrawer(false)}
				endOfChallenge={endOfChallenge}
			/>
		</RoundResultLayout>
	)
}

export default RoundResultPage
