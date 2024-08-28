import { BaseModalProps } from '@/types/dialog'
import React, { useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import InputTextArea from '../../commons/InputTextArea'
import Button from '../../commons/Button'
import { useWallet } from '@/app/providers/WalletProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import Image from 'next/image'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import { formatStroopToXlm } from '@/utils/helper'
import IconUnion from '../../svgs/IconUnion'
import PayoutItem from '../../commons/PayoutItem'
import IconInfoCircle from '../../svgs/IconInfoCircle'
import { PayoutInput } from 'round-client'
import IconLoading from '../../svgs/IconLoading'

export type PayoutTableItem = {
	actual_amount: number
	amount_override: number
	pairwise_weight_adjusted: number
	assigned_weight: number
	assigned_calculated: number
	final_calculation: number
}

const EditPayoutModal = ({ isOpen, onClose }: BaseModalProps) => {
	const [memo, setMemo] = useState<string>('')
	const { stellarPubKey, stellarKit, connectedWallet } = useWallet()
	const [managerWeight, setManagerWeight] = useState<number>(0)
	const [pairwiseWeight, setPairwiseWeight] = useState<number>(100)
	const [isLoading, setIsLoading] = useState<boolean>(false)

	const storage = useAppStorage()

	const onChangeManagerWeight = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newManagerWeight = Number(e.target.value)
		if (newManagerWeight > 100) {
			setManagerWeight(100)
			setPairwiseWeight(0)
		} else {
			setManagerWeight(newManagerWeight)
			setPairwiseWeight(100 - newManagerWeight)
		}
	}

	const onChangePairwiseWeight = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newPairwiseWeight = Number(e.target.value)
		if (newPairwiseWeight > 100) {
			setPairwiseWeight(100)
			setManagerWeight(0)
		} else {
			setPairwiseWeight(newPairwiseWeight)
			setManagerWeight(100 - newPairwiseWeight)
		}
	}

	const submitPayout = async () => {
		setIsLoading(true)
		let payoutInputs: PayoutInput[] = []

		storage.getResultNotFlagged().forEach((data) => {
			const tableState = storage.getPayoutTableItems(data.project_id.toString())
			const projectData = storage.projects.get(data.project_id.toString())
			payoutInputs.push({
				recipient_id: projectData?.owner || '',
				amount: BigInt(tableState.final_calculation * 10000000),
				memo,
			})
		})

		const contract = storage.getStellarContracts()

		if (!contract) {
			return
		}

		try {
			const savePayoutTx = await contract.round_contract.set_payouts({
				round_id: storage.current_round?.id || BigInt(0),
				caller: stellarPubKey,
				payouts: payoutInputs,
				clear_existing: true,
			})

			const txHash = await contract.signAndSendTx(
				stellarKit as StellarWalletsKit,
				savePayoutTx,
				stellarPubKey,
			)

			if (!txHash) {
				toast.error('Error submitting payout')
			} else {
				toast.success('Payout submitted successfully')
				setIsLoading(false)
				onClose()
			}
		} catch (e) {
			console.error(e)
			setIsLoading(false)
			toast.error('Failed to submit payout')
		}
	}

	let currentOverAllStats: PayoutTableItem = {
		actual_amount: 0,
		amount_override: 0,
		pairwise_weight_adjusted: 0,
		assigned_weight: 0,
		assigned_calculated: 0,
		final_calculation: 0,
	}

	storage.getResultNotFlagged().forEach((data) => {
		const tableState = storage.getPayoutTableItems(data.project_id.toString())
		currentOverAllStats.actual_amount += tableState.actual_amount
		currentOverAllStats.amount_override += tableState.amount_override
		currentOverAllStats.pairwise_weight_adjusted +=
			tableState.pairwise_weight_adjusted
		currentOverAllStats.assigned_weight += tableState.assigned_weight
		currentOverAllStats.assigned_calculated += tableState.assigned_calculated
		currentOverAllStats.final_calculation += tableState.final_calculation
	})

	useEffect(() => {
		let overridedAmount = 0

		let newPayouts = storage.current_payout_inputs
		newPayouts.forEach((value) => {
			overridedAmount += value
		})

		const pairWiseCoin =
			(pairwiseWeight / 100) *
			Number(
				formatStroopToXlm(
					storage.current_round?.current_vault_balance || BigInt(0),
				),
			)
		const managerCoin =
			Number(
				formatStroopToXlm(
					storage.current_round?.current_vault_balance || BigInt(0),
				),
			) - pairWiseCoin

		const bannedAllocation =
			storage.getBannedProjectAllocations() * pairWiseCoin
		storage.setCurrentRemaining(
			managerCoin + bannedAllocation - overridedAmount,
		)
		storage.setCurrentManagerWeight(managerWeight)
		storage.setCurrentPairwiseWeight(pairwiseWeight)
	}, [pairwiseWeight, managerWeight])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="mx-auto w-full flex flex-col min-h-full md:min-h-[50%] md:w-[900px] lg:w-[1024px] bg-grantpicks-black-50 rounded-2xl text-grantpicks-black-950 h-auto">
				<div className="w-full p-4">
					<div className="w-full md:flex md:items-center mb-4 md:mb-6">
						<div className="flex text-base md:text-xl font-semibold">
							Edit Payout
						</div>
						<div className="flex items-center md:border-l md:ml-2 md:pl-2 md:mt-0 mt-2">
							<Image
								src={'/assets/images/ava-1.png'}
								alt=""
								width={200}
								height={200}
								className="rounded-full w-10 h-10 mx-1"
							/>
							<div className="flex items-center text-xs md:text-sm font-semibold text-grantpicks-black-600 w-full flex-grow">
								{stellarPubKey.substring(0, 6)}...
								{stellarPubKey.substring(stellarPubKey.length - 6)}
							</div>
						</div>
						<div className="hiden md:flex md:flex-grow"></div>
						<Button
							className="md:w-30 hidden md:flex"
							color="black"
							onClick={submitPayout}
						>
							{isLoading && (
								<IconLoading size={20} className={`fill-white mr-2`} />
							)}
							<span>Set Payout</span>
						</Button>
					</div>
					<div className="text-base md:text-md font-semibold text-grantpicks-black-400">
						REMAINING BALANCE
					</div>
					<div className="md:flex md:items-center w-full">
						<div className="flex">
							{connectedWallet === 'near' ? (
								<IconNear size={32} className="fill-grantpicks-black-950" />
							) : (
								<IconStellar size={32} className="fill-grantpicks-black-950" />
							)}

							<div className="text-xl md:text-2xl font-semibold text-grantpicks-black-950 ml-2">
								{storage.current_remaining} /{' '}
								{Number(
									formatStroopToXlm(
										storage.current_round?.current_vault_balance || BigInt(0),
									),
								)}
							</div>
						</div>
						<div className="flex flex-grow"></div>
						<div className="md:flex md:items-center md:w-[30%] w-full">
							<div className="md:w-[50%] px-3 py-2 flex items-center bg-white rounded-xl border border-grantpicks-black-200">
								<div className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
									Manager
								</div>
								<input
									type="number"
									value={storage.current_manager_weight}
									max={100}
									className="flex flex-grow text-right outline-none w-10"
									onChange={onChangeManagerWeight}
								/>
								<IconUnion size={14} className="fill-grantpicks-black-500" />
							</div>
							<div className="md:w-[50%] mt-2 md:mt-0 md:ml-1 px-3 py-2 flex items-center bg-white rounded-xl border border-grantpicks-black-200">
								<div className="text-xs md:text-sm font-semibold text-grantpicks-black-500">
									Pairwise
								</div>
								<input
									type="number"
									value={storage.current_pairwise_weight}
									max={100}
									className="flex flex-grow text-right outline-none w-10"
									onChange={onChangePairwiseWeight}
								/>
								<IconUnion size={14} className="fill-grantpicks-black-500" />
							</div>
							<IconInfoCircle
								size={32}
								className="stroke-grantpicks-black-500 ml-2"
							/>
						</div>
					</div>
				</div>
				<div className="w-full bg-white rounded-2xl">
					<div className="flex items-center justify-between p-4 w-full border-b">
						<div className="flex items-center w-[70%] md:w-[34%]">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 ml-10">
								Project
							</p>
						</div>
						<div className="flex items-center w-[30%] md:w-[11%]">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Actual Amount
							</p>
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Amount Override
							</p>
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Pairwise Weight Adjusted
							</p>
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Assigned Weight
							</p>
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Assigned Calculated
							</p>
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center line-clamp-2 w-full">
								Final Calculation
							</p>
						</div>
					</div>
					<div className="flex w-full flex-col">
						{storage.getResultNotFlagged().map((data, index) => (
							<PayoutItem key={index} index={index} data={data} />
						))}
					</div>
					<div className="flex items-center bg-grantpicks-black-50 justify-between mb-2 md:mb-4 w-full p-4">
						<div className="flex items-center w-[34%]">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-center">
								OVERALL
							</p>
						</div>
						<div className="flex items-center w-[30%] md:w-[11%]">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.actual_amount.toFixed(2)}
							</p>
							<IconStellar size={14} className="fill-grantpicks-black-500" />
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.amount_override.toFixed(2)}
							</p>
							<IconStellar size={14} className="fill-grantpicks-black-500" />
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.pairwise_weight_adjusted.toFixed(2)}
							</p>
							<IconStellar size={14} className="fill-grantpicks-black-500" />
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.assigned_weight.toFixed(2)}
							</p>
							<IconUnion size={14} className="fill-grantpicks-black-500" />
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.assigned_calculated.toFixed(2)}
							</p>
							<IconStellar size={14} className="fill-grantpicks-black-500" />
						</div>
						<div className="items-center w-[11%] hidden md:flex">
							<p className="text-xs md:text-sm font-semibold text-grantpicks-black-500 text-right w-full">
								{currentOverAllStats.final_calculation.toFixed(2)}
							</p>
							<IconStellar size={14} className="fill-grantpicks-black-500" />
						</div>
					</div>
					<div className="w-full p-4">
						<InputTextArea
							required
							rows={2}
							value={memo}
							placeholder="Leave Message"
							onChange={(e) => setMemo(e.target.value)}
							className="mb-2 md:mb-2 border-none focus:shadow-none"
						/>
						<div className="flex justify-end">
							<Button
								className="md:w-30 hidden md:flex"
								color="white"
								onClick={onClose}
							>
								Close
							</Button>
						</div>
					</div>
				</div>

				<div className="md:hidden ml-2 mr-2">
					<Button isFullWidth color="black" onClick={submitPayout}>
						SET PAYOUT
					</Button>
					<Button isFullWidth color="white" className="mt-2" onClick={onClose}>
						CLOSE
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default EditPayoutModal
