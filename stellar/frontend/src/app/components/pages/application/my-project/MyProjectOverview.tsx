import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { DEFAULT_IMAGE_URL } from '@/constants/project'
import { toastOptions } from '@/constants/style'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import {
	IUpdateProjectParams,
	updateProject,
} from '@/services/stellar/project-registry'
import { CreateProjectStep1Data } from '@/types/form'
import { Network } from '@/types/on-chain'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import React, { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMyProject } from './MyProjectProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'

const MyProjectOverview = () => {
	const { projectData, fetchProjectApplicant } = useMyProject()
	const { stellarPubKey, stellarKit } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<CreateProjectStep1Data>({
		defaultValues: {
			title: projectData?.name,
			project_id: projectData?.id ? projectData.id.toString() : '',
			description: projectData?.overview,
			considering_desc: projectData?.overview,
		},
	})
	const storage = useAppStorage()

	const setDefaultData = () => {
		if (projectData) {
			setValue('title', projectData.name)

			if (projectData.id) {
				setValue('project_id', projectData.id.toString())
			}

			setValue('description', projectData.overview)
			setValue('considering_desc', projectData.overview)
		}
	}

	useEffect(() => {
		if (projectData) {
			setDefaultData()
		}
	}, [projectData])

	const onSaveChanges: SubmitHandler<CreateProjectStep1Data> = async (data) => {
		try {
			openPageLoading()
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const params: IUpdateProjectParams = {
				...projectData,
				name: data.title,
				overview: data.description,
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

	return (
		<div className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950">
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Overview
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
					<InputText
						required
						label="Project Title"
						{...register('title', { required: true })}
						errorMessage={
							errors.title?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Project title is required
								</p>
							) : undefined
						}
					/>
					<InputTextArea
						label="A brief Description"
						required
						rows={2}
						maxLength={300}
						hintLabel="Max. 300 characters"
						{...register('description', { required: true })}
						errorMessage={
							errors.description?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Project brief description is required
								</p>
							) : undefined
						}
					/>
					<InputTextArea
						label="Why do you consider yourself a public good?"
						required
						rows={2}
						maxLength={300}
						hintLabel="Max. 300 characters"
						{...register('considering_desc', { required: true })}
						errorMessage={
							errors.considering_desc?.type === 'required' ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Considering description is required
								</p>
							) : undefined
						}
					/>
				</div>
			</div>
			<div className="p-3 md:p-5 flex flex-col md:flex-row items-center md:justify-end space-x-0 md:space-x-4 space-y-4 md:space-y-0">
				<div className="w-full lg:w-auto">
					<Button
						color="white"
						isFullWidth
						onClick={() => setDefaultData()}
						className="!py-3 !border !border-grantpicks-black-400 disabled:cursor-not-allowed"
						isDisabled={
							projectData?.name === watch().title &&
							projectData?.overview === watch().description &&
							projectData?.overview === watch().considering_desc
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
							projectData?.name === watch().title &&
							projectData?.overview === watch().description &&
							projectData?.overview === watch().considering_desc
						}
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectOverview
