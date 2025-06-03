'use client'

import Button from '@/app/components/commons/Button'
import Checkbox from '@/app/components/commons/CheckBox'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Menu from '@/app/components/commons/Menu'
import TopNav from '@/app/components/commons/TopNav'
import CreateRoundLayout from '@/app/components/pages/create-round/CreateRoundLayout'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconRemove from '@/app/components/svgs/IconRemove'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import {
	UpdateRoundData,
} from '@/types/form'
import React, { useEffect, useState } from 'react'
import {
	useForm,
	SubmitHandler,
} from 'react-hook-form'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import {
	editRound,
	getRoundAdmins,
	getRoundInfo,
	UpdateRoundParams,
} from '@/services/stellar/round'
import { useParams, useRouter } from 'next/navigation'
import {
	IGetListExternalResponse,
} from '@/types/on-chain'
import { useWallet } from '@/app/providers/WalletProvider'
import {
	formatStroopToXlm,
} from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useModalContext } from '@/app/providers/ModalProvider'
import {
	EMAIL_VALIDATION_REGEX,
	INSTAGRAM_USERNAME_REGEX,
	TELEGRAM_USERNAME_REGEX,
	TWITTER_USERNAME_REGEX,
} from '@/constants/regex'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { nearRoundToGPRound, NearUpdateRoundParams } from '@/services/near/type'
import { GPRound } from '@/models/round'
import { roundDetailToGPRound } from '@/services/stellar/type'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import clsx from 'clsx'

const EditRoundPage = () => {
	const router = useRouter()
	const params = useParams<{ roundId: string }>()
	const { setSuccessUpdateRoundModalProps } = useModalContext()
	const [showContactType, setShowContactType] = useState<boolean>(false)
	const { stellarPrice, nearPrice } = useGlobalContext()
	const { stellarPubKey, stellarKit, nearWallet, connectedWallet } = useWallet()
	const [checkedListIds, setCheckedListIds] = useState<bigint[]>([])
	const {
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
	const onFetchDefaultValue = async () => {
		try {
			openPageLoading()
			const resRoundInfo = await onFetchRoundInfo()
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
				setValue('use_vault', resRoundInfo.use_vault || false)
				setValue('is_video_required', resRoundInfo.is_video_required || false)

				setValue(
					'referrer_fee_basis_points',
					resRoundInfo.referrer_fee_basis_points || 0,
				)
				if (resRoundInfo.contacts.length > 0) {
					setValue('contact_type', resRoundInfo?.contacts[0].name)
					setValue('contact_address', resRoundInfo?.contacts[0].value)
				}

				dismissPageLoading()
			}
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}





	const onEditRound: SubmitHandler<UpdateRoundData> = async (data) => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const updateRoundParams: UpdateRoundParams = {
					name: data.title,
					description: data.description,

					contacts: [
						{
							name: data.contact_type,
							value: data.contact_address,
						},
					],
					max_participants:
						data.max_participants,
					num_picks_per_voter: data.vote_per_person,
					application_wl_list_id: checkedListIds.length > 0 ? checkedListIds[0] : undefined,
					voting_wl_list_id: checkedListIds.length > 0 ? checkedListIds[0] : undefined,
					is_video_required: data.is_video_required,
					use_vault: data.use_vault,
				}
				const txUpdateRound = await editRound(
					stellarPubKey,
					BigInt(params.roundId),
					updateRoundParams,
					contracts,
				)
				const txHashUpdateRound = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txUpdateRound.toXDR(),
					stellarPubKey,
				)
				if (txHashUpdateRound) {
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
				const updateRoundParams: NearUpdateRoundParams = {
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
					await nearContracts?.round.editRound(updateRoundParams)

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

	// const onFetchLists = async (key: {
	// 	url: string
	// 	skip: number
	// 	limit: number
	// }) => {
	// 	if (storage.chainId === 'stellar') {
	// 		let contracts = storage.getStellarContracts()
	// 		if (!contracts) {
	// 			return []
	// 		}
	// 	} else {
	// 		let contracts = storage.getNearContracts(nearWallet)
	// 		if (!contracts) {
	// 			return []
	// 		}
	// 		const res = await contracts.lists.getLists(key.skip, key.limit)
	// 		return res
	// 	}
	// }

	// const getKey = (
	// 	pageIndex: number,
	// 	previousPageData: IGetListExternalResponse[],
	// ) => {
	// 	if (previousPageData && !previousPageData.length) return null
	// 	return {
	// 		url: `get-lists`,
	// 		skip: pageIndex * LIMIT_SIZE,
	// 		limit: LIMIT_SIZE,
	// 		chain: storage.chainId,
	// 	}
	// }
	// const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(
	// 	getKey,
	// 	async (key) => await onFetchLists(key),
	// 	{
	// 		revalidateFirstPage: false,
	// 	},
	// )

	// const lists = data
	// 	? ([] as IGetListExternalResponse[]).concat(
	// 		...(data as any as IGetListExternalResponse[]),
	// 	)
	// 	: []
	// const isEmpty = data?.[0]?.length === 0
	// const isReachingEnd =
	// 	isEmpty || (data && data[data.length - 1]?.length < LIMIT_SIZE)



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
					<div className='bg-white p-6 justify-between flex flex-col gap-2 rounded-2xl shadow-md mb-6'>

						<div className={`pt-4 flex flex-col items-center md:flex-row gap-2`}>
							<div className="flex flex-col w-full md:w-[38%] space-x-4 mb-2">
								<div className="w-full">
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
								<p className="text-xs font-normal text-grantpicks-black-600">
									You must have a minimum of 10 Participants
								</p>
							</div>
							<div className=" w-full md:w-[60%]">
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
						</div>
						{connectedWallet === 'stellar' ? (
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
						) : (
							<></>
						)}
					</div>


					{/* 
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
					</div> */}

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
