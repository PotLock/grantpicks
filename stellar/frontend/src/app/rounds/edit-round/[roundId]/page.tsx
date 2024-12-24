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
	setAdminRound,
	addProjectsRound,
	editRound,
	getRoundAdmins,
	getRoundApplications,
	getRoundInfo,
	setAdminsRound,
	UpdateRoundParams,
	getLists,
} from '@/services/stellar/round'
import { useParams, useRouter } from 'next/navigation'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import {
	IGetListExternalResponse,
	IGetRoundApplicationsResponse,
	Network,
} from '@/types/on-chain'
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
} from '@/services/stellar/project-registry'
import IconStellar from '@/app/components/svgs/IconStellar'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useModalContext } from '@/app/providers/ModalProvider'
import { IRoundPeriodData } from '@/types/round'
import {
	EMAIL_VALIDATION_REGEX,
	INSTAGRAM_USERNAME_REGEX,
	TELEGRAM_USERNAME_REGEX,
	TWITTER_USERNAME_REGEX,
} from '@/constants/regex'
import { subDays } from 'date-fns'
import useAppStorage from '@/stores/zustand/useAppStorage'
import Image from 'next/image'
import IconExpandLess from '@/app/components/svgs/IconExpandLess'
import IconExpandMore from '@/app/components/svgs/IconExpandMore'
import InfiniteScroll from 'react-infinite-scroll-component'
import useSWRInfinite from 'swr/infinite'
import IconLoading from '@/app/components/svgs/IconLoading'
import { nearRoundToGPRound, NearUpdateRoundParams } from '@/services/near/type'
import { GPRound } from '@/models/round'
import { roundDetailToGPRound } from '@/services/stellar/type'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

