import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconProject from '@/app/components/svgs/IconProject'
import { CreateProjectStep1Data } from '@/types/form'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import { DEFAULT_CREATE_PROJECT_DATA } from '@/constants/project'
import PreviousConfirmationModal from './PreviousConfirmationModal'
import { localStorageConfigs } from '@/configs/local-storage'

const CreateProjectStep1 = () => {
	const { setStep, setData, data, onClose } = useCreateProject()

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep1Data>({})

	const onNextStep1: SubmitHandler<CreateProjectStep1Data> = (submitData) => {
		setData({
			...data,
			title: submitData.title,
			project_id: submitData.project_id,
			description: submitData.description,
			considering_desc: submitData.considering_desc,
		})
		setStep(2)
	}

	useEffect(() => {
		const draftData = localStorage.getItem(
			localStorageConfigs.CREATE_PROJECT_STEP_1,
		)
		if (draftData) {
			const draft = JSON.parse(draftData)
			setValue('title', draft.title)
			setValue('description', draft.description)
			setValue('considering_desc', draft.considering_desc)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const storeData = { ...watch() }
		localStorage.setItem(
			localStorageConfigs.CREATE_PROJECT_STEP_1,
			JSON.stringify(storeData),
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch()])

	return (
		<div className="bg-grantpicks-black-50 w-full relative">
			<div className="pt-10 px-4 md:px-6 border-b border-black/10">
				<div className="flex items-center">
					<div className="bg-grantpicks-alpha-50/5 border border-grantpicks-alpha-50/[0.07] flex items-center space-x-2 px-2 py-1 rounded-full mb-4">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-bold text-grantpicks-black-950">
							Step 1 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950">
					Tell us about your project
				</p>
				<div className="py-6 md:py-8 px-5 md:px-6 space-y-6 overflow-y-auto h-[50vh]">
					<InputText
						required
						label="Project Title"
						{...register('title', { required: true })}
						errorMessage={
							errors.title?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Project title is required
								</p>
							) : undefined
						}
					/>
					<InputTextArea
						label="A brief Description"
						required
						rows={2}
						maxLength={300}
						hintLabel="Max. 300 characters"
						{...register('description', { required: true })}
						errorMessage={
							errors.description?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Project brief description is required
								</p>
							) : undefined
						}
					/>
					<InputTextArea
						label="Why do you consider yourself a public good?"
						required
						rows={2}
						maxLength={300}
						hintLabel="Max. 300 characters"
						{...register('considering_desc', { required: true })}
						errorMessage={
							errors.considering_desc?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Considering description is required
								</p>
							) : undefined
						}
					/>
				</div>
			</div>
			<div className="p-5 md:p-6 flex flex-col items-center space-y-4">
				<Button
					color="black-950"
					isFullWidth
					onClick={handleSubmit(onNextStep1)}
					className="!py-3"
				>
					Next
				</Button>
				<Button
					color="alpha-50"
					isFullWidth
					onClick={() => onClose()}
					className="!py-3"
				>
					Cancel
				</Button>
			</div>
		</div>
	)
}

export default CreateProjectStep1
