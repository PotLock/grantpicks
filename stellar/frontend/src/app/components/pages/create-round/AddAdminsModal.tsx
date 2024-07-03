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

interface AddAdminsModalProps extends BaseModalProps {
	selectedProjects: string[]
	setSelectedProjects: Dispatch<SetStateAction<string[]>>
}

const AddAdminsModal = ({
	isOpen,
	onClose,
	selectedProjects,
	setSelectedProjects,
}: AddAdminsModalProps) => {
	const [searchProject, setSearchProject] = useState<string>('')
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-white w-[45vw] mx-auto rounded-xl border border-black/10 shadow">
				<div className="px-6 pb-6 pt-8 bg-grantpicks-black-200 rounded-t-xl relative rounded-xl">
					<IconClose
						size={24}
						className="fill-grantpicks-black-400 absolute right-4 top-4 cursor-pointer transition hover:opacity-80"
						onClick={() => onClose()}
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
						placeholder="Account ID, Comma separated"
						suffixIcon={
							<p className="text-sm font-semibold text-grantpicks-black-950 hover:opacity-70 transition cursor-pointer">
								Add
							</p>
						}
					/>
				</div>
			</div>
		</Modal>
	)
}

export default AddAdminsModal
