import React from 'react'
import Button from '../../../commons/Button'
import IconDot from '../../../svgs/IconDot'

interface RoundCardActionsProps {
	actionText: string
	isDisabled: boolean
	onClick: () => void
	disableFundButton: boolean
	onFundRound: () => void
	showFundButton: boolean
	helperText?: string
	helperColorClass?: string
}

const RoundCardActions: React.FC<RoundCardActionsProps> = ({
	actionText,
	isDisabled,
	onClick,
	showFundButton,
	disableFundButton,
	onFundRound,
	helperText,
	helperColorClass,
}) => {
	return (
		<div>
			<div className="mb-2 flex flex-row justify-between gap-2 items-center">
				<p className="text-xs font-semibold text-grantpicks-black-950">Current Stage:</p>
				<div className="text-xs font-semibold text-grantpicks-black-950 flex items-center gap-2">
					{helperText && (
						<IconDot size={10} className={helperColorClass || 'fill-grantpicks-black-400'} />
					)}
					<span>{helperText}</span>
				</div>
			</div>
			<div className="w-full flex flex-row gap-2 items-start">
				<Button
					onClick={(e) => {
						e.stopPropagation()
						onClick()
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					isDisabled={isDisabled}
				>
					{actionText}
				</Button>
				{showFundButton && (
					<Button
						onClick={(e) => {
							e.stopPropagation()
							onFundRound()
						}}
						color="white"
						isDisabled={disableFundButton}
						isFullWidth
						className="!border !border-grantpicks-black-200 !py-2"
					>
						Fund Round
					</Button>
				)}
			</div>

		</div>
	)
}

export default RoundCardActions
