import React from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import clsx from 'clsx'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconCube from '../../svgs/IconCube'
import IconProject from '../../svgs/IconProject'
import IconDollar from '../../svgs/IconDollar'
import IconStellar from '../../svgs/IconStellar'
import IconClock from '../../svgs/IconClock'
import IconGroup from '../../svgs/IconGroup'
import IconTelegram from '../../svgs/IconTelegram'
import Button from '../../commons/Button'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { useWallet } from '@/app/providers/WalletProvider'
import IconNear from '../../svgs/IconNear'
import moment from 'moment'
import { formatStroopToXlm, prettyTruncate } from '@/utils/helper'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { getRoundAdmins } from '@/services/on-chain/round'
import useSWR from 'swr'
import IconLoading from '../../svgs/IconLoading'
import { Contact } from 'round-client'
import IconInstagram from '../../svgs/IconInstagram'
import IconTwitter from '../../svgs/IconTwitter'
import IconEmail from '../../svgs/IconEmail'
import Link from 'next/link'

interface RoundDetailDrawerProps extends IDrawerProps {
	doc: IGetRoundsResponse
	onOpenFundRound: () => void
	onApplyRound: () => void
	onVote: () => void
}

const RoundDetailContact = ({ contact }: { contact: Contact }) => {
	const generateLink = () => {
		if (contact.name.toLowerCase().includes('telegram')) {
			return `https://t.me/${contact.value}`
		} else if (contact.name.toLowerCase().includes('instagram')) {
			return `https://instagram.com/${contact.value}`
		} else if (contact.name.toLowerCase().includes('twitter')) {
			return `https://x.com/${contact.value}`
		} else if (contact.name.toLowerCase().includes('email')) {
			return `mailto:${contact.value}`
		} else return ``
	}
	return (
		<>
			<div className="flex items-center space-x-3">
				<div className="bg-grantpicks-black-50 rounded-full w-10 h-10 flex items-center justify-center">
					{contact.name.toLowerCase().includes('telegram') && (
						<IconTelegram size={18} className="fill-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('instagram') && (
						<IconInstagram size={18} className="stroke-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('twitter') && (
						<IconTwitter size={18} className="fill-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('email') && (
						<IconEmail size={18} className="fill-grantpicks-black-400" />
					)}
				</div>
				<p className="text-grantpicks-black-950 font-semibold text-base">
					{contact.name.toLowerCase().includes('telegram') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('instagram') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('twitter') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('email') && `@${contact.value}`}
				</p>
			</div>
			<Link href={generateLink()} target="_blank">
				<Button
					color="alpha-50"
					onClick={() => {}}
					className="!text-sm !font-semibold"
				>
					Chat
				</Button>
			</Link>
		</>
	)
}

