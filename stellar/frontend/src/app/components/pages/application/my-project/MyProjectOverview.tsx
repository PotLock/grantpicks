import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import { CreateProjectStep1Data } from '@/types/form'
import React from 'react'
import { useForm } from 'react-hook-form'

const MyProjectOverview = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateProjectStep1Data>({
		defaultValues: {
			title: '',
			project_id: '',
			description: '',
			considering_desc: '',
		},
	})

	const onSaveChanges = () => {}

	return (
		<div className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950">
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Overview
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
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
					<InputText
						required
						customLabel={
							<p className="text-sm font-semibold text-grantpicks-black-950 mb-2">
								Project ID{' '}
								<span className="text-sm font-normal text-grantpicks-black-600">
									(For DAO Only)
								</span>
							</p>
						}
						{...register('project_id')}
					/>
					<InputTextArea
						label="A brief Description"
						required
						rows={2}
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
			<div className="p-3 md:p-5 flex flex-col md:flex-row items-center md:justify-end space-x-0 md:space-x-4 space-y-4 md:space-y-0">
				<div className="w-full lg:w-auto">
					<Button
						color="white"
						isFullWidth
						onClick={() => {}}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3"
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectOverview
