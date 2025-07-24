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
import { StrKey } from 'round-client'
import { capitalizeFirstLetter } from '@/utils/helper'
import {
	BITCOIN_ADDRESS_REGEX,
	EMAIL_VALIDATION_REGEX,
	ETHEREUM_ADDRESS_REGEX,
	GITHUB_URL_REGEX,
	INSTAGRAM_USERNAME_REGEX,
	NEAR_ADDRESS_REGEX,
	TELEGRAM_USERNAME_REGEX,
	TWITTER_USERNAME_REGEX,
} from '@/constants/regex'
import { localStorageConfigs } from '@/configs/local-storage'

const CreateProjectStep3 = () => {
	const [showContractMenu, setShowContractMenu] = useState<boolean[]>([])
	const [showContactMenu, setShowContactMenu] = useState<boolean[]>([])
	const { setStep, data, setData } = useCreateProject()
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateProjectStep3Data>({
		mode: 'onChange',
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

	useEffect(() => {
		const draftData = localStorage.getItem(
			localStorageConfigs.CREATE_PROJECT_STEP_3,
		)
		if (draftData) {
			const draft = JSON.parse(draftData)
			setValue('smart_contracts', draft.smart_contracts)
			setValue('is_open_source', draft.is_open_source)
			setValue('github_urls', draft.github_urls)
			setValue('contacts', draft.contacts)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const storeData = { ...watch() }
		localStorage.setItem(
			localStorageConfigs.CREATE_PROJECT_STEP_3,
			JSON.stringify(storeData),
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch()])

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
					<p className="text-grantpicks-black-950 mb-2">Smart Contracts</p>
					{fieldContracts.map((value, index) => {
						return (
							<div key={index} className="flex flex-col mb-2">
								<div className="flex items-center space-x-4 mb-1">
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
											disabled={watch().smart_contracts[index].chain === ''}
											{...register(`smart_contracts.${index}.address`, {
												validate: (value) =>
													watch().smart_contracts[index].chain === 'bitcoin'
														? BITCOIN_ADDRESS_REGEX(value)
														: watch().smart_contracts[index].chain ===
															'ethereum'
															? ETHEREUM_ADDRESS_REGEX(value)
															: watch().smart_contracts[index].chain ===
																'stellar'
																? StrKey.isValidEd25519PublicKey(value)
																: watch().smart_contracts[index].chain ===
																	'near'
																	? NEAR_ADDRESS_REGEX(value)
																	: true,
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
									<p className="text-red-500 text-xs ml-2">
										Address is invalid
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

					<p className="text-grantpicks-black-950 mb-2">Github Repo(s)</p>
					{fieldGithubs.map((value, index) => {
						return (
							<div key={index} className="flex items-center space-x-4 mb-2">
								<div className="w-[90%]">
									<InputText
										{...register(`github_urls.${index}.github_url`, {
											validate: (value) => {
												return watch().github_urls[index].github_url !== ''
													? GITHUB_URL_REGEX.test(value)
													: true
											},
										})}
										errorMessage={
											errors?.github_urls?.[index]?.github_url?.type ===
												'validate' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Please enter a valid GitHub Repository URL
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

					<p className="text-grantpicks-black-950 mb-2">Contacts</p>
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
											disabled={watch().contacts[index].platform === ''}
											placeholder={
												watch().contacts[index].platform === 'email'
													? 'jameson@gmail.com'
													: 'jameson'
											}
											{...register(`contacts.${index}.link_url`, {
												pattern: {
													value:
														watch().contacts[index].platform === 'telegram'
															? TELEGRAM_USERNAME_REGEX
															: watch().contacts[index].platform === 'instagram'
																? INSTAGRAM_USERNAME_REGEX
																: watch().contacts[index].platform === 'twitter'
																	? TWITTER_USERNAME_REGEX
																	: EMAIL_VALIDATION_REGEX,
													message:
														watch().contacts[index].platform === 'telegram'
															? 'Telegram address is not valid'
															: watch().contacts[index].platform === 'instagram'
																? 'Instagram address is not valid'
																: watch().contacts[index].platform === 'twitter'
																	? 'Twitter address is not valid'
																	: 'Email address is not valid',
												},
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
								{errors?.contacts?.[index]?.link_url && (
									<p className="text-red-500 text-xs mt-1 ml-2">
										{errors?.contacts?.[index]?.link_url.message}
									</p>
								)}
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
						onClick={() => setStep(2)}
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
		</div>
	)
}

export default CreateProjectStep3
