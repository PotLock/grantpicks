import { toastOptions } from "@/constants/style"
import { updateRoundApplicationDuration, updateRoundVotingDuration } from "@/services/stellar/round"
import { UpdateApplicationConfig } from "@/types/form"
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit"
import { SubmitHandler } from "react-hook-form"
import { GPRound } from "@/models/round"
import toast from "react-hot-toast"
import Contracts from "@/lib/contracts"

interface AppRepo {
  chainId: string | null
  getStellarContracts: () => Contracts | null
}

interface UseRoundDurationProps {
  storage: AppRepo
  stellarPubKey: string
  stellarKit: StellarWalletsKit
  onClose: () => void
  doc: GPRound
}

export const useRoundDuration = ({ storage, stellarPubKey, stellarKit, onClose, doc }: UseRoundDurationProps) => {
  const handleUpdateApplicationDuration: SubmitHandler<UpdateApplicationConfig> = async (data) => {
    if (storage.chainId === 'stellar') {
      try {
        let contracts = storage.getStellarContracts()

        if (!contracts) {
          return
        }

        const txUpdateApplicationDuration = await updateRoundApplicationDuration(
          stellarPubKey,
          BigInt(doc.on_chain_id),
          {
            round_id: BigInt(doc.on_chain_id),
            caller: stellarPubKey,
            allow_applications: data.allow_applications,
            application_start: data.application_start ? BigInt(data.application_start.getTime()) : null,
            application_end: data.application_end ? BigInt(data.application_end.getTime()) : null,
          },
          contracts,
        )
        const txHash = await contracts.signAndSendTx(
          stellarKit,
          txUpdateApplicationDuration.toXDR(),
          stellarPubKey,
        )
        if (txHash) {
          toast.success('Application duration updated successfully', {
            style: toastOptions.success.style,
          })
          onClose()
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to update application duration', {
          style: toastOptions.error.style,
        })
      }
    }
  }

  const handleUpdateVotingDuration: SubmitHandler<UpdateApplicationConfig> = async (data) => {
    if (storage.chainId === 'stellar') {
      try {
        let contracts = storage.getStellarContracts()

        if (!contracts) {
          return
        }

        const txUpdateVotingDuration = await updateRoundVotingDuration(
          stellarPubKey,
          BigInt(doc.on_chain_id),  
          {
            round_id: BigInt(doc.on_chain_id),
            caller: stellarPubKey,
            voting_start:  BigInt(data.voting_start.getTime()),
            voting_end:  BigInt(data.voting_end.getTime()),
          },
          contracts,
        )
        const txHash = await contracts.signAndSendTx(
          stellarKit,
          txUpdateVotingDuration.toXDR(),
          stellarPubKey,
        )
        if (txHash) {
          toast.success('Voting duration updated successfully', {
            style: toastOptions.success.style,
          })
          onClose()
        }
      } catch (error) {
        console.error(error)
        toast.error('Failed to update voting duration', {
          style: toastOptions.error.style,
        })
      }
    }
  }

  return {
    handleUpdateApplicationDuration,
    handleUpdateVotingDuration,
  }
}