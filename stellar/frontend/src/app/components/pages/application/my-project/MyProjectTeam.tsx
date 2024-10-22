import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'
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
import { CreateProjectStep2Data } from '@/types/form'
import { Network } from '@/types/on-chain'
import { prettyTruncate } from '@/utils/helper'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useMyProject } from './MyProjectProvider'
import { StrKey } from 'round-client'
import useAppStorage from '@/stores/zustand/useAppStorage'
import Image from 'next/image'
import { NEAR_ADDRESS_REGEX } from '@/constants/regex'
import {
	NearProjectFundingHistory,
	NearSocialGPProject,
} from '@/services/near/near-social'

const MyProjectTeam = () => {
	const { projectData, fetchProjectApplicant } = useMyProject()
	const { stellarPubKey, stellarKit, nearWallet } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const [members, setMembers] = useState<string[]>([])
	const [sameMemberError, setSameMemberError] = useState<boolean>(false)
	const {
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep2Data>()
	const storage = useAppStorage()

	const setDefaultData = () => {
		if (projectData) {
			setMembers(projectData.team_members.map((mem: any) => mem))
		}
	}

	const onSaveChanges: SubmitHandler<CreateProjectStep2Data> = async (data) => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const params: IUpdateProjectParams = {
					...projectData,
					name: projectData?.name || '',
					overview: projectData?.overview || '',
					fundings: projectData?.funding_histories || [],
					contacts: projectData?.contacts || [],
					contracts: projectData?.contracts || [],
					image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
					payout_address: projectData?.payout_address || '',
					repositories: projectData?.repositories || [],
					team_members: members.map((mem) => ({ name: mem, value: mem })),
					video_url: projectData?.video_url || '',
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
					toast.success(`Update project team is succeed`, {
						style: toastOptions.success.style,
					})
				}
			} else {
				const contracts = storage.getNearContracts(nearWallet)

				if (!contracts) {
					return
				}

				const params: NearSocialGPProject = {
					name: projectData?.name || '',
					overview: projectData?.overview || '',
					fundings:
						(projectData?.funding_histories as unknown as NearProjectFundingHistory[]) ||
						[],
					contacts: projectData?.contacts || [],
					contracts: projectData?.contracts || [],
					image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
					payout_address: projectData?.payout_address || '',
					repositories: projectData?.repositories || [],
					team_members: members,
					video_url: projectData?.video_url || '',
					owner: projectData?.owner || '',
				}

				const txUpdateProject = await contracts.near_social.setProjectData(
					storage.my_address || '',
					params,
				)

				if (txUpdateProject) {
					dismissPageLoading()
					setTimeout(async () => {
						await fetchProjectApplicant()
					}, 2000)
					toast.success(`Update project team is succeed`, {
						style: toastOptions.success.style,
					})
				}
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(`Update project team is failed`, {
				style: toastOptions.error.style,
			})
			console.log('error to update team project', error)
		}
	}
	useEffect(() => {
		if (projectData) {
			setDefaultData()
		}
	}, [projectData])

	useEffect(() => {
		setSameMemberError(false)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch('member')])

	return (
		<div className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950">
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Team
				</p>
				<div className="mb-6 w-full">
					<InputText
						required
						placeholder="Account ID, Comma separated"
						{...register('member')}
						onKeyDown={async (e) => {
							if (e.key == 'Enter') {
								if (storage.chainId === 'stellar') {
									if (!StrKey.isValidEd25519PublicKey(watch('member'))) {
										toast.error('Address is not valid', {
											style: toastOptions.error.style,
										})
										return
									}
								} else {
									if (!NEAR_ADDRESS_REGEX(watch('member'))) {
										toast.error('Address is not valid', {
											style: toastOptions.error.style,
										})
										return
									}
								}

								if (members.includes(watch('member'))) {
									setSameMemberError(true)
								} else {
									const member = watch('member')
									setMembers((prev) => [...prev, member])
									setValue('member', '')
								}
							}
						}}
						suffixIcon={
							<button
								disabled={watch('member') === ''}
								onClick={() => {
									if (storage.chainId === 'stellar') {
										if (!StrKey.isValidEd25519PublicKey(watch('member'))) {
											toast.error('Address is not valid', {
												style: toastOptions.error.style,
											})
											return
										}
									} else {
										if (!NEAR_ADDRESS_REGEX(watch('member'))) {
											toast.error('Address is not valid', {
												style: toastOptions.error.style,
											})
											return
										}
									}

									if (members.includes(watch('member'))) {
										setSameMemberError(true)
									} else {
										setMembers((prev) => [...prev, watch('member')])
										setValue('member', '')
									}
								}}
								className="text-sm font-semibold text-grantpicks-black-950 cursor-pointer hover:opacity-70 transition disabled:cursor-not-allowed"
							>
								Add
							</button>
						}
						errorMessage={
							members.length === 0 ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Team member is required
								</p>
							) : sameMemberError ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Team member is already added
								</p>
							) : undefined
						}
						hintLabel={
							storage.chainId === 'near'
								? 'You must put a valid NEAR address that belongs to your team member(s)'
								: 'You must put a valid STELLAR address that belongs to your team member(s)'
						}
					/>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
					{members.map((member, idx) => (
						<div
							key={idx}
							className="bg-grantpicks-black-100 rounded-lg p-2 md:p-4 relative flex flex-col items-center"
						>
							<IconCloseFilled
								size={24}
								className="fill-grantpicks-black-400 absolute top-3 right-3 cursor-pointer hover:opacity-70 transition"
								onClick={() => {
									setMembers((prev) => prev.filter((p) => p !== member))
								}}
							/>
							<Image
								src={`https://www.tapback.co/api/avatar/${member}`}
								alt="member"
								width={64}
								height={64}
								className="mb-2"
							/>
							<p className="text-base font-normal text-grantpicks-black-950">
								{prettyTruncate(member, 15, 'address')}
							</p>
						</div>
					))}
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
							projectData?.team_members.map((mem: any) => mem.value)?.length ===
								members.length || members.length === 0
						}
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						isFullWidth
						color="black-950"
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3 disabled:cursor-not-allowed"
						isDisabled={
							projectData?.team_members.map((mem: any) => mem.value)?.length ===
								members.length || members.length === 0
						}
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectTeam
