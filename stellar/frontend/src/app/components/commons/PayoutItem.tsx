import useAppStorage from '@/stores/zustand/useAppStorage'
import IconStellar from '../svgs/IconStellar'
import IconUnion from '../svgs/IconUnion'
import Image from 'next/image'
import { formatStroopToXlm } from '@/utils/helper'
import { useState } from 'react'
import { GPVotingResult } from '@/models/voting'
import IconNear from '../svgs/IconNear'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

const PayoutItem = ({
	index,
	data,
}: {
	index: number
	data: GPVotingResult
}) => {
	const store = useAppStorage()
	const projectData = store.projects.get(data.project)
	const [amountOverride, setAmountOverride] = useState<number>(0)
	const tableState = store.getPayoutTableItems(data.project)
	const storage = useAppStorage()

	const onChangeAmmountOverride = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newPayouts = store.current_payout_inputs

		if (Number(e.target.value) > store.current_remaining + amountOverride) {
			setAmountOverride(0)
			newPayouts.set(data.project, 0)
			store.setCurrentPayoutInputs(newPayouts)
		} else {
			setAmountOverride(Number(e.target.value))
			newPayouts.set(data.project, Number(e.target.value))
			store.setCurrentPayoutInputs(newPayouts)
		}

		let overridedAmount = 0

		newPayouts.forEach((value) => {
			overridedAmount += value
		})

		let currentBalance = 0

		if (storage.chainId === 'stellar') {
			currentBalance = Number(
				formatStroopToXlm(
					BigInt(store.current_round?.current_vault_balance || 0),
				),
			)
		} else {
			currentBalance = Number(
				formatNearAmount(
					storage.current_round?.current_vault_balance || '0',
				).replace(',', ''),
			)
		}

		const pairWiseCoin = (store.current_pairwise_weight / 100) * currentBalance

		const bannedAllocation = store.getBannedProjectAllocations() * pairWiseCoin

		const managerCoin = currentBalance - pairWiseCoin

		overridedAmount = managerCoin + bannedAllocation - overridedAmount
		store.setCurrentRemaining(overridedAmount)
	}

	return (
		<div className="flex w-full items-center p-4 border-b">
			<div className="flex items-center w-[70%] md:w-[34%]">
				<Image
					src={`https://www.tapback.co/api/avatar/${projectData?.owner?.id}`}
					alt=""
					width={200}
					height={200}
					className="rounded-full w-10 h-10 mx-1"
				/>
				<p className="text-xs md:text-sm font-semibold text-grantpicks-black-950">
					{projectData?.name}
				</p>
			</div>
			<div className="flex items-center w-[30%] md:w-[11%]">
				<input
					type="number"
					disabled
					placeholder="0"
					maxLength={6}
					value={tableState?.actual_amount.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm disabled:bg-white"
				/>
				{storage.chainId === 'stellar' ? (
					<IconStellar size={14} className="fill-grantpicks-black-500" />
				) : (
					<IconNear size={14} className="fill-grantpicks-black-500" />
				)}
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					value={amountOverride || ''}
					step={0.01}
					className="flex flex-grow text-right outline-none w-10 text-sm m-1 bg-grantpicks-black-50 border border-grantpicks-black-100 p-2 rounded-md"
					onChange={onChangeAmmountOverride}
				/>
				{storage.chainId === 'stellar' ? (
					<IconStellar size={14} className="fill-grantpicks-black-500" />
				) : (
					<IconNear size={14} className="fill-grantpicks-black-500" />
				)}
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.pairwise_weight_adjusted.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm disabled:bg-white"
				/>
				{storage.chainId === 'stellar' ? (
					<IconStellar size={14} className="fill-grantpicks-black-500" />
				) : (
					<IconNear size={14} className="fill-grantpicks-black-500" />
				)}
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.assigned_weight.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm disabled:bg-white"
				/>
				<IconUnion size={14} className="fill-grantpicks-black-500" />
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.assigned_calculated.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm disabled:bg-white"
				/>
				{storage.chainId === 'stellar' ? (
					<IconStellar size={14} className="fill-grantpicks-black-500" />
				) : (
					<IconNear size={14} className="fill-grantpicks-black-500" />
				)}
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.final_calculation.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm disabled:bg-white"
				/>
				{storage.chainId === 'stellar' ? (
					<IconStellar size={14} className="fill-grantpicks-black-500" />
				) : (
					<IconNear size={14} className="fill-grantpicks-black-500" />
				)}
			</div>
		</div>
	)
}

export default PayoutItem
