'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import {
	IModalContextProps,
	IVoteConfirmationModalContextProps,
	ISuccessCreateProjectModalProps,
	ISuccessCreateRoundModalProps,
	ISuccessFundRoundModalProps,
	ISuccessUpdateRoundModalProps,
} from '@/types/context'
import SuccessFundRoundModal from '../components/pages/application/SuccessFundRoundModal'
import ApplyProjectModal from '../components/pages/application/create-apply-project/ApplyProjectModal'
import CreateProjectFormMainModal from '../components/pages/application/create-apply-project/create-project-form/CreateProjectFormMainModal'
import VoteConfirmationModal from '../components/pages/application/VoteConfirmationModal'
import SuccessCreateRoundModal from '../components/pages/create-round/SuccessCreateRoundModal'
import SuccessEditRoundModal from '../components/pages/application/edit-round/SuccessEditRoundModal'
import SuccessCreateProjectModal from '../components/pages/application/create-apply-project/SuccessCreateProjectModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successCreateRoundProps, setSuccessCreateRoundProps] =
		useState<ISuccessCreateRoundModalProps>({
			isOpen: false,
			createRoundRes: undefined,
			txHash: '',
		})
	const [successCreateProjectProps, setSuccessCreateProjectProps] =
		useState<ISuccessCreateProjectModalProps>({
			isOpen: false,
			createProjectRes: undefined,
			txHash: '',
		})
	const [successUpdateRoundProps, setSuccessUpdateRoundProps] =
		useState<ISuccessUpdateRoundModalProps>({
			isOpen: false,
			updateRoundRes: undefined,
			txHash: '',
		})
	const [successFundRoundProps, setSuccessFundRoundProps] =
		useState<ISuccessFundRoundModalProps>({
			isOpen: false,
			doc: undefined,
			txHash: undefined,
			amount: '',
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
				setSuccessCreateRoundModalProps: setSuccessCreateRoundProps,
				setSuccessUpdateRoundModalProps: setSuccessUpdateRoundProps,
				setSuccessCreateProjectModalProps: setSuccessCreateProjectProps,
				successFundRoundModalProps: successFundRoundProps,
				setApplyProjectInitProps,
				setVoteConfirmationProps,
				setCreateProjectFormMainProps,
			}}
		>
			{children}
			<SuccessCreateRoundModal
				isOpen={successCreateRoundProps.isOpen}
				createRoundRes={successCreateRoundProps.createRoundRes}
				txHash={successCreateRoundProps.txHash}
				onClose={() =>
					setSuccessCreateRoundProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<SuccessEditRoundModal
				isOpen={successUpdateRoundProps.isOpen}
				updateRoundRes={successUpdateRoundProps.updateRoundRes}
				txHash={successUpdateRoundProps.txHash}
				onClose={() =>
					setSuccessUpdateRoundProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<SuccessFundRoundModal
				isOpen={successFundRoundProps.isOpen}
				amount={successFundRoundProps.amount}
				doc={successFundRoundProps.doc}
				txHash={successFundRoundProps.txHash}
				onClose={() =>
					setSuccessFundRoundProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
			<SuccessCreateProjectModal
				isOpen={successCreateProjectProps.isOpen}
				createProjectRes={successCreateProjectProps.createProjectRes}
				txHash={successCreateProjectProps.txHash}
				onClose={() =>
					setSuccessCreateProjectProps((prev) => ({
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
