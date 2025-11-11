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
	hasVoted?: boolean
	isUserApplied?: boolean
	isVotingOpen?: boolean
	isApplicationOpen?: boolean
	isAdminOrOwner?: boolean
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
	hasVoted,
	isUserApplied,
	isVotingOpen,
	isApplicationOpen,
	isAdminOrOwner,
}) => {
	const shouldHideButton =
		(isVotingOpen && !isAdminOrOwner && hasVoted) ||
		(isApplicationOpen && !isAdminOrOwner && isUserApplied)

	const statusBadge = () => {
		if (isVotingOpen && !isAdminOrOwner && hasVoted) {
			return 'Already Voted'
		}
		if (isApplicationOpen && !isAdminOrOwner && isUserApplied) {
			return 'Already Applied'
		}
		return null
	}

	return (
		<div>
			<div className="mb-2 flex flex-row justify-between gap-2 items-center">
				<p className="text-xs font-semibold text-grantpicks-black-950">Current Stage:</p>
				<div className="text-xs font-semibold text-grantpicks-black-950 flex items-center gap-2">
					{helperText && (
						<IconDot size={10} className={helperColorClass || 'fill-grantpicks-green-400'} />
					)}
					<span>{helperText}</span>
				</div>
			</div>
			<div className="w-full flex flex-row gap-2 items-start">
				{shouldHideButton ? (
					<div className="flex-1 flex items-center justify-center px-4 py-2 rounded-lg border border-grantpicks-green-300 bg-grantpicks-green-50">
						<span className="text-sm font-semibold text-grantpicks-green-700">
							{statusBadge()}
						</span>
					</div>
				) : (
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
				)}
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
