import React from 'react'
import Menu from '../../commons/Menu'
import IconEye from '../../svgs/IconEye'
import IconProject from '../../svgs/IconProject'
import IconEdit from '../../svgs/IconEdit'
import IconDonate from '../../svgs/IconDonate'
import useRoundStore from '@/stores/zustand/useRoundStore'
import { useWallet } from '@/app/providers/WalletProvider'
import IconUser from '../../svgs/IconUser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GPRound } from '@/models/round'

const MoreVertMenu = ({
	isOpen,
	data,
	onClose,
	onViewDetails,
	onViewApps,
	onFundRound,
}: {
	isOpen: boolean
	data: GPRound
	onClose: () => void
	onViewDetails: () => void
	onViewApps: () => void
	onFundRound: () => void
}) => {
	const { selectedRoundType } = useRoundStore()
	const { stellarPubKey, nearAccounts } = useWallet()
	const router = useRouter()

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

	return (
		<Menu isOpen={isOpen} onClose={onClose} position={`right-0 top-0`}>
			<div className="bg-white rounded-t-2xl md:rounded-2xl border border-black/10 p-2 whitespace-nowrap min-w-40 shadow-md">
				{(selectedRoundType === 'upcoming' ||
					selectedRoundType === 'on-going') && (
					<div
						onClick={onViewDetails}
						className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
					>
						<IconEye size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							View Details
						</p>
					</div>
				)}
				{(selectedRoundType === 'upcoming' ||
					selectedRoundType === 'on-going') &&
					data.allow_applications && (
						<div
							className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
							onClick={onViewApps}
						>
							<IconProject size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								Applications
							</p>
						</div>
					)}
				{selectedRoundType === 'upcoming' &&
					(data.owner?.id === stellarPubKey ||
						data.owner?.id === nearAccounts[0]?.accountId) && (
						<div
							className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
							onClick={() =>
								router.push(`/application/edit-round/${data.id.toString()}`)
							}
						>
							<IconEdit size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								Edit Round
							</p>
						</div>
					)}
				{selectedRoundType === 'upcoming' && data.use_vault && (
					<div
						className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
						onClick={onFundRound}
					>
						<IconDonate size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Fund Round
						</p>
					</div>
				)}
				{selectedRoundType === 'on-going' && (
					<Link
						href={data.contacts.length > 0 ? generateLink() : ''}
						target="_blank"
					>
						<div className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition">
							<IconUser size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								Contact RM
							</p>
						</div>
					</Link>
				)}
			</div>
		</Menu>
	)
}

export default MoreVertMenu
