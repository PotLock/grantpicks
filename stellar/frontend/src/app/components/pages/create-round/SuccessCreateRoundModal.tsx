import React from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClock from '../../svgs/IconClock'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'

const SuccessCreateRoundModal = ({ isOpen, onClose }: BaseModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-[45vw] mx-auto bg-white rounded-xl shadow-md p-4 md:p-6">
				<div className="flex flex-col items-center">
					<div
						className="w-10 h-10 bg-green-500 mb-4"
						style={{
							fill: `var(--Green-500, #24C91E)`,
							boxShadow: `0px 1px 2px 0px rgba(136, 242, 131, 0.72) inset, 0px -1px 2px 0px rgba(22, 131, 18, 0.50) inset`,
							filter: `drop-shadow(0px 2px 4px rgba(5, 5, 5, 0.14)) drop-shadow(0px 4px 8px rgba(36, 201, 30, 0.32)) drop-shadow(0px 0px 0px #17A512)`,
						}}
					/>
					<p className="text-base font-bold text-grantpicks-black-950">
						You’ve Successfully created a Round.
					</p>
				</div>
				<div className="p-6 border border-black/10 flex flex-col items-center my-8">
					<p className="text-[25px] font-semibold text-grantpicks-black-950 mb-4">
						Web3 Education & Skill Development
					</p>
					<div className="flex items-center space-x-2 mb-4">
						<IconClock size={18} className="fill-grantpicks-black-600" />
						<p className="text-sm font-normal text-grantpicks-black-600">
							Starting 20/5/2024 and Ending 1/6/2024
						</p>
					</div>
					<Button
						color="black"
						className="!rounded-full"
						isFullWidth
						onClick={() => {}}
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
					<div className="py-2 px-3 bg-grantpicks-black-50 flex items-center justify-center">
						<p className="text-sm font-semibold text-grantpicks-black-950">
							0x063834efe2...
						</p>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default SuccessCreateRoundModal