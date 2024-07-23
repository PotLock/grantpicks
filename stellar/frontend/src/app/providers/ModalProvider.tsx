'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import {
	IModalContextProps,
	ISuccessCreateRoundModalProps,
} from '@/types/context'
import SuccessFundRoundModal from '../components/pages/application/SuccessFundRoundModal'
import ApplyProjectModal from '../components/pages/application/create-apply-project/ApplyProjectModal'
import CreateProjectFormMainModal from '../components/pages/application/create-apply-project/create-project-form/CreateProjectFormMainModal'
import SuccessCreateRoundModal from '../components/pages/create-round/SuccessCreateRoundModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successCreateRoundProps, setSuccessCreateRoundProps] =
		useState<ISuccessCreateRoundModalProps>({
			isOpen: false,
			createRoundRes: undefined,
		})
	const [successFundRoundProps, setSuccessFundRoundProps] =
		useState<IModalContextProps>({
			isOpen: false,
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
				successFundRoundModalProps: successFundRoundProps,
				setApplyProjectInitProps,
				setCreateProjectFormMainProps,
			}}
		>
			{children}
			<SuccessCreateRoundModal
				isOpen={successCreateRoundProps.isOpen}
				createRoundRes={successCreateRoundProps.createRoundRes}
				onClose={() =>
					setSuccessCreateRoundProps((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
			/>
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
