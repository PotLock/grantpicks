import React from 'react'
import { BaseModalProps } from '@/types/dialog'
import { useRouter } from 'next/navigation'
import { prettyTruncate } from '@/utils/helper'
import Link from 'next/link'
import Modal from '@/app/components/commons/Modal'
import IconCheck from '@/app/components/svgs/IconCheck'
import Button from '@/app/components/commons/Button'
import IconEye from '@/app/components/svgs/IconEye'
import IconExternalLink from '@/app/components/svgs/IconExternalLink'
import { RoundApplication } from 'round-client'
import { GPRound } from '@/models/round'
import useAppStorage from '@/stores/zustand/useAppStorage'

interface SuccessApplyProjectModalProps extends BaseModalProps {
	applyProjectRes?: RoundApplication
	roundData?: GPRound
	txHash?: string
}

const SuccessApplyProjectModal = ({
	isOpen,
	onClose,
	applyProjectRes,
	roundData,
	txHash,
}: SuccessApplyProjectModalProps) => {
	const router = useRouter()
	const storage = useAppStorage()

	return (
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
						You’ve Successfully Applied to {roundData?.name}
					</p>
				</div>
				<div className="p-6 border border-black/10 flex flex-col items-center my-8">
					<p className="text-base font-bold text-grantpicks-black-950 text-center">
						{roundData?.name}
					</p>
					<p className="text-xs font-normal text-grantpicks-black-600 text-center mb-4">
						{roundData?.owner?.id}
					</p>
					<p className="text-sm font-normal text-grantpicks-black-600 text-center mb-4">
						{roundData?.description}
					</p>
					<Button
						color="black"
						className="!rounded-full"
						isFullWidth
						onClick={() => {
							onClose()
							router.push(`/application`)
						}}
					>
						<div className="flex items-center space-x-2">
							<IconEye size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Explore Round</p>
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
							href={
								storage.chainId === 'stellar'
									? `https://stellar.expert/explorer/${storage.network}/tx/${txHash}`
									: storage.network === 'mainnet'
										? `https://nearblocks.io/txns/${txHash}`
										: `https://testnet.nearblocks.io/txns/${txHash}`
							}
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
	)
}

export default SuccessApplyProjectModal
