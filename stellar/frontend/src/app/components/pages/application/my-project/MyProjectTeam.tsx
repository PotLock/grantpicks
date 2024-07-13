import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'
import { CreateProjectStep1Data, CreateProjectStep2Data } from '@/types/form'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const MyProjectTeam = () => {
	const [members, setMembers] = useState<string[]>([])
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep2Data>()

	const onSaveChanges = () => {}

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
						suffixIcon={
							<button
								onClick={() => {
									setMembers((prev) => [...prev, watch('member')])
									setValue('member', '')
								}}
								className="text-sm font-semibold text-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
							>
								Add
							</button>
						}
						errorMessage={
							members.length === 0 ? (
								<p className="text-red-500 text-xs mt-1 ml-2">
									Team member is required
								</p>
							) : undefined
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
							<div className="bg-grantpicks-black-400 w-16 h-16 mb-2 rounded-full" />
							<p className="text-base font-normal text-grantpicks-black-950">
								{member}
							</p>
							<p className="text-xs font-normal text-grantpicks-black-600">
								@abdul.near
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
						onClick={() => {}}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						isFullWidth
						color="black-950"
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3"
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectTeam
