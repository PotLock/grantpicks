import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconProject from '@/app/components/svgs/IconProject'
import IconTrash from '@/app/components/svgs/IconTrash'
import { CreateProjectStep4Data } from '@/types/form'
import React, { useState } from 'react'
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm,
} from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import IconAdd from '@/app/components/svgs/IconAdd'
import Checkbox from '@/app/components/commons/CheckBox'
import DatePicker from 'react-datepicker'
import IconCalendar from '@/app/components/svgs/IconCalendar'
import PreviousConfirmationModal from './PreviousConfirmationModal'

const CreateProjectStep4 = () => {
	const { setStep, data, setData } = useCreateProject()
	const [showPrevConfirm, setShowPrevConfirm] = useState<boolean>(false)
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateProjectStep4Data>({
		defaultValues: {
			funding_histories:
				data.funding_histories.length > 0
					? data.funding_histories.map((history) => ({
							source: history.source || '',
							date: history.date || new Date(),
							denomination: history.denomination || '',
							amount: history.amount || '',
							description: history.description || '',
						}))
					: [
							{
								source: '',
								date: new Date(),
								denomination: '',
								amount: '',
								description: '',
							},
						],
		},
	})
	const {
		fields: fieldHistories,
		append: appendHistory,
		remove: removeHistory,
	} = useFieldArray({
		control,
		name: 'funding_histories',
	})

	const onNextStep4: SubmitHandler<CreateProjectStep4Data> = (submitData) => {
		setData({
			...data,
			funding_histories: submitData.funding_histories,
		})
		setStep(5)
	}

	console.log('githubs', watch(), errors)
	return (
		<div className="bg-grantpicks-black-50 rounded-b-xl w-full relative overflow-y-auto h-[70vh]">
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
							Step 4 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950">
					Let’s add your funding history{' '}
				</p>
				<div className="py-4 md:py-6">
					<div className="flex flex-col space-y-4 mb-6">
						{fieldHistories.map((history, index) => (
							<div
								key={index}
								className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 bg-grantpicks-black-100 rounded-xl relative"
							>
								<IconTrash
									size={24}
									className="fill-grantpicks-red-400 cursor-pointer hover:opacity-70 transition absolute top-3 right-3"
									onClick={() => {
										removeHistory(index)
									}}
								/>
								<InputText
									required
									label="Source"
									{...register(`funding_histories.${index}.source`, {
										required: true,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.source?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Source is required
											</p>
										) : undefined
									}
								/>
								<div>
									<p className="font-semibold text-grantpicks-black-950 mb-2">
										Date
									</p>
									<Controller
										name={`funding_histories.${index}.date`}
										control={control}
										rules={{ required: true }}
										render={({ field }) => (
											<DatePicker
												showIcon
												icon={
													<div className="flex items-center mt-2">
														<IconCalendar
															size={20}
															className="fill-grantpicks-black-400"
														/>
													</div>
												}
												calendarIconClassName="flex items-center"
												selected={new Date(field.value)}
												onChange={(date) => {
													field.onChange(date)
												}}
												className="border border-grantpicks-black-200 rounded-xl w-full h-12 text-grantpicks-black-950"
												wrapperClassName="w-full mb-1"
											/>
										)}
									/>
								</div>
								<InputText
									required
									label="Denomination"
									{...register(`funding_histories.${index}.denomination`, {
										required: true,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.denomination?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Denomination is required
											</p>
										) : undefined
									}
								/>
								<InputText
									required
									label="Amount"
									{...register(`funding_histories.${index}.amount`, {
										required: true,
										pattern: /^(0|[1-9]\d*)(\.\d+)?$/,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.amount?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Amount is required
											</p>
										) : errors?.funding_histories?.[index]?.amount?.type ===
										  'valueAsNumber' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Amount only allow number
											</p>
										) : undefined
									}
								/>
								<div className="col-span-1 md:col-span-2">
									<InputTextArea
										label="Description"
										required
										rows={2}
										{...register(`funding_histories.${index}.description`, {
											required: true,
										})}
										errorMessage={
											errors.funding_histories?.[index]?.description?.type ===
											'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Description is required
												</p>
											) : undefined
										}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between">
						<Checkbox
							label="We haven't raised any funds"
							checked={watch().is_havent_raised}
							onChange={(e) => setValue('is_havent_raised', e.target.checked)}
						/>
						<Button
							color="transparent"
							className="!bg-transparent !border !border-black/10"
							onClick={() => {
								appendHistory({
									id: '',
									source: '',
									date: new Date(),
									denomination: '',
									amount: '',
									description: '',
								})
							}}
						>
							<div className="flex items-center space-x-2">
								<IconAdd size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Add more
								</p>
							</div>
						</Button>
					</div>
				</div>
			</div>
			<div className="p-5 md:p-6 flex items-center space-x-4">
				<div className="flex-1">
					<Button
						color="white"
						isFullWidth
						onClick={() => setShowPrevConfirm(true)}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Previous
					</Button>
				</div>
				<div className="flex-1">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onNextStep4)}
						className="!py-3"
					>
						Next
					</Button>
				</div>
			</div>
			<PreviousConfirmationModal
				isOpen={showPrevConfirm}
				onPrevious={() => {
					reset({})
					setShowPrevConfirm(false)
					setStep(3)
				}}
				onClose={() => setShowPrevConfirm(false)}
			/>
		</div>
	)
}

export default CreateProjectStep4
