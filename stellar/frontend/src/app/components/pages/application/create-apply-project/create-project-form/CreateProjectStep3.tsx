import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconProject from '@/app/components/svgs/IconProject'
import IconTrash from '@/app/components/svgs/IconTrash'
import { CreateProjectStep3Data } from '@/types/form'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import Menu from '@/app/components/commons/Menu'
import IconAdd from '@/app/components/svgs/IconAdd'
import Checkbox from '@/app/components/commons/CheckBox'
import PreviousConfirmationModal from './PreviousConfirmationModal'
import { StrKey } from 'round-client'
import { capitalizeFirstLetter } from '@/utils/helper'
import { GITHUB_URL_REGEX } from '@/constants/regex'

const CreateProjectStep3 = () => {
	const [showContractMenu, setShowContractMenu] = useState<boolean[]>([])
	const [showContactMenu, setShowContactMenu] = useState<boolean[]>([])
	const [showPrevConfirm, setShowPrevConfirm] = useState<boolean>(false)
	const { setStep, step, data, setData } = useCreateProject()
	const [errorGithubUrl, setErrorGithubUrl] = useState<boolean>(false)
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateProjectStep3Data>({
		defaultValues: {
			smart_contracts:
				data.smart_contracts.length > 0
					? data.smart_contracts.map((contract) => ({
							id: '',
							chain: contract.chain || '',
							address: contract.address || '',
						}))
					: [
							{
								id: '',
								chain: '',
								address: '',
							},
						],
			contacts:
				data.contacts.length > 0
					? data.contacts.map((contact) => ({
							id: '',
							platform: contact.platform || '',
							link_url: contact.link_url || '',
						}))
					: [
							{
								id: '',
								platform: '',
								link_url: '',
							},
						],
			github_urls:
				data.github_urls.length > 0
					? data.github_urls.map((url) => ({
							id: '',
							github_url: url || '',
						}))
					: [
							{
								id: '',
								github_url: '',
							},
						],
		},
	})
	const {
		fields: fieldContracts,
		append: appendContract,
		remove: removeContract,
	} = useFieldArray({
		control,
		name: 'smart_contracts',
	})
	const {
		fields: fieldGithubs,
		append: appendGithub,
		remove: removeGithub,
	} = useFieldArray({
		control,
		name: 'github_urls',
	})
	const {
		fields: fieldContacts,
		append: appendContact,
		remove: removeContact,
	} = useFieldArray({
		control,
		name: 'contacts',
	})

	const onNextStep3: SubmitHandler<CreateProjectStep3Data> = (submitData) => {
		setData({
			...data,
			smart_contracts: submitData.smart_contracts,
			is_open_source: submitData.is_open_source,
			github_urls: submitData.github_urls.map((url) => url.github_url),
			contacts: submitData.contacts,
		})
		setStep(4)
	}

	useEffect(() => {
		setShowContractMenu((prev) => [...prev, false])
	}, [])

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
							Step 3 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950">
					Share your project details
				</p>
				<div className="py-4 md:py-6">
					<p className="text-grantpicks-black-950 mb-2">
						Smart Contracts <span className="text-grantpicks-red-600">*</span>
					</p>
					{fieldContracts.map((value, index) => {
						return (
							<div key={index} className="flex flex-col space-y-2">
								<div className="flex items-center space-x-4 mb-2">
									<div className="relative w-[30%]">
										<div
											onClick={() => {
												let temp = [...showContractMenu]
												temp[index] = true
												setShowContractMenu(temp)
											}}
											className="bg-white border border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
										>
											<p className="text-sm font-normal text-grantpicks-black-950">
												{capitalizeFirstLetter(
													watch().smart_contracts[index].chain,
												)}
											</p>
											<IconUnfoldMore
												size={24}
												className="fill-grantpicks-black-400"
											/>
										</div>
										{showContractMenu[index] && (
											<Menu
												isOpen={showContractMenu[index]}
												onClose={() => {
													let temp = [...showContractMenu]
													temp[index] = false
													setShowContractMenu(temp)
												}}
												position="right-0 left-0 -bottom-[150px]"
											>
												<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white">
													<p
														onClick={() => {
															setValue(
																`smart_contracts.${index}.chain`,
																'bitcoin',
															)
															let temp = [...showContractMenu]
															temp[index] = false
															setShowContractMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Bitcoin
													</p>
													<p
														onClick={() => {
															setValue(
																`smart_contracts.${index}.chain`,
																'ethereum',
															)
															let temp = [...showContractMenu]
															temp[index] = false
															setShowContractMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Ethereum
													</p>
													<p
														onClick={() => {
															setValue(
																`smart_contracts.${index}.chain`,
																'stellar',
															)
															let temp = [...showContractMenu]
															temp[index] = false
															setShowContractMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Stellar
													</p>
													<p
														onClick={() => {
															setValue(`smart_contracts.${index}.chain`, 'near')
															let temp = [...showContractMenu]
															temp[index] = false
															setShowContractMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Near
													</p>
												</div>
											</Menu>
										)}
									</div>
									<div className="w-[60%]">
										<InputText
											required
											{...register(`smart_contracts.${index}.address`, {
												required: true,
											})}
										/>
									</div>
									<div className="flex-1 w-[15%]">
										<IconTrash
											size={24}
											className="fill-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
											onClick={() => {
												let temp = [...showContractMenu]
												temp.splice(index, 1)
												setShowContractMenu(temp)
												removeContract(index)
											}}
										/>
									</div>
								</div>
								{errors?.smart_contracts?.[index]?.address?.type ===
								'validate' ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Address is invalid
									</p>
								) : errors.smart_contracts?.[index]?.address?.type ===
								  'required' ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Address is required
									</p>
								) : undefined}
							</div>
						)
					})}
					<div className="mt-2 mb-4 md:mb-6">
						<Button
							color="transparent"
							className="!bg-transparent"
							onClick={() => {
								appendContract({ id: '', chain: '', address: '' })
								setShowContractMenu((prev) => [...prev, false])
							}}
						>
							<div className="flex items-center space-x-2">
								<IconAdd size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Add more contracts
								</p>
							</div>
						</Button>
					</div>

					<div className="flex items-center mb-4">
						<Checkbox
							label="My project is Open Source "
							checked={watch().is_open_source}
							onChange={(e) => setValue('is_open_source', e.target.checked)}
						/>
					</div>

					<p className="text-grantpicks-black-950 mb-2">
						Github <span className="text-grantpicks-red-600">*</span>
					</p>
					{fieldGithubs.map((value, index) => {
						return (
							<div key={index} className="flex items-center space-x-4 mb-2">
								<div className="w-[90%]">
									<InputText
										required
										{...register(`github_urls.${index}.github_url`, {
											required: true,
											validate: (value) => {
												return GITHUB_URL_REGEX.test(value)
											},
										})}
										errorMessage={
											errors?.github_urls?.[index]?.github_url?.type ===
											'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Github is required
												</p>
											) : errors?.github_urls?.[index]?.github_url?.type ===
											  'validate' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Please enter a valid GitHub URL
												</p>
											) : undefined
										}
									/>
								</div>
								<div className="flex-1">
									<IconTrash
										size={24}
										className="fill-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
										onClick={() => {
											removeGithub(index)
										}}
									/>
								</div>
							</div>
						)
					})}
					<div className="mt-2 mb-4 md:mb-6">
						<Button
							color="transparent"
							className="!bg-transparent"
							onClick={() => {
								appendGithub({ id: '', github_url: '' })
							}}
						>
							<div className="flex items-center space-x-2">
								<IconAdd size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Add more repo
								</p>
							</div>
						</Button>
					</div>

					<p className="text-grantpicks-black-950 mb-2">
						Contacts <span className="text-grantpicks-red-600">*</span>
					</p>
					{fieldContacts.map((value, index) => {
						return (
							<div key={index} className="flex flex-col space-y-2">
								<div className="flex items-center space-x-4">
									<div className="relative w-[30%]">
										<div
											onClick={() => {
												let temp = [...showContactMenu]
												temp[index] = true
												setShowContactMenu(temp)
											}}
											className="bg-white border border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition"
										>
											<p className="text-sm font-normal text-grantpicks-black-950">
												{capitalizeFirstLetter(
													watch().contacts[index].platform,
												)}
											</p>
											<IconUnfoldMore
												size={24}
												className="fill-grantpicks-black-400"
											/>
										</div>
										{showContactMenu[index] && (
											<Menu
												isOpen={showContactMenu[index]}
												onClose={() => {
													let temp = [...showContactMenu]
													temp[index] = false
													setShowContactMenu(temp)
												}}
												position="right-0 left-0 -bottom-[150px]"
											>
												<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white">
													<p
														onClick={() => {
															setValue(`contacts.${index}.platform`, 'telegram')
															let temp = [...showContactMenu]
															temp[index] = false
															setShowContactMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Telegram
													</p>
													<p
														onClick={() => {
															setValue(
																`contacts.${index}.platform`,
																'instagram',
															)
															let temp = [...showContactMenu]
															temp[index] = false
															setShowContactMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Instagram
													</p>
													<p
														onClick={() => {
															setValue(`contacts.${index}.platform`, 'twitter')
															let temp = [...showContactMenu]
															temp[index] = false
															setShowContactMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Twitter
													</p>
													<p
														onClick={() => {
															setValue(`contacts.${index}.platform`, 'email')
															let temp = [...showContactMenu]
															temp[index] = false
															setShowContactMenu(temp)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
													>
														Email
													</p>
												</div>
											</Menu>
										)}
									</div>
									<div className="w-[60%]">
										<InputText
											placeholder="t.me/Jameson"
											required
											{...register(`contacts.${index}.link_url`, {
												required: true,
											})}
										/>
									</div>
									<div className="flex-1 w-[15%]">
										<IconTrash
											size={24}
											className="fill-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
											onClick={() => {
												let temp = [...showContactMenu]
												temp.splice(index, 1)
												setShowContactMenu(temp)
												removeContact(index)
											}}
										/>
									</div>
								</div>
								{errors?.contacts?.[index]?.link_url?.type === 'required' ? (
									<p className="text-red-500 text-xs ml-2">
										Contact is required
									</p>
								) : undefined}
							</div>
						)
					})}
					<div className="mt-2">
						<Button
							color="transparent"
							className="!bg-transparent"
							onClick={() => {
								appendContact({ id: '', platform: '', link_url: '' })
								setShowContactMenu((prev) => [...prev, false])
							}}
						>
							<div className="flex items-center space-x-2">
								<IconAdd size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Add more contacts
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
						onClick={handleSubmit(onNextStep3)}
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
					setStep(2)
				}}
				onClose={() => setShowPrevConfirm(false)}
			/>
		</div>
	)
}

export default CreateProjectStep3
