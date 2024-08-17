import React, { useEffect, useState } from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import TimerEnd from '../../commons/TimerEnd'
import Image from 'next/image'
import moment from 'moment'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	getProject,
	GetProjectParams,
	IGetProjectsResponse,
} from '@/services/on-chain/project-registry'
import { PayoutsChallenge } from 'round-client'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import { prettyTruncate } from '@/utils/helper'
import IconChallenge from '../../svgs/IconChallenge'
import IconDot from '../../svgs/IconDot'
import Button from '../../commons/Button'
import InputTextArea from '../../commons/InputTextArea'

interface ViewChallengeDrawerProps extends IDrawerProps {
	endOfChallenge: number
	challengesData: PayoutsChallenge[]
}

const ChallengeItem = ({
	challenge,
	index,
}: {
	challenge: PayoutsChallenge
	index: number
}) => {
	const { stellarPubKey } = useWallet()
	const [projectData, setProjectData] = useState<
		IGetProjectsResponse | undefined
	>(undefined)
	const [isReviewing, setIsReviewing] = useState<boolean>(false)

	// const fetchProjectById = async () => {
	// 	try {
	// 		let cmdWallet = new CMDWallet({
	// 			stellarPubKey: stellarPubKey,
	// 		})
	// 		const contracts = new Contracts(
	// 			process.env.NETWORK_ENV as Network,
	// 			cmdWallet,
	// 		)
	// 		const get1stProjectParams: GetProjectParams = {
	// 			project_id: BigInt(challenge.challenger_id),
	// 		}
	// 		const projectRes = await getProject(get1stProjectParams, contracts)
	// 		setProjectData(projectRes)
	// 	} catch (error: any) {
	// 		console.log('error project by id', error)
	// 	}
	// }

	// useEffect(() => {
	// 	fetchProjectById()
	// }, [])

	return (
		<div key={index}>
			<div className="flex items-center justify-between space-x-2 mb-2 w-full">
				<div className="w-[10%] flex justify-center">
					<Image src="/assets/images/ava-1.png" alt="" width={24} height={24} />
				</div>
				<p className="text-sm font-semibold">
					{prettyTruncate(challenge.challenger_id, 10, 'address')}
				</p>
				<p className="text-sm font-semibold text-grantpicks-purple-600">
					Challenged Payout
				</p>
				<p className="text-sm font-normal text-grantpicks-black-950">
					{moment(new Date(Number(challenge.created_at) as number)).fromNow()}
				</p>
			</div>
			<div className="flex items-center w-full mb-2">
				<div className="w-[10%] flex items-center justify-center max-h-24">
					<div className="border border-black/10 min-h-10" />
				</div>
				<p className="text-sm font-normal text-grantpicks-black-600">
					{challenge.reason}
				</p>
			</div>
			{isReviewing ? (
				<div className="border border-black/10 rounded-2xl">
					<div className="pt-3 px-4 flex items-center">
						<p className="text-xs font-semibold">RESOLVE CHALLENGE</p>
					</div>
					<div className="bg-white rounded-t-2xl p-2 md:p-4">
						<div className="bg-grantpicks-black-50 rounded-full p-2 flex items-center justify-between mb-4">
							<div className="flex items-center space-x-2">
								<div className="bg-grantpicks-black-100 rounded-full w-6"></div>
								<p className="text-sm font-semibold">
									{prettyTruncate(stellarPubKey, 10, 'address')}
								</p>
							</div>
							<IconClose size={24} className="fill-grantpicks-black-400" />
						</div>
						<InputTextArea />
					</div>
				</div>
			) : (
				<div className="flex items-center w-full">
					<div className="w-[10%] flex justify-center">
						<IconChallenge size={24} className="fill-grantpicks-purple-400" />
					</div>
					<div className="flex items-center space-x-2">
						<p className="text-grantpicks-black-600">Unresolved</p>
						<IconDot size={8} className="fill-grantpicks-black-400" />
						<button
							className="text-sm font-semibold text-grantpicks-black-950"
							onClick={() => setIsReviewing(true)}
						>
							Reply
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

const ViewChallengeDrawer = ({
	isOpen,
	onClose,
	endOfChallenge,
	challengesData,
}: ViewChallengeDrawerProps) => {
	return (
		<Drawer onClose={onClose} isOpen={isOpen} showClose={false}>
			<div
				id="containerScroll"
				className="bg-white flex flex-col w-full h-full overflow-y-auto"
			>
				<div className="bg-grantpicks-purple-50 p-4 md:p-6 flex items-center justify-end">
					<p className="text-sm font-bold text-grantpicks-purple-800">
						{isOpen && <TimerEnd expiryTime={endOfChallenge} />}
					</p>
				</div>
				<div className="px-4 md:px-6 flex items-center justify-between py-3">
					<p className="text-xl font-semibold">Payout Challenges</p>
					<IconClose
						size={20}
						className="fill-grantpicks-black-400 cursor-pointer"
						onClick={onClose}
					/>
				</div>
				<div className="px-4 md:px-6 py-4">
					<div className="flex items-center">
						<div className="bg-grantpicks-black-100 px-4 rounded-full text-grantpicks-black-600 flex items-center justify-center py-1 mb-4">
							Unresolved Challenge
						</div>
					</div>
					<div className="flex flex-col space-y-4">
						{challengesData
							.filter((cha) => !cha.resolved)
							.map((cha, index) => (
								<ChallengeItem key={index} challenge={cha} index={index} />
							))}
					</div>
				</div>
			</div>
		</Drawer>
	)
}

export default ViewChallengeDrawer
