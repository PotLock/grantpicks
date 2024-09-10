import Button from '@/app/components/commons/Button'
import Checkbox from '@/app/components/commons/CheckBox'
import InputText from '@/app/components/commons/InputText'
import Menu from '@/app/components/commons/Menu'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconTrash from '@/app/components/svgs/IconTrash'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { DEFAULT_IMAGE_URL } from '@/constants/project'
import { toastOptions } from '@/constants/style'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import {
	IUpdateProjectParams,
	updateProject,
} from '@/services/on-chain/project-registry'
import { CreateProjectStep3Data } from '@/types/form'
import { Network } from '@/types/on-chain'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMyProject } from './MyProjectProvider'
import { StrKey } from 'round-client'
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

interface IContract {
	id: string
	chain: string
	address: string
}

interface IRepo {
	id: string
	github_url: string
}

interface IContact {
	id: string
	platform: string
	link_url: string
}

const MyProjectLinks = () => {
	const { projectData, fetchProjectApplicant } = useMyProject()
	const { stellarPubKey, stellarKit } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const [showContractMenu, setShowContractMenu] = useState<boolean[]>([])
	const [showContactMenu, setShowContactMenu] = useState<boolean[]>([])
	const [currentContract, setCurrentContract] = useState<IContract[]>([])
	const [currentRepo, setCurrentRepo] = useState<IRepo[]>([])
	const [currentContact, setCurrentContact] = useState<IContact[]>([])
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
			is_open_source: true,
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

	const setDefaultData = () => {
		if (projectData) {
			setValue(
				'smart_contracts',
				projectData?.contracts.map((contract: any) => ({
					id: '',
					chain: contract.name,
					address: contract.contract_address,
				})),
			)
			setCurrentContract(
				projectData?.contracts.map((contract: any) => ({
					id: '',
					chain: contract.name,
					address: contract.contract_address,
				})),
			)
			setValue(
				'contacts',
				projectData?.contacts.map((contact: any) => ({
					id: '',
					platform: contact.name,
					link_url: contact.value,
				})),
			)
			setCurrentContact(
				projectData?.contacts.map((contact: any) => ({
					id: '',
					platform: contact.name,
					link_url: contact.value,
				})),
			)
			setValue(
				'github_urls',
				projectData?.repositories.map((repo: any) => ({
					id: '',
					github_url: repo.url,
				})),
			)
			setCurrentRepo(
				projectData?.repositories.map((repo: any) => ({
					id: '',
					github_url: repo.url,
				})),
			)
		}
	}

	const onSaveChanges: SubmitHandler<CreateProjectStep3Data> = async (data) => {
		try {
			openPageLoading()
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const params: IUpdateProjectParams = {
				...projectData,
				name: projectData?.name || '',
				overview: projectData?.overview || '',
				fundings: [],
				contacts: data.contacts.map((c) => ({
					name: c.platform,
					value: c.link_url,
				})),
				contracts: data.smart_contracts.map((contract) => ({
					name: contract.chain,
					contract_address: contract.address,
				})),
				image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
				payout_address: projectData?.payout_address || '',
				repositories:
					data.github_urls.map((repo) => ({
						label: repo.id,
						url: repo.github_url,
					})) || [],
				team_members: projectData?.team_members || [],
				video_url: projectData?.video_url || 'https://video.com/asdfgh',
			}
			const txUpdateProject = await updateProject(
				stellarPubKey,
				projectData?.id as bigint,
				params,
				contracts,
			)
			const txHashUpdateProject = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txUpdateProject.toXDR(),
				stellarPubKey,
			)
			if (txHashUpdateProject) {
				dismissPageLoading()
				setTimeout(async () => {
					await fetchProjectApplicant()
				}, 2000)
				toast.success(`Update project overview is succeed`, {
					style: toastOptions.success.style,
				})
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(`Update project overview is failed`, {
				style: toastOptions.error.style,
			})
			console.log('error to update overview project', error)
		}
	}

	useEffect(() => {
		if (projectData) {
			setDefaultData()
		}
	}, [projectData])

	return (
		<div className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950">
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Links
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
												{watch().smart_contracts[index].chain}
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

					<p className="text-grantpicks-black-950 mb-2">Github</p>
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
												{watch().contacts[index].platform}
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
			<div className="p-3 md:p-5 flex flex-col md:flex-row items-center md:justify-end space-x-0 md:space-x-4 space-y-4 md:space-y-0">
				<div className="w-full lg:w-auto">
					<Button
						color="white"
						isFullWidth
						onClick={() => setDefaultData()}
						className="!py-3 !border !border-grantpicks-black-400"
						isDisabled={
							JSON.stringify(watch().smart_contracts) ===
								JSON.stringify(currentContract) &&
							JSON.stringify(watch().github_urls) ===
								JSON.stringify(currentRepo) &&
							JSON.stringify(watch().contacts) ===
								JSON.stringify(currentContact)
						}
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3 disabled:cursor-not-allowed"
						isDisabled={
							JSON.stringify(watch().smart_contracts) ===
								JSON.stringify(currentContract) &&
							JSON.stringify(watch().github_urls) ===
								JSON.stringify(currentRepo) &&
							JSON.stringify(watch().contacts) ===
								JSON.stringify(currentContact)
						}
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectLinks
