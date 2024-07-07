import React from 'react'
import Menu from '../../commons/Menu'
import IconEye from '../../svgs/IconEye'
import IconProject from '../../svgs/IconProject'
import IconEdit from '../../svgs/IconEdit'
import IconDonate from '../../svgs/IconDonate'

const MoreVertMenu = ({
	isOpen,
	onClose,
	onViewDetails,
	onViewApps,
	onFundRound,
}: {
	isOpen: boolean
	onClose: () => void
	onViewDetails: () => void
	onViewApps: () => void
	onFundRound: () => void
}) => {
	return (
		<Menu isOpen={isOpen} onClose={onClose} position={`right-0 top-0`}>
			<div className="bg-white rounded-t-2xl md:rounded-2xl border border-black/10 p-2 whitespace-nowrap min-w-40 shadow-md">
				<div
					onClick={onViewDetails}
					className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
				>
					<IconEye size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						View Details
					</p>
				</div>
				<div
					className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
					onClick={onViewApps}
				>
					<IconProject size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						Applications
					</p>
				</div>
				<div className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition">
					<IconEdit size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						Edit Round
					</p>
				</div>
				<div
					className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
					onClick={onFundRound}
				>
					<IconDonate size={18} className="fill-grantpicks-black-400" />
					<p className="text-sm font-normal text-grantpicks-black-950">
						Fund Round
					</p>
				</div>
			</div>
		</Menu>
	)
}

export default MoreVertMenu
