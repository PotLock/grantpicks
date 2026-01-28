import Button from '@/app/components/commons/Button'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Modal from '@/app/components/commons/Modal'
import IconClose from '@/app/components/svgs/IconClose'
import IconErrorCircle from '@/app/components/svgs/IconErrorCircle'
import IconProject from '@/app/components/svgs/IconProject'
import IconDollar from '@/app/components/svgs/IconDollar'
import IconCalendar from '@/app/components/svgs/IconCalendar'
import IconClock from '@/app/components/svgs/IconClock'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { GPRound } from '@/models/round'
import { getProjectApplicant } from '@/services/stellar/project-registry'
import {
	applyProjectToRound,
	ApplyProjectToRoundParams,
} from '@/services/stellar/round'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { BaseModalProps } from '@/types/dialog'
import { prettyTruncate, formatStroopToXlm } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from 'project-registry-client'
import React, { useCallback, useEffect, useState } from 'react'
import { ListExternal } from '../../../../../../lists-client/src'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import clsx from 'clsx'

interface ApplyProjectToRoundModalProps extends BaseModalProps {
	round_id?: bigint
	roundData?: GPRound
}

const ApplyProjectModal = ({
	isOpen,
	onClose,
	round_id,
	roundData,
}: ApplyProjectToRoundModalProps) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { setCreateProjectFormMainProps } = useModalContext()
	const { stellarPubKey, stellarKit, onOpenStellarWallet } = useWallet()
	const [isProjectMissingInfo] =
		useState<boolean>(false)
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [applyNote, setApplyNote] = useState<string>('')
	const { openPageLoading, dismissPageLoading, stellarPrice } = useGlobalContext()
	const { setSuccessApplyProjectInitProps } = useModalContext()
	const [loading, setLoading] = useState<boolean>(true)
	const [listDetails, setListDetails] = useState<ListExternal | undefined>(
		undefined,
	)
	const [isRegistered, setIsRegistered] = useState<boolean>(true)
	const [isRegistering, setIsRegistering] = useState<boolean>(false)
	const storage = useAppStorage()

	// Check if user can auto-register
	const canAutoRegister = useCallback(() => {
		if (!listDetails || isRegistered) return false
		return (
			listDetails.admin_only_registrations === false &&
			listDetails.default_registration_status?.tag === 'Approved'
		)
	}, [listDetails, isRegistered])

	const fetchIsRegistered = useCallback(async () => {
		if (roundData?.application_wl_list_id) {
			const contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}
			try {
				const isRegistered = await contracts.lists_contract.is_registered({
					list_id: BigInt(roundData?.application_wl_list_id),
					registrant_id: stellarPubKey,
					required_status: {
						tag: 'Approved',
						values: undefined,
					},
				})
				setIsRegistered(isRegistered.result)

				const listDetails = await contracts.lists_contract.get_list({
					list_id: BigInt(roundData?.application_wl_list_id),
				})


				setListDetails(listDetails.result || {})
				setLoading(false)
			} catch (error) {
				console.log('error fetch list details', error)
				setLoading(false)
			}
		}
	}, [stellarPubKey, roundData, storage])

	const fetchProjectApplicant = useCallback(async () => {
		try {
			if (stellarPubKey) {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}
				setLoading(true)

				const res = await getProjectApplicant(stellarPubKey, contracts)
				//@ts-ignore
				if (!res?.error) setProjectData(res)
			}
		} catch (error: any) {
			console.log('error fetch project applicant', error)
		} finally {
			setLoading(false)
		}
	}, [storage, stellarPubKey])

	// Internal function to handle applying to round
	const performApplyToRound = useCallback(async () => {
		if (stellarPubKey) {
			let contracts = storage.getStellarContracts()

			if (!contracts || !round_id) {
				return
			}

			const applyParams: ApplyProjectToRoundParams = {
				round_id: round_id,
				caller: stellarPubKey,
				note: applyNote,
			}
			const txApplyProject = await applyProjectToRound(applyParams, contracts)

			const txHashApplyProject = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txApplyProject.toXDR(),
				stellarPubKey,
			)
			if (txHashApplyProject) {
				dismissPageLoading()
				setIsRegistering(false)
				setSuccessApplyProjectInitProps((prev) => ({
					...prev,
					isOpen: true,
					applyProjectRes: txApplyProject.result,
					txHash: txHashApplyProject,
					roundData,
				}))
				onClose()
			}
		}
	}, [storage, stellarPubKey, applyNote, round_id, stellarKit, roundData, setSuccessApplyProjectInitProps, onClose, dismissPageLoading])

	const handleAutoRegisterAndApply = useCallback(async () => {
		if (!stellarPubKey || !roundData?.application_wl_list_id || !listDetails) return

		try {
			setIsRegistering(true)
			openPageLoading()

			const contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}

			// Register to list
			const txRegisterList = await contracts.lists_contract.register_batch({
				submitter: stellarPubKey,
				list_id: BigInt(roundData.application_wl_list_id),
				notes: 'Auto-registered to apply to round',
				registrations: undefined,
			})

			const txHashRegister = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txRegisterList.toXDR(),
				stellarPubKey,
			)

			if (txHashRegister) {
				setIsRegistered(true)
				toast.success('Successfully registered to list!', {
					style: toastOptions.success.style,
				})
				// Now apply to round
				await performApplyToRound()
			}
		} catch (error: any) {
			dismissPageLoading()
			setIsRegistering(false)
			toast.error(error?.message || 'Failed to register to list', {
				style: toastOptions.error.style,
			})
			console.log('error auto-registering', error)
		}
	}, [stellarPubKey, roundData, listDetails, storage, stellarKit, openPageLoading, dismissPageLoading, performApplyToRound])

	const onApplyProjectToRound = useCallback(async () => {
		try {
			if (!isRegistered && !canAutoRegister()) {
				toast.error('You are not eligible to apply to this round', {
					style: toastOptions.error.style,
				})
				return
			}

			openPageLoading()
			await performApplyToRound()
		} catch (error: any) {
			dismissPageLoading()
			setIsRegistering(false)
			console.log('error apply project to round', error)
		}
	}, [isRegistered, canAutoRegister, openPageLoading, performApplyToRound, dismissPageLoading])

	useEffect(() => {
		if (isOpen && !projectData) {
			fetchProjectApplicant()
			fetchIsRegistered()
		}
	}, [isOpen, projectData, fetchProjectApplicant, fetchIsRegistered])

	const addApplyQuery = () => {
		const currentParams = new URLSearchParams(searchParams.toString())
		currentParams.set(
			'apply_round',
			roundData?.on_chain_id.toString() as string,
		)
		router.push(`?${currentParams.toString()}`, {
			scroll: false,
		})
	}

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return 'Not set'
		try {
			const date = new Date(dateString)
			return date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			})
		} catch {
			return 'Invalid date'
		}
	}

	const isApplicationOpen = () => {
		if (!roundData?.application_start || !roundData?.application_end) return true
		const now = new Date()
		const start = new Date(roundData.application_start)
		const end = new Date(roundData.application_end)
		return now >= start && now <= end
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			closeOnBgClick={true}
			closeOnEscape={true}
		>
			<div className="w-full max-w-[720px] mx-auto bg-white rounded-2xl shadow-xl pt-10 pb-6 px-5 sm:px-8 relative max-h-[92vh] overflow-y-auto border border-black/5">
				<IconClose
					size={24}
					className="fill-grantpicks-black-600 absolute top-5 right-5 cursor-pointer hover:opacity-70 transition z-10"
					onClick={() => {
						setProjectData(undefined)
						onClose()
					}}
				/>
				<div className="text-center mb-6">
					<p className="text-lg md:text-xl lg:text-2xl font-bold text-grantpicks-black-950">
						Apply to Round
					</p>
					<p className="text-base md:text-lg font-semibold text-grantpicks-black-950 mt-1">
						{roundData?.name}
					</p>
				</div>

				{/* Round Details Section */}
				{roundData && (
					<div className="bg-grantpicks-black-50 rounded-2xl p-5 mb-6 border border-black/10 shadow-sm">
						<div className="flex flex-col gap-3">
							<div>
								<p className="text-xs font-semibold text-grantpicks-black-600 uppercase tracking-[0.2em]">
									About this round
								</p>
								<p className="text-sm text-grantpicks-black-950 line-clamp-4 mt-2">
									{roundData.description || 'No additional description provided.'}
								</p>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								{roundData.expected_amount && (
									<div className="flex items-start gap-3">
										<div className="bg-white rounded-2xl p-3 border border-black/10">
											<IconDollar size={18} className="fill-grantpicks-black-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-grantpicks-black-500 uppercase tracking-[0.25em]">
												Expected funding
											</p>
											<p className="text-base font-semibold text-grantpicks-black-950">
												{formatStroopToXlm(BigInt(roundData.expected_amount || 0))} XLM
												{roundData.expected_amount && stellarPrice > 0 && (
													<span className="text-xs font-normal text-grantpicks-black-600 ml-1">
														{`(~$${(Number(formatStroopToXlm(BigInt(roundData.expected_amount))) * stellarPrice).toFixed(2)} USD)`}
													</span>
												)}
											</p>
										</div>
									</div>
								)}
								{roundData.application_end && (
									<div className="flex items-start gap-3">
										<div className="bg-white rounded-2xl p-3 border border-black/10">
											<IconCalendar size={18} className="fill-grantpicks-black-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-grantpicks-black-500 uppercase tracking-[0.25em]">
												Application deadline
											</p>
											<p className="text-base font-semibold text-grantpicks-black-950">
												{formatDate(roundData.application_end)}
											</p>
										</div>
									</div>
								)}
								{roundData.voting_start && (
									<div className="flex items-start gap-3">
										<div className="bg-white rounded-2xl p-3 border border-black/10">
											<IconClock size={18} className="fill-grantpicks-black-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-grantpicks-black-500 uppercase tracking-[0.25em]">
												Voting period
											</p>
											<p className="text-base font-semibold text-grantpicks-black-950">
												{formatDate(roundData.voting_start)} - {formatDate(roundData.voting_end)}
											</p>
										</div>
									</div>
								)}
								{roundData.max_participants > 0 && (
									<div className="flex items-start gap-3">
										<div className="bg-white rounded-2xl p-3 border border-black/10">
											<IconProject size={18} className="fill-grantpicks-black-600" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-[11px] font-semibold text-grantpicks-black-500 uppercase tracking-[0.25em]">
												Max participants
											</p>
											<p className="text-base font-semibold text-grantpicks-black-950">
												{roundData.max_participants} projects
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
						{roundData.application_start && roundData.application_end && (
							<div
								className={clsx(
									'mt-5 p-3 rounded-xl border',
									isApplicationOpen()
										? 'border-green-200 bg-green-50 text-green-800'
										: 'border-grantpicks-amber-200 bg-grantpicks-amber-50 text-grantpicks-amber-700',
								)}
							>
								<p className="text-sm font-semibold">
									{isApplicationOpen()
										? 'Applications are currently open.'
										: new Date() < new Date(roundData.application_start || '')
											? `Applications open on ${formatDate(roundData.application_start)}`
											: `Applications closed on ${formatDate(roundData.application_end)}`}
								</p>
							</div>
						)}
					</div>
				)}
				{loading ? (
					<div className="flex items-center justify-center h-52">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grantpicks-black-950" />
					</div>
				) : projectData ? (
					isProjectMissingInfo ? (
						<>
							<div className="mt-6 border border-grantpicks-red-100 rounded-xl p-4 bg-grantpicks-red-50 flex space-x-2">
								<IconErrorCircle
									size={18}
									className="fill-grantpicks-red-600"
								/>
								<div>
									<p className="text-grantpicks-red-950 mb-1 text-sm font-semibold">
										YOU HAVE SOME MISSING INFORMATION
									</p>
									<p className="text-grantpicks-red-600 text-sm font-normal">
										Please update your project to apply to round.
									</p>
								</div>
							</div>
							<div className="mt-6 rounded-xl border border-black/10">
								<div className="py-3 px-4 bg-grantpicks-black-50 rounded-t-xl">
									<p className="text-sm font-semibold text-grantpicks-black-950">
										1 Project found from Potlock
									</p>
								</div>
								<div className="p-4 flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<div className="bg-grantpicks-black-400 rounded-full w-10 h-10" />
										<div>
											<p className="text-base font-normal text-grantpicks-black-950">
												Magicbuild
											</p>
											<p className="text-xs font-normal text-grantpicks-black-600">
												@magicbuild.near
											</p>
										</div>
									</div>
									<Button color="alpha-50" onClick={() => { }}>
										Update
									</Button>
								</div>
							</div>
						</>
					) : (
						<>
							{/* Project Details Section */}
							<div className="bg-white border border-black/10 rounded-xl p-4 mb-6">
								<p className="text-xs font-semibold text-grantpicks-black-600 uppercase mb-3">
									Your Project
								</p>
								<div className="flex items-start space-x-3">
									<div className="relative flex-shrink-0">
										{projectData.owner ? (
											<Image
												src={`https://www.tapback.co/api/avatar/${projectData.owner}`}
												alt={projectData.name}
												width={56}
												height={56}
												className="rounded-lg object-cover"
											/>
										) : (
											<div className="w-14 h-14 bg-grantpicks-black-100 rounded-lg flex items-center justify-center">
												<IconProject size={24} className="fill-grantpicks-black-400" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-base font-bold text-grantpicks-black-950 mb-1">
											{projectData.name}
										</p>
										<p className="text-xs font-normal text-grantpicks-black-600 mb-2">
											{prettyTruncate(projectData.owner, 20, 'address')}
										</p>
										{projectData.overview && (
											<p className="text-sm text-grantpicks-black-700 line-clamp-2 mt-2">
												{projectData.overview}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* Application Note Section */}
							<div className="mb-6">
								<InputTextArea
									label="Application Note"
									rows={4}
									onChange={(e) => setApplyNote(e.target.value)}
									value={applyNote}
									hintLabel="Explain why your project is a good fit for this round. This helps the Round Manager make an informed decision."
									placeholder="Tell the Round Manager why your project should be selected..."
								/>
							</div>
						</>
					)
				) : (
					<>
						<div className="py-6 flex items-center justify-center">
							<div className="bg-grantpicks-black-100 p-1">
								<Image
									width={36}
									height={36}
									src="/assets/images/document.png"
									alt=""
									className="object-contain"
								/>
							</div>
						</div>
						<p className="text-center text-base font-bold text-grantpicks-black-950">
							No Project found
						</p>
					</>
				)}
				{listDetails?.name && !isRegistered && (
					<div className="flex flex-col w-full mt-6">
						{canAutoRegister() ? (
							<p className="text-sm font-semibold text-grantpicks-black-950">
								This is a private round. You will be automatically registered to the{' '}
								<Link
									className="text-blue-500"
									href={`/list/${listDetails.id}`}
									target="_blank"
								>
									{listDetails.name}
								</Link>{' '}
								list when you apply.
							</p>
						) : (
							<p className="text-sm font-semibold text-grantpicks-black-950">
								This is a private round. You must be an approved registrant to the
								list{' '}
								<Link
									className="text-blue-500"
									href={`/list/${listDetails.id}`}
									target="_blank"
								>
									{listDetails.name}
								</Link>{' '}
								to apply.
							</p>
						)}
					</div>
				)}
				{projectData && !isProjectMissingInfo && (
					<div className="flex flex-col w-full space-y-4 mt-6">
						<Button
							color="black-950"
							onClick={async () => {
								if (!isRegistered && canAutoRegister()) {
									await handleAutoRegisterAndApply()
								} else {
									await onApplyProjectToRound()
								}
							}}
							isDisabled={!isRegistered && !canAutoRegister()}
							isLoading={isRegistering}
							isFullWidth
						>
							<p className="text-sm font-semibold text-white">
								{isRegistering
									? 'Registering...'
									: isRegistered
										? 'Apply'
										: canAutoRegister()
											? 'Register & Apply'
											: 'Not Eligible to Apply'}
							</p>
						</Button>
						<Button
							color="transparent"
							onClick={() => {
								setProjectData(undefined)
								onClose()
							}}
							isFullWidth
						>
							Cancel
						</Button>
					</div>
				)}
				{!projectData && (
					<div className="flex flex-col w-full mt-6">
						<Button
							color="black-950"
							onClick={() => {
								if (!stellarPubKey) {
									onOpenStellarWallet()
								} else {
									addApplyQuery()
									setCreateProjectFormMainProps((prev) => ({
										...prev,
										isOpen: true,
									}))
								}
								onClose()
							}}
							isFullWidth
							className="!py-3"
						>
							<div className="flex items-center space-x-2">
								<IconProject size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-white">
									{stellarPubKey ? 'Create New Project' : 'Connect Wallet'}
								</p>
							</div>
						</Button>
					</div>
				)}
			</div>
		</Modal>
	)
}

export default ApplyProjectModal
