'use client'

import Button from '@/app/components/commons/Button'
import Checkbox from '@/app/components/commons/CheckBox'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Menu from '@/app/components/commons/Menu'
import TopNav from '@/app/components/commons/TopNav'
import CreateRoundLayout from '@/app/components/pages/create-round/CreateRoundLayout'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconNear from '@/app/components/svgs/IconNear'
import IconRemove from '@/app/components/svgs/IconRemove'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import { getPriceCrypto } from '@/services/common'
import { CreateRoundData } from '@/types/form'
import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import Switch from 'react-switch'
import DatePicker from 'react-datepicker'
import IconCalendar from '@/app/components/svgs/IconCalendar'
import AddProjectsModal from '@/app/components/pages/create-round/AddProjectsModal'
import IconClose from '@/app/components/svgs/IconClose'
import AddAdminsModal from '@/app/components/pages/create-round/AddAdminsModal'
import clsx from 'clsx'
import { useGlobalContext } from '@/app/providers/GlobalProvider'

const CreateRoundPage = () => {
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { nearPrice } = useGlobalContext()
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState<string>('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] =
		useState<boolean>(false)
	const [showAddAdminsModal, setShowAddAdminsModal] = useState<boolean>(false)
	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		getValues,
		formState: { errors },
	} = useForm<CreateRoundData>({
		defaultValues: {
			vote_per_person: 0,
			apply_duration: new Date(),
			max_participants: 0,
			voting_duration: new Date(),
		},
	})
	const [selectedProjects, setSelectedProjects] = useState<string[]>([])
	const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
	const { fields: fieldAdmins, append: appendAdmins } = useFieldArray({
		control,
		name: 'admins',
	})
	const { fields: fieldProjects, append: appendProjects } = useFieldArray({
		control,
		name: 'projects',
	})

	return (
		<CreateRoundLayout>
			<TopNav />
			<div className="w-[90%] md:w-[70%] lg:w-[50%] mx-auto">
				<div className="pt-28 md:pt-32 lg:pt-36 pb-16 text-grantpicks-black-950">
					<p className="text-[50px] font-black text-center uppercase mb-8 md:mb-12">
						Create new Round
					</p>
					<div className="p-5 rounded-2xl shadow-md bg-white space-y-6 mb-4 lg:mb-6">
						<InputText
							required
							label="Round Title"
							{...register('title', { required: true })}
							errorMessage={
								errors.title?.type === 'required' ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Round title is required
									</p>
								) : undefined
							}
						/>
						<InputTextArea
							label="Round Description"
							{...register('description', { required: true })}
							errorMessage={
								errors.description?.type === 'required' ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Round description is required
									</p>
								) : undefined
							}
						/>
						<div className="space-y-2">
							<div className="border border-grantpicks-black-200 rounded-xl py-2 px-3 flex items-center justify-between">
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Votes per person
									<span className="text-grantpicks-red-600 ml-1">*</span>
								</p>
								<div className="flex items-center space-x-4">
									<Button
										isDisabled={watch().vote_per_person <= 5}
										color="transparent"
										onClick={() => {
											setValue(
												'vote_per_person',
												watch().vote_per_person -
													(watch().vote_per_person === 5 ? 0 : 1),
											)
										}}
									>
										<IconRemove
											size={24}
											className="stroke-grantpicks-black-600"
										/>
									</Button>
									<p className="text-sm font-normal text-grantpicks-black-950">
										{watch().vote_per_person || 0}
									</p>
									<Button
										color="transparent"
										onClick={() => {
											setValue(
												'vote_per_person',
												watch().vote_per_person +
													(watch().vote_per_person === 0 ? 5 : 1),
											)
										}}
									>
										<IconAdd size={24} className="fill-grantpicks-black-600" />
									</Button>
								</div>
							</div>
							<p className="text-xs font-normal text-grantpicks-black-600">
								You must have a minimum of 5 Votes.
							</p>
						</div>

						<div className="space-y-2">
							<p className="text-sm font-semibold text-grantpicks-black-950">
								Contact
								<span className="text-grantpicks-red-600 ml-1">*</span>
							</p>
							<div className="flex items-center space-x-4">
								<div className="relative w-40 md:w-44 lg:w-52">
									<div
										onClick={() => setShowContactType(true)}
										className="border border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
									>
										<p className="text-sm font-normal text-grantpicks-black-950">
											{watch().contact_type}
										</p>
										<IconUnfoldMore
											size={24}
											className="fill-grantpicks-black-400"
										/>
									</div>
									{showContactType && (
										<Menu
											isOpen={showContactType}
											onClose={() => setShowContactType(false)}
											position="right-0 left-0 -bottom-[150px]"
										>
											<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white">
												<p
													onClick={() => {
														setValue('contact_type', 'Telegram')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Telegram
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Instagram')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Instagram
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Twitter')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Twitter
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Email')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Email
												</p>
											</div>
										</Menu>
									)}
								</div>
								<div className="flex-1">
									<InputText
										required
										{...register('contact_address', { required: true })}
									/>
								</div>
							</div>
							{errors.contact_address?.type === 'required' && (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Contact address is required
								</p>
							)}
							<p className="text-xs font-normal text-grantpicks-black-600">
								Leave an address where people can reach out to you.{' '}
							</p>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center space-x-4 w-full mb-4">
							<div className="flex-1">
								<InputText
									label="Amount"
									placeholder="Enter amount..."
									onChange={async (e) => {
										const calculation =
											parseFloat(e.target.value || '0') * nearPrice
										setAmountUsd(`${calculation.toFixed(3)}`)
										setValue('amount', e.target.value)
									}}
									preffixIcon={
										<IconNear size={24} className="fill-grantpicks-black-400" />
									}
									textAlign="left"
									suffixIcon={
										<div className="flex items-center space-x-2">
											<p className="text-sm font-normal text-grantpicks-black-500">
												{amountUsd}
											</p>
											<p className="text-sm font-normal text-grantpicks-black-400">
												USD
											</p>
										</div>
									}
								/>
							</div>
							<div className="flex-1">
								<InputText
									label="Expected Amount"
									required
									placeholder="Enter amount..."
									{...register('expected_amount', {
										onChange: async (e) => {
											const calculation =
												parseFloat(e.target.value || '0') * nearPrice
											setExpectAmountUsd(`${calculation.toFixed(3)}`)
										},
									})}
									preffixIcon={
										<IconNear size={24} className="fill-grantpicks-black-400" />
									}
									textAlign="left"
									suffixIcon={
										<div className="flex items-center space-x-2">
											<p className="text-sm font-normal text-grantpicks-black-500">
												{expectAmountUsd}
											</p>
											<p className="text-sm font-normal text-grantpicks-black-400">
												USD
											</p>
										</div>
									}
									errorMessage={
										errors.expected_amount?.type === 'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Expected Amount is required
											</p>
										) : undefined
									}
								/>
							</div>
						</div>
						<div className="flex items-center">
							<Checkbox
								label="Open Funding Pool"
								checked={watch().open_funding}
								onChange={(e) => setValue('open_funding', e.target.checked)}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<p className="text-base font-semibold">Allow Applications</p>
							<Switch
								checked={watch().allow_application}
								onChange={async (checked: boolean) => {
									setValue('allow_application', checked)
								}}
								height={22}
								width={42}
								checkedIcon={false}
								uncheckedIcon={false}
								offColor="#DCDCDC"
								onColor="#292929"
								handleDiameter={18}
							/>
						</div>
						{watch('allow_application') && (
							<>
								<div className={`pt-4 mb-6`}>
									<div className="flex space-x-4 mb-2">
										<div className="w-[35%] space-y-1">
											<InputText
												label="Max Participants"
												placeholder="0"
												required
												{...register('max_participants', {
													required: true,
													onChange: (e) => {
														setValue(
															'max_participants',
															parseInt(e.target.value),
														)
													},
												})}
												preffixIcon={
													<Button
														color="transparent"
														isDisabled={watch().max_participants === 0}
														onClick={() =>
															setValue(
																'max_participants',
																watch().max_participants - 1,
															)
														}
													>
														<IconRemove
															size={24}
															className="stroke-grantpicks-black-600"
														/>
													</Button>
												}
												textAlign="center"
												suffixIcon={
													<Button
														color="transparent"
														onClick={() =>
															setValue(
																'max_participants',
																watch().max_participants + 1,
															)
														}
													>
														<IconAdd
															size={24}
															className="fill-grantpicks-black-600"
														/>
													</Button>
												}
											/>
											{errors.max_participants?.type === 'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Max Participants is required
												</p>
											) : undefined}
										</div>
										<div className="w-[65%]">
											<p className="text-base font-semibold text-grantpicks-black-950 mb-2">
												Application Duration{' '}
												<span className="text-grantpicks-red-600 ml-1">*</span>
											</p>
											<Controller
												name="apply_duration"
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
														className="border border-grantpicks-black-200 rounded-xl w-full h-12"
														wrapperClassName="w-full mb-1"
													/>
												)}
											/>
											{errors.apply_duration?.type === 'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Max Particpants is required
												</p>
											) : undefined}
										</div>
									</div>
									<p className="text-xs font-normal text-grantpicks-black-600">
										You must have a minimum of 10 Participants
									</p>
								</div>
								<div className="flex items-center mb-4">
									<Checkbox
										label="Video Required"
										checked={watch().open_funding}
										onChange={(e) =>
											setValue('video_required', e.target.checked)
										}
									/>
								</div>
								<div className="w-full">
									<p className="text-base font-semibold text-grantpicks-black-950 mb-2">
										Voting Duration{' '}
										<span className="text-grantpicks-red-600 ml-1">*</span>
									</p>
									<Controller
										name="voting_duration"
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
												className="border border-grantpicks-black-200 rounded-xl w-full h-12"
												wrapperClassName="w-full mb-1"
											/>
										)}
									/>
									{errors.voting_duration?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Voting duration is required
										</p>
									) : undefined}
								</div>
							</>
						)}
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between w-full">
							<div>
								<p className="text-base font-bold text-grantpicks-black-950">
									Add Projects
								</p>
								<p className="text-sm font-normal text-grantpicks-black-600">
									Add a minimum of 10 projects to participate in the round.
								</p>
							</div>
							<button
								onClick={() => setShowAddProjectsModal(true)}
								className="rounded-full w-10 lg:w-12 h-10 lg:h-12 flex items-center justify-center bg-grantpicks-alpha-50/5 cursor-pointer hover:opacity-70 transition"
							>
								<IconAdd size={24} className="fill-grantpicks-black-400" />
							</button>
						</div>
						<div
							className={clsx(
								`grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4`,
								selectedProjects.length > 0 ? `mt-6` : `mt-0`,
							)}
						>
							{selectedProjects.map((selected, index) => (
								<div
									key={index}
									className="bg-grantpicks-alpha-50/5 p-1 rounded-full flex items-center justify-between"
								>
									<div className="flex items-center space-x-2">
										<div className="bg-grantpicks-black-400 rounded-full w-6 h-6" />
										<p className="text-sm font-semibold text-grantpicks-black-950">
											Label
										</p>
									</div>
									<IconClose
										size={18}
										className="fill-grantpicks-black-600 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...selectedProjects]
											temp.splice(index, 1)
											setSelectedProjects(temp)
										}}
									/>
								</div>
							))}
						</div>
						<AddProjectsModal
							isOpen={showAddProjectsModal}
							onClose={() => setShowAddProjectsModal(false)}
							selectedProjects={selectedProjects}
							setSelectedProjects={setSelectedProjects}
						/>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-6 lg:mb-10">
						<div className="flex items-center justify-between w-full">
							<div>
								<p className="text-base font-bold text-grantpicks-black-950">
									Add admins{' '}
								</p>
								<p className="text-sm font-normal text-grantpicks-black-600">
									Add admins that can help manage rounds{' '}
								</p>
							</div>
							<button
								onClick={() => setShowAddAdminsModal(true)}
								className="rounded-full w-10 lg:w-12 h-10 lg:h-12 flex items-center justify-center bg-grantpicks-alpha-50/5 cursor-pointer hover:opacity-70 transition"
							>
								<IconAdd size={24} className="fill-grantpicks-black-400" />
							</button>
						</div>
						<div
							className={clsx(
								`grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4`,
								selectedAdmins.length > 0 ? `mt-6` : `mt-0`,
							)}
						>
							{selectedAdmins.map((selected, index) => (
								<div
									key={index}
									className="bg-grantpicks-alpha-50/5 p-1 rounded-full flex items-center justify-between"
								>
									<div className="flex items-center space-x-2">
										<div className="bg-grantpicks-black-400 rounded-full w-6 h-6" />
										<p className="text-sm font-semibold text-grantpicks-black-950">
											Label
										</p>
									</div>
									<IconClose
										size={18}
										className="fill-grantpicks-black-600 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...selectedProjects]
											temp.splice(index, 1)
											setSelectedAdmins(temp)
										}}
									/>
								</div>
							))}
						</div>
						<AddAdminsModal
							isOpen={showAddAdminsModal}
							onClose={() => setShowAddAdminsModal(false)}
							selectedProjects={selectedAdmins}
							setSelectedProjects={setSelectedAdmins}
						/>
					</div>

					<Button
						color="black-950"
						className="!py-3"
						isFullWidth
						onClick={() => {}}
					>
						Create Round
					</Button>
				</div>
			</div>
		</CreateRoundLayout>
	)
}

export default CreateRoundPage