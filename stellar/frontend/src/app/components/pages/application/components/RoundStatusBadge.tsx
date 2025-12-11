import React from 'react'
import IconCube from '../../../svgs/IconCube'
import IconProject from '../../../svgs/IconProject'
import IconDollar from '../../../svgs/IconDollar'

interface RoundStatusBadgeProps {
	selectedRoundType: string
	currentTime: string
}

const RoundStatusBadge: React.FC<RoundStatusBadgeProps> = ({
	selectedRoundType,
	currentTime,
}) => {
	const getStatusConfig = () => {
		if (currentTime === 'upcoming-open' || currentTime === 'on-going') {
			return {
				className:
					'border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50',
				icon:
					selectedRoundType === 'on-going' ? (
						<IconCube size={18} className="fill-grantpicks-green-400" />
					) : (
						<IconProject size={18} className="fill-grantpicks-green-400" />
					),
				text:
					selectedRoundType === 'on-going' ? 'VOTING OPEN' : 'APPLICATION OPEN',
			}
		} else if (currentTime === 'on-going-voting-not-started') {
			return {
				className:
					'border-amber-400 text-amber-700 bg-amber-50',
				icon: <IconCube size={18} className="fill-amber-400" />,
				text: 'VOTING NOT STARTED',
			}
		} else if (
			currentTime === 'upcoming' ||
			currentTime === 'upcoming-closed'
		) {
			return {
				className:
					'border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50',
				icon: <IconProject size={18} className="fill-grantpicks-black-950" />,
				text: 'APPLICATION CLOSED',
			}
		} else {
			return {
				className:
					'border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50',
				icon: <IconDollar size={18} className="fill-grantpicks-amber-400" />,
				text: 'PAYOUT PENDING',
			}
		}
	}

	const config = getStatusConfig()

	return (
		<div className="p-4 md:p-5 flex items-center">
			<div
				className={`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full ${config.className}`}
			>
				{config.icon}
				<p className="uppercase">{config.text}</p>
			</div>
		</div>
	)
}

export default RoundStatusBadge
