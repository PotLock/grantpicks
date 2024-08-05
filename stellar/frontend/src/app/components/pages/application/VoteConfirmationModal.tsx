import React from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import { IGetRoundsResponse } from '@/types/on-chain'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconCube from '../../svgs/IconCube'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import Button from '../../commons/Button'

interface VoteConfirmationModalProps extends BaseModalProps {
	doc?: IGetRoundsResponse
}

const VoteConfirmationModal = ({
	isOpen,
	onClose,
	doc,
}: VoteConfirmationModalProps) => {
	const { connectedWallet } = useWallet()
	const { selectedRoundType } = useRoundStore()
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[480px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4">
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
					{doc?.name}
				</p>
				<p className="text-sm font-normal text-grantpicks-black-600 line-clamp-5 mb-4">
					{doc?.description}
				</p>
				<div className="flex items-center justify-between mb-6 md:mb-8 lg:mb-10">
					<div className="flex flex-1 items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{0} Projects
						</p>
					</div>
					<div className="flex flex-1 items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{doc?.num_picks_per_voter} Vote
							{(doc?.num_picks_per_voter || 0) > 1 && `s`} per person
						</p>
					</div>
					<div className="flex flex-1 items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends{` `}
							{moment(
								new Date(Number(doc?.application_end_ms) as number),
							).fromNow()}
						</p>
					</div>
				</div>
				<div className="flex items-center mb-6 md:mb-8 lg:mb-10">
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{formatStroopToXlm(doc?.expected_amount || BigInt(0))} XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							AVAILABLE FUNDS
						</p>
					</div>
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{formatStroopToXlm(doc?.expected_amount || BigInt(0))} XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							EXPECTED FUNDS
						</p>
					</div>
				</div>

				<div className="px-6 pt-4 pb-6 flex items-center space-x-4">
					<Button
						color="alpha-50"
						onClick={() => {
							onClose()
						}}
						className="!py-3 flex-1 !border !border-grantpicks-black-400"
					>
						Cancel
					</Button>
					<Button
						color="black-950"
						onClick={() => {
							// onApplyRound()
							// onClose()
						}}
						className="!py-3 flex-1"
					>
						Proceed
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default VoteConfirmationModal
