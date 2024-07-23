import { IModalContext } from '@/types/context'
import { createContext } from 'react'

export const ModalContext = createContext<IModalContext>({
	setSuccessFundRoundModalProps: () => {},
	setSuccessCreateRoundModalProps: () => {},
	successFundRoundModalProps: {
		isOpen: false,
	},
	setApplyProjectInitProps: () => {},
	setCreateProjectFormMainProps: () => {},
})
