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
import { formatNearAmount, parseNearAmount } from 'near-api-js/lib/utils/format'
import { FinalExecutionOutcome } from '@near-wallet-selector/core'
import { watch } from 'fs'
import { useForm } from 'react-hook-form'
import { StrKey } from '@stellar/stellar-base'
import { toastOptions } from '@/constants/style'
import toast from 'react-hot-toast'

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
	const [amount, setAmount] = useState<string>('')
	const [amountUsd, setAmountUsd] = useState<string>('0.00')
	const [fee, setFee] = useState<string>('0.00')
	const { setSuccessFundRoundModalProps } = useModalContext()
	const { stellarPrice, openPageLoading, dismissPageLoading, nearPrice } =
		useGlobalContext()
	const { stellarPubKey, stellarKit, currentBalance, nearWallet } = useWallet()
	const storage = useAppStorage()

	const { register, watch, handleSubmit, formState: { errors }, setError, setValue, clearErrors } = useForm()

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

	const onDepositFundRound = async () => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				const contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}


				const tx = await depositFundRound(
					{
						round_id: BigInt(doc.on_chain_id),
						caller: stellarPubKey,
						amount: BigInt(parseToStroop(amount)),
						memo: '',
						referrer_id: watch('referrer_id') || undefined,
					},
					contracts,
				)
				const txHash = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					tx.toXDR(),
					stellarPubKey,
				)
				if (txHash) {
					dismissPageLoading()
					setSuccessFundRoundModalProps((prev) => ({
						...prev,
						isOpen: true,
						amount,
						doc,
						txHash,
					}))
					await mutateRounds()
					onClose()
				}
			} else {
				const contracts = storage.getNearContracts(nearWallet)

				if (!contracts) {
					return
				}

				const depositAmount = parseNearAmount(amount)

				const tx: {
					result: any
					outcome: FinalExecutionOutcome
				} = (await contracts.round.deposit(doc.on_chain_id, depositAmount)) as {
					result: any
					outcome: FinalExecutionOutcome
				}

				dismissPageLoading()
				setSuccessFundRoundModalProps((prev) => ({
					...prev,
					isOpen: true,
					amount,
					doc,
					txHash: tx.outcome.transaction_outcome.id,
				}))
				await mutateRounds()
				onClose()
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(error.message, { style: toastOptions.error.style })
			console.log('error', error)
		}
	}

	useEffect(() => {
		getFee()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storage.my_address])

	// Calculate progress percentage
	const progressPercentage = storage.chainId !== 'near'
		? (parseFloat(formatStroopToXlm(BigInt(doc.current_vault_balance))) / parseFloat(formatStroopToXlm(BigInt(doc.expected_amount)))) * 100
		: (parseFloat(formatNearAmount(doc.current_vault_balance)) / parseFloat(formatNearAmount(doc.expected_amount))) * 100

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[420px] mx-auto bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold text-white">
								Fund Round
							</h2>
							<p className="text-gray-300 text-sm mt-1">
								Support this funding round
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
						>
							<IconClose
								size={20}
								className="fill-white"
							/>
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
						<h4 className="text-sm font-semibold text-gray-700 mb-3">Round Details</h4>
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
								<span className="text-sm font-semibold text-gray-800">{fee}%</span>
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
									{currentBalance} {storage.chainId !== 'near' ? 'XLM' : 'NEAR'}
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
									if (parseFloat(e.target.value) < parseFloat(formatStroopToXlm(BigInt(doc.minimum_deposit))) || e.target.value === '') {
										setError('amount', {
											type: 'manual',
											message: 'Funding amount cannot be less than minimum deposit'
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
									<p className="text-xs text-gray-400">
										USD
									</p>
								</div>
							}
						/>
						{errors.amount && (
							<div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-sm text-red-600 flex items-center">
									<svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
									</svg>
									Funding amount cannot be less than minimum deposit
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
										if (storage.chainId === 'stellar') {
											if (!StrKey.isValidEd25519PublicKey(e.target.value) && e.target.value !== '') {
												setError('referrer_id', { type: 'manual', message: 'Invalid Account ID' })

											} else {
												clearErrors('referrer_id')
											}
											setValue('referrer_id', e.target.value)
										}
									}}
								/>
							</div>
						)}
					</div>

					{/* Action Button */}
					<Button
						color="black-950"
						className="!py-4 !text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
						isFullWidth
						isDisabled={!!errors.amount}
						onClick={handleSubmit(onDepositFundRound)}
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
				</div>
			</div>
		</Modal>
	)
}

export default FundRoundModal
