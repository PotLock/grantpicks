'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm, FormProvider, useFieldArray, SubmitHandler } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'

// Components
import TopNav from '@/app/components/commons/TopNav'
import Button from '@/app/components/commons/Button'
import CreateRoundLayout from '@/app/components/pages/create-round/CreateRoundLayout'
import StepIndicator from '@/app/components/pages/create-round/steps/StepIndicator'
import Step1BasicInfo from '@/app/components/pages/create-round/steps/Step1BasicInfo'
import Step2Timing from '@/app/components/pages/create-round/steps/Step2Timing'
import Step3Funding from '@/app/components/pages/create-round/steps/Step3Funding'
import Step4ProjectsPermissions from '@/app/components/pages/create-round/steps/Step4ProjectsPermissions'

// Providers & Stores
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { useModalContext } from '@/app/providers/ModalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import useCreateRoundStore from '@/stores/zustand/useCreateRoundStore'

// Types & Services
import { CreateRoundData } from '@/types/form'
import { IndexerProjectResponse } from '@/services/stellar/project-registry'
import {
	addProjectsRound,
	createRound,
	CreateRoundParams,
	depositFundRound,
} from '@/services/stellar/round'
import { normalizeCreateRoundTimings, parseToStroop } from '@/utils/helper'
import { toastOptions } from '@/constants/style'
import { IRoundPeriodData } from '@/types/round'
import { convertToBasisPoints, LIMIT_SIZE } from '@/constants/query'
import useSWRInfinite from 'swr/infinite'
import { GPRound } from '@/models/round'
import { usePotlockService } from '@/services/potlock'
import { APIListExternal } from '@/app/components/pages/application/lists/ListCard'

const STEPS = ['Basic Info', 'Timing', 'Funding', 'Projects']

