import React from 'react'
import Button from '../../../commons/Button'
import IconDot from '../../../svgs/IconDot'
import clsx from 'clsx'

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
	const statusBadge = () => {
		if (isVotingOpen && !isAdminOrOwner && hasVoted) {
			return { text: '✓ Voted', className: 'bg-green-100 text-green-700 border-green-300' }
		}
		if (isApplicationOpen && !isAdminOrOwner && isUserApplied) {
			return { text: '✓ You\'re a part of this round.', className: 'bg-blue-100 text-blue-700 border-blue-300' }
		}
		return null
	}

	const badge = statusBadge()

	return (
		<div className="space-y-3">
			{/* Status Indicator */}
			{helperText && (
				<div className="flex items-center justify-between px-3 py-2 bg-grantpicks-black-50 rounded-lg border border-grantpicks-black-100">
					<span className="text-xs font-medium text-grantpicks-black-600 uppercase tracking-wide">
						Status
					</span>
					<div className="flex items-center space-x-2">
						<IconDot size={8} className={helperColorClass || 'fill-grantpicks-green-400'} />
						<span className="text-xs font-bold text-grantpicks-black-950">
							{helperText}
						</span>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex flex-col gap-2">
				{badge && (
					<div
						className={clsx(
							'px-4 py-2 rounded-lg border-2 text-center text-sm font-bold',
							badge.className,
						)}
					>
						{badge.text}
					</div>
				)}
				<div className="flex gap-2">
					<Button
						onClick={(e) => {
							e.stopPropagation()
							onClick()
						}}
						isFullWidth
						color={isDisabled ? 'disabled' : 'black-950'}
						className={clsx(
							'!py-3 !font-bold transition-all',
							!isDisabled && 'hover:scale-[1.02] shadow-lg',
						)}
						isDisabled={isDisabled || (isVotingOpen && !isAdminOrOwner && hasVoted)}
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
							className="!py-3 !font-bold !border-2 !border-grantpicks-black-200 hover:border-grantpicks-black-300 transition-all hover:scale-[1.02]"
						>
							Fund
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}

export default RoundCardActions
