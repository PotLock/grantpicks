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
import { CreateRoundData } from '@/types/form'
import React, { ChangeEvent, useEffect, useState } from 'react'
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
import { IGetProjectsResponse } from '@/services/stellar/project-registry'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	addProjectsRound,
	createRound,
	CreateRoundParams,
	depositFundRound,
	getLists,
} from '@/services/stellar/round'
import { parseToStroop, prettyTruncate, sleep } from '@/utils/helper'
import { useModalContext } from '@/app/providers/ModalProvider'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import IconStellar from '@/app/components/svgs/IconStellar'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { useRouter } from 'next/navigation'
import { PERIODS } from '@/constants/round'
import { IRoundPeriodData } from '@/types/round'
import { subDays } from 'date-fns'
import { StrKey } from 'round-client'
import IconInfoCircle from '@/app/components/svgs/IconInfoCircle'
import { Tooltip } from 'react-tooltip'
import {
	EMAIL_VALIDATION_REGEX,
	INSTAGRAM_USERNAME_REGEX,
	NEAR_ADDRESS_REGEX,
	TELEGRAM_USERNAME_REGEX,
	TWITTER_USERNAME_REGEX,
} from '@/constants/regex'
import useAppStorage from '@/stores/zustand/useAppStorage'
import Image from 'next/image'
import { usePotlockService } from '@/services/potlock'
import { NearCreateRoundParams } from '@/services/near/type'
import IconLoading from '@/app/components/svgs/IconLoading'
import IconExpandLess from '@/app/components/svgs/IconExpandLess'
import IconExpandMore from '@/app/components/svgs/IconExpandMore'
import InfiniteScroll from 'react-infinite-scroll-component'
import { IGetListExternalResponse } from '@/types/on-chain'
import { LIMIT_SIZE, LIMIT_SIZE_CONTRACT } from '@/constants/query'
import useSWRInfinite from 'swr/infinite'

