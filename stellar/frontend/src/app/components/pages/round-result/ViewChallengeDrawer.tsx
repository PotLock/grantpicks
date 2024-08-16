import React from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import TimerEnd from '../../commons/TimerEnd'

interface ViewChallengeDrawerProps extends IDrawerProps {
	endOfChallenge: number
}

const ViewChallengeDrawer = ({
	isOpen,
	onClose,
	endOfChallenge,
}: ViewChallengeDrawerProps) => {
	return (
		<Drawer onClose={onClose} isOpen={isOpen} showClose={false}>
			<div
				id="containerScroll"
				className="bg-white flex flex-col w-full h-full overflow-y-auto"
			>
				<div className="bg-grantpicks-purple-50 p-4 md:p-6 flex items-center justify-end">
					<p className="text-sm font-bold text-grantpicks-purple-800">
						{isOpen && <TimerEnd expiryTime={endOfChallenge} />}
					</p>
				</div>
				<div className="px-4 md:px-6 flex items-center justify-between py-4">
					<p className="text-xl font-semibold">Payout Challenges</p>
					<IconClose
						size={20}
						className="fill-grantpicks-black-400 cursor-pointer"
						onClick={onClose}
					/>
				</div>
			</div>
		</Drawer>
	)
}

export default ViewChallengeDrawer