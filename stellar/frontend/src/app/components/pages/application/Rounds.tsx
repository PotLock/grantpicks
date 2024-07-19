import useRoundStore from '@/stores/zustand/useRoundStore'
import clsx from 'clsx'
import React, { useState } from 'react'
import IconNear from '../../svgs/IconNear'
import IconCube from '../../svgs/IconCube'
import IconProject from '../../svgs/IconProject'
import IconDollar from '../../svgs/IconDollar'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import Button from '../../commons/Button'
import IconMoreVert from '../../svgs/IconMoreVert'
import MoreVertMenu from './MoreVertMenu'
import RoundDetailDrawer from './RoundDetailDrawer'
import ApplicationsDrawer from './ApplicationsDrawer'
import FundRoundModal from './FundRoundModal'
import { useModalContext } from '@/app/providers/ModalProvider'

const ApplicationRoundsItem = () => {
	const { selectedRoundType } = useRoundStore()
	const [showMoreVert, setShowMoreVert] = useState<boolean>(false)
	const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
	const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const { setApplyProjectInitProps } = useModalContext()

	return (
		<div className="p-4 md:p-5 rounded-xl border border-black/10">
			<div className="flex items-center justify-between mb-4 md:mb-6">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
					<IconNear size={16} className="fill-grantpicks-black-950" />
				</div>
				<div className="flex items-center space-x-2">
					<div
						className={clsx(
							`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
							selectedRoundType === 'on-going' ||
								selectedRoundType === 'upcoming'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{selectedRoundType === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : selectedRoundType === 'upcoming' ? (
							<IconProject size={18} className="fill-grantpicks-green-400" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{selectedRoundType === 'on-going'
								? `voting open`
								: selectedRoundType === 'upcoming'
									? `application open`
									: `payout pending`}
						</p>
					</div>
					{(selectedRoundType === 'on-going' ||
						selectedRoundType === 'upcoming') && (
						<div className="relative">
							<IconMoreVert
								size={24}
								className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70 transition"
								onClick={() => setShowMoreVert(true)}
							/>
							<MoreVertMenu
								isOpen={showMoreVert}
								onClose={() => setShowMoreVert(false)}
								onViewDetails={() => {
									setShowMoreVert(false)
									setShowDetailDrawer(true)
								}}
								onViewApps={() => {
									setShowMoreVert(false)
									setShowAppsDrawer(true)
								}}
								onFundRound={() => {
									setShowMoreVert(false)
									setShowFundRoundModal(true)
								}}
							/>
						</div>
					)}
				</div>
			</div>
			<p className="font-semibold text-base md:text-lg lg:text-xl max-w-60 mb-4 text-grantpicks-black-950">
				Web3 Education & Skill Development
			</p>
			<div className="flex items-center justify-between mb-6">
				{selectedRoundType === 'on-going' ? (
					<div className="flex items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							15 Votes per person
						</p>
					</div>
				) : selectedRoundType === 'upcoming' ? (
					<div className="flex items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							8 Participating
						</p>
					</div>
				) : (
					<div className="flex items-center space-x-1">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							50 Projects
						</p>
					</div>
				)}
				{selectedRoundType === 'on-going' ? (
					<div className="flex items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends in 3days
						</p>
					</div>
				) : selectedRoundType === 'upcoming' ? (
					<div className="flex items-center space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Closes in 3days
						</p>
					</div>
				) : (
					<p className="text-lg md:text-xl font-normal text-grantpicks-black-950">
						407,121{' '}
						<span className="text-sm font-normal text-grantpicks-black-600">
							NEAR
						</span>
					</p>
				)}
			</div>
			<div className="w-full">
				<Button
					onClick={() => {
						if (selectedRoundType === 'on-going') {
						} else if (selectedRoundType === 'upcoming') {
							setApplyProjectInitProps((prev) => ({
								...prev,
								isOpen: true,
							}))
						} else {
						}
					}}
					isFullWidth
					className="!border !border-grantpicks-black-200 !py-2"
					color="white"
				>
					{selectedRoundType === 'on-going'
						? 'Vote'
						: selectedRoundType === 'upcoming'
							? 'Apply'
							: 'View Result'}
				</Button>
			</div>
			<RoundDetailDrawer
				isOpen={showDetailDrawer}
				onClose={() => setShowDetailDrawer(false)}
			/>
			<ApplicationsDrawer
				isOpen={showAppsDrawer}
				onClose={() => setShowAppsDrawer(false)}
			/>
			<FundRoundModal
				isOpen={showFundRoundModal}
				onClose={() => setShowFundRoundModal(false)}
			/>
		</div>
	)
}

const ApplicationRounds = () => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	return (
		<div>
			<div className="flex items-center md:justify-center md:space-x-4 space-x-2 overflow-x-auto mb-6 md:mb-7 lg:mb-8">
				<button
					onClick={() => setSelectedRoundType('on-going')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'on-going'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Ongoing rounds
				</button>
				<button
					onClick={() => setSelectedRoundType('upcoming')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'upcoming'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Upcoming rounds
				</button>
				<button
					onClick={() => setSelectedRoundType('ended')}
					className={clsx(
						`rounded-full px-6 py-3 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
						selectedRoundType === 'ended'
							? `bg-grantpicks-black-950 text-white`
							: `bg-grantpicks-black-50 text-grantpicks-black-950`,
					)}
				>
					Round results
				</button>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
				{[...Array(6)].map((doc, idx) => (
					<ApplicationRoundsItem key={idx} />
				))}
			</div>
		</div>
	)
}

export default ApplicationRounds