const CreateRoundPage = () => {
	const router = useRouter()
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { nearPrice, stellarPrice, openPageLoading, dismissPageLoading } =
		useGlobalContext()
	const { stellarPubKey, stellarKit, nearWallet, nearAccounts } = useWallet()
	const { setSuccessCreateRoundModalProps } = useModalContext()
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState<string>('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] =
		useState<boolean>(false)
	const [showAddAdminsModal, setShowAddAdminsModal] = useState<boolean>(false)
	const [isMobile, setIsMobile] = useState(false)
	const potlockService = usePotlockService()
	const [showLists, setShowLists] = useState<boolean>(true)
	const [checkedListIds, setCheckedListIds] = useState<bigint[]>([])
	const {
		control,
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		trigger,
		formState: { errors },
	} = useForm<CreateRoundData>({
		mode: 'onChange',
		defaultValues: {
			vote_per_person: 1,
			apply_duration_start: undefined,
			apply_duration_end: undefined,
			compliance_period_ms: undefined,
			compliance_end_ms: undefined,
			cooldown_period_ms: undefined,
			cooldown_end_ms: undefined,
			max_participants: 10,
			voting_duration_start: null,
			voting_duration_end: null,
			use_vault: false,
			is_video_required: false,
			allow_application: false,
			compliance_req_desc: '',
		},
	})
	const { append: appendProject, remove: removeProject } = useFieldArray({
		control,
		name: 'projects',
	})
	const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
		control,
		name: 'admins',
	})
	const [selectedProjects, setSelectedProjects] = useState<
		IGetProjectsResponse[]
	>([])
	const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
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
	const storage = useAppStorage()

	const onAddApprovedProjects = async (roundId: bigint) => {
		if (storage.chainId === 'stellar') {
			try {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const projects = selectedProjects.map((p) => p.id)
				const txAddProject = await addProjectsRound(
					BigInt(roundId),
					stellarPubKey,
					projects,
					contracts,
				)
				const txHash = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txAddProject.toXDR(),
					stellarPubKey,
				)
				return txHash
			} catch (error: any) {
				dismissPageLoading()
				console.log('error', error)
			}
		}
	}

	const onInitialDeposit = async (roundId: bigint) => {
		if (storage.chainId === 'stellar') {
			try {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const txAddProject = await depositFundRound(
					{
						caller: stellarPubKey,
						round_id: roundId,
						amount: BigInt(parseToStroop(watch().amount)),
						memo: '',
						referrer_id: undefined,
					},
					contracts,
				)
				const txHash = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txAddProject.toXDR(),
					stellarPubKey,
				)
				return txHash
			} catch (error: any) {
				dismissPageLoading()
				console.log('error', error)
			}
		}
	}

	const onCreateRound: SubmitHandler<CreateRoundData> = async (data) => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const maxParticipants =
					data.max_participants < 10 ? 10 : data.max_participants
				const createRoundParams: CreateRoundParams = {
					owner: stellarPubKey,
					name: data.title,
					description: data.description,
					application_start_ms: data.apply_duration_start
						? BigInt(data.apply_duration_start?.getTime() as number)
						: undefined,
					application_end_ms: data.apply_duration_end
						? BigInt(data.apply_duration_end?.getTime() as number)
						: undefined,
					contacts: [
						{
							name: data.contact_type,
							value: data.contact_address,
						},
					],
					expected_amount: parseToStroop(data.expected_amount),
					max_participants:
						selectedProjects.length > maxParticipants // TODO: must change "Max Participants" when adding projects
							? selectedProjects.length
							: maxParticipants,
					num_picks_per_voter:
						data.vote_per_person < 1 ? 1 : data.vote_per_person,
					use_whitelist: checkedListIds.length > 0,
					wl_list_id: checkedListIds.length > 0 ? checkedListIds[0] : undefined,
					is_video_required: data.is_video_required,
					allow_applications: data.allow_application,
					use_vault: data.use_vault,
					voting_start_ms: BigInt(
						data.voting_duration_start?.getTime() as number,
					),
					voting_end_ms: BigInt(data.voting_duration_end?.getTime() as number),
					admins:
						data.admins?.length > 0
							? data.admins.map((admin) => admin.admin_id)
							: [],
					allow_remaining_dist: data.allow_remaining_dist,
					compliance_req_desc: data.compliance_req_desc,
					compliance_period_ms: data.compliance_period_ms
						? BigInt(data.compliance_period_ms as number)
						: undefined,
					cooldown_period_ms: data.cooldown_period_ms
						? BigInt(data.cooldown_period_ms as number)
						: undefined,
					remaining_dist_address:
						data.remaining_dist_address || storage.my_address || '',
					referrer_fee_basis_points: 0,
				}
				console.log('debug params', createRoundParams)
				const txCreateRound = await createRound(
					stellarPubKey,
					createRoundParams,
					contracts,
				)
				const txHashCreateRound = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txCreateRound.toXDR(),
					stellarPubKey,
				)
				if (txHashCreateRound) {
					let txHashAddProjects, txHashInitialDeposit
					if (selectedProjects.length > 0) {
						txHashAddProjects = await onAddApprovedProjects(
							txCreateRound.result.id,
						)
					}
					if (watch().amount && watch().amount !== '0') {
						txHashInitialDeposit = await onInitialDeposit(
							txCreateRound.result.id,
						)
					}

					let round = null

					while (!round) {
						try {
							round = await potlockService.getRound(
								Number(txCreateRound.result.id),
							)
						} catch (e) {
							console.error(e)
						}
						await sleep(3000)
					}

					setSuccessCreateRoundModalProps((prev) => ({
						...prev,
						isOpen: true,
						createRoundRes: round,
						txHash: txHashCreateRound,
					}))
					reset()
					dismissPageLoading()
					router.push(`/application`)
				}
			} else {
				const params: NearCreateRoundParams = {
					owner: storage.my_address || '',
					admins: selectedAdmins,
					name: data.title,
					description: data.description,
					allow_applications: data.allow_application,
					application_end_ms: data.allow_application
						? data.apply_duration_end?.getTime()
						: undefined,
					application_requires_video: data.is_video_required,
					application_start_ms: data.allow_application
						? data.apply_duration_start?.getTime()
						: undefined,
					expected_amount: data.expected_amount,
					contacts: [
						{
							name: data.contact_type,
							value: data.contact_address,
						},
					],
					compliance_period_ms: parseInt(
						data.compliance_period_ms?.toString() || '0',
					),
					compliance_requirement_description: data.compliance_req_desc,
					cooldown_period_ms: parseInt(
						data.cooldown_period_ms?.toString() || '0',
					),
					use_cooldown: data.allow_cooldown || false,
					use_compliance: data.allow_compliance || false,
					use_referrals: false,
					referrer_fee_basis_points: 0,
					use_whitelist: false,
					voting_end_ms: data.voting_duration_end?.getTime() || 0,
					voting_start_ms: data.voting_duration_start?.getTime() || 0,
					num_picks_per_voter: data.vote_per_person,
					max_participants: data.max_participants,
					allow_remaining_funds_redistribution:
						data.allow_remaining_dist || false,
					remaining_funds_redistribution_recipient: data.allow_remaining_dist
						? data.remaining_dist_address
						: undefined,
				}

				if (!nearWallet) {
					return
				}

				const nearContracts = storage.getNearContracts(nearWallet)
				console.log('nearContracts', nearContracts)
				const txNearCreateRound = await nearContracts?.round.createRound(params)

				console.log('txNearCreateRound', txNearCreateRound)

				//TODO: handle & test after BE indexed by prometheus

				reset()
				dismissPageLoading()
				router.push(`/application`)
			}
		} catch (error: any) {
			console.error(error)
			toast.error(error?.message || 'Something went wrong', {
				style: toastOptions.error.style,
			})
			dismissPageLoading()
		}
	}

	useEffect(() => {
		const handleKeyDown = (ev: KeyboardEvent) => {
			if (ev.code === 'Escape') {
				setCooldownPeriodData({ ...cooldownPeriodData, isOpen: false })
				setCompliancePeriodData({ ...compliancePeriodData, isOpen: false })
			}
		}
		window.addEventListener('keydown', handleKeyDown)

		return () => {
			window.removeEventListener('keydown', handleKeyDown)
		}
	}, [])

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 425)
		}

		checkIfMobile()
		window.addEventListener('resize', checkIfMobile)

		return () => window.removeEventListener('resize', checkIfMobile)
	}, [])

	const onFetchLists = async (key: {
		url: string
		skip: number
		limit: number
	}) => {
		if (storage.chainId === 'stellar') {
			let contracts = storage.getStellarContracts()
			if (!contracts) {
				return []
			}
			const res = await getLists(
				{ skip: key.skip, limit: key.limit },
				contracts,
			)
			return res
		} else {
			let contracts = storage.getNearContracts(nearWallet)
			if (!contracts) {
				return []
			}
			const res = await contracts?.round.getListsNear(
				key.skip * LIMIT_SIZE_CONTRACT,
				LIMIT_SIZE_CONTRACT,
			)
			return res
		}
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetListExternalResponse[],
	) => {
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-lists`,
			skip: pageIndex,
			limit: LIMIT_SIZE,
			chain: storage.chainId,
		}
	}
	const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(
		getKey,
		async (key) => await onFetchLists(key),
		{
			revalidateFirstPage: false,
		},
	)

	const lists = data
		? ([] as IGetListExternalResponse[]).concat(
				...(data as any as IGetListExternalResponse[]),
			)
		: []
	const hasMore = data ? data.length >= LIMIT_SIZE : false

	const isOwner = (listOwnerId: string): boolean => {
		return (stellarPubKey || nearAccounts[0]?.accountId) === listOwnerId
	}

	const isAdmin = (adminIds: string[]): boolean => {
		return adminIds.includes(stellarPubKey || nearAccounts[0]?.accountId)
	}

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
										minDate={subDays(watch().apply_duration_end as Date, 1)}
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
											setValue('voting_duration_end', date[1], {
												shouldValidate: true,
											})
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
							<Controller
								name="voting_duration_end"
								control={control}
								rules={{
									validate: {
										validEndDate: (value) => {
											const currentDate = new Date()
											return (value && value >= currentDate) || false
										},
									},
								}}
								render={() => <></>}
							/>
							{watch('voting_duration_end') &&
								errors.voting_duration_end?.type === 'validEndDate' && (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Voting end date cannot be in the past
									</p>
								)}
						</div>
						<div className="space-y-2">
							<div className="border border-grantpicks-black-200 rounded-xl py-2 px-3 flex items-center justify-between">
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Votes per person
									<span className="text-grantpicks-red-600 ml-1">*</span>
								</p>
								<div className="flex items-center space-x-4">
									<Button
										isDisabled={watch().vote_per_person <= 1}
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
										{watch().vote_per_person || 1}
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
														trigger('contact_address')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Telegram
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Instagram')
														trigger('contact_address')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Instagram
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Twitter')
														trigger('contact_address')
														setShowContactType(false)
													}}
													className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition"
												>
													Twitter
												</p>
												<p
													onClick={() => {
														setValue('contact_type', 'Email')
														trigger('contact_address')
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
										disabled={!watch('contact_type')}
										required
										placeholder="Your username..."
										{...register('contact_address', {
											required: true,
											validate: (value) => {
												const contactType = watch('contact_type')
												if (!value) return true
												if (contactType === 'Telegram') {
													return (
														TELEGRAM_USERNAME_REGEX.test(value) ||
														'Telegram address is not valid'
													)
												}
												if (contactType === 'Instagram') {
													return (
														INSTAGRAM_USERNAME_REGEX.test(value) ||
														'Instagram address is not valid'
													)
												}
												if (contactType === 'Twitter') {
													return (
														TWITTER_USERNAME_REGEX.test(value) ||
														'Twitter address is not valid'
													)
												}
												if (contactType === 'Email') {
													return (
														EMAIL_VALIDATION_REGEX.test(value) ||
														'Email address is not valid'
													)
												}
												return true
											},
										})}
									/>
								</div>
							</div>
							{errors.contact_address?.type === 'required' && (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Contact address is required
								</p>
							)}
							{errors.contact_address && (
								<p className="text-red-500 text-xs mt-1 ml-2">
									{errors.contact_address.message}
								</p>
							)}
							<p className="text-xs font-normal text-grantpicks-black-600">
								Leave an address where people can reach out to you.{' '}
							</p>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-start space-x-4 w-full mb-4">
							<div className="flex-1">
								<InputText
									type="number"
									disabled={!watch().use_vault}
									label="Initial Deposit"
									placeholder={isMobile ? '' : 'Enter amount...'}
									{...register('amount', {
										onChange: async (e) => {
											let calculation = 0

											if (storage.chainId === 'stellar') {
												calculation =
													parseFloat(e.target.value || '0') * stellarPrice
											} else {
												calculation =
													parseFloat(e.target.value || '0') * nearPrice
											}

											setAmountUsd(`${calculation.toFixed(3)}`)
											setValue('amount', e.target.value)
										},
									})}
									preffixIcon={
										storage.chainId === 'stellar' ? (
											<IconStellar
												size={24}
												className="fill-grantpicks-black-400"
											/>
										) : (
											<IconNear
												size={24}
												className="fill-grantpicks-black-400"
											/>
										)
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
									errorMessage={
										parseFloat(watch().amount) <= 0 ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Initial deposit cannot be less than or equal to 0
											</p>
										) : undefined
									}
								/>
							</div>
							<div className="flex-1">
								<InputText
									type="number"
									label="Expected Amount"
									required
									placeholder={isMobile ? '' : 'Enter amount...'}
									{...register('expected_amount', {
										required: true,
										onChange: async (e) => {
											const calculation =
												parseFloat(e.target.value || '0') * stellarPrice
											setExpectAmountUsd(`${calculation.toFixed(3)}`)
										},
									})}
									preffixIcon={
										storage.chainId === 'stellar' ? (
											<IconStellar
												size={24}
												className="fill-grantpicks-black-400"
											/>
										) : (
											<IconNear
												size={24}
												className="fill-grantpicks-black-400"
											/>
										)
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
										) : parseFloat(watch().expected_amount) <
										  parseFloat(watch().amount) ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Expected Amount should not be less than intiial deposit
											</p>
										) : parseFloat(watch().expected_amount) <= 0 ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Expected Amount cannot be less than or equal to 0
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
								onChange={(e) => {
									setValue('use_vault', e.target.checked)
									setValue('amount', '')
								}}
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
						<div className={`pt-4 mb-6`}>
							<div className="flex space-x-4 mb-2">
								<div className="w-[35%] space-y-1">
									<InputText
										type="number"
										disabled={!watch().allow_application}
										label="Max Participants"
										placeholder="10"
										required={watch().allow_application}
										{...register('max_participants', {
											required: watch().allow_application === true,
											onChange: (e) => {
												setValue(
													'max_participants',
													parseInt(e.target.value) || 0,
												)
											},
										})}
										preffixIcon={
											<Button
												color="transparent"
												isDisabled={watch().max_participants <= 10}
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
												isDisabled={!watch().allow_application}
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
									) : watch().max_participants < 10 ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Min. 10 Participants
										</p>
									) : undefined}
								</div>
								<div className="w-[65%]">
									<p
										className={clsx(
											`text-sm font-semibold mb-2`,
											!watch().allow_application
												? `text-grantpicks-black-300`
												: `text-grantpicks-black-950`,
										)}
									>
										Application Duration{' '}
										{watch().allow_application && (
											<span className="text-grantpicks-red-600 ml-1">*</span>
										)}
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
												maxDate={subDays(
													watch().voting_duration_start as Date,
													0,
												)}
												icon={
													<div className="flex items-center mt-2 pr-2">
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
											start and end of apply duration is required
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
								disabled={!watch().allow_application}
								label="Video Required"
								checked={watch().is_video_required}
								onChange={(e) =>
									setValue('is_video_required', e.target.checked)
								}
								className={clsx(
									!watch().allow_application && '!cursor-not-allowed',
								)}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<div className="flex items-center space-x-2">
								<p className="text-base font-semibold">Cooldown</p>
								<a
									data-tooltip-id="require_cooldown_tooltip"
									data-tooltip-html="Interval after voting period ends to payout period"
								>
									<IconInfoCircle
										size={16}
										className="stroke-grantpicks-black-600"
									/>
								</a>
								<Tooltip id="require_cooldown_tooltip" place="right" />
							</div>
							<Switch
								checked={watch().allow_cooldown}
								onChange={async (checked: boolean) => {
									setValue('allow_cooldown', checked)
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
						<div className={`pt-4 mb-6`}>
							<InputText
								type="number"
								disabled={!watch().allow_cooldown}
								label="Set Deadline"
								placeholder="0"
								required={watch().allow_cooldown}
								{...register('cooldown_end_ms', {
									required: watch().allow_cooldown === true,
									onChange: (ev: ChangeEvent<HTMLInputElement>) => {
										setCooldownPeriodData({
											...cooldownPeriodData,
											period_ms:
												parseInt(ev.target.value) *
												(compliancePeriodData.selected === 'days'
													? 1000 * 60 * 60 * 24
													: compliancePeriodData.selected === 'weeks'
														? 1000 * 60 * 60 * 24 * 7
														: 1000 * 60 * 60 * 24 * 7 * 30),
										})
									},
								})}
								suffixIcon={
									<div className="relative">
										<div
											onClick={() =>
												setCooldownPeriodData({
													...cooldownPeriodData,
													isOpen: !cooldownPeriodData.isOpen,
												})
											}
											className="border-l pl-4 border-black/10 cursor-pointer flex items-center space-x-2"
										>
											<p className="text-sm font-normal text-grantpicks-black-600">
												{cooldownPeriodData.selected}
											</p>
											<IconUnfoldMore
												size={24}
												className="fill-grantpicks-black-400"
											/>
										</div>
										{cooldownPeriodData.isOpen && (
											<div className="border bg-white border-black/10 rounded-xl absolute top-8 right-0 w-24">
												{PERIODS.map((period, index) => (
													<div
														key={index}
														className="p-2 text-xs font-normal text-gray-950 cursor-pointer hover:opacity-70"
														onClick={() =>
															setCooldownPeriodData({
																...cooldownPeriodData,
																selected: period,
																isOpen: false,
															})
														}
													>
														{period}
													</div>
												))}
											</div>
										)}
									</div>
								}
								errorMessage={
									errors.cooldown_end_ms?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Cooldown deadline is required
										</p>
									) : (watch().cooldown_end_ms as unknown as number) < 0 ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Cooldown deadline cannot be less than 0
										</p>
									) : undefined
								}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<div className="flex items-center space-x-2 z-10">
								<p className="text-base font-semibold">Require Compliance</p>
								<a
									data-tooltip-id="require_compliance_tooltip"
									data-tooltip-html="This requires grantees to do KYC process. That means that projects must KYC <br/>an account with Potlock KYC partner and if they don't after the compliance period <br/>all their earned funds will be sent to the funds remaining address"
								>
									<IconInfoCircle
										size={16}
										className="stroke-grantpicks-black-600"
									/>
								</a>
								<Tooltip id="require_compliance_tooltip" place="right" />
							</div>
							<Switch
								checked={watch().allow_compliance}
								onChange={async (checked: boolean) => {
									setValue('allow_compliance', checked)
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
						<div className={`pt-4 mb-6`}>
							<InputTextArea
								required={watch().allow_compliance}
								disabled={!watch().allow_compliance}
								label="Description"
								{...register('compliance_req_desc', {
									required: watch().allow_compliance === true,
								})}
								errorMessage={
									errors.compliance_req_desc?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Compliance description is required
										</p>
									) : undefined
								}
							/>
							<InputText
								type="number"
								disabled={!watch().allow_compliance}
								label="Set Deadline"
								placeholder="0"
								required={watch().allow_compliance}
								{...register('compliance_period_ms', {
									required: watch().allow_compliance === true,
									onChange: (ev: ChangeEvent<HTMLInputElement>) => {
										setCompliancePeriodData({
											...compliancePeriodData,
											period_ms:
												parseInt(ev.target.value) *
												(compliancePeriodData.selected === 'days'
													? 1000 * 60 * 60 * 24
													: compliancePeriodData.selected === 'weeks'
														? 1000 * 60 * 60 * 24 * 7
														: 1000 * 60 * 60 * 24 * 7 * 30),
										})
									},
								})}
								suffixIcon={
									<div className="relative">
										<div
											onClick={() =>
												setCompliancePeriodData({
													...compliancePeriodData,
													isOpen: !compliancePeriodData.isOpen,
												})
											}
											className="border-l pl-4 border-black/10 cursor-pointer flex items-center space-x-2"
										>
											<p className="text-sm font-normal text-grantpicks-black-600">
												{compliancePeriodData.selected}
											</p>
											<IconUnfoldMore
												size={24}
												className="fill-grantpicks-black-400"
											/>
										</div>
										{compliancePeriodData.isOpen && (
											<div className="border bg-white border-black/10 rounded-xl absolute top-8 right-0 w-24">
												{PERIODS.map((period, index) => (
													<div
														key={index}
														className="p-2 text-xs font-normal text-gray-950 cursor-pointer hover:opacity-70"
														onClick={() =>
															setCompliancePeriodData({
																...compliancePeriodData,
																selected: period,
																isOpen: false,
															})
														}
													>
														{period}
													</div>
												))}
											</div>
										)}
									</div>
								}
								errorMessage={
									errors.compliance_period_ms?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Compliance deadline is required
										</p>
									) : (watch().compliance_period_ms as unknown as number) <
									  0 ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Compliance deadline cannot be less than 0
										</p>
									) : undefined
								}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<div className="flex items-center space-x-2 z-10">
								<p className="text-base font-semibold">
									Remaining Funds Redistribution
								</p>
								<a
									data-tooltip-id="remaining_funds_tooltip"
									data-tooltip-html="Remaining funds for those who haven't done their compliance<br />check get sent to this address after compliance period is over"
								>
									<IconInfoCircle
										size={16}
										className="stroke-grantpicks-black-600"
									/>
								</a>
								<Tooltip id="remaining_funds_tooltip" place="right" />
							</div>
							<Switch
								checked={watch().allow_remaining_dist}
								onChange={async (checked: boolean) => {
									setValue('allow_remaining_dist', checked)
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
						<div className={`pt-4 mb-6`}>
							<InputText
								disabled={!watch().allow_remaining_dist}
								label="Recipient Address"
								placeholder="Address..."
								required={watch().allow_remaining_dist}
								{...register('remaining_dist_address', {
									required: watch().allow_remaining_dist === true,
									validate: (value, formValues) => {
										if (watch().allow_remaining_dist) {
											if (storage.chainId === 'stellar') {
												return StrKey.isValidEd25519PublicKey(value)
											} else {
												return NEAR_ADDRESS_REGEX(value)
											}
										} else {
											return true
										}
									},
								})}
								errorMessage={
									errors.remaining_dist_address?.type === 'validate' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Address is invalid
										</p>
									) : undefined
								}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between w-full">
							<div>
								<p className="text-base font-bold text-grantpicks-black-950">
									Add Projects
								</p>
								<p className="text-sm font-normal text-grantpicks-black-600">
									Add a maximum of 10 projects to participate in the round.
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
										<Image
											src="/assets/images/ava-1.png"
											alt=""
											className="rounded-full object-fill"
											width={24}
											height={24}
										/>
										<p className="text-sm font-semibold text-grantpicks-black-950">
											{prettyTruncate(selected.name, 15, 'address')}
										</p>
									</div>
									<IconClose
										size={18}
										className="fill-grantpicks-black-600 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...selectedProjects]
											temp.splice(index, 1)
											setSelectedProjects(temp)
											removeProject(index)
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

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
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
										<Image
											src={`https://www.tapback.co/api/avatar/${selected}`}
											alt="admin"
											width={24}
											height={24}
										/>
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
											removeAdmin(index)
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

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<p className="text-base font-semibold">Voter Requirements</p>
						</div>
						<div>
							<button
								onClick={() => {
									setShowLists(!showLists)
								}}
								className="flex justify-between w-full items-center py-[14px]"
							>
								<p className="font-semibold text-sm text-grantpicks-black-950">
									List
								</p>
								{showLists ? (
									<IconExpandLess
										size={24}
										className="stroke-grantpicks-black-400"
									/>
								) : (
									<IconExpandMore
										size={24}
										className="stroke-grantpicks-black-400"
									/>
								)}
							</button>
							{showLists && (
								<div className="max-h-[522px] overflow-scroll">
									<InfiniteScroll
										dataLength={lists.length}
										next={() => !isValidating && setSize(size + 1)}
										hasMore={hasMore}
										style={{ display: 'flex', flexDirection: 'column' }}
										loader={
											<div className="my-2 flex items-center justify-center">
												<IconLoading
													size={24}
													className="fill-grantpicks-black-600"
												/>
											</div>
										}
									>
										{isLoading ? (
											<div className="h-52 flex items-center justify-center w-full">
												<IconLoading
													size={40}
													className="fill-grantpicks-black-600"
												/>
											</div>
										) : lists.length === 0 ? (
											<div>
												<p className="text-base font-bold text-grantpicks-black-950 text-center">
													There are no Lists Contract yet.
												</p>
											</div>
										) : (
											<div>
												{lists?.map((list) => {
													return (
														<div
															key={list.id}
															className="py-4 flex items-center gap-x-4"
														>
															<Checkbox
																checked={checkedListIds.includes(list.id)}
																onChange={(e) => {
																	if (e.target.checked) {
																		setCheckedListIds([list.id])
																	} else {
																		setCheckedListIds(
																			checkedListIds.filter(
																				(id) => id !== list.id,
																			),
																		)
																	}
																}}
																name="wl_list_id"
																value={list.id.toString()}
															/>
															<div className="flex justify-between w-full items-center">
																<div className="flex gap-x-3 items-center">
																	<Image
																		src="/assets/images/default-list-image.png"
																		alt="list"
																		width={72}
																		height={46}
																	/>
																	<div className="grid gap-y-1">
																		<p className="font-semibold text-sm text-grantpicks-black-950">
																			{list.name}
																		</p>
																		<p className="text-sm text-grantpicks-black-700">
																			{list.total_registrations_count.toString()}{' '}
																			Voters
																		</p>
																	</div>
																</div>
																<div className="flex gap-x-1">
																	{isOwner(list.owner) && (
																		<div className="px-3 py-[2px] bg-grantpicks-black-950 rounded-full">
																			<p className="font-semibold text-xs text-white">
																				Owner
																			</p>
																		</div>
																	)}
																	{isAdmin(list.admins) && (
																		<div className="px-3 py-[2px] bg-grantpicks-black-100 rounded-full">
																			<p className="font-semibold text-xs text-grantpicks-black-950">
																				Admin
																			</p>
																		</div>
																	)}
																</div>
															</div>
														</div>
													)
												})}
											</div>
										)}
									</InfiniteScroll>
								</div>
							)}
						</div>
					</div>

					<Button
						color="black-950"
						className="!py-3"
						isFullWidth
						onClick={handleSubmit(onCreateRound)}
					>
						Create Round
					</Button>
				</div>
			</div>
		</CreateRoundLayout>
	)
}

export default CreateRoundPage
