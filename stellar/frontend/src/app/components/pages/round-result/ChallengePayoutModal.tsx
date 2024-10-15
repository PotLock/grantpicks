import { BaseModalProps } from '@/types/dialog'
import React, { useState } from 'react'
import Modal from '../../commons/Modal'
import IconClose from '../../svgs/IconClose'
import InputTextArea from '../../commons/InputTextArea'
import Button from '../../commons/Button'
import CMDWallet from '@/lib/wallet'
import { useWallet } from '@/app/providers/WalletProvider'
import Contracts from '@/lib/contracts'
import { IGetRoundsResponse, Network } from '@/types/on-chain'
import { challengePayoutRound } from '@/services/stellar/round'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'

interface ChallengePayoutModalProps extends BaseModalProps {
	roundData: IGetRoundsResponse | undefined
}

const ChallengePayoutModal = ({
	isOpen,
	onClose,
	roundData,
}: ChallengePayoutModalProps) => {
	const [reason, setReason] = useState<string>('')
	const { stellarPubKey, stellarKit } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const storage = useAppStorage()

	const onSubmitChallenge = async () => {
		try {
			openPageLoading()
			let contracts = storage.getStellarContracts()

			if (!contracts) {
				return
			}

			const tx = await challengePayoutRound(
				{
					round_id: roundData?.id as bigint,
					caller: stellarPubKey,
					reason,
				},
				contracts,
			)
			const txhash = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				tx.toXDR(),
				stellarPubKey,
			)
			if (txhash) {
				toast.success('Payout challenged successfully', {
					style: toastOptions.success.style,
				})
				dismissPageLoading()
				onClose()
			}
		} catch (error: any) {
			dismissPageLoading()
			console.log('error challenge payout', error)
			toast.error('Challenge payout failed', {
				style: toastOptions.error.style,
			})
		}
	}
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="mx-auto w-[360px] md:w-[480px] bg-white rounded-2xl p-4 md:p-6 text-grantpicks-black-950">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<p className="text-base md:text-xl font-semibold">Challenge Payout</p>
					<IconClose
						size={20}
						className="fill-grantpicks-black-950 cursor-pointer"
						onClick={onClose}
					/>
				</div>
				<InputTextArea
					label="Reason"
					required
					rows={2}
					value={reason}
					onChange={(e) => setReason(e.target.value)}
					className="mb-4 md:mb-6"
				/>
				<Button
					isFullWidth
					color="black"
					isDisabled={!reason}
					onClick={onSubmitChallenge}
				>
					Challenge Payout
				</Button>
			</div>
		</Modal>
	)
}

export default ChallengePayoutModal
