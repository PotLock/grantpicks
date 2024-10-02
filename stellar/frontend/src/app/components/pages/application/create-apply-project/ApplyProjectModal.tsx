import Button from '@/app/components/commons/Button'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Modal from '@/app/components/commons/Modal'
import IconClose from '@/app/components/svgs/IconClose'
import IconErrorCircle from '@/app/components/svgs/IconErrorCircle'
import IconProject from '@/app/components/svgs/IconProject'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import CMDWallet from '@/lib/wallet'
import { getProjectApplicant } from '@/services/on-chain/project-registry'
import {
	applyProjectToRound,
	ApplyProjectToRoundParams,
} from '@/services/on-chain/round'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { BaseModalProps } from '@/types/dialog'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { prettyTruncate } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import Image from 'next/image'
import { Project } from 'project-registry-client'
import React, { useEffect, useState } from 'react'

interface ApplyProjectToRoundModalProps extends BaseModalProps {
	round_id?: bigint
	roundData?: IGetRoundsResponse
}

const ApplyProjectModal = ({
	isOpen,
	onClose,
	round_id,
	roundData,
}: ApplyProjectToRoundModalProps) => {
	const { setCreateProjectFormMainProps } = useModalContext()
	const { stellarPubKey, stellarKit } = useWallet()
	const [isProjectMissingInfo, setIsProjectMissingInfo] =
		useState<boolean>(false)
	const [projectData, setProjectData] = useState<Project | undefined>(undefined)
	const [applyNote, setApplyNote] = useState<string>('')
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const { setSuccessApplyProjectInitProps } = useModalContext()
	const storage = useAppStorage()

	const fetchProjectApplicant = async () => {
		try {
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const res = await getProjectApplicant(stellarPubKey, contracts)
			//@ts-ignore
			if (!res?.error) setProjectData(res)
			//@ts-ignore
			console.log('res project applicant', res, res?.error)
		} catch (error: any) {
			console.log('error fetch project applicant', error)
		}
	}

	const onApplyProjectToRound = async () => {
		try {
			openPageLoading()
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const applyParams: ApplyProjectToRoundParams = {
				round_id: round_id as bigint,
				caller: stellarPubKey,
				applicant: stellarPubKey,
				note: applyNote,
				review_note: '',
			}
			const txApplyProject = await applyProjectToRound(
				applyParams,
				true,
				contracts,
			)
			const txHashApplyProject = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txApplyProject.toXDR(),
				stellarPubKey,
			)
			if (txHashApplyProject) {
				dismissPageLoading()
				setSuccessApplyProjectInitProps((prev) => ({
					...prev,
					isOpen: true,
					applyProjectRes: txApplyProject.result,
					txHash: txHashApplyProject,
					roundData,
				}))
				onClose()
			}
		} catch (error: any) {
			dismissPageLoading()
			console.log('error apply project to round', error)
		}
	}

	useEffect(() => {
		if (isOpen && !projectData) {
			fetchProjectApplicant()
		}
	}, [isOpen])

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
					Apply to {projectData?.name}
				</p>
				{projectData ? (
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
									<Button color="alpha-50" onClick={() => {}}>
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
										{prettyTruncate(projectData.owner, 18, 'address')}
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
				{projectData && !isProjectMissingInfo && (
					<div className="flex flex-col w-full space-y-4 mt-6">
						<Button
							color="black-950"
							onClick={onApplyProjectToRound}
							isFullWidth
						>
							<p className="text-sm font-semibold text-white">Apply</p>
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
								setCreateProjectFormMainProps((prev) => ({
									...prev,
									isOpen: true,
								}))
								onClose()
							}}
							isFullWidth
							className="!py-3"
						>
							<div className="flex items-center space-x-2">
								<IconProject size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-semibold text-white">
									Create New Project
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
