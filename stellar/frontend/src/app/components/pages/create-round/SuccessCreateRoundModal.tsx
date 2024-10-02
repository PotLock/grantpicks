import React, { useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClock from '../../svgs/IconClock'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'
import IconCheck from '../../svgs/IconCheck'
import { IGetRoundsResponse } from '@/types/on-chain'
import moment from 'moment'
import { prettyTruncate } from '@/utils/helper'
import Link from 'next/link'
import IconExternalLink from '../../svgs/IconExternalLink'
import RoundDetailDrawer from '../application/RoundDetailDrawer'
import { useModalContext } from '@/app/providers/ModalProvider'
import FundRoundModal from '../application/FundRoundModal'
import ApplicationsDrawer from '../application/ApplicationsDrawer'
import { GPRound } from '@/models/round'

interface SuccessCreateRoundModalProps extends BaseModalProps {
	createRoundRes?: GPRound
	txHash?: string
}

const SuccessCreateRoundModal = ({
	isOpen,
	onClose,
	createRoundRes,
	txHash,
}: SuccessCreateRoundModalProps) => {
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose} closeOnBgClick>
				<div className="w-11/12 md:w-[60vw] lg:w-[45vw] mx-auto bg-white rounded-xl shadow-md p-4 md:p-6">
					<div className="flex flex-col items-center">
						<div
							className="w-14 h-14 flex items-center justify-center mb-6 bg-grantpicks-green-600 rounded-full"
							style={{
								fill: `var(--Green-500, #24C91E)`,
								boxShadow: `0px 1px 2px 0px rgba(136, 242, 131, 0.72) inset, 0px -1px 2px 0px rgba(22, 131, 18, 0.50) inset`,
								filter: `drop-shadow(0px 2px 4px rgba(5, 5, 5, 0.14)) drop-shadow(0px 4px 8px rgba(36, 201, 30, 0.32)) drop-shadow(0px 0px 0px #17A512)`,
							}}
						>
							<IconCheck size={24} className="stroke-white" />
						</div>
						<p className="text-base font-bold text-grantpicks-black-950">
							You’ve Successfully created a Round.
						</p>
					</div>
					<div className="p-6 border border-black/10 flex flex-col items-center my-8">
						<p className="text-[25px] font-semibold text-grantpicks-black-950 mb-4">
							{createRoundRes?.name}
						</p>
						<div className="flex items-center space-x-2 mb-4">
							<IconClock size={18} className="fill-grantpicks-black-600" />
							<p className="text-sm font-normal text-grantpicks-black-600">
								Starting{' '}
								{moment(new Date(createRoundRes?.voting_start || '')).format(
									'l',
								)}{' '}
								and Ending{' '}
								{moment(new Date(createRoundRes?.voting_end || '')).format('l')}
							</p>
						</div>
						<Button
							color="black"
							className="!rounded-full"
							isFullWidth
							onClick={() => {
								onClose()
								setShowDetailDrawer(true)
							}}
						>
							<div className="flex items-center space-x-2">
								<IconEye size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold">View Round</p>
							</div>
						</Button>
					</div>
					<div className="flex flex-col items-center">
						<p className="text-xs font-normal text-grantpicks-black-600 mb-2">
							Transaction ID
						</p>
						<div className="py-2 px-3 bg-grantpicks-black-50 flex items-center justify-center space-x-2 rouxl">
							<p className="text-sm font-semibold text-grantpicks-black-950">
								{prettyTruncate(txHash, 25)}
							</p>
							<Link
								href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
								target="_blank"
							>
								<IconExternalLink
									size={16}
									className="stroke-grantpicks-black-950"
								/>
							</Link>
						</div>
					</div>
				</div>
			</Modal>
			{createRoundRes && (
				<>
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
								doc: createRoundRes,
							}))
						}}
						doc={createRoundRes}
					/>
					<ApplicationsDrawer
						isOpen={showAppsDrawer}
						onClose={() => setShowAppsDrawer(false)}
						doc={createRoundRes}
					/>
					<FundRoundModal
						isOpen={showFundRoundModal}
						doc={createRoundRes}
						mutateRounds={() => {}}
						onClose={() => setShowFundRoundModal(false)}
					/>
				</>
			)}
		</>
	)
}

export default SuccessCreateRoundModal
