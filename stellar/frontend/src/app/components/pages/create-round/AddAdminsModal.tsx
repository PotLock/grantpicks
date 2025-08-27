import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import IconTrash from '../../svgs/IconTrash'
import IconAdmin from '../../svgs/IconAdmin'
import InputText from '../../commons/InputText'
import { prettyTruncate } from '@/utils/helper'
import { UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form'
import { StrKey } from 'round-client'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import Image from 'next/image'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NEAR_ADDRESS_REGEX } from '@/constants/regex'
import Button from '../../commons/Button'
import clsx from 'clsx'

interface AddAdminsModalProps extends BaseModalProps {
	selectedAdmins: string[]
	setSelectedAdmins: Dispatch<SetStateAction<string[]>>
	append: UseFieldArrayAppend<any, 'admins' | 'projects'>
	remove: UseFieldArrayRemove
	header?: string
	handleSaveChanges?: () => void
}

const AddAdminsModal = ({
	isOpen,
	onClose,
	selectedAdmins,
	handleSaveChanges,
	setSelectedAdmins,
	append,
	remove,
	header,
}: AddAdminsModalProps) => {
	const [searchAdmin, setSearchAdmin] = useState<string>('')
	const [errorMessage, setErrorMessage] = useState<boolean>(false)
	const [sameAdminError, setSameAdminError] = useState<boolean>(false)
	const storage = useAppStorage()

	const onAddAdmin = async () => {
		if (storage.chainId === 'stellar') {
			if (!StrKey.isValidEd25519PublicKey(searchAdmin)) {
				toast.error('Address is not valid stellar address', {
					style: toastOptions.error.style,
				})
				return
			}
		} else {
			if (!NEAR_ADDRESS_REGEX(searchAdmin)) {
				toast.error('Address is not valid near address', {
					style: toastOptions.error.style,
				})
				return
			}
		}

		if (selectedAdmins.includes(searchAdmin)) {
			toast.error('This admin is already added', {
				style: toastOptions.error.style,
			})
			return
		}
		append({ admin_id: searchAdmin })
		setSelectedAdmins((prev) => [...prev, searchAdmin])
		setSearchAdmin('')
	}

	useEffect(() => {
		if (storage.chainId === 'stellar') {
			if (!StrKey.isValidEd25519PublicKey(searchAdmin)) {
				setErrorMessage(true)
			} else {
				setErrorMessage(false)
			}
		} else {
			if (!NEAR_ADDRESS_REGEX(searchAdmin)) {
				setErrorMessage(true)
			} else {
				setErrorMessage(false)
			}
		}

		if (selectedAdmins.includes(searchAdmin)) {
			setSameAdminError(true)
		} else {
			setSameAdminError(false)
		}
	}, [searchAdmin, selectedAdmins])

	return (
		<Modal
			isOpen={isOpen}
			onClose={() => {
				setSearchAdmin('')
				onClose()
				setErrorMessage(false)
				setSameAdminError(false)
			}}
		>
			<div className="bg-white w-11/12 md:w-[60vw] lg:w-[45vw] mx-auto rounded-xl border border-black/10 shadow">
				<div className="px-4 md:px-5 lg:px-6 pb-6 pt-8 bg-grantpicks-black-50 rounded-t-xl relative rounded-xl">
					<IconClose
						size={24}
						className={clsx("fill-grantpicks-black-400 absolute right-4 top-4 cursor-pointer transition hover:opacity-80",

						)}
						onClick={() => {
							setSearchAdmin('')
							onClose()
							setErrorMessage(false)
							setSameAdminError(false)
						}}
					/>
					<div className="flex items-center justify-center mb-6">
						{!header && (
							<div className="border border-black/10 bg-white rounded-full p-3 mb-3">
								<IconAdmin size={24} className="fill-grantpicks-black-400" />
							</div>
						)}
						<p className="text-center text-base font-bold text-grantpicks-black-950">
							{header ?? 'Add Admin'}
						</p>
					</div>
					<InputText
						onChange={(e) => setSearchAdmin(e.target.value)}
						value={searchAdmin}
						placeholder="Account ID, Comma separated"
						onKeyDown={(e) => {
							if (e.key == 'Enter') {
								onAddAdmin()
							}
						}}
						suffixIcon={
							<button
								disabled={errorMessage || sameAdminError || searchAdmin === ''}
								onClick={onAddAdmin}
								className="text-sm disabled:cursor-not-allowed font-semibold text-grantpicks-black-950 hover:opacity-70 transition cursor-pointer"
							>
								Add
							</button>
						}
						errorMessage={
							errorMessage && searchAdmin != '' ? (
								<p>Address is not valid</p>
							) : sameAdminError ? (
								<p>This admin is already added</p>
							) : undefined
						}
					/>
				</div>
				{selectedAdmins.length > 0 && (
					<div className="py-4 px-4 md:px-5 lg:px-6 flex flex-col">
						{selectedAdmins?.map((admin, index) => (
							<div
								key={index}
								className="py-2 flex items-center justify-between"
							>
								<div className="flex items-center space-x-2">
									<Image
										src={`https://www.tapback.co/api/avatar/${admin}`}
										alt="admin"
										width={24}
										height={24}
									/>
									<p className="text-base font-normal text-grantpicks-black-950">
										{prettyTruncate(admin, 18, 'address')}
									</p>
								</div>
								<IconTrash
									size={24}
									className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-70"
									onClick={() => {
										setSelectedAdmins((admin2) =>
											admin2.filter((ad) => ad !== admin),
										)
										let temp = [...selectedAdmins]
										let indexTemp = temp.findIndex((admin2) => admin2 === admin)
										if (indexTemp !== -1) {
											remove(indexTemp)
										}
									}}
								/>
							</div>
						))}
					</div>
				)}
				{
					handleSaveChanges && (
						<div className="flex my-3 justify-center items-center gap-2">
							<Button onClick={handleSaveChanges}>Save Changes</Button>
						</div>
					)
				}
			</div>
		</Modal>
	)
}

export default AddAdminsModal
