import Button from '@/app/components/commons/Button'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Modal from '@/app/components/commons/Modal'
import IconClose from '@/app/components/svgs/IconClose'
import IconErrorCircle from '@/app/components/svgs/IconErrorCircle'
import IconProject from '@/app/components/svgs/IconProject'
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
import { prettyTruncate } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Project } from 'project-registry-client'
import React, { useCallback, useEffect, useState } from 'react'
import { ListExternal } from '../../../../../../lists-client/src'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'

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
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
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

				console.log(isRegistered.result)
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

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			closeOnBgClick={true}
			closeOnEscape={true}
		>
			<div className="w-11/12 md:w-[400px] mx-auto bg-white rounded-xl shadow-md pt-14 px-6 pb-6 relative">
				<IconClose
					size={24}
					className="fill-grantpicks-black-600 absolute top-5 right-5 cursor-pointer hover:opacity-70 transition"
					onClick={() => {
						setProjectData(undefined)
						onClose()
					}}
				/>
				<p className="text-base md:text-lg lg:text-xl font-semibold text-grantpicks-black-950 text-center">
					Apply to {roundData?.name}
				</p>
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
							<div className="flex items-center space-x-2 mt-6">
								<Image
									src={`https://www.tapback.co/api/avatar/${projectData.owner}`}
									alt="owner"
									width={40}
									height={40}
								/>
								<div>
									<p className="text-sm font-bold text-grantpicks-black-950">
										{prettyTruncate(projectData.name, 18, 'address')}
									</p>
									<p className="text-sm font-normal text-grantpicks-black-600">
										{prettyTruncate(projectData.owner, 18, 'address')}
									</p>
								</div>
							</div>
							<div className="mt-6">
								<InputTextArea
									label="Leave a note"
									rows={3}
									onChange={(e) => setApplyNote(e.target.value)}
									value={applyNote}
									hintLabel="Leaving a note helps create a better impression on the Round Manager."
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
