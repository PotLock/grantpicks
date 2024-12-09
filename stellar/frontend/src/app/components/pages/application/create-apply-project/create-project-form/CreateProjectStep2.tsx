import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconProject from '@/app/components/svgs/IconProject'
import { CreateProjectStep2Data } from '@/types/form'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'
import { prettyTruncate } from '@/utils/helper'
import { StrKey } from 'round-client'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { localStorageConfigs } from '@/configs/local-storage'
import Image from 'next/image'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NEAR_ADDRESS_REGEX } from '@/constants/regex'

const CreateProjectStep2 = () => {
	const [members, setMembers] = useState<string[]>([])
	const { setStep, data, setData } = useCreateProject()
	const [requiredError, setRequiredError] = useState<boolean>(false)
	const [validationError, setValidationError] = useState<boolean>(false)
	const [sameMemberError, setSameMemberError] = useState<boolean>(false)
	const {
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep2Data>()
	const storage = useAppStorage()

	const onNextStep2: SubmitHandler<CreateProjectStep2Data> = (submitData) => {
		if (members.length === 0) {
			setRequiredError(true)
			return
		}
		setData({
			...data,
			team_member: members,
		})
		setStep(3)
	}

	const onAddMember = async () => {
		if (storage.chainId === 'stellar') {
			if (!StrKey.isValidEd25519PublicKey(watch('member'))) {
				toast.error('Address is not valid', { style: toastOptions.error.style })
				return
			}
		} else {
			if (!NEAR_ADDRESS_REGEX(watch('member'))) {
				toast.error('Address is not valid', { style: toastOptions.error.style })
				return
			}
		}
		if (members.includes(watch('member'))) {
			toast.error('This admin is already added', {
				style: toastOptions.error.style,
			})
			return
		}
		const member = watch('member')
		setMembers((prev) => [...prev, member])
		setValue('member', '')
	}

	useEffect(() => {
		if (watch('member') !== '') {
			if (storage.chainId === 'stellar') {
				if (!StrKey.isValidEd25519PublicKey(watch('member'))) {
					setValidationError(true)
				} else {
					setValidationError(false)
				}
			} else {
				if (NEAR_ADDRESS_REGEX(watch('member'))) {
					setValidationError(false)
				} else {
					setValidationError(true)
				}
			}

			if (members.includes(watch('member'))) {
				setSameMemberError(true)
			} else {
				setSameMemberError(false)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch('member'), members])

	useEffect(() => {
		setRequiredError(false)
		if (watch('member') === '') {
			setValidationError(false)
			setSameMemberError(false)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [watch('member')])

	useEffect(() => {
		const draftData = localStorage.getItem(
			localStorageConfigs.CREATE_PROJECT_STEP_2,
		)
		if (draftData) {
			const draft = JSON.parse(draftData)
			setMembers(draft)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (members.length != 0) {
			localStorage.setItem(
				localStorageConfigs.CREATE_PROJECT_STEP_2,
				JSON.stringify(members),
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [members])

	return (
		<div className="bg-grantpicks-black-50 w-full relative overflow-y-auto h-[70vh]">
			<div className="pt-10 px-4 md:px-6 border-b border-black/10">
				<div className="flex items-center space-x-2 mb-4">
					<IconCheckCircle size={18} className="fill-grantpicks-green-600" />
					<p className="text-sm font-semibold text-grantpicks-black-950">
						YOUR PROGRESS HAS BEEN SAVED
					</p>
				</div>
				<div className="flex items-center mb-4">
					<div className="bg-grantpicks-alpha-50/5 border border-grantpicks-alpha-50/[0.07] flex items-center space-x-2 px-2 py-1 rounded-full">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-bold text-grantpicks-black-950">
							Step 2 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950">
					Add your team
				</p>
				<div className="py-6 md:py-8 px-5 md:px-6">
					<div className="mb-6">
						<InputText
							required
							label="Team Member"
							placeholder="Account ID, Comma separated"
							{...register('member')}
							onKeyDown={(e) => {
								if (e.key == 'Enter') {
									onAddMember()
								}
							}}
							suffixIcon={
								<button
									disabled={
										(requiredError || validationError || sameMemberError) &&
										watch('member') === ''
									}
									onClick={() => {
										onAddMember()
									}}
									className="text-sm font-semibold text-grantpicks-black-950 cursor-pointer hover:opacity-70 transition disabled:cursor-not-allowed"
								>
									Add
								</button>
							}
							errorMessage={
								requiredError ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Team member is required
									</p>
								) : validationError ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Address invalid
									</p>
								) : sameMemberError ? (
									<p className="text-red-500 text-xs mt-1 ml-2">
										Team member is already added
									</p>
								) : undefined
							}
							hintLabel={
								storage.chainId === 'stellar'
									? 'You must put a valid STELLAR address that belongs to your team member(s)'
									: 'You must put a valid NEAR address that belongs to your team member(s)'
							}
						/>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
									{prettyTruncate(member, 10, 'address')}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
			<div className="p-5 md:p-6 flex items-center space-x-4">
				<div className="flex-1">
					<Button
						color="white"
						isFullWidth
						onClick={() => setStep(1)}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Previous
					</Button>
				</div>
				<div className="flex-1">
					<Button
						color="black-950"
						isFullWidth
						onClick={handleSubmit(onNextStep2)}
						className="!py-3"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	)
}

export default CreateProjectStep2
