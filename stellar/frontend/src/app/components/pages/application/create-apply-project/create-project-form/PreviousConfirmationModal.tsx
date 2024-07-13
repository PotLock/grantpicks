import Button from '@/app/components/commons/Button'
import Modal from '@/app/components/commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import React from 'react'

interface PreviousConfirmationModalProps extends BaseModalProps {
	onPrevious: () => void
}

const PreviousConfirmationModal = ({
	isOpen,
	onClose,
	onPrevious,
}: PreviousConfirmationModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} zIndex={110}>
			<div className="w-[360px] mx-auto rounded-xl bg-white p-4 md:p-6">
				<p className="font-semibold text-xl mb-4 md:mb-6 text-grantpicks-red-600 text-center">
					Previous Confirmation
				</p>
				<p className="text-grantpicks-red-600 text-center text-sm font-normal mb-4 md:mb-6">
					Are you sure you want to back to previous step? Any changes in this
					step will be discard
				</p>
				<div className="flex items-center space-x-4 md:space-x-6">
					<div className="flex-1">
						<Button isFullWidth color="white" onClick={onClose}>
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button
							isFullWidth
							color="red"
							onClick={() => {
								onPrevious()
								onClose()
							}}
						>
							Yes
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default PreviousConfirmationModal
