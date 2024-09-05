'use client'
import { formatStroopToXlm } from '@/utils/helper'
import { useRouter } from 'next/navigation'
import { ProjectVotingResult } from 'round-client'
import IconStarBronze from '../svgs/IconStarBronze'
import IconStarGold from '../svgs/IconStarGold'
import IconStarSilver from '../svgs/IconStarSilver'
import IconStellar from '../svgs/IconStellar'
import useAppStorage from '@/stores/zustand/useAppStorage'
import Image from 'next/image'
import clsx from 'clsx'

const ResultItem = ({
	index,
	data,
}: {
	index: number
	data: ProjectVotingResult
}) => {
	const router = useRouter()
	const store = useAppStorage()
	const roundData = store.current_round
	const projectData = store.projects.get(data.project_id.toString())
	let totalVoting = store.getTotalVoting()

	const myVote = (Number(data.voting_count) / totalVoting) * 100
	let amountToDistribute = 0

	if (roundData?.use_vault) {
		amountToDistribute =
			(Number(formatStroopToXlm(roundData?.vault_total_deposits || BigInt(0))) *
				myVote) /
			100
	} else {
		amountToDistribute =
			Number(formatStroopToXlm(roundData?.expected_amount || BigInt(0))) /
			(store.current_results.length || 0)
	}

	if (store.current_round_payouts.length > 0) {
		const payout = store.current_round_payouts.find(
			(p) => p.recipient_id === projectData?.owner,
		)
		if (payout) {
			amountToDistribute = Number(formatStroopToXlm(payout.amount))
		} else {
			amountToDistribute = 0
		}
	}

	return (
		<div
			className={clsx(
				'flex items-center w-full px-4 py-4 cursor-pointe transition rounded-2xl',
				data.is_flagged && 'bg-red-100 border-none', // Add this line
				!data.is_flagged && 'bg-white hover:bg-black/10', // Add this line
			)}
			onClick={() => {
				if (roundData)
					[
						router.push(
							`/application/round-result/${roundData?.id.toString()}/project/${data.project_id.toString()}`,
						),
					]
			}}
		>
			<div className="flex items-center w-[10%]">
				{index === 0 && <IconStarGold size={24} />}
				{index === 1 && <IconStarSilver size={24} />}
				{index === 2 && <IconStarBronze size={24} />}
				{index > 2 && (
					<p className="text-xs md:text-sm font-semibold text-grantpicks-black-600 text-center">
						#{index + 1}
					</p>
				)}
			</div>
			<div className="flex items-center w-[60%]">
				{!projectData?.image_url ? (
					<div className="bg-grantpicks-black-200 rounded-full w-10 h-10" />
				) : (
					<Image
						src={projectData?.image_url}
						alt=""
						width={200}
						height={200}
						className="rounded-full w-10 h-10 mx-1"
					/>
				)}
				<div className="flex items-center text-xs md:text-sm font-semibold text-grantpicks-black-600 w-full">
					<div className="w-full">{projectData?.name || 'Loading...'}</div>
					{data.is_flagged && (
						<div className="bg-red-50 border rounded-full px-2 py-1 text-red-500 border-red-500 mr-5">
							flagged
						</div>
					)}
				</div>
			</div>
			<div className="flex items-center w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-950 text-right mr-1">
					{amountToDistribute.toFixed(2)}
				</p>
				<IconStellar size={14} className="fill-grantpicks-black-600" />
			</div>
			<div className="flex items-center justify-end w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
					{myVote} %
				</p>
			</div>
			<div className="flex items-center justify-end w-[12%]">
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right">
					{data.voting_count.toString()}
				</p>
			</div>
		</div>
	)
}

export default ResultItem
