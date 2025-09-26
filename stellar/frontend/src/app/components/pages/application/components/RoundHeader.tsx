import React from 'react'
import IconNear from '../../../svgs/IconNear'
import IconStellar from '../../../svgs/IconStellar'
import IconCube from '../../../svgs/IconCube'
import IconGroup from '../../../svgs/IconGroup'
import IconProject from '../../../svgs/IconProject'
import IconClock from '../../../svgs/IconClock'
import moment from 'moment'
import { GPRound } from '@/models/round'

interface RoundHeaderProps {
	doc: GPRound
	chainId: string
	selectedRoundType: string
	currentTime: string
}

const RoundHeader: React.FC<RoundHeaderProps> = ({
	doc,
	chainId,
	selectedRoundType,
	currentTime,
}) => {
	const renderMetadata = () => {
		if (selectedRoundType === 'on-going') {
			return (
				<>
					<div className="flex flex-1 items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{doc.num_picks_per_voter} Vote
							{doc.num_picks_per_voter > 1 && 's'} per person
						</p>
					</div>
					<div className="flex flex-1 items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends {moment(new Date(doc.voting_end || '')).fromNow()}
						</p>
					</div>
				</>
			)
		} else if (selectedRoundType === 'upcoming') {
			return (
				<>
					<div className="flex flex-1 items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Max. {doc.max_participants} applicant
						</p>
					</div>
					{doc.allow_applications && (
						<div className="flex flex-1 items-center space-x-1">
							<IconClock size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								{new Date().getTime() <
								new Date(doc.application_start || '').getTime()
									? 'Open'
									: 'Closed'}{' '}
								{new Date().getTime() <
								new Date(doc.application_start || '').getTime()
									? moment(
											new Date(doc.application_start || '').getTime(),
										).fromNow()
									: moment(
											new Date(doc.application_end || '').getTime(),
										).fromNow()}
							</p>
						</div>
					)}
				</>
			)
		} else {
			return (
				<div className="flex flex-1 items-center space-x-1">
					<IconProject size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						-- Projects
					</p>
				</div>
			)
		}
	}

	return (
		<div className="px-5 py-4">
			<div className="flex items-center">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
					{chainId === 'near' ? (
						<IconNear size={16} className="fill-grantpicks-black-950" />
					) : (
						<IconStellar size={16} className="fill-grantpicks-black-950" />
					)}
				</div>
			</div>

			<p className="text-grantpicks-black-950 text-2xl md:text-3xl lg:text-[32px] font-semibold mb-4">
				{doc.name}
			</p>

			<p className="text-sm font-normal text-grantpicks-black-600 line-clamp-5 mb-4">
				{doc.description}
			</p>

			<div className="flex items-center">{renderMetadata()}</div>
		</div>
	)
}

export default RoundHeader
