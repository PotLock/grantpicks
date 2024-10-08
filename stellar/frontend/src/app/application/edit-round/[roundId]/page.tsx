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
import {
	CreateRoundData,
	IAdminCreateRound,
	UpdateRoundData,
} from '@/types/form'
import React, { useEffect, useState } from 'react'
import {
	useForm,
	useFieldArray,
	Controller,
	SubmitHandler,
} from 'react-hook-form'
import Switch from 'react-switch'
import DatePicker from 'react-datepicker'
import IconCalendar from '@/app/components/svgs/IconCalendar'
import AddProjectsModal from '@/app/components/pages/create-round/AddProjectsModal'
import IconClose from '@/app/components/svgs/IconClose'
import AddAdminsModal from '@/app/components/pages/create-round/AddAdminsModal'
import clsx from 'clsx'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import {
	addAdminRound,
	addProjectsRound,
	editRound,
	getRoundAdmins,
	getRoundApplications,
	getRoundInfo,
	setAdminsRound,
	UpdateRoundParams,
} from '@/services/on-chain/round'
import { useParams, useRouter } from 'next/navigation'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { IGetRoundApplicationsResponse, Network } from '@/types/on-chain'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	formatStroopToXlm,
	parseToStroop,
	prettyTruncate,
	sleep,
} from '@/utils/helper'
import { LIMIT_SIZE } from '@/constants/query'
import {
	getProject,
	IGetProjectsResponse,
} from '@/services/on-chain/project-registry'
import IconStellar from '@/app/components/svgs/IconStellar'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useModalContext } from '@/app/providers/ModalProvider'
import { IRoundPeriodData } from '@/types/round'

