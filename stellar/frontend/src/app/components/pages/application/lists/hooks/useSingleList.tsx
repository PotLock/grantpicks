import { useWallet } from "@/app/providers/WalletProvider"
import { batchRegisterToList, getList } from "@/services/stellar/list"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit"
import { RegistrationInput, RegistrationStatus } from "lists-client"
import toast from "react-hot-toast"
import useSWR from "swr"

type UseSingleListProps = {
  listId: string
}

type ApplyToListParams = {
  defaultRegistrationStatus: RegistrationStatus
  note: string | null
  onClose: () => void
}

export const useSingleList = ({ listId }: UseSingleListProps) => {
  const storage = useAppStorage()
  const { stellarPubKey, stellarKit } = useWallet()

  const getKey = () => {
    if (!listId || !storage.getStellarContracts()) return null
    return `list-${listId}`
  }

  const { data, isLoading, error } = useSWR(
    getKey(),
    async () => {
      const contracts = storage.getStellarContracts()
      if (!contracts) throw new Error('Contracts not found')
      return getList({ list_id: BigInt(listId) }, contracts)
    }
  )

  const handleBatchRegisterToList = async (registrations: RegistrationInput[], onClose: () => void) => {
    const contracts = storage.getStellarContracts()
    if (!contracts || !stellarPubKey) throw new Error('Contracts not found')
    try {
      const txBatchRegisterToList = await batchRegisterToList({ list_id: BigInt(listId), submitter: stellarPubKey, notes: 'test', registrations }, contracts)
      const txHashBatchRegisterToList = await contracts.signAndSendTx(
        stellarKit as StellarWalletsKit,
        txBatchRegisterToList.toXDR(),
        stellarPubKey,
      )

      if (txHashBatchRegisterToList) {
        toast.success('Registered project(s) to list successfully')
        return onClose()
      } else {
        toast.error('Failed to register project(s) to list')
      }
    } catch (error) {
      toast.error('Failed to register project(s) to list')
    }
  }
  const handleApplyToList = async ({ defaultRegistrationStatus, note, onClose }: ApplyToListParams) => {
    const contracts = storage.getStellarContracts()
    if (!contracts || !stellarPubKey) {
      toast.error('Something went wrong with your connected wallet')
      return
    }
    try {
      const txApplyToList = await batchRegisterToList({
        list_id: BigInt(listId), submitter: stellarPubKey, notes: note || '', registrations: [{
          registrant: stellarPubKey,
          status: defaultRegistrationStatus,
          submitted_ms: BigInt(Date.now()),
          updated_ms: BigInt(Date.now()),
          notes: note || ''
        }]
      }, contracts)

      const txHashApplyToList = await contracts.signAndSendTx(
        stellarKit as StellarWalletsKit,
        txApplyToList.toXDR(),
        stellarPubKey,
      )

      if (txHashApplyToList) {
        toast.success('Applied Successfully')
        return onClose()
      } else {
        toast.error('Failed to apply to list')
      }

    } catch (error) {
      toast.error('Failed to apply to list')
    }
  }

  return {
    data,
    isLoading,
    isError: !!error,
    handleBatchRegisterToList,
    handleApplyToList,
  }
}