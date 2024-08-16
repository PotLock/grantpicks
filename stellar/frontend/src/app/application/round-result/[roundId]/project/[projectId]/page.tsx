'use client'

import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import RoundResultLayout from '@/app/components/pages/round-result/RoundResultLayout'
import IconArrowLeft from '@/app/components/svgs/IconArrowLeft'
import IconArrowRight from '@/app/components/svgs/IconArrowRight'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconDot from '@/app/components/svgs/IconDot'
import IconFlag from '@/app/components/svgs/IconFlag'
import IconProject from '@/app/components/svgs/IconProject'
import IconSearch from '@/app/components/svgs/IconSearch'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { getProject } from '@/services/on-chain/project-registry'
import { getRoundInfo } from '@/services/on-chain/round'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { prettyTruncate } from '@/utils/helper'
import clsx from 'clsx'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Project } from 'round-client'

const PairItem = () => {
	return (
		<div className="rounded-2xl shadow-lg text-grantpicks-black-950">
			<div className="bg-grantpicks-black-50 p-3 flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<div className="bg-grantpicks-black-100 rounded-full w-5 h-5"></div>
					<p className="text-base font-normal">@AccountID.near</p>
				</div>
				<IconFlag size={24} className="fill-grantpicks-black-400" />
			</div>
			<div className="px-3 py-5">
				{/* <div className="relative justify-center flex items-center space-x-2 md:space-x-4">
				<div>
					<div
						className={clsx(
							`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
							pair.projects.map((p) => p.toString())[0] ===
								(selectedPair?.project_id.toString() as string)
								? `border-2 border-grantpicks-purple-500`
								: `border-2 border-grantpicks-black-300`,
						)}
					></div>
					<p className="text-grantpicks-black-950 font-semibold text-base">
						{prettyTruncate(firstProjectData?.name, 20)}
					</p>
				</div>
				<div>
					<div
						className={clsx(
							`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300 mb-4`,
							pair.projects.map((p) => p.toString())[1] ===
								(selectedPair?.project_id.toString() as string)
								? `border-2 border-grantpicks-purple-500`
								: `border-2 border-grantpicks-black-300`,
						)}
					></div>
					<p className="text-grantpicks-black-950 font-semibold text-base">
						{prettyTruncate(secondProjectData?.name, 20)}
					</p>
				</div>
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="rounded-full w-16 h-16 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center">
						<p className="text-[32px] font-black text-white">VS</p>
					</div>
				</div>
			</div> */}
			</div>
		</div>
	)
}

const RoundResultProjectDetailPage = () => {
	const router = useRouter()
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [pairFilter, setPairFilter] = useState<'all' | 'won' | 'lost'>('all')
	const [roundData, setRoundData] = useState<IGetRoundsResponse | undefined>(
		undefined,
	)
	const params = useParams<{ roundId: string; projectId: string }>()
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
			{ project_id: BigInt(params.projectId) },
			contracts,
		)
		setProjectData(projectDetail)
	}

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
		console.log('debig resround', resRoundInfo)
		setRoundData(resRoundInfo)
		return resRoundInfo
	}

	useEffect(() => {
		if (params && stellarPubKey) {
			fetchProjectDetail()
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
					<div className="flex items-center space-x-3">
						<p className="text-grantpicks-black-600 text-base font-normal">
							Round
						</p>
						<IconArrowRight size={24} className="fill-grantpicks-black-400" />
						<p className="text-grantpicks-black-950 text-base font-normal">
							{roundData?.name}
						</p>
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
			</div>

			<div className="flex flex-col md:flex-row items-center w-full justify-between my-12 md:my-16">
				<div className="flex items-center space-x-4 md:space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2 md:space-x-4">
						<div className="border border-black/10 p-2 rounded-full">
							<IconProject size={24} className="fill-grantpicks-black-400" />
						</div>
						<div>
							<p className="text-[25px] font-normal">--</p>
							<p className="text-xs font-semibold text-grantpicks-black-600">
								VOTES OUT OF 600 MATCHES
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2 md:space-x-4">
						<div className="border border-black/10 p-2 rounded-full">
							<IconDollar size={24} className="fill-grantpicks-black-400" />
						</div>
						<div>
							<p className="text-[25px] font-normal">
								USD 40,000{` `}{' '}
								<span className="text-base font-normal text-gray-600">
									5,381 NEAR
								</span>{' '}
							</p>
							<p className="text-xs font-semibold text-grantpicks-black-600">
								ALLOCATED{' '}
							</p>
						</div>
					</div>
				</div>

				<Button
					color="white"
					className="!border !border-black/10 !rounded-full !px-8"
					onClick={() => {}}
				>
					Flag Project
				</Button>
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

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6"></div>
		</RoundResultLayout>
	)
}

export default RoundResultProjectDetailPage
