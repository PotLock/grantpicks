import React from 'react'
import { BaseModalProps } from '@/types/dialog'
import { IGetRoundsResponse } from '@/types/on-chain'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { prettyTruncate } from '@/utils/helper'
import Link from 'next/link'
import Modal from '@/app/components/commons/Modal'
import IconCheck from '@/app/components/svgs/IconCheck'
import IconClock from '@/app/components/svgs/IconClock'
import Button from '@/app/components/commons/Button'
import IconEye from '@/app/components/svgs/IconEye'
import IconExternalLink from '@/app/components/svgs/IconExternalLink'
import { Project } from 'round-client'

interface SuccessCreateProjectModalProps extends BaseModalProps {
	createProjectRes?: Project
	txHash?: string
}

const SuccessCreateProjectModal = ({
	isOpen,
	onClose,
	createProjectRes,
	txHash,
}: SuccessCreateProjectModalProps) => {
	const router = useRouter()
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
						You’ve Successfully created a Project.
					</p>
				</div>
				<div className="p-6 border border-black/10 flex flex-col items-center my-8">
					<p className="text-[25px] font-semibold text-grantpicks-black-950 mb-4">
						{createProjectRes?.name}
					</p>
					{/* <div className="flex items-center space-x-2 mb-4">
						<IconClock size={18} className="fill-grantpicks-black-600" />
						<p className="text-sm font-normal text-grantpicks-black-600">
							Starting{' '}
							{moment(
								Number(createRoundRes?.application_start_ms) as number,
							).format('l')}{' '}
							and Ending{' '}
							{moment(
								Number(createRoundRes?.application_end_ms) as number,
							).format('l')}
						</p>
					</div> */}
					<Button
						color="black"
						className="!rounded-full"
						isFullWidth
						onClick={() => {
							onClose()
							router.push(`/application/my-project`)
						}}
					>
						<div className="flex items-center space-x-2">
							<IconEye size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">View Project</p>
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

export default SuccessCreateProjectModal
