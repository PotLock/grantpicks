import React from 'react'
import { useFormContext } from 'react-hook-form'
import InputText from '@/app/components/commons/InputText'
import IconStellar from '@/app/components/svgs/IconStellar'
import IconInfoCircle from '@/app/components/svgs/IconInfoCircle'
import { Tooltip } from 'react-tooltip'
import { CreateRoundData } from '@/types/form'

interface Step3FundingProps {
	stellarPrice: number
	amountUsd: string
	setAmountUsd: (val: string) => void
	expectAmountUsd: string
	setExpectAmountUsd: (val: string) => void
	minimumDepositUsd: string
	setMinimumDepositUsd: (val: string) => void
}

const Step3Funding: React.FC<Step3FundingProps> = ({
	stellarPrice,
	amountUsd,
	setAmountUsd,
	expectAmountUsd,
	setExpectAmountUsd,
	minimumDepositUsd,
	setMinimumDepositUsd,
}) => {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<CreateRoundData>()

	const expectedAmount = watch('expected_amount')
	const initialDeposit = watch('amount')
	const minimumDeposit = watch('minimum_deposit')

	return (
		<div className="space-y-6 animate-fadeIn">
			<div className="p-5 rounded-2xl shadow-md bg-white space-y-6">
				{/* Expected Amount */}
				<InputText
					type="number"
					label="Expected Funding Goal"
					required
					labelIcon={
						<>
							<a data-tooltip-id="expected_amount_tooltip">
								<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
							</a>
							<Tooltip
								id="expected_amount_tooltip"
								place="top"
								content="The total funding goal you hope to raise for this round"
							/>
						</>
					}
					{...register('expected_amount', {
						required: 'Expected amount is required',
						min: { value: 0.0000001, message: 'Amount must be greater than 0' },
						onChange: (e) => {
							const val = parseFloat(e.target.value || '0')
							setExpectAmountUsd((val * stellarPrice).toFixed(2))
						},
					})}
					preffixIcon={<IconStellar size={24} className="fill-grantpicks-black-400" />}
					suffixIcon={
						<div className="flex items-center space-x-2 pr-2">
							<p className="text-sm font-medium text-grantpicks-black-500">${expectAmountUsd}</p>
							<p className="text-xs font-bold text-grantpicks-black-400">USD</p>
						</div>
					}
					errorMessage={errors.expected_amount?.message}
				/>

				{/* Minimum Deposit */}
				<InputText
					type="number"
					label="Minimum Contribution"
					required
					labelIcon={
						<>
							<a data-tooltip-id="min_deposit_tooltip">
								<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
							</a>
							<Tooltip
								id="min_deposit_tooltip"
								place="top"
								content="The smallest amount a donor can contribute to the round"
							/>
						</>
					}
					{...register('minimum_deposit', {
						required: 'Minimum deposit is required',
						min: { value: 0.0000001, message: 'Amount must be greater than 0' },
						validate: (val) => {
							if (parseFloat(val) > parseFloat(expectedAmount)) {
								return 'Cannot exceed the total funding goal'
							}
							return true
						},
						onChange: (e) => {
							const val = parseFloat(e.target.value || '0')
							setMinimumDepositUsd((val * stellarPrice).toFixed(2))
						},
					})}
					preffixIcon={<IconStellar size={24} className="fill-grantpicks-black-400" />}
					suffixIcon={
						<div className="flex items-center space-x-2 pr-2">
							<p className="text-sm font-medium text-grantpicks-black-500">${minimumDepositUsd}</p>
							<p className="text-xs font-bold text-grantpicks-black-400">USD</p>
						</div>
					}
					errorMessage={errors.minimum_deposit?.message}
				/>

				{/* Initial Deposit */}
				<InputText
					type="number"
					label="Your Initial Deposit (Optional)"
					labelIcon={
						<>
							<a data-tooltip-id="initial_deposit_tooltip">
								<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
							</a>
							<Tooltip
								id="initial_deposit_tooltip"
								place="top"
								content="Start the round with your own contribution"
							/>
						</>
					}
					{...register('amount', {
						min: { value: 0, message: 'Amount cannot be negative' },
						validate: (val) => {
							if (!val || val === '0') return true
							if (parseFloat(val) < parseFloat(minimumDeposit)) {
								return 'Must be at least the minimum contribution amount'
							}
							return true
						},
						onChange: (e) => {
							const val = parseFloat(e.target.value || '0')
							setAmountUsd((val * stellarPrice).toFixed(2))
						},
					})}
					preffixIcon={<IconStellar size={24} className="fill-grantpicks-black-400" />}
					suffixIcon={
						<div className="flex items-center space-x-2 pr-2">
							<p className="text-sm font-medium text-grantpicks-black-500">${amountUsd}</p>
							<p className="text-xs font-bold text-grantpicks-black-400">USD</p>
						</div>
					}
					errorMessage={errors.amount?.message}
				/>

				{/* Referral Fee */}
				<div className="pt-4 border-t border-black/10">
					<InputText
						label="Referral Fee (%)"
						labelIcon={
							<>
								<a data-tooltip-id="referral_fee_tooltip">
									<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
								</a>
								<Tooltip
									id="referral_fee_tooltip"
									place="top"
									style={{ maxWidth: '250px' }}
									content="Optional commission (0-5%) for referrers who bring donors to this round."
								/>
							</>
						}
						placeholder="0-5"
						type="number"
						{...register('referrer_fee_basis_points', {
							min: { value: 0, message: 'Cannot be negative' },
							max: { value: 5, message: 'Maximum 5%' },
						})}
						suffixIcon={<p className="text-sm font-bold text-grantpicks-black-400 pr-4">%</p>}
						errorMessage={errors.referrer_fee_basis_points?.message}
					/>
				</div>
			</div>
		</div>
	)
}

export default Step3Funding
