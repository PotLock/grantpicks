'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import {
	IModalContextProps,
	ISuccessCreateRoundModalProps,
	ISuccessFundRoundModalProps,
	ISuccessUpdateRoundModalProps,
} from '@/types/context'
import SuccessFundRoundModal from '../components/pages/application/SuccessFundRoundModal'
import ApplyProjectModal from '../components/pages/application/create-apply-project/ApplyProjectModal'
import CreateProjectFormMainModal from '../components/pages/application/create-apply-project/create-project-form/CreateProjectFormMainModal'
import SuccessCreateRoundModal from '../components/pages/create-round/SuccessCreateRoundModal'
import SuccessEditRoundModal from '../components/pages/application/edit-round/SuccessEditRoundModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successCreateRoundProps, setSuccessCreateRoundProps] =
		useState<ISuccessCreateRoundModalProps>({
			isOpen: false,
			createRoundRes: undefined,
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
				successFundRoundModalProps: successFundRoundProps,
				setApplyProjectInitProps,
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
			<ApplyProjectModal
				isOpen={applyProjectInitProps.isOpen}
				onClose={() =>
					setApplyProjectInitProps((prev) => ({
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
