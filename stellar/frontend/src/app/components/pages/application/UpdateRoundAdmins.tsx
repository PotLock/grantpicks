import { GPRound } from "@/models/round"
import AddAdminsModal from "../create-round/AddAdminsModal"
import { useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { setAdminRound } from "@/services/stellar/round"
import { useWallet } from "@/app/providers/WalletProvider"
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { useGlobalContext } from "@/app/providers/GlobalProvider"

interface FormData {
  admins: { admin_id: string }[]
}

export const UpdateRoundAdmins = ({
  isOpen,
  onClose,
  doc,
  mutateRounds,
}: {
  isOpen: boolean
  onClose: () => void
  doc: GPRound
  mutateRounds: () => void
}) => {
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([])
  const storage = useAppStorage()
  const { stellarPubKey, stellarKit, } = useWallet()
  const { openPageLoading, dismissPageLoading } = useGlobalContext()
  const {
    control,
    handleSubmit,
  } = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      admins: doc?.admins?.map(admin => ({ admin_id: admin })) || [],
    },
  })
  const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
    control,
    name: 'admins',
  })



  const onSubmit = async (data: FormData) => {
    const admins = data.admins.map(admin => admin.admin_id)
    if (admins.length === 0) {
      toast.error('Admins cannot be empty')
      return
    }

    if (admins.includes(doc?.owner?.id as string)) {
      toast.error('Owner cannot be an admin')
      return
    }

    try {
      const contracts = storage.getStellarContracts()

      if (!contracts) {
        toast.error('Failed to update round admins')
        return
      }

      openPageLoading()

      const tx = await setAdminRound(BigInt(doc.on_chain_id), admins, contracts)
      const txHash = await contracts.signAndSendTx(
        stellarKit as StellarWalletsKit,
        tx.toXDR(),
        stellarPubKey,
      )
      if (txHash) {
        toast.success('Round admins updated successfully')
        onClose()
        mutateRounds()
        dismissPageLoading()
      } else {
        toast.error('Failed to update round admins')
        dismissPageLoading()
      }
    } catch (error) {
      toast.error('Failed to update round admins')
      dismissPageLoading()
    }
  }

  return (
    <AddAdminsModal
      isOpen={isOpen}
      onClose={onClose}
      selectedAdmins={selectedAdmins}
      setSelectedAdmins={setSelectedAdmins}
      append={appendAdmin}
      remove={removeAdmin}
      handleSaveChanges={handleSubmit(onSubmit)}
      header="Update Round Admins"
    />
  )
} 