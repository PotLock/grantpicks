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
import { skip } from 'node:test'
import { IGetProjectsResponse } from '@/services/on-chain/project-registry'
import CMDWallet from '@/lib/wallet'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import {
	addProjectsRound,
	createRound,
	CreateRoundParams,
	depositFundRound,
} from '@/services/on-chain/round'
import { parseToStroop, prettyTruncate } from '@/utils/helper'
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

const CreateRoundPage = () => {
	const router = useRouter()
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { nearPrice, stellarPrice, openPageLoading, dismissPageLoading } =
		useGlobalContext()
	const { stellarPubKey, stellarKit } = useWallet()
	const { setSuccessCreateRoundModalProps } = useModalContext()
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
		reset,
		watch,
		formState: { errors },
	} = useForm<CreateRoundData>({
		defaultValues: {
			vote_per_person: 0,
			apply_duration_start: null,
			apply_duration_end: null,
			max_participants: 0,
			voting_duration_start: null,
			voting_duration_end: null,
			open_funding: true,
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

	const onAddApprovedProjects = async (roundId: bigint) => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const txAddProject = await addProjectsRound(
				BigInt(roundId),
				stellarPubKey,
				watch().projects.map((p) => p.id),
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

	const onInitialDeposit = async (roundId: bigint) => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
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
				txAddProject,
				stellarPubKey,
			)
			return txHash
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	const onCreateRound: SubmitHandler<CreateRoundData> = async (data) => {
		try {
			openPageLoading()
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const createRoundParams: CreateRoundParams = {
				owner: stellarPubKey,
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
				max_participants: data.max_participants,
				num_picks_per_voter: data.vote_per_person,
				use_whitelist: false,
				is_video_required: data.video_required,
				allow_applications: data.allow_application,
				voting_start_ms: BigInt(
					data.voting_duration_start?.getTime() as number,
				),
				voting_end_ms: BigInt(data.voting_duration_end?.getTime() as number),
				admins:
					data.admins?.length > 0
						? data.admins.map((admin) => admin.admin_id)
						: [],
				allow_remaining_dist: true,
				compliance_req_desc: data.compliance_req_desc,
				compliance_end_ms: BigInt(
					BigInt(data.voting_duration_end?.getTime() || 0),
				),
				compliance_period_ms: BigInt(data.compliance_period_ms || 0),
				cooldown_end_ms: BigInt(data.voting_duration_end?.getTime() || 0),
				cooldown_period_ms: BigInt(0),
				remaining_dist_address: data.remaining_dist_address || stellarPubKey,
				referrer_fee_basis_points: 0,
			}
			const txCreateRound = await createRound(
				stellarPubKey,
				createRoundParams,
				contracts,
			)
			const txHashCreateRound = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txCreateRound,
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
					txHashInitialDeposit = await onInitialDeposit(txCreateRound.result.id)
				}
				setSuccessCreateRoundModalProps((prev) => ({
					...prev,
					isOpen: true,
					createRoundRes: txCreateRound.result,
					txHash: txHashCreateRound,
				}))
				reset()
				dismissPageLoading()
				router.push(`/application`)
			}
		} catch (error: any) {
			console.log('error', error?.message)
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
									label="Initial Deposit"
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
								disabled
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
						<div className={`pt-4 mb-6`}>
							<div className="flex space-x-4 mb-2">
								<div className="w-[35%] space-y-1">
									<InputText
										disabled={!watch().allow_application}
										label="Max Participants"
										placeholder="0"
										required
										{...register('max_participants', {
											required: true,
											onChange: (e) => {
												setValue('max_participants', parseInt(e.target.value))
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
									<p
										className={clsx(
											`text-sm font-semibold mb-2`,
											!watch().allow_application
												? `text-grantpicks-black-300`
												: `text-grantpicks-black-950`,
										)}
									>
										Application Duration{' '}
										<span className="text-grantpicks-red-600 ml-1">*</span>
									</p>
									<Controller
										name="apply_duration_start"
										control={control}
										rules={{ required: true }}
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
								checked={watch().video_required}
								onChange={(e) => setValue('video_required', e.target.checked)}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<p className="text-base font-semibold">Cooldown</p>
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
								disabled={!watch().allow_cooldown}
								label="Set Deadline"
								placeholder="0"
								required
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
									) : undefined
								}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<p className="text-base font-semibold">Require Compliance</p>
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
								disabled={!watch().allow_compliance}
								label="Description"
								{...register('compliance_req_desc', {
									required: watch().allow_compliance,
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
								disabled={!watch().allow_compliance}
								label="Set Deadline"
								placeholder="0"
								required
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
									) : undefined
								}
							/>
						</div>
					</div>

					<div className="p-5 rounded-2xl shadow-md bg-white mb-4 lg:mb-6">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<div className="flex items-center space-x-2">
								<p className="text-base font-semibold">
									Remaining Funds Redistribution
								</p>
								<a
									data-tooltip-id="remaining_funds_tooltip"
									data-tooltip-html="Remaining funds for those who haven’t done their compliance<br />check get sent to this address after compliance period is over"
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
								required
								{...register('remaining_dist_address', {
									required: watch().allow_remaining_dist === true,
									validate: (value, formValues) =>
										watch().allow_remaining_dist
											? StrKey.isValidEd25519PublicKey(value)
											: true,
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
