import Modal from '@/app/components/commons/Modal'
import IconProject from '@/app/components/svgs/IconProject'
import { ICreateProjectForm, ICreateProjectFormContext } from '@/types/context'
import { BaseModalProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { createContext, useContext, useState } from 'react'
import CreateProjectStep1 from './CreateProjectStep1'
import CreateProjectStep2 from './CreateProjectStep2'
import CreateProjectStep3 from './CreateProjectStep3'
import CreateProjectStep4 from './CreateProjectStep4'
import CreateProjectStep5 from './CreateProjectStep5'
import { DEFAULT_CREATE_PROJECT_DATA } from '@/constants/project'

const CreateProjectFormContext = createContext<ICreateProjectFormContext>({
	data: DEFAULT_CREATE_PROJECT_DATA,
	setData: () => {},
	step: 1,
	setStep: () => {},
	onClose: () => {},
})

const CreateProjectFormMainModal = ({ isOpen, onClose }: BaseModalProps) => {
	const [dataForm, setDataForm] = useState<ICreateProjectForm>(
		DEFAULT_CREATE_PROJECT_DATA,
	)
	const [step, setStep] = useState<number>(1)

	return (
		<CreateProjectFormContext.Provider
			value={{
				data: dataForm,
				step,
				setStep,
				setData: setDataForm,
				onClose,
			}}
		>
			<Modal isOpen={isOpen} onClose={onClose}>
				<div className="w-11/12 md:w-[560px] mx-auto bg-white rounded-xl border border-black/10 shadow p-2">
					<div className="py-4 px-4 md:px-6 flex items-center justify-center">
						<p className="text-3xl md:text-4xl lg:text-[40px] font-black text-grantpicks-black-950 uppercase text-center">
							Create New Project
						</p>
					</div>
					<div
						className={clsx(`border-2 border-black`)}
						style={{
							width: `${(step / 5) * 100}%`,
						}}
					/>
					{step === 1 && <CreateProjectStep1 />}
					{step === 2 && <CreateProjectStep2 />}
					{step === 3 && <CreateProjectStep3 />}
					{step === 4 && <CreateProjectStep4 />}
					{step === 5 && <CreateProjectStep5 />}
				</div>
			</Modal>
		</CreateProjectFormContext.Provider>
	)
}

export const useCreateProject = () => useContext(CreateProjectFormContext)

export default CreateProjectFormMainModal
