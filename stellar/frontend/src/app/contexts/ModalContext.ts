import { IModalContext } from '@/types/context'
import { createContext } from 'react'

export const ModalContext = createContext<IModalContext>({
	setSuccessFundRoundModalProps: () => {},
	setSuccessCreateRoundModalProps: () => {},
	setSuccessUpdateRoundModalProps: () => {},
	setSuccessCreateProjectModalProps: () => {},
	successFundRoundModalProps: {
		isOpen: false,
		doc: undefined,
		txHash: undefined,
		amount: '',
	},
	setApplyProjectInitProps: () => {},
	setVoteConfirmationProps: () => {},
	setCreateProjectFormMainProps: () => {},
	setSuccessApplyProjectInitProps: () => {},
	setVideoPlayerProps: () => {},
})
