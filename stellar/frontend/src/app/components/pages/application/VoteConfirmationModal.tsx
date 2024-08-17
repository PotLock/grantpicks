import React, { useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
	Network,
} from '@/types/on-chain'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconCube from '../../svgs/IconCube'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import Button from '../../commons/Button'
import { getRoundApplications } from '@/services/on-chain/round'
import { LIMIT_SIZE } from '@/constants/query'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { useRouter } from 'next/navigation'

interface VoteConfirmationModalProps extends BaseModalProps {
	data?: IGetRoundsResponse
}

const VoteConfirmationModal = ({
	isOpen,
	onClose,
	data,
}: VoteConfirmationModalProps) => {
	const router = useRouter()
	const { connectedWallet, stellarPubKey } = useWallet()
	const { selectedRoundType } = useRoundStore()
	const [appsRound, setAppsRound] = useState<IGetRoundApplicationsResponse[]>(
		[],
	)

	const onFetchAppsRound = async () => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			let skip = 0
			let foldRes: IGetRoundApplicationsResponse[] = []
			const stopLooping = setInterval(async () => {
				const newRes = await getRoundApplications(
					{ round_id: data?.id as bigint, skip, limit: LIMIT_SIZE },
					contracts,
				)
				if (newRes.length < LIMIT_SIZE) {
					for (const item of newRes) {
						if (!foldRes.includes(item)) foldRes.push(item)
					}
					setAppsRound(foldRes)
					clearInterval(stopLooping)
					return
				}
				skip += LIMIT_SIZE
			}, 500)
		} catch (error: any) {
			console.log('error', error)
		}
	}

	useEffect(() => {
		if (isOpen) {
			onFetchAppsRound()
		}
	}, [isOpen])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[500px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4 md:p-8 lg:p-10">
				<div className="flex items-center">
					<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
						{connectedWallet === 'near' ? (
							<IconNear size={16} className="fill-grantpicks-black-950" />
						) : (
							<IconStellar size={16} className="fill-grantpicks-black-950" />
						)}
					</div>
				</div>
				<p className="text-grantpicks-black-950 text-2xl md:text-3xl lg:text-[32px] font-semibold mb-4">
					{data?.name}
				</p>
				<p className="text-sm font-normal text-grantpicks-black-600 line-clamp-5 mb-4">
					{data?.description}
				</p>
				<div className="flex items-center justify-between mb-6 md:mb-8 lg:mb-10">
					<div className="flex flex-1 items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{appsRound.length} Projects
						</p>
					</div>
					<div className="flex flex-1 items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{data?.num_picks_per_voter} Vote
							{(data?.num_picks_per_voter || 0) > 1 && `s`} per person
						</p>
					</div>
					<div className="flex flex-1 items-center justify-end space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends{` `}
							{moment(
								new Date(Number(data?.voting_end_ms) as number),
							).fromNow()}
						</p>
					</div>
				</div>
				<div className="flex items-center mb-6 md:mb-8 lg:mb-10">
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{formatStroopToXlm(data?.current_vault_balance || BigInt(0))} XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							AVAILABLE FUNDS
						</p>
					</div>
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{formatStroopToXlm(data?.expected_amount || BigInt(0))} XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							EXPECTED FUNDS
						</p>
					</div>
				</div>

				<div className="pt-4 pb-6 flex flex-col md:flex-row md:items-center space-x-4 w-full">
					<div className="flex-1">
						<Button
							color="alpha-50"
							isFullWidth
							onClick={() => {
								onClose()
							}}
							className="!py-3 flex-1 !border !border-grantpicks-black-400"
						>
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button
							color="black-950"
							isFullWidth
							onClick={() => {
								router.push(`/round-vote/${data?.id}`)
								onClose()
								// onApplyRound()
								// onClose()
							}}
							className="!py-3 flex-1"
						>
							Proceed
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default VoteConfirmationModal
