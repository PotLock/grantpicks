import React from 'react'
import IconEye from '../../svgs/IconEye'
import IconProject from '../../svgs/IconProject'
import IconEdit from '../../svgs/IconEdit'
import IconDonate from '../../svgs/IconDonate'
import Link from 'next/link'
import IconUser from '../../svgs/IconUser'
import useRoundStore from '@/stores/zustand/useRoundStore'
import { useRouter } from 'next/navigation'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'

const RoundMenu = ({
	data,
	onViewDetails,
	onViewApps,
	onFundRound,
	onUpdateTimePeriod,
}: {
	data: GPRound
	onViewDetails: () => void
	onViewApps: () => void
	onFundRound: () => void
	onUpdateTimePeriod: () => void
}) => {
	const { selectedRoundType } = useRoundStore()
	const router = useRouter()
	const storage = useAppStorage()

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
		<div className="bg-white rounded-t-2xl md:rounded-2xl border border-black/10 p-2 whitespace-nowrap min-w-40">
			{(selectedRoundType === 'upcoming' ||
				selectedRoundType === 'on-going') && (
					<>
						<div
							onClick={onViewDetails}
							className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
						>
							<IconEye size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								View Details
							</p>
						</div>
						{data.owner?.id === storage.my_address && (
							<div
								className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
								onClick={onUpdateTimePeriod}
							>
								<IconEdit size={18} className="fill-grantpicks-black-400" />
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
				data.owner?.id === storage.my_address && (
					<>
						<div
							className="p-2 flex items-center space-x-2 cursor-pointer hover:opacity-70 transition"
							onClick={() =>
								router.push(`/rounds/edit-round/${data.on_chain_id}`)
							}
						>
							<IconEdit size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-normal text-grantpicks-black-950">
								Edit Round
							</p>
						</div>

					</>
				)}
			{(selectedRoundType === 'upcoming' || selectedRoundType === 'on-going') &&
				storage.my_address &&
				data.use_vault && (
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
	)
}

export default RoundMenu
