import { BaseModalProps } from '@/types/dialog'
import React, { useState } from 'react'
import Modal from '../../commons/Modal'
import IconClose from '../../svgs/IconClose'
import InputTextArea from '../../commons/InputTextArea'
import Button from '../../commons/Button'
import { useWallet } from '@/app/providers/WalletProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import toast from 'react-hot-toast'
import IconLoading from '../../svgs/IconLoading'

const FlagProjectModal = ({ isOpen, onClose }: BaseModalProps) => {
	const [reason, setReason] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const { stellarPubKey, stellarKit } = useWallet()
	const storage = useAppStorage()

	const flagProject = async () => {
		setIsLoading(true)
		try {
			const contract = storage.getStellarContracts()
			if (!contract) return

			const flagTx = await contract.round_contract.flag_project({
				round_id: storage.current_round?.id || BigInt(0),
				project_id: storage.current_project?.id || BigInt(0),
				caller: stellarPubKey,
				reason: reason,
			})

			const txHash = await contract.signAndSendTx(
				stellarKit as StellarWalletsKit,
				flagTx,
				stellarPubKey,
			)

			if (!txHash) {
				toast.error('Failed to flag project')
			}

			console.log('txHash', txHash)
			setIsLoading(false)
			onClose()
		} catch (e) {
			console.error(e)
			toast.error('Failed to flag project')
			setIsLoading(false)
		}
	}

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="mx-auto w-[360px] md:w-[480px] bg-white rounded-2xl p-4 md:p-6 text-grantpicks-black-950">
				<div className="flex items-center justify-between mb-4 md:mb-6">
					<p className="text-base md:text-xl font-semibold">
						Flag {storage?.current_project?.name}
					</p>
					<IconClose
						size={20}
						className="fill-grantpicks-black-950 cursor-pointer"
						onClick={onClose}
					/>
				</div>
				<div className="bg-grantpicks-black-50 text-black p-2 my-2">
					Flagging this project will remove their donations when calculating
					payouts for this Round.
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
					isDisabled={!reason || isLoading}
					onClick={flagProject}
				>
					{isLoading && <IconLoading size={20} className={`fill-white mr-2`} />}
					<span>Flag Project</span>
				</Button>
			</div>
		</Modal>
	)
}

export default FlagProjectModal
