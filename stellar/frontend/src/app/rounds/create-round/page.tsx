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
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
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
	IGetProjectsResponse,
	IndexerProjectResponse,
} from '@/services/stellar/project-registry'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	addProjectsRound,
	createRound,
	CreateRoundParams,
	depositFundRound,
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
import IconLoading from '@/app/components/svgs/IconLoading'
import IconExpandLess from '@/app/components/svgs/IconExpandLess'
import IconExpandMore from '@/app/components/svgs/IconExpandMore'
import InfiniteScroll from 'react-infinite-scroll-component'
import { convertToBasisPoints, LIMIT_SIZE } from '@/constants/query'
import useSWRInfinite from 'swr/infinite'
import { GPRound } from '@/models/round'
import { usePotlockService } from '@/services/potlock'
import { APIListExternal } from '@/app/components/pages/application/lists/ListCard'

const CreateRoundPage = () => {
	const router = useRouter()
	const buttonRef = useRef<HTMLDivElement>(null)
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const [showTips, setShowTips] = useState<boolean>(false)
	const { stellarPrice, openPageLoading, dismissPageLoading } =
		useGlobalContext()
	const { stellarPubKey, stellarKit, connectedWallet, onOpenStellarWallet } =
		useWallet()
	const { setSuccessCreateRoundModalProps } = useModalContext()
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState<string>('0.00')
	const [minimumDepositUsd, setMinimumDepositUsd] = useState<string>('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] =
		useState<boolean>(false)
	const [showAddAdminsModal, setShowAddAdminsModal] = useState<boolean>(false)
	const [isMobile, setIsMobile] = useState(false)
	const [showLists, setShowLists] = useState<boolean>(true)
	const [checkedListIds, setCheckedListIds] = useState<bigint[]>([])
	const [showApplicationLists, setShowApplicationLists] =
		useState<boolean>(true)
	const [checkedApplicationListIds, setCheckedApplicationListIds] = useState<
		bigint[]
	>([])
	const {
		control,
		register,
		handleSubmit,
		setValue,
		reset,
		watch,
		trigger,
		setError,
		formState: { errors },
	} = useForm<CreateRoundData>({
		mode: 'onChange',
		defaultValues: {
			contact_type: '',
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
			voting_wl_list_id: undefined,
			application_wl_list_id: undefined,
		},
	})
	const potlockApi = usePotlockService()
	const { append: appendProject, remove: removeProject } = useFieldArray({
		control,
		name: 'projects',
	})
	const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
		control,
		name: 'admins',
	})
	const [selectedProjects, setSelectedProjects] = useState<
		IndexerProjectResponse[]
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
		try {
			const contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const projects = selectedProjects.map((p) => p.on_chain_id)
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

	const onInitialDeposit = async (roundId: bigint) => {
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

	const onCreateRound: SubmitHandler<CreateRoundData> = async (data) => {
		if (!data.allow_application && selectedProjects.length < 2) {
			return toast.error(
				'Please add at least 2 projects to create a round for voting',
				{
					style: toastOptions.error.style,
				},
			)
		}
		try {
			openPageLoading()

			// Adjust application times

			if (data.apply_duration_start && data.apply_duration_end) {
				const startDate = new Date(data.apply_duration_start)
				const endDate = new Date(data.apply_duration_end)

				// If start is today, set to current time + 15 mins
				if (startDate.toDateString() === new Date().toDateString()) {
					startDate.setHours(new Date().getHours())
					startDate.setMinutes(new Date().getMinutes() + 15)
				}

				// If end is tomorrow, set to current time + 3 hours
				const tomorrow = new Date()
				tomorrow.setDate(tomorrow.getDate() + 1)

				if (endDate.toDateString() === tomorrow.toDateString()) {
					endDate.setHours(new Date().getHours() + 1)
					endDate.setMinutes(new Date().getMinutes())
				}

				data.apply_duration_start = startDate
				data.apply_duration_end = endDate
			}

			// Adjust voting times
			if (data.voting_duration_start && data.voting_duration_end) {
				const startDate = new Date(data.voting_duration_start)
				const endDate = new Date(data.voting_duration_end)
				const applyEndDate = data.apply_duration_end
					? new Date(data.apply_duration_end)
					: null
				const currentDate = new Date()

				// If voting starts same day as application ends and we have an apply end date
				if (
					applyEndDate &&
					startDate.toDateString() === applyEndDate.toDateString()
				) {
					startDate.setHours(applyEndDate.getHours() + 1)
					startDate.setMinutes(applyEndDate.getMinutes())
				}
				// If voting starts next day and we have an apply end date
				else if (
					applyEndDate &&
					startDate.toDateString() ===
					new Date(
						new Date().setDate(applyEndDate.getDate() + 1),
					).toDateString()
				) {
					startDate.setHours(applyEndDate.getHours())
					startDate.setMinutes(applyEndDate.getMinutes())
				}
				// If no application period, ensure voting starts 15 minutes after set time
				else if (!applyEndDate) {
					if (startDate.toDateString() === currentDate.toDateString()) {
						startDate.setHours(currentDate.getHours())
						startDate.setMinutes(currentDate.getMinutes() + 15)
					}
					if (
						endDate.toDateString() ===
						new Date(
							new Date().setDate(new Date().getDate() + 1),
						).toDateString()
					) {
						endDate.setHours(currentDate.getHours() + 1)
						endDate.setMinutes(currentDate.getMinutes())
					}
				}

				// Set end time to start time + 24 hours
				endDate.setHours(startDate.getHours() + 4)
				endDate.setMinutes(startDate.getMinutes())

				data.voting_duration_start = startDate
				data.voting_duration_end = endDate
			}

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const maxParticipants =
					data.max_participants < 10 ? 10 : data.max_participants
				// Guard against possibly undefined dates to satisfy TS and avoid runtime issues
				const votingStartMsSafe = data.voting_duration_start
					? BigInt(data.voting_duration_start.getTime())
					: BigInt(Date.now())
				const votingEndMsSafe = data.voting_duration_end
					? BigInt(data.voting_duration_end.getTime())
					: BigInt(Date.now() + 4 * 60 * 60 * 1000)

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
					minimum_deposit: parseToStroop(data.minimum_deposit),
					max_participants:
						selectedProjects.length > maxParticipants // TODO: must change "Max Participants" when adding projects
							? selectedProjects.length
							: maxParticipants,
					num_picks_per_voter:
						data.vote_per_person < 1 ? 1 : data.vote_per_person,
					use_whitelist: checkedListIds.length > 0,
					voting_wl_list_id:
						checkedListIds.length > 0 ? checkedListIds[0] : undefined,
					is_video_required: data.is_video_required,
					use_whitelist_application: checkedApplicationListIds?.length > 0,
					application_wl_list_id:
						checkedApplicationListIds.length > 0
							? checkedApplicationListIds[0]
							: undefined,
					allow_applications: data.allow_application,
					use_vault: data.use_vault,
					voting_start_ms: votingStartMsSafe,
					voting_end_ms: votingEndMsSafe,
					admins:
						data.admins?.length > 0
							? data.admins.map((admin) => admin.admin_id)
							: [],
					allow_remaining_dist: data.allow_remaining_dist || false,
					compliance_req_desc: data.compliance_req_desc,
					compliance_period_ms: compliancePeriodData.period_ms
						? BigInt(compliancePeriodData.period_ms)
						: undefined,

					cooldown_period_ms: cooldownPeriodData.period_ms
						? BigInt(cooldownPeriodData.period_ms)
						: undefined,
					remaining_dist_address:
						data.remaining_dist_address || storage.my_address || '',
					referrer_fee_basis_points: convertToBasisPoints(
						data.referrer_fee_basis_points,
					),
				}


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
					let round = null
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

					setSuccessCreateRoundModalProps((prev) => ({
						...prev,
						isOpen: true,
						createRoundRes: {
							...txCreateRound.result,
							voting_start: data.voting_duration_start?.toISOString(),
							voting_end: data.voting_duration_end?.toISOString(),
							...(data.apply_duration_start && {
								application_start: data.apply_duration_start.toISOString(),
							}),
							...(data.apply_duration_end && {
								application_end: data.apply_duration_end.toISOString(),
							}),
						} as unknown as GPRound,
						txHash: txHashCreateRound,
					}))
					reset()
					dismissPageLoading()
					router.push(`/rounds`)
				}
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

	const onFetchLists = useCallback(async () => {
		const res = await potlockApi.getLists()
		return res
	}, [potlockApi])

	const getKey = (pageIndex: number) => {
		return {
			url: `get-lists`,
			skip: pageIndex * LIMIT_SIZE,
			limit: LIMIT_SIZE,
			chain: storage.chainId,
			account: stellarPubKey || 'guest',
		}
	}
	const { data, size, setSize, isValidating, isLoading, error, mutate } =
		useSWRInfinite(getKey, async () => await onFetchLists(), {
			revalidateFirstPage: true,
		})

	const lists = data
		? ([] as APIListExternal[]).concat(...(data as any as APIListExternal[]))
		: []
	const isEmpty = data?.[0]?.length === 0
	const isReachingEnd =
		isEmpty || (!!data && (data[data.length - 1]?.length || 0) < LIMIT_SIZE)

	const networkError = error || (!isLoading && !isValidating && !data)

	const isOwner = (listOwnerId: string): boolean => {
		return stellarPubKey === listOwnerId
	}

	const isAdmin = (adminIds: string[]): boolean => {
		return adminIds.includes(stellarPubKey)
	}

	// Re-run lists fetch when wallet connects/changes
	useEffect(() => {
		if (storage.chainId) {
			mutate()
			setSize(1)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.chainId])

	return (
		<CreateRoundLayout>
			<TopNav />
			<div className="w-[90%] md:w-[70%] lg:w-[50%] mx-auto">
				<div className="pt-28 md:pt-32 lg:pt-36 pb-16 text-grantpicks-black-950">
					<p className="text-[50px] font-black text-center uppercase mb-8 md:mb-12">
						Create new Round
					</p>
					<div className="border border-black/10 p-5 rounded-2xl shadow-md mb-4 lg:mb-6">
						<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
							<button
								onClick={() => setShowTips(!showTips)}
								className="flex justify-between w-full items-center py-2"
							>
								<div className="flex items-center space-x-2">
									<IconInfoCircle
										size={20}
										className="stroke-grantpicks-black-600"
									/>
									<p className="font-semibold text-base text-grantpicks-black-950">
										How Creating Rounds Work
									</p>
								</div>
								{showTips ? (
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
							<div
								className={`overflow-hidden transition-all duration-500 ease-in-out ${showTips ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
									}`}
							>
								<div className="pt-4 space-y-4 border-t border-black/10">
									<div>
										<h4 className="font-semibold text-sm text-grantpicks-black-950 mb-2">
											📅 Duration & Timing
										</h4>
										<ul className="text-sm text-grantpicks-black-700 space-y-1 ml-4">
											<li>
												• <strong>Application Period:</strong> If enabled, must
												be at least 24 hours long
											</li>
											<li>
												• <strong>Voting Period:</strong> Must be at least 24
												hours long
											</li>
											<li>
												• <strong>Timeline:</strong> Application period must end
												before voting period begins
											</li>
											<li>
												• <strong>Auto-adjustment:</strong> Times are
												automatically adjusted to ensure proper sequencing
											</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-grantpicks-black-950 mb-2">
											📋 Lists & Requirements
										</h4>
										<ul className="text-sm text-grantpicks-black-700 space-y-1 ml-4">
											<li>
												• <strong>Voter Lists:</strong> Control who can vote in
												your round
											</li>
											<li>
												• <strong>Application Lists:</strong> Control who can
												apply (only if applications are enabled)
											</li>
											<li>
												• <strong>List Selection:</strong> You can only select
												one list per requirement
											</li>
											<li>
												• <strong>Ownership:</strong> You can use lists you own
												or are an admin of
											</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-grantpicks-black-950 mb-2">
											💰 Funding & Deposits
										</h4>
										<ul className="text-sm text-grantpicks-black-700 space-y-1 ml-4">
											<li>
												• <strong>Expected Amount:</strong> The total funding
												goal for your round
											</li>
											<li>
												• <strong>Minimum Deposit:</strong> The smallest amount
												someone can contribute
											</li>
											<li>
												• <strong>Initial Deposit:</strong> Your starting
												contribution (optional)
											</li>
											<li>
												• <strong>Validation:</strong> Initial deposit cannot be
												less than minimum deposit
											</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-sm text-grantpicks-black-950 mb-2">
											⚙️ Advanced Features
										</h4>
										<ul className="text-sm text-grantpicks-black-700 space-y-1 ml-4">
											<li>
												• <strong>Cooldown Period:</strong> Time between voting
												end and payout period
											</li>
											{/* <li>
											• <strong>Compliance:</strong> Requires grantees to
											complete KYC process
										</li> */}
											<li>
												• <strong>Remaining Funds:</strong> Redistribute
												unclaimed funds to specified address
											</li>
											<li>
												• <strong>Referral Fees:</strong> Set commission for
												referrers (0-5%)
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
						<div className="p-5 rounded-2xl shadow-md bg-white space-y-6 mb-4 lg:mb-6">
							<InputText
								required
								label="Round Title"
								maxLength={60}
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
								maxLength={300}
								{...register('description', { required: true })}
								errorMessage={
									errors.description?.type === 'required' ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											Round description is required
										</p>
									) : undefined
								}
							/>
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
									<div className="flex md:flex-row flex-col gap-2 md:space-x-0 md:mb-2">
										<div className="w-full md:w-[35%] space-y-1">
											<InputText
												type="number"
												disabled={!watch().allow_application}
												label="Max Participants"
												placeholder="10"
												max={100}
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
											) : watch().max_participants < 10 ||
												watch().max_participants > 100 ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													{watch().max_participants < 10
														? 'Min. 10 Participants'
														: 'Max. 100 Participants'}
												</p>
											) : undefined}
										</div>
										<div className="w-full md:w-[65%]">
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
													<span className="text-grantpicks-red-600 ml-1">
														*
													</span>
												)}
											</p>
											<div
												{...register('apply_duration_start', {
													required: watch().allow_application,
												})}
											>
												<Controller
													name="apply_duration_start"
													control={control}
													rules={{ required: watch().allow_application }}
													render={({ field }) => (
														<DatePicker
															disabled={!watch().allow_application}
															showIcon
															selectsRange={true}
															minDate={new Date()}
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
																const [start, end] = date

																field.onChange(start)
																setValue('apply_duration_end', end)

																if (!start || !end) return

																const startDate = new Date(start)
																const endDate = new Date(end)
																const hoursDiff =
																	(endDate.getTime() - startDate.getTime()) /
																	(1000 * 60 * 60)

																if (hoursDiff < 24) {
																	toast.error(
																		'Application duration must be at least 24 hours',
																		{
																			style: toastOptions.error.style,
																		},
																	)
																	setError('apply_duration_start', {
																		type: 'manual',
																		message:
																			'Application duration must be at least 24 hours apart',
																	})
																	setValue('apply_duration_end', null, {
																		shouldValidate: true,
																		shouldDirty: true,
																		shouldTouch: true,
																	})
																	field.onChange(null)
																	return
																}
															}}
															className="border border-grantpicks-black-200 rounded-xl w-full h-12"
															wrapperClassName="w-full mb-1"
														/>
													)}
												/>
											</div>
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

							<div className="w-full">
								<p className="text-base font-semibold text-grantpicks-black-950 mb-2">
									Voting Duration{' '}
									<span className="text-grantpicks-red-600 ml-1">*</span>
								</p>
								<div {...register('voting_duration_start', { required: true })}>
									<Controller
										name="voting_duration_start"
										control={control}
										rules={{ required: true }}
										render={({ field }) => (
											<DatePicker
												showIcon
												minDate={
													subDays(watch().apply_duration_end as Date, 0) ||
													new Date()
												}
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
													const [start, end] = date

													field.onChange(start)
													setValue('voting_duration_end', end)

													if (!start || !end) return

													const startDate = new Date(start)
													const endDate = new Date(end)
													const hoursDiff =
														(endDate.getTime() - startDate.getTime()) /
														(1000 * 60 * 60)

													if (hoursDiff < 24) {
														toast.error(
															'Voting duration must be at least 24 hours',
															{
																style: toastOptions.error.style,
															},
														)
														setError('voting_duration_start', {
															type: 'manual',
															message:
																'Voting duration must be at least 24 hours apart',
														})
														setValue('voting_duration_end', null, {
															shouldValidate: true,
															shouldDirty: true,
															shouldTouch: true,
														})
														field.onChange(null)
														return
													}
												}}
												className="border border-grantpicks-black-200 rounded-xl w-full h-12"
												wrapperClassName="w-full mb-1"
											/>
										)}
									/>
								</div>
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
											<IconAdd
												size={24}
												className="fill-grantpicks-black-600"
											/>
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
								<div className="flex flex-col md:flex-row items-center gap-4">
									<div className="relative w-full md:w-44 lg:w-52" ref={buttonRef}>
										<input type="hidden" {...register('contact_type', { required: true })} />
										<button
											type="button"
											// visual trigger only; value is managed via hidden input above
											onClick={() => setShowContactType(true)}
											className={clsx(
												'border w-full border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition',
												errors.contact_type?.type === 'required' &&
												'border-red-500',
											)}
										>
											<p
												className={clsx(
													'text-sm font-normal ',
													watch('contact_type') === ''
														? 'text-grantpicks-black-950/50'
														: 'text-grantpicks-black-950',
												)}
											>
												{watch('contact_type') === ''
													? 'Select platform'
													: watch('contact_type')}
											</p>
											<IconUnfoldMore
												size={24}
												className="fill-grantpicks-black-400"
											/>
										</button>
										{showContactType && (
											<Menu
												isOpen={showContactType}
												onClose={() => setShowContactType(false)}
												position="right-0 left-0 -bottom-[150px]"
												mobileAsPortal
												buttonRef={buttonRef}
											>
												<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white w-full">
													<button
														type="button"
														onPointerDown={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Telegram', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Telegram', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition w-full text-left"
													>
														Telegram
													</button>
													<button
														type="button"
														onPointerDown={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Instagram', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Instagram', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition w-full text-left"
													>
														Instagram
													</button>
													<button
														type="button"
														onPointerDown={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Twitter', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Twitter', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition w-full text-left"
													>
														Twitter
													</button>
													<button
														type="button"
														onPointerDown={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Email', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														onClick={(e) => {
															e.preventDefault()
															e.stopPropagation()
															setValue('contact_type', 'Email', { shouldValidate: true, shouldDirty: true })
															trigger(['contact_type', 'contact_address'])
															setShowContactType(false)
														}}
														className="text-sm font-normal text-grantpicks-black-950 hover:opacity-70 cursor-pointer transition w-full text-left"
													>
														Email
													</button>
												</div>
											</Menu>
										)}
									</div>
									<div className="w-full md:flex-1">
										<InputText
											className={clsx(
												(errors.contact_address?.type === 'required' ||
													errors.contact_address) &&
												'border border-red-500',
											)}
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
							<div className="flex items-start flex-wrap md:flex-row flex-col md:space-x-4 w-full mb-4">
								<div className="flex-1">
									<InputText
										type="number"
										label="Expected Amount"
										required
										className="text-sm w-full"
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
													Expected Amount should not be less than intiial
													deposit
												</p>
											) : parseFloat(watch().expected_amount) <= 0 ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Expected Amount cannot be less than or equal to 0
												</p>
											) : undefined
										}
									/>
								</div>

								<div className="flex-1">
									<InputText
										type="number"
										disabled={!watch().use_vault}
										label="Initial Deposit"
										className="text-sm w-full"
										placeholder={isMobile ? '' : 'Enter amount...'}
										{...register('amount', {
											onChange: async (e) => {
												let calculation = 0

												calculation =
													parseFloat(e.target.value || '0') * stellarPrice

												setAmountUsd(`${calculation.toFixed(3)}`)
												setValue('amount', e.target.value)
											},
											validate: (value) => {
												const minDeposit = watch('minimum_deposit')
												if (!minDeposit) return true // Skip validation if minimum deposit not set
												if (parseFloat(value) < parseFloat(minDeposit)) {
													return 'Initial deposit cannot be less than minimum deposit'
												}
												return true
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
											parseFloat(watch().amount) < 0 ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Initial deposit cannot be less than 0
												</p>
											) : errors.amount?.message ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													{errors.amount.message}
												</p>
											) : undefined
										}
									/>
								</div>
								<div className="flex-1">
									<InputText
										type="number"
										label="Minimum Deposit"
										required
										className="text-sm w-full"
										placeholder={isMobile ? '' : 'Enter amount...'}
										{...register('minimum_deposit', {
											required: true,
											onChange: async (e) => {
												const calculation =
													parseFloat(e.target.value || '0') * stellarPrice
												setMinimumDepositUsd(`${calculation.toFixed(3)}`)
											},
											validate: (value) => {
												const expectedAmount = watch().expected_amount
												if (!expectedAmount) return true // Skip validation if expected amount not set
												if (parseFloat(value) > parseFloat(expectedAmount)) {
													return 'Minimum deposit cannot be greater than expected amount'
												}
												return true
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
													{minimumDepositUsd}
												</p>
												<p className="text-sm font-normal text-grantpicks-black-400">
													USD
												</p>
											</div>
										}
										errorMessage={
											errors.minimum_deposit?.type === 'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Minimum Deposit is required
												</p>
											) : errors.minimum_deposit?.message ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													{errors.minimum_deposit.message}
												</p>
											) : parseFloat(watch().minimum_deposit) <= 0 ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Minimum Deposit cannot be less than or equal to 0
												</p>
											) : undefined
										}
									/>
								</div>
							</div>
							<div className="flex items-center">
								<Checkbox
									label="Allow Deposit to Vault"
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
												src={`https://www.tapback.co/api/avatar/${selected.owner?.id}`}
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
									<div
										id="scrollListsContainer"
										className="max-h-[522px] overflow-scroll"
									>
										<InfiniteScroll
											scrollableTarget="scrollListsContainer"
											dataLength={lists.length}
											next={() => !isValidating && setSize(size + 1)}
											hasMore={!isReachingEnd}
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
											{networkError ? (
												<div className="h-20 flex items-center justify-center">
													<p className="text-sm text-red-600">
														Network error - please refresh or reconnect your
														wallet
													</p>
												</div>
											) : isLoading ? (
												<div className="h-20 flex items-center justify-center">
													<IconLoading
														size={24}
														className="fill-grantpicks-black-600"
													/>
												</div>
											) : lists.length === 0 ? (
												<div>
													<p className="text-sm text-grantpicks-black-950 text-center">
														There are no Lists Contract yet.
													</p>
												</div>
											) : (
												<div>
													{lists?.length > 0 &&
														lists?.map((list) => {
															return (
																<div
																	key={list.on_chain_id}
																	className="py-4 flex items-center gap-x-4"
																>
																	<Checkbox
																		checked={checkedListIds.includes(
																			BigInt(list.on_chain_id),
																		)}
																		onChange={(e) => {
																			if (e.target.checked) {
																				setCheckedListIds([
																					BigInt(list.on_chain_id),
																				])
																				setValue(
																					'voting_wl_list_id',
																					BigInt(list.on_chain_id),
																				)
																			} else {
																				setCheckedListIds(
																					checkedListIds.filter(
																						(on_chain_id) =>
																							on_chain_id !==
																							BigInt(list.on_chain_id),
																					),
																				)
																				setValue('voting_wl_list_id', undefined)
																			}
																		}}
																		name="voting_wl_list_id"
																		value={list.on_chain_id.toString()}
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
																					{list.registrations_count.toString()}{' '}
																					Eligible
																				</p>
																			</div>
																		</div>
																		<div className="flex gap-x-1">
																			{isOwner(list.owner.id) && (
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

						{/* Application Requirements - Only show when allow_application is true */}
						{watch().allow_application && (
							<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
								<div className="flex items-center justify-between pb-4 border-b border-black/10">
									<p className="text-base font-semibold">
										Application Requirements
									</p>
								</div>
								<div>
									<button
										onClick={() => {
											setShowApplicationLists(!showApplicationLists)
										}}
										className="flex justify-between w-full items-center py-[14px]"
									>
										<p className="font-semibold text-sm text-grantpicks-black-950">
											List
										</p>
										{showApplicationLists ? (
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
									{showApplicationLists && (
										<div
											id="scrollApplicationListsContainer"
											className="max-h-[522px] overflow-scroll"
										>
											<InfiniteScroll
												scrollableTarget="scrollApplicationListsContainer"
												dataLength={lists?.length || 0}
												next={() => !isValidating && setSize(size + 1)}
												hasMore={!isReachingEnd}
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
													<div className="h-20 flex items-center justify-center">
														<IconLoading
															size={24}
															className="fill-grantpicks-black-600"
														/>
													</div>
												) : lists?.length === 0 ? (
													<div>
														<p className="text-sm text-grantpicks-black-950 text-center">
															There are no Lists Contract yet.
														</p>
													</div>
												) : (
													<div>
														{lists?.length > 0 &&
															lists?.map((list) => {
																return (
																	<div
																		key={list?.on_chain_id}
																		className="py-4 flex items-center gap-x-4"
																	>
																		<Checkbox
																			checked={checkedApplicationListIds.includes(
																				BigInt(list.on_chain_id),
																			)}
																			onChange={(e) => {
																				if (e.target.checked) {
																					setCheckedApplicationListIds([
																						BigInt(list.on_chain_id),
																					])
																					setValue(
																						'application_wl_list_id',
																						BigInt(list.on_chain_id),
																					)
																				} else {
																					setCheckedApplicationListIds(
																						checkedApplicationListIds.filter(
																							(id) =>
																								id !== BigInt(list.on_chain_id),
																						),
																					)
																					setValue(
																						'application_wl_list_id',
																						undefined,
																					)
																				}
																			}}
																			name="application_wl_list_id"
																			value={list.on_chain_id.toString()}
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
																						{list.registrations_count.toString()}{' '}
																						Eligible
																					</p>
																				</div>
																			</div>
																			<div className="flex gap-x-1">
																				{isOwner(list.owner.id) && (
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
						)}

						<div className="flex bg-white p-5 rounded-2xl shadow-md mb-4">
							<InputText
								label="Referral Fee (%)"
								placeholder="0-5"
								type="number"
								min={0}
								max={5}
								{...register('referrer_fee_basis_points', {
									required: false,
									validate: (value) => {
										if (value < 0) return 'Referral fee cannot be negative'
										if (value > 5)
											return 'Referral fee cannot be greater than 5%'
										return true
									},
								})}
								errorMessage={
									errors.referrer_fee_basis_points?.message ? (
										<p className="text-red-500 text-xs mt-1 ml-2">
											{errors.referrer_fee_basis_points.message}
										</p>
									) : undefined
								}
								suffixIcon={
									<p className="text-sm font-normal text-grantpicks-black-400">
										%
									</p>
								}
							/>
						</div>
						{stellarPubKey ? (
							<Button
								color="black-950"
								className="!py-3"
								isFullWidth
								onClick={handleSubmit(onCreateRound)}
							>
								Create Round
							</Button>
						) : (
							<Button
								color="black-950"
								className="!py-3"
								isFullWidth
								type="button"
								onClick={() => onOpenStellarWallet()}
							>
								Connect Wallet
							</Button>
						)}
					</div>
				</div>
			</div>
		</CreateRoundLayout>
	)
}

export default CreateRoundPage
