import React, { useEffect, useState } from 'react'
import IconCheckCircle from '../../svgs/IconCheckCircle'
import IconCube from '../../svgs/IconCube'
import IconClock from '../../svgs/IconClock'
import { useWallet } from '@/app/providers/WalletProvider'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import clsx from 'clsx'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { getResultVoteRound, getRoundInfo } from '@/services/stellar/round'
import { useParams } from 'next/navigation'
import { Pair, VotingResult } from 'round-client'
import moment from 'moment'
import {
	getProject,
	GetProjectParams,
} from '@/services/stellar/project-registry'
import { prettyTruncate } from '@/utils/helper'
import { Project } from 'project-registry-client'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NearPair } from '@/services/near/type'

const IsVotedPairItem = ({
	index,
	pair,
	votingResult,
}: {
	index: number
	pair: Pair | NearPair
	votingResult?: VotingResult
}) => {
	const { connectedWallet, stellarPubKey, stellarKit } = useWallet()
	const [firstProjectData, setFirstProjectData] = useState<Project | undefined>(
		undefined,
	)
	const [secondProjectData, setSecondProjectData] = useState<
		Project | undefined
	>(undefined)
	const storage = useAppStorage()

	const fetchProjectById = async () => {
		try {
			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const get1stProjectParams: GetProjectParams = {
					project_id: pair.projects[0] as bigint,
				}
				const get2ndProjectParams: GetProjectParams = {
					project_id: pair.projects[1] as bigint,
				}
				const [firstRes, secondRes] = await Promise.all([
					getProject(get1stProjectParams, contracts),
					getProject(get2ndProjectParams, contracts),
				])

				setFirstProjectData(firstRes)
				setSecondProjectData(secondRes)
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const [firstRes, secondRes] = await Promise.all([
					contracts.near_social.getProjectData(pair.projects[0] as string),
					contracts.near_social.getProjectData(pair.projects[1] as string),
				])

				const project1JSON =
					firstRes[`${storage.my_address || ''}`]['profile']['gp_project'] ||
					'{}'
				const project2JSON =
					secondRes[`${storage.my_address || ''}`]['profile']['gp_project'] ||
					'{}'
				const firstProject = JSON.parse(project1JSON)
				const secondProject = JSON.parse(project2JSON)

				setFirstProjectData(firstProject)
				setSecondProjectData(secondProject)
			}
		} catch (error: any) {
			console.log('error project by id', error)
		}
	}

	const selectedPair = votingResult?.picks?.filter(
		(pick) => pick.pair_id === pair.pair_id,
	)[0]

	useEffect(() => {
		fetchProjectById()
	}, [])

	return (
		<div key={index} className="p-4 md:p-6 rounded-2xl bg-grantpicks-black-50">
			<div className="relative justify-center flex items-center gap-x-4 md:gap-x-6 mb-4 md:mb-6">
				<div
					className={clsx(
						`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
						pair.projects.map((p) => p.toString())[0] ===
							(selectedPair?.project_id.toString() as string)
							? `border-2 border-grantpicks-purple-500`
							: `border-2 border-grantpicks-black-300`,
					)}
				></div>
				<div
					className={clsx(
						`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
						pair.projects.map((p) => p.toString())[1] ===
							(selectedPair?.project_id.toString() as string)
							? `border-2 border-grantpicks-purple-500`
							: `border-2 border-grantpicks-black-300`,
					)}
				></div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="rounded-full w-16 h-16 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center">
						<p className="text-[32px] font-black text-white">VS</p>
					</div>
				</div>
			</div>
			<div className="relative justify-center flex items-center gap-x-4 md:gap-x-6 mb-4 md:mb-6">
				<p className="text-grantpicks-black-950 font-semibold text-base">
					{prettyTruncate(firstProjectData?.name, 20)}
				</p>
				<p className="text-grantpicks-black-950 font-semibold text-base">
					{prettyTruncate(secondProjectData?.name, 20)}
				</p>
			</div>
			<div className="flex items-center justify-center space-x-2">
				<IconCheckCircle size={18} className="fill-grantpicks-purple-500" />
				<p className="text-xs font-semibold text-grantpicks-black-950">Voted</p>
			</div>
		</div>
	)
}

const IsVotedSection = ({
	hasVoted,
	pairsData,
}: {
	hasVoted: boolean
	pairsData: Pair[] | NearPair[]
}) => {
	const params = useParams<{ roundId: string }>()
	const { connectedWallet, stellarPubKey, stellarKit } = useWallet()
	const [votingResult, setVotingResult] = useState<VotingResult | undefined>(
		undefined,
	)
	const [roundData, setRoundData] = useState<IGetRoundsResponse | undefined>(
		undefined,
	)
	const storage = useAppStorage()

	const fetchRoundData = async () => {
		try {
			if (!stellarPubKey) return
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const roundRes = await getRoundInfo(
				{ round_id: BigInt(params.roundId) },
				contracts,
			)
			if (roundRes) {
				setRoundData(roundRes)
			}
		} catch (error: any) {
			console.log('error fetch pairs', error)
		}
	}

	const fetchResultRound = async () => {
		try {
			if (!stellarPubKey) return

			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const votingResultRes = await getResultVoteRound(
				{ round_id: BigInt(params.roundId), voter: stellarPubKey },
				contracts,
			)
			if (votingResultRes) {
				setVotingResult(votingResultRes)
			}
		} catch (error: any) {
			console.log('error fetch pairs', error)
		}
	}

	useEffect(() => {
		if (hasVoted) {
			fetchResultRound()
			fetchRoundData()
		}
	}, [hasVoted])

	return (
		<div>
			<div className="bg-grantpicks-black-50 flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-6 mt-14 md:mt-8 lg:mt-4 rounded-xl">
				<div className="flex items-center space-x-2">
					<IconCheckCircle size={18} className="fill-grantpicks-purple-500" />
					<p className="text-xs font-semibold">VOTING COMPLETED</p>
				</div>
				<div className="flex items-center space-x-4 md:space-x-6">
					<div className="flex items-center space-x-2">
						<IconCube size={18} className="fill-grantpicks-black-600" />
						<p className="text-xs md:text-sm">
							{votingResult?.picks?.length} Match
							{(votingResult?.picks?.length as number) > 1 && 'es'}
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<IconClock size={18} className="fill-grantpicks-black-600" />
						<p className="text-xs md:text-sm">
							Voted at{` `}
							{moment(
								new Date(Number(votingResult?.voted_ms) as number),
							).format('LLL')}
						</p>
					</div>
				</div>
			</div>
			<div className="mt-10 md:mt-14 flex items-center space-x-2 md:space-x-4">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
					{connectedWallet === 'near' ? (
						<IconNear size={16} className="fill-grantpicks-black-950" />
					) : (
						<IconStellar size={16} className="fill-grantpicks-black-950" />
					)}
				</div>
				<p className="text-[40px] font-black uppercase text-grantpicks-black-950">
					{roundData?.name}
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
				{pairsData.map((pair, idx) => (
					<IsVotedPairItem
						key={idx}
						pair={pair}
						index={idx}
						votingResult={votingResult}
					/>
				))}
			</div>
		</div>
	)
}

export default IsVotedSection
