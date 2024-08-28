import useAppStorage from '@/stores/zustand/useAppStorage'
import { ProjectVotingResult } from 'round-client'
import IconStellar from '../svgs/IconStellar'
import IconUnion from '../svgs/IconUnion'
import Image from 'next/image'
import { formatStroopToXlm } from '@/utils/helper'
import { useState } from 'react'

const PayoutItem = ({
	index,
	data,
}: {
	index: number
	data: ProjectVotingResult
}) => {
	const store = useAppStorage()
	const projectData = store.projects.get(data.project_id.toString())
	const [amountOverride, setAmountOverride] = useState<number>(0)
	const tableState = store.getPayoutTableItems(data.project_id.toString())

	const onChangeAmmountOverride = (e: React.ChangeEvent<HTMLInputElement>) => {
		let newPayouts = store.current_payout_inputs

		if (Number(e.target.value) > store.current_remaining + amountOverride) {
			setAmountOverride(0)
			newPayouts.set(data.project_id.toString(), 0)
			store.setCurrentPayoutInputs(newPayouts)
		} else {
			setAmountOverride(Number(e.target.value))
			newPayouts.set(data.project_id.toString(), Number(e.target.value))
			store.setCurrentPayoutInputs(newPayouts)
		}

		let overridedAmount = 0

		newPayouts.forEach((value) => {
			overridedAmount += value
		})

		const pairWiseCoin =
			(store.current_pairwise_weight / 100) *
			Number(
				formatStroopToXlm(
					store.current_round?.current_vault_balance || BigInt(0),
				),
			)

		const bannedAllocation = store.getBannedProjectAllocations() * pairWiseCoin

		const managerCoin =
			Number(
				formatStroopToXlm(
					store.current_round?.current_vault_balance || BigInt(0),
				),
			) - pairWiseCoin

		overridedAmount = managerCoin + bannedAllocation - overridedAmount
		store.setCurrentRemaining(overridedAmount)
	}

	return (
		<div className="flex w-full items-center p-4 border-b">
			<div className="flex items-center w-[70%] md:w-[34%]">
				<Image
					src={projectData?.image_url || '/assets/images/ava-1.png'}
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
					className="flex flex-grow text-right outline-none w-10 text-sm"
				/>
				<IconStellar size={14} className="fill-grantpicks-black-500" />
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					value={amountOverride == 0 ? '' : amountOverride}
					className="flex flex-grow text-right outline-none w-10 text-sm"
					onChange={onChangeAmmountOverride}
				/>
				<IconStellar size={14} className="fill-grantpicks-black-500" />
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.pairwise_weight_adjusted.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm"
				/>
				<IconStellar size={14} className="fill-grantpicks-black-500" />
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.assigned_weight.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm"
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
					className="flex flex-grow text-right outline-none w-10 text-sm"
				/>
				<IconStellar size={14} className="fill-grantpicks-black-500" />
			</div>
			<div className="items-center w-[11%] hidden md:flex">
				<input
					type="number"
					placeholder="0"
					maxLength={6}
					disabled
					value={tableState?.final_calculation.toFixed(2)}
					className="flex flex-grow text-right outline-none w-10 text-sm"
				/>
				<IconStellar size={14} className="fill-grantpicks-black-500" />
			</div>
		</div>
	)
}

export default PayoutItem
