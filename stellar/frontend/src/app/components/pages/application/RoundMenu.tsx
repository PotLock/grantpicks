import React, { useState, useRef } from 'react'
import IconMoreVert from '../../svgs/IconMoreVert'
import Link from 'next/link'
import useRoundStore from '@/stores/zustand/useRoundStore'
import { useRouter } from 'next/navigation'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import Menu from '../../commons/Menu'

const RoundMenu = ({
	data,
	onViewDetails,
	onViewApps,
	onFundRound,
	onUpdateTimePeriod,
	onUpdateAdmins,
}: {
	data: GPRound
	onViewDetails: () => void
	onViewApps: () => void
	onFundRound: () => void
	onUpdateTimePeriod: () => void
	onUpdateAdmins: () => void
}) => {
	const { selectedRoundType } = useRoundStore()
	const router = useRouter()
	const storage = useAppStorage()
	const [isOpen, setIsOpen] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)

	const generateLink = () => {
		if (data.contacts[0].name.toLowerCase().includes('telegram')) {
			return `https://t.me/${data.contacts[0].value}`
		} else if (data.contacts[0].name.toLowerCase().includes('instagram')) {
			return `https://instagram.com/${data.contacts[0].value}`
		} else if (data.contacts[0].name.toLowerCase().includes('twitter')) {
			return `https://x.com/${data.contacts[0].value}`
		} else if (data.contacts[0].name.toLowerCase().includes('email')) {
			return `mailto:${data.contacts[0].value}`
		} else return ``
	}

	const handleMenuClose = () => {
		setIsOpen(false)
	}

	const handleAction = (action: () => void) => {
		action()
		setIsOpen(false)
	}

	return (
		<div className="relative flex items-center justify-between space-x-2" ref={buttonRef}>
			{/* Trigger Button */}
			<div className="flex items-center space-x-2">
				<p className="text-sm font-normal text-grantpicks-black-950">Round Actions</p>
			</div>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
				aria-label="Open round menu"
			>
				<IconMoreVert size={20} className="fill-grantpicks-black-600" />
			</button>

			{/* Dropdown Menu */}
			<Menu
				isOpen={isOpen}
				onClose={handleMenuClose}
				buttonRef={buttonRef}
				position=""
			>
				<div
					className="bg-white rounded-xl border border-black/10 p-2 whitespace-nowrap min-w-48 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-auto absolute right-0 mt-2"
					style={{ right: 0, top: '100%' }}
				>
					{(selectedRoundType === 'upcoming' ||
						selectedRoundType === 'on-going') && (
							<>
								<div
									onClick={() => handleAction(onViewDetails)}
									className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
								>
									<p className="text-sm font-normal text-grantpicks-black-950">
										View Details
									</p>
								</div>
								{data.owner?.id === storage.my_address && (
									<div
										className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
										onClick={() => handleAction(onUpdateTimePeriod)}
									>
										<p className="text-sm font-normal text-grantpicks-black-950">
											Update Duration
										</p>
									</div>
								)}
							</>
						)}
					{(selectedRoundType === 'upcoming' || selectedRoundType === 'on-going') &&
						storage.my_address &&
						data.allow_applications && (
							<div
								className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
								onClick={() => handleAction(onViewApps)}
							>
								<p className="text-sm font-normal text-grantpicks-black-950">
									Applications
								</p>
							</div>
						)}
					{selectedRoundType === 'upcoming' &&
						data.owner?.id === storage.my_address && (
							<div
								className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
								onClick={() => handleAction(() => router.push(`/rounds/edit-round/${data.on_chain_id}`))}
							>
								<p className="text-sm font-normal text-grantpicks-black-950">
									Edit Round
								</p>
							</div>
						)}
					{(selectedRoundType === 'upcoming' || selectedRoundType === 'on-going') &&
						storage.my_address &&
						data.use_vault && (
							<div className="flex flex-col space-y-2">
								<div
									className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
									onClick={() => handleAction(onFundRound)}
								>
									<p className="text-sm font-normal text-grantpicks-black-950">
										Fund Round
									</p>
								</div>

							</div>
						)}
					{data.owner?.id === storage.my_address && (
						<div
							className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg"
							onClick={() => handleAction(onUpdateAdmins)}
						>
							<p className="text-sm font-normal text-grantpicks-black-950">
								Update Admins
							</p>
						</div>
					)}
					{selectedRoundType === 'on-going' && data.contacts.length > 0 && (
						<Link
							href={generateLink()}
							target="_blank"
							onClick={handleMenuClose}
						>
							<div className="p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200 rounded-lg">
								<p className="text-sm font-normal text-grantpicks-black-950">
									Contact RM
								</p>
							</div>
						</Link>
					)}
				</div>
			</Menu>
		</div>
	)
}

export default RoundMenu