const CreateRoundPage = () => {
	const router = useRouter()
	const { currentStep, setCurrentStep, formData, setFormData, resetStore } = useCreateRoundStore()
	const { stellarPrice, openPageLoading, dismissPageLoading } = useGlobalContext()
	const { stellarPubKey, stellarKit, onOpenStellarWallet } = useWallet()
	const { setSuccessCreateRoundModalProps } = useModalContext()
	const storage = useAppStorage()
	const potlockApi = usePotlockService()

	// Local UI State
	const [amountUsd, setAmountUsd] = useState('0.00')
	const [expectAmountUsd, setExpectAmountUsd] = useState('0.00')
	const [minimumDepositUsd, setMinimumDepositUsd] = useState('0.00')
	const [showAddProjectsModal, setShowAddProjectsModal] = useState(false)
	const [showAddAdminsModal, setShowAddAdminsModal] = useState(false)
	const [showLists, setShowLists] = useState(true)
	const [showApplicationLists, setShowApplicationLists] = useState(true)
	const [checkedListIds, setCheckedListIds] = useState<bigint[]>([])
	const [checkedApplicationListIds, setCheckedApplicationListIds] = useState<bigint[]>([])
	const [selectedProjects, setSelectedProjects] = useState<IndexerProjectResponse[]>([])
	const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
	const [cooldownPeriodData, setCooldownPeriodData] = useState<IRoundPeriodData>({
		selected: 'days',
		isOpen: false,
		period_ms: null,
	})

	const methods = useForm<CreateRoundData>({
		mode: 'onChange',
		defaultValues: formData,
	})

	const {
		control,
		handleSubmit,
		trigger,
		watch,
		reset,
		formState: { isSubmitting },
	} = methods

	const { append: appendProject, remove: removeProject } = useFieldArray({
		control,
		name: 'projects',
	})
	const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
		control,
		name: 'admins',
	})

	// Sync store with form on change
	useEffect(() => {
		const subscription = watch((value) => {
			setFormData(value as Partial<CreateRoundData>)
		})
		return () => subscription.unsubscribe()
	}, [watch, setFormData])

	const onAddApprovedProjects = async (roundId: bigint) => {
		try {
			const contracts = storage.getStellarContracts()
			if (!contracts) return

			const projects = selectedProjects.map((p) => p.on_chain_id)
			const txAddProject = await addProjectsRound(roundId, stellarPubKey, projects, contracts)
			return await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txAddProject.toXDR(),
				stellarPubKey,
			)
		} catch (error) {
			console.error('Error adding projects:', error)
			dismissPageLoading()
		}
	}

	const onInitialDeposit = async (roundId: bigint) => {
		try {
			const contracts = storage.getStellarContracts()
			if (!contracts) return

			const txDeposit = await depositFundRound(
				{
					caller: stellarPubKey,
					round_id: roundId,
					amount: BigInt(parseToStroop(watch('amount'))),
					memo: '',
				},
				contracts,
			)
			return await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txDeposit.toXDR(),
				stellarPubKey,
			)
		} catch (error) {
			console.error('Error initial deposit:', error)
			dismissPageLoading()
		}
	}

	const onCreateRound: SubmitHandler<CreateRoundData> = async (data) => {
		// Prevent submission if not on the final step
		if (currentStep !== 4) {
			return
		}

		if (!data.allow_application && selectedProjects.length < 2) {
			return toast.error('Please add at least 2 projects for a voting-only round', {
				style: toastOptions.error.style,
			})
		}

		try {
			openPageLoading()
			const contracts = storage.getStellarContracts()
			if (!contracts) return

			const maxParticipants = Math.max(data.max_participants, 10, selectedProjects.length)

			const now = new Date()
			const {
				applicationStartMs,
				applicationEndMs,
				votingStartMs: votingStartEffectiveMs,
				votingEndMs: votingEndEffectiveMs,
			} = normalizeCreateRoundTimings({
				now,
				allowApplications: data.allow_application,
				applicationStart: data.apply_duration_start,
				applicationEnd: data.apply_duration_end,
				votingStart: data.voting_duration_start,
				votingEnd: data.voting_duration_end,
			})

			const votingStartEffectiveDate = new Date(votingStartEffectiveMs)
			const votingEndEffectiveDate = new Date(votingEndEffectiveMs)

			const createRoundParams: CreateRoundParams = {
				owner: stellarPubKey,
				name: data.title,
				description: data.description,
				application_start_ms: applicationStartMs !== undefined ? BigInt(applicationStartMs) : undefined,
				application_end_ms: applicationEndMs !== undefined ? BigInt(applicationEndMs) : undefined,
				contacts: [{ name: data.contact_type, value: data.contact_address }],
				expected_amount: parseToStroop(data.expected_amount),
				minimum_deposit: parseToStroop(data.minimum_deposit),
				max_participants: maxParticipants,
				num_picks_per_voter: Math.max(data.vote_per_person, 1),
				use_whitelist: checkedListIds.length > 0,
				voting_wl_list_id: checkedListIds[0],
				is_video_required: data.is_video_required,
				use_whitelist_application: checkedApplicationListIds.length > 0,
				application_wl_list_id: checkedApplicationListIds[0],
				allow_applications: data.allow_application,
				use_vault: true,
				voting_start_ms: BigInt(votingStartEffectiveMs),
				voting_end_ms: BigInt(votingEndEffectiveMs),
				admins: data.admins?.map((a) => a.admin_id) || [],
				allow_remaining_dist: data.allow_remaining_dist || false,
				compliance_req_desc: data.compliance_req_desc,
				cooldown_period_ms: cooldownPeriodData.period_ms ? BigInt(cooldownPeriodData.period_ms) : undefined,
				remaining_dist_address: data.remaining_dist_address || storage.my_address || '',
				referrer_fee_basis_points: convertToBasisPoints(data.referrer_fee_basis_points),
			} as CreateRoundParams

			const txCreate = await createRound(stellarPubKey, createRoundParams, contracts)
			const txHash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txCreate.toXDR(),
				stellarPubKey,
			)

			if (txHash) {
				const roundId = txCreate.result.id
				if (selectedProjects.length > 0) await onAddApprovedProjects(roundId)
				if (watch('amount') && watch('amount') !== '0') await onInitialDeposit(roundId)

				setSuccessCreateRoundModalProps((prev) => ({
					...prev,
					isOpen: true,
					createRoundRes: {
						...txCreate.result,
						voting_start: votingStartEffectiveDate.toISOString(),
						voting_end: votingEndEffectiveDate.toISOString(),
					} as any,
					txHash,
				}))
				reset()
				resetStore() // Reset the step and store data only on success
				router.push('/rounds')
			}
		} catch (error: any) {
			toast.error(error?.message || 'Failed to create round', { style: toastOptions.error.style })
		} finally {
			dismissPageLoading()
		}
	}

	const nextStep = async (e?: React.MouseEvent<HTMLButtonElement>) => {
		e?.preventDefault()
		e?.stopPropagation()

		let fieldsToValidate: any[] = []
		if (currentStep === 1) fieldsToValidate = ['title', 'description', 'contact_type', 'contact_address']
		if (currentStep === 2) fieldsToValidate = ['voting_duration_start', 'voting_duration_end']
		if (currentStep === 3) fieldsToValidate = ['expected_amount', 'minimum_deposit']

		const isValid = await trigger(fieldsToValidate)
		if (isValid) {
			setCurrentStep(currentStep + 1)
		}
	}

	const prevStep = () => setCurrentStep(currentStep - 1)

	// SWR for whitelists
	const { data: listData, size, setSize, isValidating, isLoading, error } = useSWRInfinite(
		(index) => ({ url: 'get-lists', skip: index * LIMIT_SIZE, chain: storage.chainId }),
		async () => await potlockApi.getLists(),
		{ revalidateFirstPage: true }
	)

	const lists = listData ? [].concat(...(listData as any)) : []
	const isReachingEnd = !listData || (listData[listData.length - 1]?.length || 0) < LIMIT_SIZE

	return (
		<CreateRoundLayout>
			<TopNav />
			<div className="w-[90%] md:w-[70%] lg:w-[50%] mx-auto pt-28 md:pt-32 lg:pt-36 pb-16">
				<p className="text-4xl md:text-5xl font-black text-center uppercase mb-8 md:mb-12 text-grantpicks-black-950">
					Create new Round
				</p>

				<StepIndicator currentStep={currentStep} steps={STEPS} />

				<FormProvider {...methods}>
					<form
						onSubmit={(e) => {
							// Only allow form submission on step 4
							if (currentStep !== 4) {
								e.preventDefault()
								e.stopPropagation()
								return false
							}
							return handleSubmit(onCreateRound)(e)
						}}
						className="space-y-8"
					>
						{currentStep === 1 && <Step1BasicInfo />}
						{currentStep === 2 && (
							<Step2Timing
								cooldownPeriodData={cooldownPeriodData}
								setCooldownPeriodData={setCooldownPeriodData}
							/>
						)}
						{currentStep === 3 && (
							<Step3Funding
								stellarPrice={stellarPrice}
								amountUsd={amountUsd}
								setAmountUsd={setAmountUsd}
								expectAmountUsd={expectAmountUsd}
								setExpectAmountUsd={setExpectAmountUsd}
								minimumDepositUsd={minimumDepositUsd}
								setMinimumDepositUsd={setMinimumDepositUsd}
							/>
						)}
						{currentStep === 4 && (
							<Step4ProjectsPermissions
								selectedProjects={selectedProjects}
								setSelectedProjects={setSelectedProjects}
								selectedAdmins={selectedAdmins}
								setSelectedAdmins={setSelectedAdmins}
								showAddProjectsModal={showAddProjectsModal}
								setShowAddProjectsModal={setShowAddProjectsModal}
								showAddAdminsModal={showAddAdminsModal}
								setShowAddAdminsModal={setShowAddAdminsModal}
								appendProject={appendProject}
								removeProject={removeProject}
								appendAdmin={appendAdmin}
								removeAdmin={removeAdmin}
								showLists={showLists}
								setShowLists={setShowLists}
								lists={lists}
								checkedListIds={checkedListIds}
								setCheckedListIds={setCheckedListIds}
								showApplicationLists={showApplicationLists}
								setShowApplicationLists={setShowApplicationLists}
								checkedApplicationListIds={checkedApplicationListIds}
								setCheckedApplicationListIds={setCheckedApplicationListIds}
								isValidating={isValidating}
								setSize={setSize}
								size={size}
								isReachingEnd={isReachingEnd}
								networkError={error}
								isLoading={isLoading}
								isOwner={(id) => stellarPubKey === id}
								isAdmin={(admins) => admins.includes(stellarPubKey)}
							/>
						)}

						<div className="flex items-center gap-4 pt-4">
							{currentStep > 1 && (
								<Button
									type="button"
									color="transparent"
									className="border border-grantpicks-black-200 !py-3"
									isFullWidth
									onClick={prevStep}
								>
									Back
								</Button>
							)}
							{currentStep < 4 ? (
								<Button
									type="button"
									color="black-950"
									className="!py-3"
									isFullWidth
									onClick={(e) => {
										e.preventDefault()
										e.stopPropagation()
										nextStep(e)
									}}
								>
									Next Step
								</Button>
							) : stellarPubKey ? (
								<Button
									type="submit"
									color="black-950"
									className="!py-3"
									isFullWidth
									isDisabled={
										isSubmitting ||
										(!watch('allow_application') && selectedProjects.length < 2)
									}
									onClick={(e) => {
										// Ensure we're on step 4 before allowing submission
										if (currentStep !== 4) {
											e.preventDefault()
											e.stopPropagation()
											return false
										}
										// Validate projects requirement
										if (!watch('allow_application') && selectedProjects.length < 2) {
											e.preventDefault()
											e.stopPropagation()
											toast.error('Please add at least 2 projects for a voting-only round', {
												style: toastOptions.error.style,
											})
											return false
										}
									}}
								>
									{isSubmitting ? 'Creating...' : 'Create Round'}
								</Button>
							) : (
								<Button type="button" color="black-950" className="!py-3" isFullWidth onClick={() => onOpenStellarWallet()}>
									Connect Wallet
								</Button>
							)}
						</div>
					</form>
				</FormProvider>
			</div>
		</CreateRoundLayout>
	)
}

export default CreateRoundPage
