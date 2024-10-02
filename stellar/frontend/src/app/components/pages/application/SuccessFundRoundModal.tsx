import React from 'react'
import { BaseModalProps } from '@/types/dialog'
import Modal from '@/app/components/commons/Modal'
import IconCheck from '@/app/components/svgs/IconCheck'
import IconClose from '@/app/components/svgs/IconClose'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { prettyTruncate } from '@/utils/helper'
import Link from 'next/link'
import IconExternalLink from '../../svgs/IconExternalLink'
import { GPRound } from '@/models/round'

interface SuccessFundRoundModalProps extends BaseModalProps {
	amount: string
	doc?: GPRound
	txHash?: string
}

const SuccessFundRoundModal = ({
	isOpen,
	onClose,
	doc,
	txHash,
	amount,
}: SuccessFundRoundModalProps) => {
	const { stellarPrice } = useGlobalContext()
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[340px] mx-auto bg-white rounded-xl shadow-md p-4 md:p-6 relative">
				<IconClose
					size={24}
					className="fill-grantpicks-black-600 absolute top-5 right-5 cursor-pointer hover:opacity-70 transition"
					onClick={onClose}
				/>
				<div className="flex flex-col items-center mb-8">
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
					<p className="text-base font-bold text-grantpicks-black-950 mb-3">
						You’ve Successfully Donated{' '}
					</p>
					<p className="text-xl font-semibold text-grantpicks-black-950">
						{amount} XLM
					</p>
					<p className="text-sm font-normal text-grantpicks-black-950">
						~{parseFloat(amount || '0') * stellarPrice} USD
					</p>
				</div>
				<div className="flex flex-col items-center">
					<p className="text-xs font-normal text-grantpicks-black-600 mb-2">
						Transaction ID
					</p>
					<div className="py-2 px-3 bg-grantpicks-black-50 flex items-center justify-center space-x-2 rounded-full">
						<p className="text-sm font-semibold text-grantpicks-black-950">
							{prettyTruncate(txHash, 10)}
						</p>
						<Link
							href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
							target="_blank"
						>
							<IconExternalLink
								size={24}
								className="stroke-grantpicks-black-950"
							/>
						</Link>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default SuccessFundRoundModal
