import React from 'react'
import IconGroup from '../../../svgs/IconGroup'
import IconClock from '../../../svgs/IconClock'
import IconDollar from '../../../svgs/IconDollar'
import moment from 'moment'
import { GPRound } from '@/models/round'
import { formatStroopToXlm } from '@/utils/helper'
import clsx from 'clsx'

interface RoundCardContentProps {
	doc: GPRound
	selectedRoundType: string
	currentTime: string
	totalApprovedProjects: number
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
		return { funded, target }
	}

	const progressPercent = () => {
		const { funded, target } = fundedDisplay()
		const fundedNum = parseFloat(funded || '0')
		const targetNum = parseFloat(target || '0')
		if (!targetNum || targetNum <= 0) return 0
		const pct = (fundedNum / targetNum) * 100
		const pctFixed = Math.max(0, Math.min(100, Number(pct.toFixed(2))))
		return fundedNum > 0 ? Math.max(1, pctFixed) : 0
	}

	const progressColorClass = () => {
		const pct = progressPercent()
		if (pct < 30) return 'bg-gradient-to-r from-red-400 to-red-500'
		if (pct <= 79) return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
		return 'bg-gradient-to-r from-green-500 to-green-600'
	}

	const getTimelineInfo = () => {
		const now = new Date().getTime()
		
		if (selectedRoundType === 'upcoming') {
			if (currentTime === 'upcoming-open' && doc.application_end) {
				return {
					label: 'Application Closes',
					time: moment(new Date(doc.application_end)).fromNow(),
					date: moment(new Date(doc.application_end)).format('MMM D, YYYY'),
				}
			}
			if (currentTime === 'upcoming-not-started' && doc.application_start) {
				return {
					label: 'Application Starts',
					time: moment(new Date(doc.application_start)).fromNow(),
					date: moment(new Date(doc.application_start)).format('MMM D, YYYY'),
				}
			}
			if (doc.voting_start) {
				return {
					label: 'Voting Starts',
					time: moment(new Date(doc.voting_start)).fromNow(),
					date: moment(new Date(doc.voting_start)).format('MMM D, YYYY'),
				}
			}
		}
		
		if (selectedRoundType === 'on-going') {
			if (currentTime === 'on-going-voting-not-started' && doc.voting_start) {
				return {
					label: 'Voting Starts',
					time: moment(new Date(doc.voting_start)).fromNow(),
					date: moment(new Date(doc.voting_start)).format('MMM D, YYYY'),
				}
			}
			if (doc.voting_end) {
				return {
					label: 'Voting Closes',
					time: moment(new Date(doc.voting_end)).fromNow(),
					date: moment(new Date(doc.voting_end)).format('MMM D, YYYY'),
				}
			}
		}
		
		if (selectedRoundType === 'ended' && doc.voting_end) {
			return {
				label: 'Voting Ended',
				time: moment(new Date(doc.voting_end)).fromNow(),
				date: moment(new Date(doc.voting_end)).format('MMM D, YYYY'),
			}
		}
		
		return null
	}

	const { funded, target } = fundedDisplay()
	const timelineInfo = getTimelineInfo()
	const progress = progressPercent()

	return (
		<div className="space-y-4">
			{/* Title */}
			<div>
				<h3 className="text-lg md:text-xl font-black text-grantpicks-black-950 mb-1.5 line-clamp-2 leading-tight">
					{doc.name}
				</h3>
				{doc.description && (
					<p className="text-sm text-grantpicks-black-600 line-clamp-2 leading-relaxed">
						{doc.description}
					</p>
				)}
			</div>

			{/* Admin Alert */}
			{isAdminOrOwner && pendingApplicationsCount > 0 && (
				<div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg px-3 py-2 flex items-center justify-between shadow-sm">
					<div className="flex items-center space-x-2">
						<div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
						<p className="text-xs font-bold text-orange-700">
							{pendingApplicationsCount} Pending Review
						</p>
					</div>
				</div>
			)}

			{/* Funding Progress */}
			<div className="bg-gradient-to-br from-grantpicks-black-50 to-white rounded-xl p-3 border border-grantpicks-black-100">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center space-x-2">
						<IconDollar size={18} className="fill-grantpicks-black-600" />
						<span className="text-sm font-bold text-grantpicks-black-700">
							Funding Progress
						</span>
					</div>
					<div className="text-right">
						<p className="text-base font-black text-grantpicks-black-950">
							{progress.toFixed(0)}%
						</p>
					</div>
				</div>
				<div className="w-full h-3 bg-grantpicks-black-100 rounded-full overflow-hidden shadow-inner mb-2">
					<div
						className={clsx(
							'h-full rounded-full transition-all duration-500 shadow-md',
							progressColorClass(),
						)}
						style={{ width: `${progress}%` }}
					/>
				</div>
				<div className="flex items-center justify-between text-[11px]">
					<span className="font-semibold text-grantpicks-black-700">
						{funded} XLM
					</span>
					<span className="text-grantpicks-black-500">of {target} XLM</span>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 gap-3">
				{/* Participants */}
				<div className="bg-white rounded-xl p-3 border border-grantpicks-black-100">
					<div className="flex items-center space-x-2 mb-1">
						<IconGroup size={16} className="fill-grantpicks-black-400" />
						<span className="text-xs font-medium text-grantpicks-black-500 uppercase">
							Projects
						</span>
					</div>
					<p className="text-xl font-black text-grantpicks-black-950">
						{totalApprovedProjects}
					</p>
					<p className="text-xs text-grantpicks-black-500 mt-0.5">
						Participating
					</p>
				</div>

				{/* Timeline */}
				{timelineInfo && (
					<div className="bg-white rounded-xl p-3 border border-grantpicks-black-100">
						<div className="flex items-center space-x-2 mb-1">
							<IconClock size={16} className="fill-grantpicks-black-400" />
							<span className="text-xs font-medium text-grantpicks-black-500 uppercase">
								{timelineInfo.label}
							</span>
						</div>
						<p className="text-sm font-bold text-grantpicks-black-950 line-clamp-1">
							{timelineInfo.time}
						</p>
						<p className="text-xs text-grantpicks-black-500 mt-0.5">
							{timelineInfo.date}
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default RoundCardContent
