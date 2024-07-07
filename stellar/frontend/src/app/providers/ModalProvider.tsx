'use client'

import React, { useContext, useState } from 'react'
import { ModalContext } from '../contexts/ModalContext'
import { IModalContextProps } from '@/types/context'
import SuccessFundRoundModal from '../components/pages/application/SuccessFundRoundModal'

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
	const [successFundRoundProps, setSuccessFundRoundProps] =
		useState<IModalContextProps>({
			isOpen: false,
		})

	return (
		<ModalContext.Provider
			value={{
				setSuccessFundRoundModalProps: setSuccessFundRoundProps,
				successFundRoundModalProps: successFundRoundProps,
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
		</ModalContext.Provider>
	)
}

export const useModal = () => useContext(ModalContext)

export default ModalProvider