const RoundDetailDrawer = ({
	isOpen,
	onClose,
	doc,
	onOpenFundRound,
	onApplyRound,
	onVote,
}: RoundDetailDrawerProps) => {
	const { selectedRoundType } = useRoundStore()
	const { connectedWallet, stellarPubKey } = useWallet()

	const onFetchRoundAdmins = async () => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		const res = await getRoundAdmins({ round_id: BigInt(doc.id) }, contracts)
		return res
	}

	const getSpecificTime = () => {
		if (selectedRoundType === 'upcoming') {
			if (new Date().getTime() < Number(doc.application_start_ms)) {
				return `upcoming`
			} else if (
				Number(doc.application_start_ms) <= new Date().getTime() &&
				new Date().getTime() < Number(doc.application_end_ms)
			) {
				return `upcoming-open`
			} else if (
				Number(doc.application_end_ms) <= new Date().getTime() &&
				new Date().getTime() < Number(doc.voting_start_ms)
			) {
				return `upcoming-closed`
			}
		} else if (selectedRoundType === 'on-going') {
			return `on-going`
		} else {
			return `ended`
		}
	}

	const {
		data: admins,
		isValidating,
		isLoading,
	} = useSWR(isOpen ? `get-round-admins-${doc.id}` : null, onFetchRoundAdmins)

	return (
		<Drawer onClose={onClose} isOpen={isOpen}>
			<div className="bg-white flex flex-col w-full h-full overflow-y-auto">
				<div className="p-4 md:p-5 flex items-center">
					<div
						className={clsx(
							`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
							getSpecificTime() === 'upcoming-open' ||
								getSpecificTime() === 'on-going'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: getSpecificTime() === 'upcoming' ||
									  getSpecificTime() === 'upcoming-closed'
									? `border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50`
									: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{selectedRoundType === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : getSpecificTime() === 'upcoming-open' ? (
							<IconProject size={18} className="fill-grantpicks-green-400" />
						) : getSpecificTime() === 'upcoming' ||
						  getSpecificTime() === 'upcoming-closed' ? (
							<IconProject size={18} className="fill-grantpicks-black-950" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{getSpecificTime() === 'on-going'
								? `voting open`
								: getSpecificTime() === 'upcoming'
									? `application closed`
									: getSpecificTime() === 'upcoming-open'
										? `application open`
										: getSpecificTime() === 'upcoming-closed'
											? `application closed`
											: `payout pending`}
						</p>
					</div>
				</div>
				<div className="px-5 py-4">
					<div className="flex items-center">
						<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
							{connectedWallet === 'near' ? (
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
					<div className="flex items-center">
						{selectedRoundType === 'on-going' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconCube size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									{doc.num_picks_per_voter} Vote
									{doc.num_picks_per_voter > 1 && `s`} per person
								</p>
							</div>
						) : selectedRoundType === 'upcoming' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconGroup size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Max. {doc.max_participants} applicant
								</p>
							</div>
						) : (
							<div className="flex flex-1 items-center space-x-1">
								<IconProject size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									-- Projects
								</p>
							</div>
						)}
						{selectedRoundType === 'on-going' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Ends{` `}
									{moment(
										new Date(Number(doc.voting_end_ms) as number),
									).fromNow()}
								</p>
							</div>
						) : selectedRoundType === 'upcoming' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Closes{' '}
									{moment(
										new Date(Number(doc.application_start_ms) as number),
									).fromNow()}{' '}
								</p>
							</div>
						) : (
							<p className="text-lg flex-1 md:text-xl font-normal text-grantpicks-black-950">
								{formatStroopToXlm(doc.expected_amount)}{' '}
								<span className="text-sm font-normal text-grantpicks-black-600">
									XLM
								</span>
							</p>
						)}
					</div>
				</div>
				<div className="p-4 md:p-5">
					<div className="flex items-center mb-4 md:mb-5">
						<div className="flex-1">
							<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
								{formatStroopToXlm(doc.current_vault_balance)} XLM
							</p>
							<p className="font-semibold text-xs text-grantpicks-black-600">
								AVAILABLE FUNDS
							</p>
						</div>
						<div className="flex-1">
							<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
								{formatStroopToXlm(doc.expected_amount)} XLM
							</p>
							<p className="font-semibold text-xs text-grantpicks-black-600">
								EXPECTED FUNDS
							</p>
						</div>
					</div>
					<div className="mb-4 md:mb-5">
						<div className="border-b border-black/10 pb-2 flex items-center">
							<p className="text-xs font-semibold text-grantpicks-black-600">
								ADMIN{' '}
								<span className="text-sm font-bold text-grantpicks-black-600 ml-2">
									{admins?.length || ''}
								</span>
							</p>
						</div>
						{isLoading || isValidating ? (
							<div className="h-20 flex items-center justify-center w-full">
								<IconLoading size={24} className="fill-grantpicks-black-600" />
							</div>
						) : (
							<div className="grid grid-cols-2 gap-4 pt-3">
								{admins?.map((adminKey, idx) => (
									<div key={idx} className="flex items-center space-x-2">
										<div className="bg-grantpicks-black-600 rounded-full w-10 h-10" />
										<div>
											<p className="text-base font-bold text-grantpicks-black-950">
												{prettyTruncate(adminKey, 8, 'address')}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div>
						<div className="border-b border-black/10 pb-2 flex items-center">
							<p className="text-xs font-semibold text-grantpicks-black-600">
								CONTACTS
							</p>
						</div>
						{doc.contacts.length === 0 ? (
							<div className="flex items-center justify-center h-20">
								<p className="text-center text-sm text-grantpicks-black-400">
									No contacts yet
								</p>
							</div>
						) : (
							<div>
								{doc?.contacts.map((contact, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between pt-3"
									>
										<RoundDetailContact contact={contact} />
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{selectedRoundType === 'upcoming' && (
					<div className="px-6 pt-4 pb-6 flex items-center space-x-4">
						<Button
							color="black-950"
							onClick={() => {
								onApplyRound()
								onClose()
							}}
							className="!py-3 flex-1"
						>
							Apply
						</Button>
						{doc.use_vault && (
							<Button
								color="alpha-50"
								onClick={() => {
									onOpenFundRound()
									onClose()
								}}
								className="!py-3 flex-1"
							>
								Fund Round
							</Button>
						)}
					</div>
				)}
				{selectedRoundType === 'on-going' && (
					<div className="px-6 flex items-center">
						<Button
							color="black-950"
							isFullWidth
							onClick={() => {
								onVote()
								onClose()
							}}
							className="!py-3 flex-1"
						>
							Vote
						</Button>
					</div>
				)}
			</div>
		</Drawer>
	)
}

export default RoundDetailDrawer
