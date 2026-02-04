import { BaseModalProps } from '@/types/dialog'
import React, { useEffect, useState, useMemo } from 'react'
import Modal from '../../commons/Modal'
import InputTextArea from '../../commons/InputTextArea'
import Button from '../../commons/Button'
import { useWallet } from '@/app/providers/WalletProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import IconStellar from '../../svgs/IconStellar'
import { formatStroopToXlm, prettyTruncate } from '@/utils/helper'
import { PayoutInput } from 'round-client'
import IconLoading from '../../svgs/IconLoading'
import Image from 'next/image'
import IconInfoCircle from '../../svgs/IconInfoCircle'

export type PayoutTableItem = {
	actual_amount: number
	amount_override: number
	pairwise_weight_adjusted: number
	assigned_weight: number
	assigned_calculated: number
	final_calculation: number
}

interface PayoutAllocation {
	projectId: string
	projectName: string
	ownerId: string
	ownerAvatar: string
	votes: number
	votePercentage: number
	autoAmount: number
	manualAmount: number
	totalAmount: number
}

const EditPayoutModal = ({ isOpen, onClose }: BaseModalProps) => {
	const [memo, setMemo] = useState<string>('')
	const { stellarPubKey, stellarKit } = useWallet()
	const [isLoading, setIsLoading] = useState<boolean>(false)

	// Split State
	const [pairwiseWeight, setPairwiseWeight] = useState<number>(100)
	const [managerWeight, setManagerWeight] = useState<number>(0)

	// Manual overrides - how much extra to give each project from manager pool
	const [manualAllocations, setManualAllocations] = useState<Map<string, number>>(new Map())

	const storage = useAppStorage()

	// Calculate vault balance from vault_total_deposits
	// Subtract 0.01 XLM buffer to avoid "Insufficient Funds" errors
	const vaultBalance = useMemo(() => {
		const totalDeposits = storage.current_round?.vault_total_deposits
		if (!totalDeposits || totalDeposits === '0') return 0

		const balance = Number(formatStroopToXlm(BigInt(totalDeposits)))
		const margin = 0.03
		return Math.max(0, balance - margin)
	}, [storage.current_round?.vault_total_deposits])

	// Calculate weights from split
	const pairwisePool = (vaultBalance * pairwiseWeight) / 100
	const managerPool = (vaultBalance * managerWeight) / 100

	// Get non-flagged results
	const validResults = useMemo(() => {
		return storage.current_results.filter(r => !r.flag)
	}, [storage.current_results])

	// Total votes
	const totalVotes = useMemo(() => {
		return validResults.reduce((sum, r) => sum + r.votes, 0)
	}, [validResults])

	// Calculate allocations for each project
	const allocations = useMemo((): PayoutAllocation[] => {
		return validResults.map(result => {
			const projectData = storage.projects.get(result.project)
			const votePercentage = totalVotes > 0 ? (result.votes / totalVotes) * 100 : 0
			// Auto amount is now based on the Pairwise Pool, not the total vault
			const autoAmount = (votePercentage / 100) * pairwisePool
			const manualAmount = manualAllocations.get(result.project) || 0

			return {
				projectId: result.project,
				projectName: projectData?.name || 'Unknown Project',
				ownerId: projectData?.owner?.id || '',
				ownerAvatar: `https://www.tapback.co/api/avatar/${projectData?.owner?.id}`,
				votes: result.votes,
				votePercentage,
				autoAmount,
				manualAmount,
				totalAmount: autoAmount + manualAmount,
			}
		})
	}, [validResults, storage.projects, totalVotes, pairwisePool, manualAllocations])

	// Total stats
	const totalAuto = allocations.reduce((sum, a) => sum + a.autoAmount, 0)
	const totalManual = allocations.reduce((sum, a) => sum + a.manualAmount, 0)
	const totalAllocated = totalAuto + totalManual

	// Remaining from Manager Pool (helpful to know if you've overspent your 'budget')
	const remainingManagerBudget = managerPool - totalManual
	// Absolute remaining from vault (hard limit)
	const remainingVault = vaultBalance - totalAllocated

	// Handle manual allocation change
	const handleManualChange = (projectId: string, value: string) => {
		const numValue = parseFloat(value) || 0
		const newAllocations = new Map(manualAllocations)

		if (numValue <= 0) {
			newAllocations.delete(projectId)
		} else {
			newAllocations.set(projectId, numValue)
		}

		setManualAllocations(newAllocations)
	}

	// Handle split changes
	const handlePairwiseChange = (val: string) => {
		let num = Math.min(100, Math.max(0, parseInt(val) || 0))
		setPairwiseWeight(num)
		setManagerWeight(100 - num)
	}

	const handleManagerChange = (val: string) => {
		let num = Math.min(100, Math.max(0, parseInt(val) || 0))
		setManagerWeight(num)
		setPairwiseWeight(100 - num)
	}

	// Submit payouts
	const submitPayout = async () => {
		if (totalAllocated > vaultBalance + 0.00001) { // Add tiny epsilon for float precision
			toast.error('Total allocation exceeds vault balance')
			return
		}

		if (allocations.length === 0) {
			toast.error('No projects to pay out')
			return
		}

		setIsLoading(true)
		try {
			const payoutInputs: PayoutInput[] = allocations
				.filter(a => a.totalAmount > 0)
				.map(allocation => ({
					recipient_id: allocation.ownerId,
					amount: BigInt(Math.floor(allocation.totalAmount * 10000000)), // Convert to stroops
					memo,
				}))

			if (payoutInputs.length === 0) {
				toast.error('No payouts to process')
				setIsLoading(false)
				return
			}

			const contract = storage.getStellarContracts()
			if (!contract) {
				toast.error('Unable to connect to contracts')
				setIsLoading(false)
				return
			}

			const savePayoutTx = await contract.round_contract.set_payouts({
				round_id: BigInt(storage.current_round?.on_chain_id || 0),
				caller: stellarPubKey,
				payouts: payoutInputs,
				clear_existing: true,
			}, {
				fee: 200,
			})

			const txHash = await contract.signAndSendTx(
				stellarKit as StellarWalletsKit,
				savePayoutTx.toXDR(),
				stellarPubKey,
			)

			if (!txHash) {
				toast.error('Error submitting payout')
			} else {
				toast.success('Payout set successfully!')
				setIsLoading(false)
				onClose()
			}

		} catch (e) {
			console.error(e)
			setIsLoading(false)
			toast.error('Failed to submit payout')
		}
	}

	// Reset allocations when modal opens
	useEffect(() => {
		if (isOpen) {
			setManualAllocations(new Map())
			setMemo('')
			setPairwiseWeight(100)
			setManagerWeight(0)
		}
	}, [isOpen])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="mx-auto w-full flex flex-col min-h-full md:min-h-[50%] md:w-[900px] lg:w-[1024px] bg-white rounded-2xl text-grantpicks-black-950 h-auto max-h-[90vh] overflow-hidden">
				{/* Header */}
				<div className="p-6 border-b border-grantpicks-black-100">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<h2 className="text-xl font-bold">Set Payout Amounts</h2>
							<div className="flex items-center space-x-2 text-sm text-grantpicks-black-600">
								<Image
									src={`https://www.tapback.co/api/avatar/${storage.my_address}`}
									alt=""
									width={28}
									height={28}
									className="rounded-full"
								/>
								<span>{prettyTruncate(storage.my_address || '', 12, 'address')}</span>
							</div>
						</div>
						<Button
							color={isLoading || remainingVault < -0.00001 ? 'disabled' : 'black'}
							isDisabled={isLoading || remainingVault < -0.00001}
							onClick={submitPayout}
							className="!px-6"
						>
							{isLoading && <IconLoading size={20} className="fill-white mr-2" />}
							Confirm Payouts
						</Button>
					</div>
				</div>

				{/* Summary Cards */}
				<div className="p-6 bg-grantpicks-black-50 grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Card 1: Balance */}
					<div className="bg-white rounded-xl p-4 border border-grantpicks-black-100">
						<p className="text-xs font-semibold text-grantpicks-black-500 uppercase mb-1">Total Vault Balance</p>
						<div className="flex items-center space-x-2">
							<IconStellar size={20} className="fill-grantpicks-black-600" />
							<span className="text-xl font-bold">{vaultBalance.toFixed(2)} XLM</span>
						</div>
					</div>

					{/* Card 2: Split Controls */}
					<div className="bg-white rounded-xl p-4 border border-grantpicks-black-100 col-span-2">
						<p className="text-xs font-semibold text-grantpicks-black-500 uppercase mb-2">Fund Allocation Split</p>
						<div className="flex items-center space-x-4">
							<div className="flex-1 flex items-center space-x-2 bg-grantpicks-black-50 p-2 rounded-lg">
								<span className="text-xs font-semibold text-grantpicks-black-600">Pairwise %</span>
								<input
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									value={String(pairwiseWeight)}
									onChange={(e) => handlePairwiseChange(e.target.value.replace(/\D/g, ''))}
									className="w-full bg-white border border-grantpicks-black-200 rounded px-2 py-1 text-right font-bold text-sm outline-none focus:ring-2 focus:ring-grantpicks-black-200"
								/>
							</div>
							<div className="flex-1 flex items-center space-x-2 bg-grantpicks-black-50 p-2 rounded-lg">
								<span className="text-xs font-semibold text-grantpicks-black-600">Manager %</span>
								<input
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									value={String(managerWeight)}
									onChange={(e) => handleManagerChange(e.target.value.replace(/\D/g, ''))}
									className="w-full bg-white border border-grantpicks-black-200 rounded px-2 py-1 text-right font-bold text-sm outline-none focus:ring-2 focus:ring-grantpicks-black-200"
								/>
							</div>
						</div>
					</div>

					{/* Card 3: Manager Budget */}
					<div className="bg-white rounded-xl p-4 border border-grantpicks-black-100">
						<p className="text-xs font-semibold text-grantpicks-black-500 uppercase mb-1">
							Unused Manager Budget
						</p>
						<div className="flex items-center space-x-2 justify-between">
							<IconStellar size={20} className="fill-grantpicks-black-600" />
							<div>
								<span className={`text-xl font-bold ${remainingManagerBudget < 0 ? 'text-amber-600' : 'text-green-600'}`}>
									{remainingManagerBudget.toFixed(2)}
								</span>
								<span className="text-xs text-grantpicks-black-400 ml-1">/ {managerPool.toFixed(0)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Info Box */}
				<div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
					<div className="flex items-start space-x-3">
						<IconInfoCircle size={20} className="stroke-blue-600 flex-shrink-0 mt-0.5" />
						<div className="text-sm text-blue-800">
							<p className="font-semibold mb-1">How payouts are calculated:</p>
							<ul className="list-disc list-inside space-y-1 text-blue-700">
								<li><strong>Allocation Split</strong>: Decide how much of the vault goes to Pairwise (voting) vs Manager (manual)</li>
								<li><strong>Auto Amount</strong>: (Pairwise %) × (Vote %)</li>
								<li><strong>Manual Bonus</strong>: Allocations from your Manager Budget</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Table */}
				<div className="flex-1 overflow-auto p-6">
					<table className="w-full">
						<thead className="bg-grantpicks-black-50 sticky top-0">
							<tr>
								<th className="text-left text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4 rounded-l-lg">
									Project
								</th>
								<th className="text-right text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4">
									Votes
								</th>
								<th className="text-right text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4">
									Vote %
								</th>
								<th className="text-right text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4">
									<div className="flex items-center justify-end space-x-1">
										<span>Auto Amount</span>
										<div className="relative group">
											<IconInfoCircle size={14} className="stroke-grantpicks-black-400 cursor-help" />
											<div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-grantpicks-black-950 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
												Amount based on voting results and pairwise split
											</div>
										</div>
									</div>
								</th>
								<th className="text-right text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4">
									<div className="flex items-center justify-end space-x-1">
										<span>Manual Bonus</span>
										<div className="relative group">
											<IconInfoCircle size={14} className="stroke-grantpicks-black-400 cursor-help" />
											<div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-grantpicks-black-950 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
												Extra amount from manager budget
											</div>
										</div>
									</div>
								</th>
								<th className="text-right text-xs font-semibold text-grantpicks-black-500 uppercase py-3 px-4 rounded-r-lg">
									Total Payout
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-grantpicks-black-100">
							{allocations.length === 0 ? (
								<tr>
									<td colSpan={6} className="text-center py-12 text-grantpicks-black-500">
										No projects to distribute funds to
									</td>
								</tr>
							) : (
								allocations.map((allocation, index) => (
									<tr key={allocation.projectId} className={index % 2 === 0 ? 'bg-white' : 'bg-grantpicks-black-50/30'}>
										<td className="py-4 px-4">
											<div className="flex items-center space-x-3">
												<div className="relative">
													<Image
														src={allocation.ownerAvatar}
														alt=""
														width={40}
														height={40}
														className="rounded-full"
													/>
													{index < 3 && (
														<div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
															}`}>
															{index + 1}
														</div>
													)}
												</div>
												<div>
													<p className="font-semibold text-sm">{allocation.projectName}</p>
													<p className="text-xs text-grantpicks-black-500">
														{prettyTruncate(allocation.ownerId, 12, 'address')}
													</p>
												</div>
											</div>
										</td>
										<td className="py-4 px-4 text-right">
											<span className="font-semibold">{allocation.votes}</span>
										</td>
										<td className="py-4 px-4 text-right">
											<span className="font-semibold">{allocation.votePercentage.toFixed(2)}%</span>
										</td>
										<td className="py-4 px-4 text-right">
											<div className="flex items-center justify-end space-x-1">
												<span className="font-medium text-grantpicks-black-600">
													{allocation.autoAmount.toFixed(4)}
												</span>
												<IconStellar size={14} className="fill-grantpicks-black-400" />
											</div>
										</td>
										<td className="py-4 px-4 text-right">
											<div className="flex items-center justify-end space-x-1">
												<input
													type="number"
													min="0"
													step="0.0001"
													placeholder="0"
													value={manualAllocations.get(allocation.projectId) || ''}
													onChange={(e) => handleManualChange(allocation.projectId, e.target.value)}
													className="w-24 text-right px-2 py-1 border border-grantpicks-black-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-grantpicks-black-400 text-sm"
												/>
												<IconStellar size={14} className="fill-grantpicks-black-400" />
											</div>
										</td>
										<td className="py-4 px-4 text-right">
											<div className="flex items-center justify-end space-x-1">
												<span className="font-bold text-grantpicks-black-950">
													{allocation.totalAmount.toFixed(4)}
												</span>
												<IconStellar size={14} className="fill-grantpicks-black-600" />
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
						{/* Totals Row */}
						{allocations.length > 0 && (
							<tfoot className="bg-grantpicks-black-100">
								<tr>
									<td className="py-4 px-4 font-bold rounded-l-lg">TOTAL</td>
									<td className="py-4 px-4 text-right font-bold">{totalVotes}</td>
									<td className="py-4 px-4 text-right font-bold">100%</td>
									<td className="py-4 px-4 text-right">
										<div className="flex items-center justify-end space-x-1">
											<span className="font-bold">
												{allocations.reduce((sum, a) => sum + a.autoAmount, 0).toFixed(4)}
											</span>
											<IconStellar size={14} className="fill-grantpicks-black-600" />
										</div>
									</td>
									<td className="py-4 px-4 text-right">
										<div className="flex items-center justify-end space-x-1">
											<span className="font-bold">
												{allocations.reduce((sum, a) => sum + a.manualAmount, 0).toFixed(4)}
											</span>
											<IconStellar size={14} className="fill-grantpicks-black-600" />
										</div>
									</td>
									<td className="py-4 px-4 text-right rounded-r-lg">
										<div className="flex items-center justify-end space-x-1">
											<span className={`font-bold ${totalAllocated > vaultBalance ? 'text-red-600' : ''}`}>
												{totalAllocated.toFixed(4)}
											</span>
											<IconStellar size={14} className="fill-grantpicks-black-600" />
										</div>
									</td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-grantpicks-black-100 bg-grantpicks-black-50">
					<div className="flex items-center justify-between">
						<div className="flex-1 mr-4">
							<InputTextArea
								rows={2}
								value={memo}
								placeholder="Add a memo for this payout (optional)..."
								onChange={(e) => setMemo(e.target.value)}
								className="!border-grantpicks-black-200 bg-white"
							/>
						</div>
						<div className="flex space-x-3">
							<Button color="white" onClick={onClose} className="!px-6">
								Cancel
							</Button>
							<Button
								color={isLoading || remainingVault < -0.00001 ? 'disabled' : 'black'}
								isDisabled={isLoading || remainingVault < -0.00001}
								onClick={submitPayout}
								className="!px-6 md:hidden"
							>
								{isLoading && <IconLoading size={20} className="fill-white mr-2" />}
								Confirm
							</Button>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default EditPayoutModal
