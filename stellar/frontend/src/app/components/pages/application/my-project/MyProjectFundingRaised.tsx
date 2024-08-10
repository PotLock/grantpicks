import { useMyProject } from '@/app/application/my-project/page'
import Button from '@/app/components/commons/Button'
import Checkbox from '@/app/components/commons/CheckBox'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Menu from '@/app/components/commons/Menu'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconCalendar from '@/app/components/svgs/IconCalendar'
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
import { CreateProjectStep4Data } from '@/types/form'
import { Network } from '@/types/on-chain'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import {
	Controller,
	SubmitHandler,
	useFieldArray,
	useForm,
} from 'react-hook-form'
import toast from 'react-hot-toast'

const MyProjectFundingRaised = () => {
	const { projectData, fetchProjectApplicant } = useMyProject()
	const { stellarPubKey, stellarKit } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const [showContractMenu, setShowContractMenu] = useState<boolean[]>([])
	const [showContactMenu, setShowContactMenu] = useState<boolean[]>([])
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateProjectStep4Data>({
		defaultValues: {
			funding_histories: [
				{
					source: '',
					date: new Date(),
					denomination: '',
					amount: '',
					description: '',
				},
			],
		},
	})
	const {
		fields: fieldHistories,
		append: appendHistory,
		remove: removeHistory,
	} = useFieldArray({
		control,
		name: 'funding_histories',
	})

	const setDefaultData = () => {
		if (projectData) {
			setValue('funding_histories', [])
		}
	}

	const onSaveChanges: SubmitHandler<CreateProjectStep4Data> = async (data) => {
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
				contacts: projectData?.contacts || [],
				contracts: projectData?.contracts || [],
				image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
				payout_address: projectData?.payout_address || '',
				repositories: projectData?.repositories || [],
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
				txUpdateProject,
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
					<p className="text-grantpicks-black-950 mb-2">
						Smart Contracts <span className="text-grantpicks-red-600">*</span>
					</p>
					<div className="flex flex-col space-y-4 mb-6">
						{fieldHistories.map((history, index) => (
							<div
								key={index}
								className="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 bg-grantpicks-black-100 rounded-xl relative"
							>
								<IconTrash
									size={24}
									className="fill-grantpicks-red-400 cursor-pointer hover:opacity-70 transition absolute top-3 right-3"
									onClick={() => {
										removeHistory(index)
									}}
								/>
								<InputText
									required
									label="Source"
									{...register(`funding_histories.${index}.source`, {
										required: true,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.source?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Source is required
											</p>
										) : undefined
									}
								/>
								<div>
									<p className="font-semibold text-grantpicks-black-950 mb-2">
										Date
									</p>
									<Controller
										name={`funding_histories.${index}.date`}
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
												className="border border-grantpicks-black-200 rounded-xl w-full h-12 text-grantpicks-black-950"
												wrapperClassName="w-full mb-1"
											/>
										)}
									/>
								</div>
								<InputText
									required
									label="Denomination"
									{...register(`funding_histories.${index}.denomination`, {
										required: true,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.denomination?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Denomination is required
											</p>
										) : undefined
									}
								/>
								<InputText
									required
									label="Amount"
									{...register(`funding_histories.${index}.amount`, {
										required: true,
									})}
									errorMessage={
										errors?.funding_histories?.[index]?.amount?.type ===
										'required' ? (
											<p className="text-red-500 text-xs mt-1 ml-2">
												Amount is required
											</p>
										) : undefined
									}
								/>
								<div className="col-span-1 md:col-span-2">
									<InputTextArea
										label="Description"
										required
										rows={2}
										{...register(`funding_histories.${index}.description`, {
											required: true,
										})}
										errorMessage={
											errors.funding_histories?.[index]?.description?.type ===
											'required' ? (
												<p className="text-red-500 text-xs mt-1 ml-2">
													Description is required
												</p>
											) : undefined
										}
									/>
								</div>
							</div>
						))}
					</div>
					<div className="flex items-center justify-between">
						<Checkbox
							label="We haven't raised any funds"
							checked={watch().is_havent_raised}
							onChange={(e) => setValue('is_havent_raised', e.target.checked)}
						/>
						<Button
							color="transparent"
							className="!bg-transparent !border !border-black/10"
							onClick={() => {
								appendHistory({
									id: '',
									source: '',
									date: new Date(),
									denomination: '',
									amount: '',
									description: '',
								})
							}}
						>
							<div className="flex items-center space-x-2">
								<IconAdd size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Add more
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
						onClick={() => {}}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3"
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectFundingRaised
