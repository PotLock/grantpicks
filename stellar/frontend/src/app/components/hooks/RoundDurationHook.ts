import { toastOptions } from '@/constants/style'
import {
	updateRoundApplicationDuration,
	updateRoundVotingDuration,
} from '@/services/stellar/round'
import { UpdateApplicationConfig } from '@/types/form'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { SubmitHandler } from 'react-hook-form'
import { GPRound } from '@/models/round'
import toast from 'react-hot-toast'
import Contracts from '@/lib/contracts'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { usePotlockService } from '@/services/potlock'

interface AppRepo {
	chainId: string | null
	getStellarContracts: () => Contracts | null
}

interface UseRoundDurationProps {
	storage: AppRepo
	stellarPubKey: string
	stellarKit: StellarWalletsKit
	doc: GPRound
	mutateRounds: any
}

export const useRoundDuration = ({
	storage,
	stellarPubKey,
	stellarKit,
	doc,
	mutateRounds,
}: UseRoundDurationProps) => {
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const potlockApi = usePotlockService()

	const handleUpdateApplicationDuration: SubmitHandler<
		UpdateApplicationConfig
	> = async (data) => {
		if (storage.chainId === 'stellar') {
			try {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}
				openPageLoading()

				const txUpdateApplicationDuration =
					await updateRoundApplicationDuration(
						stellarPubKey,
						BigInt(doc.on_chain_id),
						{
							round_id: BigInt(doc.on_chain_id),
							caller: stellarPubKey,
							allow_applications: data.allow_applications,
							application_start: data.application_start
								? BigInt(data.application_start.getTime())
								: null,
							application_end: data.application_end
								? BigInt(data.application_end.getTime())
								: null,
						},
						contracts,
					)
				const txHash = await contracts.signAndSendTx(
					stellarKit,
					txUpdateApplicationDuration.toXDR(),
					stellarPubKey,
				)
				if (txHash) {
					await potlockApi.syncRound(Number(doc.on_chain_id)).catch(() => {})
					toast.success('Application duration updated successfully', {
						style: toastOptions.success.style,
					})
					await mutateRounds()
				}
			} catch (error) {
				console.error(error)
				toast.error('Failed to update application duration', {
					style: toastOptions.error.style,
				})
			} finally {
				dismissPageLoading()
			}
		}
	}

	const handleUpdateVotingDuration: SubmitHandler<
		UpdateApplicationConfig
	> = async (data) => {
		if (storage.chainId === 'stellar') {
			try {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}
				openPageLoading()
				const txUpdateVotingDuration = await updateRoundVotingDuration(
					stellarPubKey,
					BigInt(doc.on_chain_id),
					{
						round_id: BigInt(doc.on_chain_id),
						caller: stellarPubKey,
						voting_start: BigInt(data.voting_start.getTime()),
						voting_end: BigInt(data.voting_end.getTime()),
					},
					contracts,
				)
				const txHash = await contracts.signAndSendTx(
					stellarKit,
					txUpdateVotingDuration.toXDR(),
					stellarPubKey,
				)
				if (txHash) {
					await potlockApi.syncRound(Number(doc.on_chain_id)).catch(() => {})
					toast.success('Voting duration updated successfully', {
						style: toastOptions.success.style,
					})
					await mutateRounds()
				}
			} catch (error) {
				console.error(error)
				toast.error('Failed to update voting duration', {
					style: toastOptions.error.style,
				})
			} finally {
				dismissPageLoading()
			}
		}
	}

	return {
		handleUpdateApplicationDuration,
		handleUpdateVotingDuration,
	}
}
