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
import { depositFundRound } from '@/services/on-chain/round'
import { useWallet } from '@/app/providers/WalletProvider'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'

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
	const { stellarPrice, openPageLoading, dismissPageLoading } =
		useGlobalContext()
	const { stellarPubKey, stellarKit, currentBalance } = useWallet()
	const storage = useAppStorage()

	const getFee = async () => {
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
	}

	const onDepositFundRound = async () => {
		try {
			openPageLoading()
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
					referrer_id: undefined,
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
		} catch (error: any) {
			dismissPageLoading()
			console.log('error', error)
		}
	}

	useEffect(() => {
		if (stellarPubKey) {
			getFee()
			storage.setMyAddress(stellarPubKey)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stellarPubKey])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[340px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<p className="text-base font-bold text-grantpicks-black-950">
						Fund Round
					</p>
					<IconClose
						size={24}
						className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
						onClick={() => onClose()}
					/>
				</div>
				<div className="p-4 bg-grantpicks-alpha-50/5 rounded-xl mb-4 md:mb-6">
					<p className="text-sm font-normal text-grantpicks-black-950">
						We’ve raised XLM{' '}
						{formatStroopToXlm(BigInt(doc.current_vault_balance))} and have
						reached{' '}
						<span className="font-semibold text-grantpicks-green-800">
							{(
								(BigInt(doc.current_vault_balance) * BigInt(100)) /
								BigInt(doc.expected_amount)
							).toString()}
							% of our expected funds.
						</span>
					</p>
				</div>
				<div className="flex-1 mb-4 md:mb-6">
					<InputText
						type="number"
						value={amount}
						placeholder="0.00"
						hintLabel={`included protocol fee ${fee} %`}
						onChange={(e) => {
							const calculation =
								parseFloat(e.target.value || '0') * stellarPrice
							setAmountUsd(`${calculation.toFixed(3)}`)
							setAmount(e.target.value)
						}}
						preffixIcon={
							<IconStellar size={24} className="fill-grantpicks-black-400" />
						}
						suffixIcon={
							<div className="flex items-center space-x-2">
								<p className="text-sm font-normal text-grantpicks-black-500">
									{amountUsd}
								</p>
								<p className="text-sm font-normal text-grantpicks-black-400">
									USD
								</p>
							</div>
						}
						customLabel={
							<div className="flex items-center justify-between w-full mb-2">
								<p className="text-sm font-semibold text-grantpicks-black-950">
									Amount <span className="text-grantpicks-red-600">*</span>
								</p>
								<p className="text-sm font-semibold text-grantpicks-black-950">
									{currentBalance} XLM{' '}
									<span className="ml-1 text-sm font-normal text-grantpicks-black-600">
										available
									</span>
								</p>
							</div>
						}
					/>
				</div>
				<div className="w-full">
					<Button
						color="black-950"
						className="!py-3"
						isFullWidth
						onClick={async () => {
							await onDepositFundRound()
						}}
					>
						Fund Round
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default FundRoundModal
