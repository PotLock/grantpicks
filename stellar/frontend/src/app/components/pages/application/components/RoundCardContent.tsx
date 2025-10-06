import React from 'react'
import IconGroup from '../../../svgs/IconGroup'
import IconClock from '../../../svgs/IconClock'
import moment from 'moment'
import { GPRound } from '@/models/round'
import { formatStroopToXlm } from '@/utils/helper'

interface RoundCardContentProps {
	doc: GPRound
	selectedRoundType: string
	currentTime: string
	totalApprovedProjects: number
	chainId: string
	isAdminOrOwner: boolean
	pendingApplicationsCount: number
}

const RoundCardContent: React.FC<RoundCardContentProps> = ({
	doc,
	selectedRoundType,
	currentTime,
	totalApprovedProjects,
	isAdminOrOwner,
	pendingApplicationsCount,
}) => {
	const fundedDisplay = () => {
		const funded = formatStroopToXlm(BigInt(doc.vault_total_deposits || '0'))
		const target = formatStroopToXlm(BigInt(doc.expected_amount || '0'))
		return `${funded}/${target} XLM`
	}

	const progressPercent = () => {
		const funded = parseFloat(
			formatStroopToXlm(BigInt(doc.vault_total_deposits || '0')) || '0',
		)
		const target = parseFloat(
			formatStroopToXlm(BigInt(doc.expected_amount || '0')) || '0',
		)
		if (!target || target <= 0) return 0
		const pct = (funded / target) * 100
		const pctFixed = Math.max(0, Math.min(100, Number(pct.toFixed(2))))
		return funded > 0 ? Math.max(1, pctFixed) : 0
	}

	const progressColorClass = () => {
		const pct = progressPercent()
		if (pct < 30) return 'bg-red-500'
		if (pct <= 79) return 'bg-yellow-400'
		return 'bg-grantpicks-green-700'
	}

	const closesText = () => {
		if (
			selectedRoundType === 'upcoming' &&
			(currentTime === 'upcoming' || currentTime === 'upcoming-open')
		) {
			return `Closing ${moment(new Date(doc.application_end || '')).fromNow()}`
		}
		if (selectedRoundType === 'on-going') {
			return `Closes ${moment(new Date(doc.voting_end)).fromNow()}`
		}
		return ''
	}


	return (
		<>
			<button
				className="font-semibold text-base sm:text-lg md:text-xl lg:text-2xl max-w-full mb-4 text-grantpicks-black-950 text-left truncate"
				title={doc.name}
			>
				{doc.name}
			</button>
			{isAdminOrOwner && pendingApplicationsCount > 0 && (
				<div className="mb-4 border border-orange-300 bg-orange-50 text-orange-700 rounded-xl px-4 py-3 text-sm font-semibold flex items-center">
					{pendingApplicationsCount} pending applications to review
				</div>
			)}

			{doc.description && (
				<p className="text-base h-12 font-normal text-grantpicks-black-600 line-clamp-2 mb-4">
					{doc.description}
				</p>
			)}

			<div className="mb-2 flex items-center justify-between gap-2 min-w-0">
				<p className="text-base font-semibold text-grantpicks-black-950 flex-shrink-0">
					Funding Progress
				</p>
				<p
					className="text-sm sm:text-base font-semibold text-grantpicks-black-950 text-right truncate max-w-[60%] sm:max-w-[65%]"
					title={fundedDisplay()}
				>
					{fundedDisplay()}
				</p>
			</div>
			<div className="w-full h-3 bg-grantpicks-black-100 rounded-full mb-4 overflow-hidden">
				<div
					className={`h-3 rounded-full ${progressColorClass()}`}
					style={{ width: `${progressPercent()}%` }}
				/>
			</div>

			<div className="flex items-center mb-4 justify-between flex-wrap gap-x-2 gap-y-1">
				<div className="flex items-center space-x-2 min-w-0">
					<IconGroup size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950 whitespace-nowrap">
						{totalApprovedProjects} Participating
					</p>
				</div>
				<div className="flex items-center space-x-2 min-w-0">
					<IconClock size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950 whitespace-nowrap">
						{closesText()}
					</p>
				</div>
			</div>


		</>
	)
}

export default RoundCardContent
