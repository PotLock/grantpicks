'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import {
	IModalContextProps,
	IVoteConfirmationModalContextProps,
} from '@/types/context'
import SuccessFundRoundModal from '../components/pages/application/SuccessFundRoundModal'
import ApplyProjectModal from '../components/pages/application/create-apply-project/ApplyProjectModal'
import CreateProjectFormMainModal from '../components/pages/application/create-apply-project/create-project-form/CreateProjectFormMainModal'
import VoteConfirmationModal from '../components/pages/application/VoteConfirmationModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successFundRoundProps, setSuccessFundRoundProps] =
		useState<IModalContextProps>({
			isOpen: false,
		})
	const [applyProjectInitProps, setApplyProjectInitProps] =
		useState<IModalContextProps>({
			isOpen: false,
		})
	const [voteConfirmationProps, setVoteConfirmationProps] =
		useState<IVoteConfirmationModalContextProps>({
			isOpen: false,
			doc: undefined,
		})
	const [createProjectFormMainProps, setCreateProjectFormMainProps] =
		useState<IModalContextProps>({
			isOpen: false,
		})

	return (
		<ModalContext.Provider
			value={{
				setSuccessFundRoundModalProps: setSuccessFundRoundProps,
				successFundRoundModalProps: successFundRoundProps,
				setApplyProjectInitProps,
				setVoteConfirmationProps,
				setCreateProjectFormMainProps,
			}}
		>
			{children}
			<SuccessFundRoundModal
				isOpen={successFundRoundProps.isOpen}
				onClose={() =>
					setSuccessFundRoundProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<ApplyProjectModal
				isOpen={applyProjectInitProps.isOpen}
				onClose={() =>
					setApplyProjectInitProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<VoteConfirmationModal
				isOpen={voteConfirmationProps.isOpen}
				doc={voteConfirmationProps.doc}
				onClose={() =>
					setVoteConfirmationProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<CreateProjectFormMainModal
				isOpen={createProjectFormMainProps.isOpen}
				onClose={() =>
					setCreateProjectFormMainProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
		</ModalContext.Provider>
	)
}

export const useModalContext = () => useContext(ModalContext)

export default ModalProvider
