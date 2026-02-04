import React, { useMemo } from 'react'
import IconCube from '../../../svgs/IconCube'
import IconProject from '../../../svgs/IconProject'
import IconDollar from '../../../svgs/IconDollar'
import IconClock from '../../../svgs/IconClock'
import clsx from 'clsx'

interface RoundCardHeaderProps {
	currentTime: string
	selectedRoundType: string
}

const RoundCardHeader: React.FC<RoundCardHeaderProps> = ({
	currentTime,
	selectedRoundType,
}) => {
	const config = useMemo(() => {
		if (currentTime === 'upcoming-open' || currentTime === 'on-going') {
			return {
				className:
					selectedRoundType === 'on-going'
						? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
						: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
				icon:
					selectedRoundType === 'on-going' ? (
						<IconCube size={20} className="fill-white" />
					) : (
						<IconProject size={20} className="fill-white" />
					),
				text:
					selectedRoundType === 'on-going' ? 'VOTING OPEN' : 'APPLICATION OPEN',
				badgeBg: 'bg-green-50',
				badgeText: 'text-green-700',
				badgeBorder: 'border-green-200',
			}
		} else if (currentTime === 'on-going-voting-not-started') {
			return {
				className:
					'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
				icon: <IconClock size={20} className="fill-white" />,
				text: 'VOTING NOT STARTED',
				badgeBg: 'bg-green-50',
				badgeText: 'text-green-700',
				badgeBorder: 'border-green-200',
			}
		} else if (
			currentTime === 'upcoming' ||
			currentTime === 'upcoming-closed' ||
			currentTime === 'ended'
		) {
			return {
				className:
					currentTime === 'ended'
						? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
						: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30',
				icon:
					currentTime === 'ended' ? (
						<IconDollar size={20} className="fill-white" />
					) : (
						<IconProject size={20} className="fill-white" />
					),
				text: currentTime === 'ended' ? 'COMPLETED' : 'APPLICATION CLOSED',
				badgeBg:
					currentTime === 'ended' ? 'bg-purple-50' : 'bg-orange-50',
				badgeText:
					currentTime === 'ended' ? 'text-purple-700' : 'text-orange-700',
				badgeBorder:
					currentTime === 'ended' ? 'border-purple-200' : 'border-orange-200',
			}
		} else if (currentTime === 'upcoming-not-started') {
			return {
				className:
					'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-400/30',
				icon: <IconClock size={20} className="fill-white" />,
				text: 'NOT STARTED',
				badgeBg: 'bg-orange-50',
				badgeText: 'text-orange-700',
				badgeBorder: 'border-orange-200',
			}
		} else if (currentTime === 'payout-done') {
			return {
				className:
					'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
				icon: <IconDollar size={20} className="fill-white" />,
				text: 'PAYOUT DONE',
				badgeBg: 'bg-purple-50',
				badgeText: 'text-purple-700',
				badgeBorder: 'border-purple-200',
			}
		} else {
			return {
				className:
					'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
				icon: <IconDollar size={20} className="fill-white" />,
				text: 'PAYOUT PENDING',
				badgeBg: 'bg-purple-50',
				badgeText: 'text-purple-700',
				badgeBorder: 'border-purple-200',
			}
		}
	}, [currentTime, selectedRoundType])

	return (
		<div className="mb-4">
			<div className="flex items-center justify-between">
				<p className="text-[11px] font-semibold text-grantpicks-black-500 uppercase tracking-wider">
					Round Status
				</p>
			</div>
			<div
				className={clsx(
					'mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-sm border border-white/30',
					config.className,
				)}
			>
				{config.icon}
				<p className="uppercase tracking-wide">{config.text}</p>
			</div>
		</div>
	)
}

export default RoundCardHeader
