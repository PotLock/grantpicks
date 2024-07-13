import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconClose from '@/app/components/svgs/IconClose'
import IconProject from '@/app/components/svgs/IconProject'
import IconTrash from '@/app/components/svgs/IconTrash'
import { CreateProjectStep1Data, CreateProjectStep2Data } from '@/types/form'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'

const CreateProjectStep2 = () => {
	const [members, setMembers] = useState<string[]>([])
	const { setStep, data, setData, step } = useCreateProject()
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep2Data>()

	const onNextStep2: SubmitHandler<CreateProjectStep2Data> = (submitData) => {
		if (members.length === 0) return
		setData({
			...data,
			team_member: members,
		})
		setStep(3)
	}

	useEffect(() => {
		if (step === 2) {
			setMembers(data.team_member)
		}
	}, [step])

	return (
		<div className="bg-grantpicks-black-50 w-full relative">
			<div className="pt-10 px-4 md:px-6 border-b border-black/10">
				<div className="flex items-center space-x-2 mb-4">
					<IconCheckCircle size={18} className="fill-grantpicks-green-600" />
					<p className="text-sm font-semibold text-grantpicks-black-950">
						YOUR PROGRESS HAS BEEN SAVED
					</p>
				</div>
				<div className="flex items-center mb-4">
					<div className="bg-grantpicks-alpha-50/5 border border-grantpicks-alpha-50/[0.07] flex items-center space-x-2 px-2 py-1 rounded-full">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-bold text-grantpicks-black-950">
							Step 2 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950">
					Add your team
				</p>
				<div className="py-6 md:py-8 px-5 md:px-6">
					<div className="mb-6">
						<InputText
							required
							label="Team Member"
							placeholder="Account ID, Comma separated"
							{...register('member')}
							suffixIcon={
								<button
									onClick={() => {
										setMembers((prev) => [...prev, watch('member')])
										setValue('member', '')
									}}
									className="text-sm font-semibold text-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
								>
									Add
								</button>
							}
							errorMessage={
								members.length === 0 ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Team member is required
									</p>
								) : undefined
							}
						/>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
						{members.map((member, idx) => (
							<div
								key={idx}
								className="bg-grantpicks-black-100 rounded-lg p-2 md:p-4 relative flex flex-col items-center"
							>
								<IconCloseFilled
									size={24}
									className="fill-grantpicks-black-400 absolute top-3 right-3 cursor-pointer hover:opacity-70 transition"
									onClick={() => {
										setMembers((prev) => prev.filter((p) => p !== member))
									}}
								/>
								<div className="bg-grantpicks-black-400 w-16 h-16 mb-2 rounded-full" />
								<p className="text-base font-normal text-grantpicks-black-950">
									{member}
								</p>
								<p className="text-xs font-normal text-grantpicks-black-600">
									@abdul.near
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="p-5 md:p-6 flex items-center space-x-4">
				<div className="flex-1">
					<Button
						color="white"
						isFullWidth
						onClick={() => setStep(1)}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Previous
					</Button>
				</div>
				<div className="flex-1">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onNextStep2)}
						className="!py-3"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}

export default CreateProjectStep2