const EditRoundPage = () => {
	const router = useRouter()
	const params = useParams<{ roundId: string }>()
	const { setSuccessUpdateRoundModalProps } = useModalContext()
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { stellarPrice, nearPrice } = useGlobalContext()
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState<string>('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] =
		useState<boolean>(false)
	const { stellarPubKey, stellarKit, nearWallet, nearAccounts } = useWallet()
	const [showAddAdminsModal, setShowAddAdminsModal] = useState<boolean>(false)
	const [showLists, setShowLists] = useState<boolean>(true)
	const [checkedListIds, setCheckedListIds] = useState<bigint[]>([])
	const {
		control,
		register,
		handleSubmit,
		setValue,
		watch,
		reset,
		trigger,
		formState: { errors },
	} = useForm<UpdateRoundData>({
		mode: 'onChange',
		defaultValues: {
			vote_per_person: 1,
			apply_duration_start: new Date(),
			apply_duration_end: new Date(),
			max_participants: 10,
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
	const storage = useAppStorage()

	const onFetchAdmins = async () => {
		if (storage.chainId === 'stellar') {
			let contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}
			const res = await getRoundAdmins(
				{ round_id: BigInt(params.roundId) },
				contracts,
			)
			return res
		} else {
			let contracts = storage.getNearContracts(nearWallet)
			if (!contracts) {
				return
			}
			const res = await contracts.round.getRoundById(parseInt(params.roundId))
			return res.admins
		}
	}

	const onFetchRoundInfo = async (): Promise<GPRound | undefined> => {
		if (storage.chainId === 'stellar') {
			let contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}
			const resRoundInfo = await getRoundInfo(
				{ round_id: BigInt(params.roundId) },
				contracts,
			)
			return roundDetailToGPRound(resRoundInfo)
		} else {
			let contracts = storage.getNearContracts(nearWallet)
			if (!contracts) {
				return
			}
			const resRoundInfo = await contracts.round.getRoundById(
				parseInt(params.roundId),
			)
			return nearRoundToGPRound(resRoundInfo)
		}
	}

	const onFetchRoundApplications = async () => {
		let contracts = storage.getStellarContracts()

		if (!contracts) {
			return
		}

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
		let contracts = storage.getStellarContracts()

		if (!contracts) {
			return
		}

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
			const resRoundAdmins = await onFetchAdmins()
			if (resRoundInfo) {
				setValue('title', resRoundInfo?.name)
				setValue('description', resRoundInfo?.description)
				setValue('vote_per_person', resRoundInfo?.num_picks_per_voter)
				setValue('vote_per_person', resRoundInfo?.num_picks_per_voter)

				if (storage.chainId === 'stellar') {
					setValue(
						'amount',
						formatStroopToXlm(BigInt(resRoundInfo?.current_vault_balance)) ===
							'0'
							? '0'
							: formatStroopToXlm(BigInt(resRoundInfo?.current_vault_balance)),
					)
				} else {
					setValue(
						'amount',
						formatNearAmount(resRoundInfo?.current_vault_balance) === '0'
							? '0'
							: formatNearAmount(resRoundInfo?.current_vault_balance).replace(
									',',
									'',
								),
					)
				}

				setValue(
					'expected_amount',
					storage.chainId === 'stellar'
						? (formatStroopToXlm(
								BigInt(resRoundInfo?.expected_amount),
							) as string)
						: (resRoundInfo?.expected_amount as string),
				)
				let calculation = 0
				if (storage.chainId === 'stellar') {
					calculation =
						parseFloat(
							formatStroopToXlm(BigInt(resRoundInfo?.expected_amount)) || '0',
						) * stellarPrice
				} else {
					calculation =
						parseFloat(
							formatNearAmount(resRoundInfo?.expected_amount).replace(
								',',
								'',
							) || '0',
						) * nearPrice
				}
				setExpectAmountUsd(`${calculation.toFixed(3)}`)
				setValue('use_vault', resRoundInfo.use_vault || false)
				setValue('is_video_required', resRoundInfo.is_video_required || false)
				if (resRoundInfo.compliance_end) {
					setValue(
						'allow_compliance',
						resRoundInfo.compliance_end ? true : false,
					)
					setValue('compliance_end_ms', new Date(resRoundInfo.compliance_end))
					setValue(
						'compliance_period_ms',
						Number(resRoundInfo.compliance_period_ms),
					)
					setValue('compliance_req_desc', resRoundInfo.compliance_req_desc)
				}
				if (resRoundInfo.cooldown_end) {
					setValue('allow_cooldown', resRoundInfo.cooldown_end ? true : false)
					setValue('cooldown_end_ms', new Date(resRoundInfo.cooldown_end))
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
						resRoundInfo.remaining_dist_address?.id || '',
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
						new Date(resRoundInfo.application_start || 0),
					)
					setValue(
						'apply_duration_end',
						new Date(resRoundInfo.application_end || 0),
					)
					setValue('voting_duration_start', new Date(resRoundInfo.voting_start))
					setValue('voting_duration_end', new Date(resRoundInfo.voting_end))
					if ('is_video_required' in resRoundInfo) {
						setValue('is_video_required', resRoundInfo.is_video_required)
					}
				}
				// if (resProjects.length > 0) {
				// 	setValue(`projects`, resProjects)
				// }
				if (resRoundAdmins && resRoundAdmins.length > 0) {
					setSelectedAdmins(resRoundAdmins.map((admin) => admin))
					setValue(
						'admins',
						resRoundAdmins.map((admin) => ({ admin_id: admin })),
					)
				}
				setCheckedListIds(
					Array.isArray(resRoundInfo.wl_list_id)
						? resRoundInfo.wl_list_id.map((id) => BigInt(id))
						: [],
				)
				dismissPageLoading()
			}
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	const onAddApprovedProjects = async (roundId: bigint) => {
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

	const onSetAdmins = async (roundId: bigint) => {
		try {
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const txAddAdmins = await setAdminsRound(
				{
					round_id: BigInt(roundId),
					round_admin: watch().admins.map((admin) => admin.admin_id),
				},
				contracts,
			)
			const txHash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txAddAdmins.toXDR(),
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
	// 		// 	txAddProject.toXDR(),
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

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

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
					use_whitelist: checkedListIds.length > 0,
					wl_list_id: checkedListIds.length > 0 ? checkedListIds[0] : undefined,
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
					txUpdateRound.toXDR(),
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
					txHashAddProjects = await onAddApprovedProjects(
						txUpdateRound.result.id,
					)
					txHashAddAdmins = await onSetAdmins(BigInt(params.roundId))
					setSuccessUpdateRoundModalProps((prev) => ({
						...prev,
						isOpen: true,
						updateRoundRes: txUpdateRound.result,
						txHash: txHashUpdateRound,
					}))
					reset()
					dismissPageLoading()
					router.push(`/rounds`)
				}
			} else {
				const udpateRoundParams: NearUpdateRoundParams = {
					round_id: parseInt(params.roundId),
					name: data.title,
					description: data.description,
					allow_applications: data.allow_application,
					application_end_ms: data.allow_application
						? data.apply_duration_end?.getTime()
						: undefined,
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
					use_whitelist: checkedListIds.length > 0,
					wl_list_id: checkedListIds.length > 0 ? checkedListIds[0] : undefined,
					voting_end_ms: data.voting_duration_end?.getTime() || 0,
					voting_start_ms: data.voting_duration_start?.getTime() || 0,
					num_picks_per_voter: data.vote_per_person,
					max_participants: data.max_participants,
					application_requires_video: data.is_video_required,
				}

				if (!nearWallet) {
					return
				}

				const nearContracts = storage.getNearContracts(nearWallet)
				console.log('nearContracts', nearContracts)
				const txNearEditRound =
					await nearContracts?.round.editRound(udpateRoundParams)

				console.log('txNearCreateRound', txNearEditRound)

				//TODO: handle & test after BE indexed by prometheus

				reset()
				dismissPageLoading()
				router.push(`/rounds`)
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.chainId, storage.my_address])

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
			const res = await contracts.lists.getLists(key.skip, key.limit)
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
			skip: pageIndex * LIMIT_SIZE,
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
	const isEmpty = data?.[0]?.length === 0
	const isReachingEnd =
		isEmpty || (data && data[data.length - 1]?.length < LIMIT_SIZE)

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
						Edit Round
					</p>
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
									<button
										{...register('contact_type', { required: true })}
										onClick={() => setShowContactType(true)}
										className={clsx(
											'border border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition',
											errors.contact_address?.type === 'required' &&
												'border-red-500',
										)}
									>
										<p
											className={clsx(
												'text-sm font-normal ',
												watch().contact_type === ''
													? 'text-grantpicks-black-950/50'
													: 'text-grantpicks-black-950',
											)}
										>
											{watch().contact_type === ''
												? 'Select platform'
												: watch().contact_type}
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
						<div className="flex items-start space-x-4 w-full mb-4">
							<div className="flex-1">
								<InputText
									type="number"
									disabled
									label="Amount"
									placeholder="Enter amount..."
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
									// errorMessage={
									// 	parseFloat(watch().amount) <= 0 ? (
									// 		<p className="text-red-500 text-xs mt-1 ml-2">
									// 			Initial deposit cannot be less than or equal to 0
									// 		</p>
									// 	) : undefined
									// }
								/>
							</div>
							<div className="flex-1">
								<InputText
									type="number"
									label="Expected Amount"
									required
									placeholder="Enter amount..."
									{...register('expected_amount', {
										required: true,
										onChange: async (e) => {
											let calculation = 0
											if (storage.chainId === 'stellar') {
												calculation =
													parseFloat(e.target.value || '0') * stellarPrice
											} else {
												calculation =
													parseFloat(e.target.value || '0') * nearPrice
											}
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
						{/* <div className="flex items-center">
							<Checkbox
								label="Open Funding Pool"
								checked={watch().use_vault}
								onChange={(e) => {
									setValue('use_vault', e.target.checked)
									setValue('amount', '')
								}}
							/>
						</div> */}
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
															parseInt(e.target.value),
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
											<p className="text-base font-semibold text-grantpicks-black-950 mb-2">
												Application Duration{' '}
												<span className="text-grantpicks-red-600 ml-1">*</span>
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
											</div>
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
									<div
										{...register('voting_duration_start', { required: true })}
									>
										<Controller
											name="voting_duration_start"
											control={control}
											rules={{ required: true }}
											render={({ field }) => (
												<DatePicker
													showIcon
													minDate={subDays(
														watch().apply_duration_end as Date,
														1,
													)}
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
										{isLoading ? (
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
						onClick={handleSubmit(onEditRound)}
					>
						Save Changes
					</Button>
				</div>
			</div>
		</CreateRoundLayout>
	)
}

export default EditRoundPage
