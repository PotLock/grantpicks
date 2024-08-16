import React, { Dispatch, SetStateAction, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import IconSearch from '../../svgs/IconSearch'
import Image from 'next/image'
import Button from '../../commons/Button'
import IconAdd from '../../svgs/IconAdd'
import IconTrash from '../../svgs/IconTrash'
import IconAdmin from '../../svgs/IconAdmin'
import InputText from '../../commons/InputText'
import { getRoundAdmins } from '@/services/on-chain/round'
import { prettyTruncate } from '@/utils/helper'
import {
	UseFieldArrayAppend,
	UseFieldArrayRemove,
	UseFormSetValue,
} from 'react-hook-form'
import { CreateRoundData } from '@/types/form'
import { StrKey } from 'round-client'
import { useWallet } from '@/app/providers/WalletProvider'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'

interface AddAdminsModalProps extends BaseModalProps {
	selectedAdmins: string[]
	setSelectedAdmins: Dispatch<SetStateAction<string[]>>
	append: UseFieldArrayAppend<CreateRoundData, 'admins'>
	remove: UseFieldArrayRemove
}

const AddAdminsModal = ({
	isOpen,
	onClose,
	selectedAdmins,
	setSelectedAdmins,
	append,
	remove,
}: AddAdminsModalProps) => {
	const [searchAdmin, setSearchAdmin] = useState<string>('')
	const { stellarPubKey } = useWallet()

	const onAddAdmin = async () => {
		if (!StrKey.isValidEd25519PublicKey(searchAdmin)) {
			toast.error('Address is not valid', { style: toastOptions.error.style })
			return
		}
		append({ admin_id: searchAdmin })
		setSelectedAdmins((prev) => [...prev, searchAdmin])
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-white w-11/12 md:w-[60vw] lg:w-[45vw] mx-auto rounded-xl border border-black/10 shadow">
				<div className="px-4 md:px-5 lg:px-6 pb-6 pt-8 bg-grantpicks-black-50 rounded-t-xl relative rounded-xl">
					<IconClose
						size={24}
						className="fill-grantpicks-black-400 absolute right-4 top-4 cursor-pointer transition hover:opacity-80"
						onClick={() => {
							setSearchAdmin('')
							onClose()
						}}
					/>
					<div className="flex items-center justify-center mb-6">
						<div className="border border-black/10 bg-white rounded-full p-3 mb-3">
							<IconAdmin size={24} className="fill-grantpicks-black-400" />
						</div>
						<p className="text-center text-base font-bold text-grantpicks-black-950">
							Add Admin
						</p>
					</div>
					<InputText
						onChange={(e) => setSearchAdmin(e.target.value)}
						value={searchAdmin}
						placeholder="Account ID, Comma separated"
						suffixIcon={
							<button
								onClick={onAddAdmin}
								className="text-sm font-semibold text-grantpicks-black-950 hover:opacity-70 transition cursor-pointer"
							>
								Add
							</button>
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
									<div className="rounded-full bg-grantpicks-black-400 w-6 h-6" />
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
			</div>
		</Modal>
	)
}

export default AddAdminsModal
