import React from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconCheckCircle from '../../svgs/IconCheckCircle'
import Button from '../../commons/Button'

const EvaluationGuideModal = ({ isOpen, onClose }: BaseModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[480px] mx-auto bg-white rounded-2xl max-h-[80%] overflow-scroll">
				<div className="bg-grantpicks-black-50 py-6 px-5 md:px-8 lg:px-10 rounded-t-2xl">
					<p className="text-2xl md:text-3xl lg:text-[40px] font-black text-grantpicks-black-950 uppercase">
						Evaluation Guide
					</p>
				</div>
				<div className="px-5 md:px-8 lg:px-10 pb-5 md:pb-8 pt-8 md:pt-12 lg:pt-14 text-grantpicks-black-950">
					<p className="text-base font-normal mb-6">
						We’ve prepared a helpful evaluation guide that should help you
						determine the amount of impact a particular has had. Please consider
						the following evaluation criteria:{' '}
					</p>
					<div className="border border-black/10 rounded-xl p-4 md:p-6 mb-6 md:mb-10">
						<div className="flex space-x-2 md:space-x-4 mb-4">
							<IconCheckCircle
								size={24}
								className="fill-grantpicks-black-400 shrink-0"
							/>
							<p className="text-base font-normal">
								Given the project’s funding to date and the scale of the problem
								they’re addressing, how impactful was their contribution?
							</p>
						</div>
						<div className="flex space-x-2 md:space-x-4 mb-4">
							<IconCheckCircle
								size={24}
								className="fill-grantpicks-black-400 shrink-0"
							/>
							<p className="text-base font-normal">
								If this project was fully resourced, would they significantly
								move the needle forward on their focus issue?
							</p>
						</div>
						<div className="flex space-x-2 md:space-x-4 mb-4">
							<IconCheckCircle
								size={24}
								className="fill-grantpicks-black-400 shrink-0"
							/>
							<p className="text-base font-normal">
								How underserved are they? Geographically? Topically? Visibility
								in the ecosystem?
							</p>
						</div>
						<div className="flex space-x-2 md:space-x-4 mb-4">
							<IconCheckCircle
								size={24}
								className="fill-grantpicks-black-400 shrink-0"
							/>
							<p className="text-base font-normal">
								Make sure you have 2 XLM for the gas fees in your wallet to
								actually cast vote.
							</p>
						</div>
					</div>
					<div className="flex flex-col md:flex-row md:items-center space-x-4 w-full">
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
								onClick={() => onClose()}
								className="!py-3 flex-1"
							>
								Proceed
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default EvaluationGuideModal
