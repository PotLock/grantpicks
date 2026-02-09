import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import InputText from '@/app/components/commons/InputText'
import Button from '@/app/components/commons/Button'
import Checkbox from '@/app/components/commons/CheckBox'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconRemove from '@/app/components/svgs/IconRemove'
import IconInfoCircle from '@/app/components/svgs/IconInfoCircle'
import IconCalendar from '@/app/components/svgs/IconCalendar'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import { Tooltip } from 'react-tooltip'
import Switch from 'react-switch'
import DatePicker from 'react-datepicker'
import { subDays, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { CreateRoundData } from '@/types/form'
import { PERIODS } from '@/constants/round'
import clsx from 'clsx'

interface Step2TimingProps {
	cooldownPeriodData: any
	setCooldownPeriodData: (data: any) => void
}

const Step2Timing: React.FC<Step2TimingProps> = ({
	cooldownPeriodData,
	setCooldownPeriodData,
}) => {
	const {
		register,
		watch,
		setValue,
		control,
		setError,
		formState: { errors },
	} = useFormContext<CreateRoundData>()

	const allowApplication = watch('allow_application')
	const maxParticipants = watch('max_participants')
	const votePerPerson = watch('vote_per_person')
	const applyDurationStart = watch('apply_duration_start')
	const applyDurationEnd = watch('apply_duration_end')
	const votingDurationStart = watch('voting_duration_start')
	const votingDurationEnd = watch('voting_duration_end')
	const allowCooldown = watch('allow_cooldown')

	return (
		<div className="space-y-6 animate-fadeIn">
			<div className="p-5 rounded-2xl shadow-md bg-white space-y-6">
				{/* Application Toggle */}
				<div className="flex items-center justify-between pb-4 border-b border-black/10">
					<div>
						<p className="text-base font-semibold text-grantpicks-black-950">Allow Applications</p>
						<p className="text-sm text-grantpicks-black-500">Enable if you want projects to apply to this round</p>
					</div>
					<Switch
						checked={allowApplication}
						onChange={(checked) => setValue('allow_application', checked)}
						height={22}
						width={42}
						checkedIcon={false}
						uncheckedIcon={false}
						offColor="#DCDCDC"
						onColor="#292929"
						handleDiameter={18}
					/>
				</div>

				{allowApplication && (
					<div className="space-y-6 pt-2">
						<div className="flex md:flex-row flex-col gap-4">
							{/* Max Participants */}
							<div className="w-full md:w-1/3 space-y-2">
								<InputText
									type="number"
									label="Max Participants"
									labelIcon={
										<>
											<a data-tooltip-id="max_participants_tooltip">
												<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
											</a>
											<Tooltip
												id="max_participants_tooltip"
												place="top"
												content="Maximum number of projects that can apply to this round. From 10 and above"
											/>
										</>
									}
									placeholder="10"
									{...register('max_participants', {
										required: allowApplication,
										min: 10,
										max: 100,
									})}
									preffixIcon={
										<Button
											color="transparent"
											isDisabled={maxParticipants <= 10}
											onClick={() => setValue('max_participants', maxParticipants - 1)}
										>
											<IconRemove size={24} className="stroke-grantpicks-black-600" />
										</Button>
									}
									textAlign="center"
									suffixIcon={
										<Button
											color="transparent"
											isDisabled={maxParticipants >= 100}
											onClick={() => setValue('max_participants', maxParticipants + 1)}
										>
											<IconAdd size={24} className="fill-grantpicks-black-600" />
										</Button>
									}
									errorMessage={
										errors.max_participants?.type === 'min'
											? 'Min. 10 participants'
											: errors.max_participants?.type === 'max'
												? 'Max. 100 participants'
												: undefined
									}
								/>
							</div>

							{/* Application Duration */}
							<div className="w-full md:w-2/3 space-y-2">
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Application Duration <span className="text-grantpicks-red-600">*</span>
								</p>
								<Controller
									name="apply_duration_start"
									control={control}
									rules={{ required: allowApplication }}
									render={({ field }) => (
										<div className="w-full [&_.react-datepicker-wrapper]:w-full [&_input]:text-grantpicks-black-950 [&_input]:placeholder:text-grantpicks-black-400">
											<DatePicker
												showIcon
												selectsRange
												minDate={new Date()}
												maxDate={votingDurationStart ? subDays(votingDurationStart as Date, 0) : undefined}
												startDate={applyDurationStart as Date}
												endDate={applyDurationEnd as Date}
												placeholderText="Select application start and end date"
												onChange={(date) => {
													const [start, end] = date
													field.onChange(start)
													setValue('apply_duration_end', end)

													if (votingDurationStart && isSameDay(votingDurationStart as Date, new Date())) {
														toast.error('Voting duration cleared: must start after application ends', {
															style: toastOptions.error.style,
														})
														setValue('voting_duration_start', null)
														setValue('voting_duration_end', null)
													}

													if (start && end) {
														const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
														if (hoursDiff < 24) {
															toast.error('Application duration must be at least 24 hours', {
																style: toastOptions.error.style,
															})
															field.onChange(null)
															setValue('apply_duration_end', null)
														}
													}
												}}
												icon={
													<div className="flex items-center mt-2 pr-2">
														<IconCalendar size={20} className="fill-grantpicks-black-400" />
													</div>
												}
												className="border border-grantpicks-black-200 rounded-xl w-full h-12 px-10"
												wrapperClassName="w-full"
												dateFormat="MMM d, yyyy"
											/>
										</div>
									)}
								/>
								{errors.apply_duration_start && (
									<p className="text-red-500 text-xs mt-1">Application duration is required</p>
								)}
							</div>
						</div>

						<Checkbox
							label="Video Submission Required"
							checked={watch('is_video_required')}
							onChange={(e) => setValue('is_video_required', e.target.checked)}
						/>
					</div>
				)}

				{/* Voting Duration */}
				<div className="space-y-2 pt-2 border-t border-black/10">
					<p className="text-base font-semibold text-grantpicks-black-950">
						Voting Duration <span className="text-grantpicks-red-600">*</span>
					</p>
					<Controller
						name="voting_duration_start"
						control={control}
						rules={{ required: 'Voting duration is required' }}
						render={({ field }) => (
							<div className="w-full [&_.react-datepicker-wrapper]:w-full [&_input]:text-grantpicks-black-950 [&_input]:placeholder:text-grantpicks-black-400">
								<DatePicker
									showIcon
									selectsRange
									minDate={applyDurationEnd ? (subDays(applyDurationEnd as Date, 0) || new Date()) : new Date()}
									startDate={votingDurationStart as Date}
									endDate={votingDurationEnd as Date}
									placeholderText="Select voting start and end date"
									onChange={(date) => {
										const [start, end] = date
										field.onChange(start)
										setValue('voting_duration_end', end)

										if (start && end) {
											const hoursDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
											if (hoursDiff < 24) {
												toast.error('Voting duration must be at least 24 hours', {
													style: toastOptions.error.style,
												})
												field.onChange(null)
												setValue('voting_duration_end', null)
											}
										}
									}}
									icon={
										<div className="flex items-center mt-2 pr-2">
											<IconCalendar size={20} className="fill-grantpicks-black-400" />
										</div>
									}
									className="border border-grantpicks-black-200 rounded-xl w-full h-12 px-10"
									wrapperClassName="w-full"
									dateFormat="MMM d, yyyy"
								/>
							</div>
						)}
					/>
					{errors.voting_duration_start && (
						<p className="text-red-500 text-xs mt-1">{errors.voting_duration_start.message}</p>
					)}
				</div>

				{/* Votes per person */}
				<div className="space-y-2">
					<div className="border border-grantpicks-black-200 rounded-xl py-2 px-4 flex items-center justify-between">
						<div>
							<p className="text-sm font-semibold text-grantpicks-black-950">Votes per person</p>
							<p className="text-xs text-grantpicks-black-500">Number of projects each voter can select</p>
						</div>
						<div className="flex items-center space-x-4">
							<Button
								isDisabled={votePerPerson <= 1}
								color="transparent"
								onClick={() => setValue('vote_per_person', votePerPerson - 1)}
							>
								<IconRemove size={24} className="stroke-grantpicks-black-600" />
							</Button>
							<p className="text-sm font-bold w-4 text-grantpicks-black-950 text-center">{votePerPerson}</p>
							<Button color="transparent" onClick={() => setValue('vote_per_person', votePerPerson + 1)}>
								<IconAdd size={24} className="fill-grantpicks-black-600" />
							</Button>
						</div>
					</div>
				</div>

				{/* Cooldown Toggle */}
				<div className="space-y-4 pt-4 border-t border-black/10">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<p className="text-base font-semibold text-grantpicks-black-950">Cooldown Period</p>
							<a data-tooltip-id="cooldown_tooltip">
								<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
							</a>
							<Tooltip
								id="cooldown_tooltip"
								place="top"
								content="Time between voting end and payout period"
							/>
						</div>
						<Switch
							checked={allowCooldown}
							onChange={(checked) => setValue('allow_cooldown', checked)}
							height={22}
							width={42}
							checkedIcon={false}
							uncheckedIcon={false}
							offColor="#DCDCDC"
							onColor="#292929"
							handleDiameter={18}
						/>
					</div>

					{allowCooldown && (
						<div className="animate-fadeIn">
							<InputText
								type="number"
								label="Cooldown Duration"
								placeholder="0"
								{...register('cooldown_end_ms', {
									required: allowCooldown,
									min: 0,
								})}
								suffixIcon={
									<div className="relative">
										<div
											onClick={() =>
												setCooldownPeriodData({
													...cooldownPeriodData,
													isOpen: !cooldownPeriodData.isOpen,
												})
											}
											className="border-l pl-4 border-black/10 cursor-pointer flex items-center space-x-2"
										>
											<p className="text-sm font-normal text-grantpicks-black-600">
												{cooldownPeriodData.selected}
											</p>
											<IconUnfoldMore size={24} className="fill-grantpicks-black-400" />
										</div>
										{cooldownPeriodData.isOpen && (
											<div className="border bg-white border-black/10 rounded-xl absolute top-10 right-0 w-32 z-50 shadow-lg overflow-hidden">
												{PERIODS.map((period) => (
													<div
														key={period}
														className="p-3 text-sm font-normal text-gray-950 cursor-pointer hover:bg-grantpicks-black-50 transition"
														onClick={() =>
															setCooldownPeriodData({
																...cooldownPeriodData,
																selected: period,
																isOpen: false,
															})
														}
													>
														{period}
													</div>
												))}
											</div>
										)}
									</div>
								}
								errorMessage={errors.cooldown_end_ms && 'Cooldown duration is required'}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default Step2Timing
