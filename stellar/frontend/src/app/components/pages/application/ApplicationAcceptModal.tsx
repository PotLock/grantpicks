import { BaseModalProps } from '@/types/dialog'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
} from '@/types/on-chain'
import React, { useState } from 'react'
import Modal from '../../commons/Modal'
import IconClose from '../../svgs/IconClose'
import InputTextArea from '../../commons/InputTextArea'
import Button from '../../commons/Button'

interface ApplicationAcceptModalProps extends BaseModalProps {
	roundData: IGetRoundsResponse
	applicationData: IGetRoundApplicationsResponse
	mutate?: any
	onConfirm: (note: string) => Promise<void>
}

const ApplicationAcceptModal = ({
	isOpen,
	onClose,
	roundData,
	applicationData,
	onConfirm,
}: ApplicationAcceptModalProps) => {
	const [note, setNote] = useState<string>('')

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[340px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<p className="text-base font-bold text-grantpicks-black-950">
						Accept Confirmation
					</p>
					<IconClose
						size={24}
						className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
						onClick={() => onClose()}
					/>
				</div>
				<div className="p-4 bg-grantpicks-alpha-50/5 rounded-xl mb-4 md:mb-6">
					<p className="text-sm font-normal text-grantpicks-black-950">
						Are you sure you want to accept the application?
					</p>
				</div>
				<div className="flex-1 mb-4 md:mb-6">
					<InputTextArea
						label="Review note"
						value={note}
						rows={4}
						onChange={(e) => {
							setNote(e.target.value)
						}}
					/>
				</div>
				<div className="w-full">
					<Button
						color="black-950"
						className="!py-3"
						isFullWidth
						onClick={async () => {
							await onConfirm(note)
						}}
					>
						Confirm
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default ApplicationAcceptModal