const EditRoundPage = () => {
	const router = useRouter()
	const params = useParams<{ roundId: string }>()
	const { setSuccessUpdateRoundModalProps } = useModalContext()
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { stellarPrice } = useGlobalContext()
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState<string>('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] =
		useState<boolean>(false)
	const { stellarPubKey, stellarKit } = useWallet()
	const [showAddAdminsModal, setShowAddAdminsModal] = useState<boolean>(false)
	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		formState: { errors },
	} = useForm<UpdateRoundData>({
		defaultValues: {
			vote_per_person: 0,
			apply_duration_start: new Date(),
			apply_duration_end: new Date(),
			max_participants: 0,
			voting_duration_start: new Date(),
			voting_duration_end: new Date(),
			use_vault: false,
			is_video_required: false,
		},
	})
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const [selectedProjects, setSelectedProjects] = useState<
		IGetProjectsResponse[]
	>([])
	const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
	const { append: appendProject, remove: removeProject } = useFieldArray({
		control,
		name: 'projects',
	})
	const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
		control,
		name: 'admins',
	})
	const [cooldownPeriodData, setCooldownPeriodData] =
		useState<IRoundPeriodData>({
			selected: 'days',
			isOpen: false,
			period_ms: null,
		})
	const [compliancePeriodData, setCompliancePeriodData] =
		useState<IRoundPeriodData>({
			selected: 'days',
			isOpen: false,
			period_ms: null,
		})

	const onFetchAdmins = async () => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		const res = await getRoundAdmins(
			{ round_id: BigInt(params.roundId) },
			contracts,
		)
		return res
	}

	const onFetchRoundInfo = async () => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		const resRoundInfo = await getRoundInfo(
			{ round_id: BigInt(params.roundId) },
			contracts,
		)
		return resRoundInfo
	}

	const onFetchRoundApplications = async () => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		let resRoundApps: IGetRoundApplicationsResponse[] = []
		let currData: IGetRoundApplicationsResponse[]
		do {
			currData = []
			const currRes = await getRoundApplications(
				{ round_id: BigInt(params.roundId), skip: 0, limit: LIMIT_SIZE },
				contracts,
			)
			resRoundApps = [...resRoundApps, ...currRes]
			currData = currRes
		} while (currData.length >= LIMIT_SIZE)
		return resRoundApps
	}

	const onFetchProjectsByApplication = async (
		roundApps: IGetRoundApplicationsResponse[],
	) => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		console.log('project id from round apps', roundApps)
		let resProjects: IGetProjectsResponse[] = []
		roundApps.forEach(async (app, index) => {
			const currRes = await getProject(
				{ project_id: BigInt(app.project_id) },
				contracts,
			)
			resProjects = [...resProjects, currRes as IGetProjectsResponse]
		})
		return resProjects
	}

	const onFetchDefaultValue = async () => {
		try {
			openPageLoading()
			const resRoundInfo = await onFetchRoundInfo()
			console.log('res round info', resRoundInfo)
			const resRoundAdmins = await onFetchAdmins()
			console.log('res round admins', resRoundAdmins)
			if (resRoundInfo) {
				setValue('title', resRoundInfo?.name)
				setValue('description', resRoundInfo?.description)
				setValue('vote_per_person', resRoundInfo?.num_picks_per_voter)
				setValue('vote_per_person', resRoundInfo?.num_picks_per_voter)
				setValue(
					'amount',
					formatStroopToXlm(resRoundInfo?.current_vault_balance),
				)
				setValue(
					'expected_amount',
					formatStroopToXlm(resRoundInfo?.expected_amount),
				)
				const calculation =
					parseFloat(formatStroopToXlm(resRoundInfo?.expected_amount) || '0') *
					stellarPrice
				setExpectAmountUsd(`${calculation.toFixed(3)}`)
				setValue('use_vault', resRoundInfo.use_vault || false)
				setValue('is_video_required', resRoundInfo.is_video_required || false)
				if (resRoundInfo.compliance_end_ms) {
					setValue(
						'allow_compliance',
						resRoundInfo.compliance_end_ms ? true : false,
					)
					setValue(
						'compliance_end_ms',
						new Date(Number(resRoundInfo.compliance_end_ms)),
					)
					setValue(
						'compliance_period_ms',
						Number(resRoundInfo.compliance_period_ms),
					)
					setValue('compliance_req_desc', resRoundInfo.compliance_req_desc)
				}
				if (resRoundInfo.cooldown_end_ms) {
					setValue(
						'allow_cooldown',
						resRoundInfo.cooldown_end_ms ? true : false,
					)
					setValue(
						'cooldown_end_ms',
						new Date(Number(resRoundInfo.cooldown_end_ms)),
					)
					setValue(
						'cooldown_period_ms',
						Number(resRoundInfo.cooldown_period_ms),
					)
				}
				if (resRoundInfo.allow_remaining_dist) {
					setValue(
						'allow_remaining_dist',
						resRoundInfo.allow_remaining_dist || false,
					)
					setValue(
						'remaining_dist_address',
						resRoundInfo.remaining_dist_address,
					)
				}
				setValue(
					'referrer_fee_basis_points',
					resRoundInfo.referrer_fee_basis_points || 0,
				)
				if (resRoundInfo.contacts.length > 0) {
					setValue('contact_type', resRoundInfo?.contacts[0].name)
					setValue('contact_address', resRoundInfo?.contacts[0].value)
				}
				if (resRoundInfo.allow_applications) {
					setValue('allow_application', true)
					setValue('max_participants', resRoundInfo?.max_participants)
					setValue(
						'apply_duration_start',
						new Date(Number(resRoundInfo.application_start_ms)),
					)
					setValue(
						'apply_duration_end',
						new Date(Number(resRoundInfo.application_end_ms)),
					)
					setValue(
						'voting_duration_start',
						new Date(Number(resRoundInfo.voting_start_ms)),
					)
					setValue(
						'voting_duration_end',
						new Date(Number(resRoundInfo.voting_end_ms)),
					)
					setValue('is_video_required', resRoundInfo?.is_video_required)
				}
				// if (resProjects.length > 0) {
				// 	setValue(`projects`, resProjects)
				// }
				if (resRoundAdmins.length > 0) {
					setSelectedAdmins(resRoundAdmins.map((admin) => admin))
					setValue(
						'admins',
						resRoundAdmins.map((admin) => ({ admin_id: admin })),
					)
				}
				dismissPageLoading()
			}
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	const onAddApprovedProjects = async (roundId: bigint) => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const projects = selectedProjects.map((p) => p.id)
			const txAddProject = await addProjectsRound(
				BigInt(roundId),
				stellarPubKey,
				projects,
				contracts,
			)
			const txHash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txAddProject,
				stellarPubKey,
			)
			return txHash
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	const onSetAdmins = async (roundId: bigint) => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const txAddAdmins = await setAdminsRound(
				{
					round_id: BigInt(roundId),
					round_admin: watch().admins.map((admin) => admin.admin_id),
				},
				contracts,
			)
			const txHash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txAddAdmins,
				stellarPubKey,
			)
			return txHash
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	// const onAddAdmins = async () => {
	// 	try {
	// 		let cmdWallet = new CMDWallet({
	// 			stellarPubKey: stellarPubKey,
	// 		})
	// 		const contracts = new Contracts(
	// 			process.env.NETWORK_ENV as Network,
	// 			cmdWallet,
	// 		)
	// 		// const txAddProject = await addAdminRound(
	// 		// 	BigInt(params.roundId),
	// 		// 	watch().admins.map((p) => p.admin_id),
	// 		// 	contracts,
	// 		// )
	// 		// const txHash = await contracts.signAndSendTx(
	// 		// 	stellarKit as StellarWalletsKit,
	// 		// 	txAddProject,
	// 		// 	stellarPubKey,
	// 		// )
	// 		// return txHash
	// 	} catch (error: any) {
	// 		dismissPageLoading()
	// 		console.log('error', error)
	// 	}
	// }

	const onEditRound: SubmitHandler<UpdateRoundData> = async (data) => {
		try {
			openPageLoading()
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const udpateRoundParams: UpdateRoundParams = {
				name: data.title,
				description: data.description,
				application_start_ms: BigInt(
					data.apply_duration_start?.getTime() as number,
				),
				application_end_ms: BigInt(
					data.apply_duration_end?.getTime() as number,
				),
				contacts: [
					{
						name: data.contact_type,
						value: data.contact_address,
					},
				],
				expected_amount: parseToStroop(data.expected_amount),
				max_participants:
					selectedProjects.length > data.max_participants // TODO: must change "Max Participants" when adding projects
						? selectedProjects.length
						: data.max_participants,
				num_picks_per_voter: data.vote_per_person,
				use_whitelist: false,
				is_video_required: data.is_video_required,
				allow_applications: data.allow_application,
				voting_start_ms: BigInt(
					data.voting_duration_start?.getTime() as number,
				),
				voting_end_ms: BigInt(data.voting_duration_end?.getTime() as number),
				use_vault: data.use_vault,
			}
			console.log('update round params', udpateRoundParams)
			const txUpdateRound = await editRound(
				stellarPubKey,
				BigInt(params.roundId),
				udpateRoundParams,
				contracts,
			)
			console.log('tx update round', txUpdateRound)
			const txHashUpdateRound = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txUpdateRound,
				stellarPubKey,
			)
			console.log('tx hash update round', txUpdateRound)
			if (txHashUpdateRound) {
				let txHashAddProjects
				let txHashAddAdmins
				if (selectedProjects.length > 0) {
					txHashAddProjects = await onAddApprovedProjects(
						txUpdateRound.result.id,
					)
				}
				txHashAddProjects = await onAddApprovedProjects(txUpdateRound.result.id)
				txHashAddAdmins = await onSetAdmins(BigInt(params.roundId))
				setSuccessUpdateRoundModalProps((prev) => ({
					...prev,
					isOpen: true,
					updateRoundRes: txUpdateRound.result,
					txHash: txHashUpdateRound,
				}))
				reset()
				dismissPageLoading()
				router.push(`/application`)
			}
		} catch (error: any) {
			console.error('error', error)
			toast.error(error?.message || 'Something went wrong', {
				style: toastOptions.error.style,
			})
			dismissPageLoading()
		}
	}

	useEffect(() => {
		onFetchDefaultValue()
	}, [])

	return (
		<CreateRoundLayout>
			<TopNav />
			<div className="w-[90%] md:w-[70%] lg:w-[50%] mx-auto">
				<div className="pt-28 md:pt-32 lg:pt-36 pb-16 text-grantpicks-black-950">
					<p className="text-[50px] font-black text-center uppercase mb-8 md:mb-12">
						Edit Round
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
							required
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
										isDisabled={watch().vote_per_person <= 0}
										color="transparent"
										onClick={() => {
											setValue('vote_per_person', watch().vote_per_person - 1)
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
											setValue('vote_per_person', watch().vote_per_person + 1)
										}}
									>
										<IconAdd size={24} className="fill-grantpicks-black-600" />
									</Button>
								</div>
							</div>
							<p className="text-xs font-normal text-grantpicks-black-600">
								You must have a minimum of 1 Vote.
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
										placeholder="Your username..."
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
									disabled={!watch().use_vault}
									label="Amount"
									placeholder="Enter amount..."
									onChange={async (e) => {
										const calculation =
											parseFloat(e.target.value || '0') * stellarPrice
										setAmountUsd(`${calculation.toFixed(3)}`)
										setValue('amount', e.target.value)
									}}
									preffixIcon={
										<IconStellar
											size={24}
											className="fill-grantpicks-black-400"
										/>
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
												parseFloat(e.target.value || '0') * stellarPrice
											setExpectAmountUsd(`${calculation.toFixed(3)}`)
										},
									})}
									preffixIcon={
										<IconStellar
											size={24}
											className="fill-grantpicks-black-400"
										/>
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
								checked={watch().use_vault}
								onChange={(e) => setValue('use_vault', e.target.checked)}
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
												disabled={!watch().allow_application}
												label="Max Participants"
												placeholder="0"
												required
												{...register('max_participants', {
													required: watch().allow_application === true,
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
												name="apply_duration_start"
												control={control}
												rules={{ required: watch().allow_application }}
												render={({ field }) => (
													<DatePicker
														disabled={!watch().allow_application}
														showIcon
														selectsRange={true}
														icon={
															<div className="flex items-center mt-2">
																<IconCalendar
																	size={20}
																	className="fill-grantpicks-black-400"
																/>
															</div>
														}
														calendarIconClassName="flex items-center"
														startDate={field.value as Date}
														endDate={watch().apply_duration_end as Date}
														placeholderText="Apply Duration"
														isClearable={true}
														onChange={(date) => {
															field.onChange(date[0])
															setValue('apply_duration_end', date[1])
														}}
														className="border border-grantpicks-black-200 rounded-xl w-full h-12"
														wrapperClassName="w-full mb-1"
													/>
												)}
											/>
											{errors.apply_duration_start?.type === 'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Start and end apply duration is required
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
										checked={watch().is_video_required}
										onChange={(e) =>
											setValue('is_video_required', e.target.checked)
										}
									/>
								</div>
								<div className="w-full">
									<p className="text-base font-semibold text-grantpicks-black-950 mb-2">
										Voting Duration{' '}
										<span className="text-grantpicks-red-600 ml-1">*</span>
									</p>
									<Controller
										name="voting_duration_start"
										control={control}
										rules={{ required: true }}
										render={({ field }) => (
											<DatePicker
												showIcon
												selectsRange={true}
												icon={
													<div className="flex items-center mt-2">
														<IconCalendar
															size={20}
															className="fill-grantpicks-black-400"
														/>
													</div>
												}
												calendarIconClassName="flex items-center"
												startDate={field.value as Date}
												endDate={watch().voting_duration_end as Date}
												placeholderText="Voting Duration"
												isClearable={true}
												onChange={(date) => {
													field.onChange(date[0])
													setValue('voting_duration_end', date[1])
												}}
												className="border border-grantpicks-black-200 rounded-xl w-full h-12"
												wrapperClassName="w-full mb-1"
											/>
										)}
									/>
									{errors.voting_duration_start?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Start and end voting duration is required
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
											{selected.name}
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
							append={appendProject}
							remove={removeProject}
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
											{prettyTruncate(selected, 10, 'address')}
										</p>
									</div>
									<IconClose
										size={18}
										className="fill-grantpicks-black-600 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...selectedAdmins]
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
							selectedAdmins={selectedAdmins}
							setSelectedAdmins={setSelectedAdmins}
							append={appendAdmin}
							remove={removeAdmin}
						/>
					</div>

					<Button
						color="black-950"
						className="!py-3"
						isFullWidth
						onClick={handleSubmit(onEditRound)}
					>
						Edit Round
					</Button>
				</div>
			</div>
		</CreateRoundLayout>
	)
}

export default EditRoundPage
