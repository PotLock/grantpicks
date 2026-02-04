import React, { useState, useRef } from 'react'
import { useFormContext } from 'react-hook-form'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import Menu from '@/app/components/commons/Menu'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import { CreateRoundData } from '@/types/form'
import clsx from 'clsx'
import {
	EMAIL_VALIDATION_REGEX,
	INSTAGRAM_USERNAME_REGEX,
	TELEGRAM_USERNAME_REGEX,
	TWITTER_USERNAME_REGEX,
} from '@/constants/regex'

const Step1BasicInfo = () => {
	const {
		register,
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<CreateRoundData>()
	const [showContactType, setShowContactType] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const contactType = watch('contact_type')

	return (
		<div className="space-y-6 animate-fadeIn">
			<div className="p-5 rounded-2xl shadow-md bg-white space-y-6">
				<InputText
					required
					label="Round Title"
					maxLength={60}
					{...register('title', { required: 'Round title is required' })}
					errorMessage={errors.title?.message}
					placeholder="e.g. Stellar Community Fund"
				/>
				<InputTextArea
					label="Round Description"
					required
					maxLength={300}
					{...register('description', { required: 'Round description is required' })}
					errorMessage={errors.description?.message}
					placeholder="Describe the purpose and goals of this funding round..."
				/>

				<div className="space-y-2">
					<p className="text-sm font-semibold text-grantpicks-black-950">
						Contact Platform
						<span className="text-grantpicks-red-600 ml-1">*</span>
					</p>
					<div className="flex flex-col md:flex-row items-center gap-4">
						<div className="relative w-full md:w-44 lg:w-52" ref={buttonRef}>
							<input type="hidden" {...register('contact_type', { required: 'Contact platform is required' })} />
							<button
								type="button"
								onClick={() => setShowContactType(true)}
								className={clsx(
									'border w-full border-grantpicks-black-200 rounded-xl py-3 px-3 flex items-center justify-between cursor-pointer hover:opacity-80 transition',
									errors.contact_type && 'border-red-500',
								)}
							>
								<p
									className={clsx(
										'text-sm font-normal ',
										!contactType ? 'text-grantpicks-black-950/50' : 'text-grantpicks-black-950',
									)}
								>
									{contactType || 'Select platform'}
								</p>
								<IconUnfoldMore size={24} className="fill-grantpicks-black-400" />
							</button>
							{showContactType && (
								<Menu
									isOpen={showContactType}
									onClose={() => setShowContactType(false)}
									position="top-14 left-0"
									mobileAsPortal
									buttonRef={buttonRef}
								>
									<div className="border border-black/10 p-3 rounded-xl space-y-3 bg-white w-full shadow-xl">
										{['Telegram', 'Instagram', 'Twitter', 'Email'].map((platform) => (
											<button
												key={platform}
												type="button"
												onPointerDown={(e) => {
													e.preventDefault()
													e.stopPropagation()
												}}
												onClick={(e) => {
													e.preventDefault()
													e.stopPropagation()
													setValue('contact_type', platform, { shouldValidate: true })
													trigger('contact_type')
													setShowContactType(false)
												}}
												className="text-sm font-normal text-grantpicks-black-950 hover:bg-grantpicks-black-50 p-2 rounded-lg transition w-full text-left"
											>
												{platform}
											</button>
										))}
									</div>
								</Menu>
							)}
						</div>
						<div className="w-full md:flex-1">
							<InputText
								disabled={!contactType}
								required
								placeholder={
									contactType === 'Email' ? 'Enter email address...' : 'Enter username...'
								}
								{...register('contact_address', {
									required: 'Contact address is required',
									validate: (value) => {
										if (!value) return true
										if (contactType === 'Telegram') {
											return TELEGRAM_USERNAME_REGEX.test(value) || 'Invalid Telegram username'
										}
										if (contactType === 'Instagram') {
											return INSTAGRAM_USERNAME_REGEX.test(value) || 'Invalid Instagram username'
										}
										if (contactType === 'Twitter') {
											return TWITTER_USERNAME_REGEX.test(value) || 'Invalid Twitter username'
										}
										if (contactType === 'Email') {
											return EMAIL_VALIDATION_REGEX.test(value) || 'Invalid email address'
										}
										return true
									},
								})}
								errorMessage={errors.contact_address?.message}
							/>
						</div>
					</div>
					<p className="text-xs font-normal text-grantpicks-black-600">
						Provide a way for participants and admins to reach you.
					</p>
				</div>
			</div>
		</div>
	)
}

export default Step1BasicInfo
