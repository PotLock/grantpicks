import React, { useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import InputText from '../../commons/InputText'
import IconStellar from '../../svgs/IconStellar'
import Button from '../../commons/Button'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { formatStroopToXlm, parseToStroop } from '@/utils/helper'
import { depositFundRound } from '@/services/stellar/round'
import { useWallet } from '@/app/providers/WalletProvider'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import IconNear from '../../svgs/IconNear'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { useForm } from 'react-hook-form'
import { StrKey } from '@stellar/stellar-base'
import { toastOptions } from '@/constants/style'
import toast from 'react-hot-toast'
import { localStorageConfigs } from '@/configs/local-storage'
import { usePotlockService } from '@/services/potlock'

interface FundROundModalProps extends BaseModalProps {
	doc: GPRound
	mutateRounds: any
}

const FundRoundModal = ({
	isOpen,
	onClose,
	doc,
	mutateRounds,
}: FundROundModalProps) => {
	const storage = useAppStorage()
	const potlockApi = usePotlockService()
	const { setSuccessFundRoundModalProps } = useModalContext()
	const { stellarPrice, openPageLoading, dismissPageLoading, nearPrice } =
		useGlobalContext()
	const { stellarPubKey, stellarKit, currentBalance, onOpenStellarWallet } =
		useWallet()

	const getMinimumDepositFormatted = () => {
		return storage.chainId !== 'near'
			? formatStroopToXlm(BigInt(doc.minimum_deposit))
			: formatNearAmount(doc.minimum_deposit)
	}

	const [amount, setAmount] = useState<string>(getMinimumDepositFormatted())
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [fee, setFee] = useState<string>('0.00')
	const [showBreakdown, setShowBreakdown] = useState<boolean>(false)
	const [useReferrer, setUseReferrer] = useState<boolean>(true)
	const [savedReferrer, setSavedReferrer] = useState<string | null>(null)

	const {
		register,
		watch,
		formState: { errors },
		setError,
		setValue,
		clearErrors,
	} = useForm()

	const getFee = async () => {
		if (storage.chainId === 'stellar') {
			const contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			try {
				const config = (await contracts.round_contract.get_config()).result

				if (config) {
					const newFee =
						(Number(config.protocol_fee_basis_points.toString()) * 100) / 10000

					setFee(newFee.toFixed(2).toString())
				}
			} catch (error: any) {
				console.log('error', error)
			}
		} else {
			const contracts = storage.getNearContracts(null)

			if (!contracts) {
				return
			}

			try {
				const config = await contracts.round.getConfig()

				if (config) {
					const newFee = (config.protocol_fee_basis_points * 100) / 10000

					setFee(newFee.toFixed(2).toString())
				}
			} catch (error: any) {
				console.log('error', error)
			}
		}
	}

	const calculateBreakdown = () => {
		const originalAmount = parseFloat(amount || '0')
		const protocolFeePercent = parseFloat(fee || '0')
		const protocolFeeAmount = (originalAmount * protocolFeePercent) / 100

		const referrerId = watch('referrer_id')
		const hasReferrer = useReferrer && referrerId && referrerId.trim() !== ''
		const referrerFeePercent = hasReferrer ? doc.referrer_fee_basis_points / 100 : 0
		const referrerFeeAmount = hasReferrer ? (originalAmount * referrerFeePercent) / 100 : 0

		const totalFees = protocolFeeAmount + referrerFeeAmount
		const finalDonatedAmount = originalAmount - totalFees

		return {
			originalAmount,
			protocolFeePercent,
			protocolFeeAmount,
			hasReferrer,
			referrerFeePercent,
			referrerFeeAmount,
			totalFees,
			finalDonatedAmount,
		}
	}

	const onDepositFundRound = async () => {
		try {
			openPageLoading()

			const contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const referrerId = useReferrer ? watch('referrer_id') : undefined
			const tx = await depositFundRound(
				{
					round_id: BigInt(doc.on_chain_id),
					caller: stellarPubKey,
					amount: BigInt(parseToStroop(amount)),
					memo: '',
					referrer_id: referrerId && referrerId.trim() !== '' ? referrerId : undefined,
				},
				contracts,
			)
			const txHash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				tx.toXDR(),
				stellarPubKey,
			)
			if (txHash) {
				// Sync deposits to indexer
				await potlockApi.syncRoundDeposits(Number(doc.on_chain_id)).catch(() => {})

				dismissPageLoading()
				setSuccessFundRoundModalProps((prev) => ({
					...prev,
					isOpen: true,
					amount,
					doc,
					txHash,
				}))
				await mutateRounds()
				setShowBreakdown(false)
				onClose()
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(error.message, { style: toastOptions.error.style })
			console.log('error', error)
		}
		finally {
			dismissPageLoading()
		}
	}

	useEffect(() => {
		getFee()
		// Initialize USD amount with default minimum deposit
		const minDeposit = getMinimumDepositFormatted()
		const calculation =
			storage.chainId !== 'near'
				? parseFloat(minDeposit || '0') * stellarPrice
				: parseFloat(minDeposit || '0') * nearPrice
		setAmountUsd(`${calculation.toFixed(3)}`)

		// Load saved referrer from localStorage
		if (typeof window !== 'undefined') {
			const savedRef = localStorage.getItem(localStorageConfigs.REFERRED_BY)
			if (savedRef) {
				setSavedReferrer(savedRef)
				setValue('referrer_id', savedRef)
				setUseReferrer(true)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.my_address, stellarPrice, nearPrice])

	useEffect(() => {
		if (!isOpen) {
			setShowBreakdown(false)
			// Reset useReferrer when modal closes
			if (savedReferrer) {
				setUseReferrer(true)
			}
		}
	}, [isOpen, savedReferrer])

	// Calculate progress percentage
	const progressPercentage =
		(parseFloat(formatStroopToXlm(BigInt(doc.current_vault_balance))) /
			parseFloat(formatStroopToXlm(BigInt(doc.expected_amount)))) *
		100


	return (
		<Modal
			isOpen={isOpen}
			onClose={(e: any) => {
				e.stopPropagation()
				onClose(e)
			}}
			zIndex={1000}
			closeOnBgClick={true}
		>
			<div
				onClick={(e) => {
					e.stopPropagation()
				}}
				className="w-11/12 md:w-[420px] overflow-y-auto max-h-[calc(100vh-2rem)] mx-auto bg-white rounded-3xl border border-gray-200 shadow-2xl p-2 md:p-0"
			>
				{/* Header */}
				<div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 rounded-t-3xl">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold text-white">Fund Round</h2>
							<p className="text-gray-300 text-sm mt-1">
								Support this funding round
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
						>
							<IconClose size={20} className="fill-white" />
						</button>
					</div>
				</div>

				{/* Content */}
				<div className="px-6 py-6">
					{/* Progress Section */}
					<div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 border border-gray-200">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-gray-800">
								Funding Progress
							</h3>
							<span className="text-2xl font-bold text-gray-900">
								{progressPercentage.toFixed(1)}%
							</span>
						</div>

						{/* Progress Bar */}
						<div className="w-full bg-gray-200 rounded-full h-3 mb-4">
							<div
								className="bg-gradient-to-r from-gray-700 to-gray-800 h-3 rounded-full transition-all duration-500 ease-out"
								style={{ width: `${Math.min(progressPercentage, 100)}%` }}
							></div>
						</div>

						<div className="grid grid-cols-2 gap-4 text-sm">
							<div className="text-center">
								<p className="text-gray-600 font-medium">Raised</p>
								<p className="text-xl font-bold text-gray-800">
									{storage.chainId !== 'near'
										? formatStroopToXlm(BigInt(doc.current_vault_balance))
										: formatNearAmount(doc.current_vault_balance)}
								</p>
								<p className="text-xs text-gray-500">
									{storage.chainId !== 'near' ? 'XLM' : 'NEAR'}
								</p>
							</div>
							<div className="text-center">
								<p className="text-gray-600 font-medium">Target</p>
								<p className="text-xl font-bold text-gray-800">
									{storage.chainId !== 'near'
										? formatStroopToXlm(BigInt(doc.expected_amount))
										: formatNearAmount(doc.expected_amount)}
								</p>
								<p className="text-xs text-gray-500">
									{storage.chainId !== 'near' ? 'XLM' : 'NEAR'}
								</p>
							</div>
						</div>
					</div>

					{/* Round Details */}
					<div className="bg-gray-50 rounded-xl p-4 mb-6">
						<h4 className="text-sm font-semibold text-gray-700 mb-3">
							Round Details
						</h4>
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Minimum Deposit:</span>
								<span className="text-sm font-semibold text-gray-800">
									{storage.chainId !== 'near'
										? formatStroopToXlm(BigInt(doc.minimum_deposit))
										: formatNearAmount(doc.minimum_deposit)}{' '}
									{storage.chainId !== 'near' ? 'XLM' : 'NEAR'}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Protocol Fee:</span>
								<span className="text-sm font-semibold text-gray-800">
									{fee}%
								</span>
							</div>
						</div>
					</div>

					{/* Amount Input */}
					<div className="mb-6">
						<div className="flex items-center justify-between mb-3">
							<label className="text-sm font-semibold text-gray-800">
								Amount to Fund
							</label>
							<div className="text-right">
								<p className="text-sm font-medium text-gray-700">
									{currentBalance} XLM
								</p>
								<p className="text-xs text-gray-500">available</p>
							</div>
						</div>

						<InputText
							type="number"
							value={amount}
							placeholder="0.00"
							{...register('amount', {
								required: true,
								onChange: (e) => {
									const calculation =
										storage.chainId !== 'near'
											? parseFloat(e.target.value || '0') * stellarPrice
											: parseFloat(e.target.value || '0') * nearPrice
									setAmountUsd(`${calculation.toFixed(3)}`)
									setAmount(e.target.value)
									const minDepositFormatted = getMinimumDepositFormatted()
									const minDepositValue = parseFloat(minDepositFormatted)
									const inputAmount = parseFloat(e.target.value || '0')
									const balanceAmount = parseFloat(String(currentBalance ?? '0'))

									if (e.target.value === '') {
										setError('amount', {
											type: 'manual',
											message: `Funding amount cannot be less than minimum deposit (${minDepositFormatted} XLM)`,
										})
									} else if (inputAmount < minDepositValue) {
										setError('amount', {
											type: 'manual',
											message: `Funding amount cannot be less than minimum deposit (${minDepositFormatted} XLM)`,
										})
									} else if (inputAmount > balanceAmount) {
										setError('amount', {
											type: 'manual',
											message: `Insufficient balance. You have ${currentBalance} XLM available.`,
										})
									} else {
										clearErrors('amount')
									}
								},
							})}
							hintLabel={`Protocol fee: ${fee}%`}
							preffixIcon={
								storage.chainId !== 'near' ? (
									<IconStellar size={24} className="fill-gray-600" />
								) : (
									<IconNear size={24} className="fill-gray-600" />
								)
							}
							suffixIcon={
								<div className="flex items-center space-x-2">
									<p className="text-sm font-medium text-gray-600">
										${amountUsd}
									</p>
									<p className="text-xs text-gray-400">USD</p>
								</div>
							}
						/>
						{errors.amount && (
							<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600 flex items-center">
									<svg
										className="w-4 h-4 mr-2"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
											clipRule="evenodd"
										/>
									</svg>
									{errors.amount.message as string}
								</p>
							</div>
						)}
						{doc.referrer_fee_basis_points > 0 && (
							<div className="mt-4">
								<InputText
									placeholder="Enter Referrer Account ID"
									hintLabel={`Referrer fee: ${(doc.referrer_fee_basis_points / 100).toFixed(2)}%`}
									{...register('referrer_id')}
									errorMessage={errors.referrer_id?.message as string}
									onChange={(e) => {
										if (
											!StrKey.isValidEd25519PublicKey(e.target.value) &&
											e.target.value !== ''
										) {
											setError('referrer_id', {
												type: 'manual',
												message: 'Invalid Account ID',
											})
										} else {
											clearErrors('referrer_id')
										}
										setValue('referrer_id', e.target.value)
									}}
								/>
							</div>
						)}
					</div>

					{/* Action Button */}
					{stellarPubKey ? (
						<Button
							color="black-950"
							className="!py-4 !text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
							isFullWidth
							isDisabled={!!errors.amount || amount === '0' || amount === ''}
							onClick={(e) => {
								e.stopPropagation()
								if (amount > '0') {
									setShowBreakdown(true)
								}
							}}
						>
							<div className="flex items-center justify-center space-x-2">
								{storage.chainId !== 'near' ? (
									<IconStellar size={20} className="fill-white" />
								) : (
									<IconNear size={20} className="fill-white" />
								)}
								<span>Fund Round</span>
							</div>
						</Button>
					) : (
						<Button
							color="black-950"
							className="!py-4 !text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
							isFullWidth
							onClick={() => onOpenStellarWallet()}
							type="button"
						>
							Connect Wallet
						</Button>
					)}
				</div>
			</div>

			{/* Breakdown Modal */}
			{showBreakdown && (
				<Modal
					isOpen={showBreakdown}
					onClose={(e: any) => {
						e.stopPropagation()
						setShowBreakdown(false)
					}}
					zIndex={1001}
					closeOnBgClick={true}
				>
					<div
						onClick={(e) => {
							e.stopPropagation()
						}}
						className="w-11/12 md:w-[480px] mx-auto bg-white rounded-3xl border border-gray-200 shadow-2xl p-2 md:p-0"
					>
						{/* Header */}
						<div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5 rounded-t-3xl">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-xl font-bold text-white">
										Funding Breakdown
									</h2>
									<p className="text-gray-300 text-sm mt-1">
										Review your donation details
									</p>
								</div>
								<button
									onClick={() => setShowBreakdown(false)}
									className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
								>
									<IconClose size={20} className="fill-white" />
								</button>
							</div>
						</div>

						{/* Breakdown Content */}
						<div className="px-6 py-6">
							{(() => {
								const breakdown = calculateBreakdown()
								return (
									<div className="space-y-4">
										{/* Original Amount */}
										<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
											<div className="flex justify-between items-center">
												<span className="text-sm font-medium text-gray-700">
													Amount to Fund
												</span>
												<span className="text-lg font-bold text-gray-900">
													{breakdown.originalAmount.toFixed(4)} XLM
												</span>
											</div>
										</div>

										{/* Fees Section */}
										<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
											<h4 className="text-sm font-semibold text-gray-700 mb-3">
												Fees Breakdown
											</h4>
											<div className="space-y-3">
												{/* Protocol Fee */}
												<div className="flex justify-between items-center">
													<div>
														<span className="text-sm text-gray-600">
															Protocol Fee
														</span>
														<span className="text-xs text-gray-500 ml-2">
															({breakdown.protocolFeePercent.toFixed(2)}%)
														</span>
													</div>
													<span className="text-sm font-semibold text-gray-800">
														-{breakdown.protocolFeeAmount.toFixed(4)} XLM
													</span>
												</div>

												{/* Referrer Fee */}
												{breakdown.hasReferrer && (
													<div className="flex justify-between items-center">
														<div>
															<span className="text-sm text-gray-600">
																Referrer Fee
															</span>
															<span className="text-xs text-gray-500 ml-2">
																({breakdown.referrerFeePercent.toFixed(2)}%)
															</span>
														</div>
														<span className="text-sm font-semibold text-gray-800">
															-{breakdown.referrerFeeAmount.toFixed(4)} XLM
														</span>
													</div>
												)}

												{/* Total Fees */}
												<div className="border-t border-gray-300 pt-3 mt-3">
													<div className="flex justify-between items-center">
														<span className="text-sm font-medium text-gray-700">
															Total Fees
														</span>
														<span className="text-sm font-bold text-gray-900">
															-{breakdown.totalFees.toFixed(4)} XLM
														</span>
													</div>
												</div>
											</div>
										</div>

										{/* Referrer Option Checkbox */}
										{savedReferrer && (
											<div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
												<label className="flex items-center space-x-3 cursor-pointer">
													<input
														type="checkbox"
														checked={useReferrer}
														onChange={(e) => {
															setUseReferrer(e.target.checked)
														}}
														className="w-4 h-4 text-grantpicks-black-950 bg-white border-gray-300 rounded focus:ring-grantpicks-black-950 focus:ring-2"
													/>
													<div className="flex-1">
														<span className="text-sm font-medium text-gray-700">
															Use Referrer ({savedReferrer.slice(0, 8)}...{savedReferrer.slice(-6)})
														</span>
														<p className="text-xs text-gray-500 mt-1">
															Uncheck to remove referrer fee and donate more to the round
														</p>
													</div>
												</label>
											</div>
										)}

										{/* Final Donated Amount */}
										<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
											<div className="flex justify-between items-center">
												<span className="text-sm font-semibold text-gray-700">
													Amount Donated
												</span>
												<span className="text-xl font-bold text-green-700">
													{breakdown.finalDonatedAmount.toFixed(4)} XLM
												</span>
											</div>
											<p className="text-xs text-gray-500 mt-1">
												This is the amount that will be added to the round
											</p>
										</div>

										{/* Action Buttons */}
										<div className="flex gap-3 pt-2">
											<Button
												color="white"
												className="!py-3 !text-base font-semibold rounded-xl flex-1"
												onClick={() => setShowBreakdown(false)}
											>
												Cancel
											</Button>
											<Button
												color="black-950"
												className="!py-3 !text-base font-semibold rounded-xl flex-1 shadow-lg hover:shadow-xl transition-all duration-200"
												onClick={(e) => {
													e.stopPropagation()
													onDepositFundRound()
												}}
											>
												<div className="flex items-center justify-center space-x-2">
													{storage.chainId !== 'near' ? (
														<IconStellar size={20} className="fill-white" />
													) : (
														<IconNear size={20} className="fill-white" />
													)}
													<span>Confirm & Fund</span>
												</div>
											</Button>
										</div>
									</div>
								)
							})()}
						</div>
					</div>
				</Modal>
			)}
		</Modal>
	)
}

export default FundRoundModal
