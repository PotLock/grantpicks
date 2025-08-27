import { ChangeEvent, useCallback, useEffect, useState } from "react"
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form"
import { CreateListData } from "@/types/list-form"
import { toast } from "react-hot-toast"
import { toastOptions } from "@/constants/style"
import { useFileUpload } from "./useUploadToPinata"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createList, updateList } from "@/services/stellar/list"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { useWallet } from "@/app/providers/WalletProvider"
import { RegistrationStatus } from "lists-client"
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit"
import { useRouter } from "next/navigation"
import { useGlobalContext } from "@/app/providers/GlobalProvider"

type FormState = {
  showAddAdminsModal: boolean
  selectedAdmins: string[]
  coverImage: File | null
  coverImageUrl: string
}

const schema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  allow_applications: z.boolean(),
  approve_applications: z.boolean(),
  admins: z.array(z.object({ admin_id: z.string() })).optional(),
  cover_img_url: z.string().optional()
})

type FormValues = z.infer<typeof schema>

type UseListFormProps = {
  listId?: string
}

export const useListForm = ({ listId }: UseListFormProps) => {
  const [state, setState] = useState<FormState>({
    showAddAdminsModal: false,
    selectedAdmins: [],
    coverImage: null,
    coverImageUrl: ""
  })
  const storage = useAppStorage()
  const { stellarPubKey, stellarKit } = useWallet()
  const router = useRouter()
  const { control, handleSubmit, setValue, watch, register, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  })

  const { handleFileInputChange, isPending, error } = useFileUpload({
    onSuccess: (result) => {
      if (result?.url) {
        setValue('cover_img_url', result.url)
      }
    }
  })

  const { append: appendAdmin, remove: removeAdmin } = useFieldArray({
    control,
    name: 'admins' as const,
  })
  const { openPageLoading, dismissPageLoading } = useGlobalContext()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file.size / 10 ** 6 > 5) {
      toast.error('Image size should be less than 5MB', {
        style: toastOptions.error.style,
      })
      return
    }

    try {
      setState(prev => ({
        ...prev,
        coverImage: file,
        coverImageUrl: URL.createObjectURL(file)
      }))

      const input = document.createElement('input')
      input.type = 'file'
      input.files = new DataTransfer().files
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      input.files = dataTransfer.files
      const event = new Event('change', { bubbles: true }) as unknown as ChangeEvent<HTMLInputElement>
      Object.defineProperty(event, 'target', { value: input })
      handleFileInputChange(event)
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        coverImage: null,
        coverImageUrl: ""
      }))
      console.log('error uploading', error)
      toast.error('Error uploading image', {
        style: toastOptions.error.style,
      })
    }
  }, [handleFileInputChange])

  useEffect(() => {
    if (error) {
      setState(prev => ({
        ...prev,
        coverImage: null,
        coverImageUrl: ""
      }))
      toast.error('Error uploading image', {
        style: toastOptions.error.style,
      })
    }
  }, [error])

  const handleRemoveImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      coverImage: null,
      coverImageUrl: ""
    }))
    setValue('cover_img_url', "")
  }, [setValue])

  const handleRemoveAdmin = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      selectedAdmins: prev.selectedAdmins.filter((_, i) => i !== index)
    }))
    removeAdmin(index)
  }, [removeAdmin])

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if(storage.chainId === 'stellar') {
      try {
        openPageLoading()
        let contracts = storage.getStellarContracts()
        if(!contracts) {
          toast.error('Stellar contracts not found', {
            style: toastOptions.error.style,
          })
          return
        }
        if(listId) {
          const txUpdateList = await updateList({
            list_id: BigInt(listId),
            name: data.name,
            description: data.description,
            cover_image_url: data.cover_img_url || '',
            default_registration_status: data.approve_applications ? { tag: 'Approved' } as RegistrationStatus : { tag: 'Pending' } as RegistrationStatus,
            admin_only_registrations: data.allow_applications ? false : true
          }, contracts)
          const txHashUpdateList = await contracts.signAndSendTx(
            stellarKit as StellarWalletsKit,
            txUpdateList.toXDR(),
            stellarPubKey,
          )
          if(txHashUpdateList) {
            toast.success('List updated successfully')
            router.push(`/list/${listId}`)
          } else {
            toast.error('Failed to update list')
          }
        } else {
          const txCreateList = await createList(stellarPubKey, {
            name: data.name,
            description: data.description,
            cover_image_url: data.cover_img_url,
            admins: data.admins?.map(admin => admin.admin_id) || [],
            owner: stellarPubKey,
            default_registration_status: data.approve_applications ? { tag: 'Approved' } as RegistrationStatus : { tag: 'Pending' } as RegistrationStatus,
            admin_only_registrations: data.allow_applications ? false : true
          }, contracts)
          const txHashCreateList = await contracts.signAndSendTx(
            stellarKit as StellarWalletsKit,
            txCreateList.toXDR(),
            stellarPubKey,
          )
          if(txHashCreateList) {
            toast.success('List created successfully')
            router.push(`/lists`)
          } else {
            toast.error('Failed to create list')
          }
        } 
        

      } catch (error) {
        toast.error('Failed to create list')
        console.log('error', error)
      } finally {
        dismissPageLoading()
      }
    }
  }

  return {
    control,
    onSubmit: handleSubmit(onSubmit),
    setValue,
    watch,
    register,
    errors,
    listFormState: state,
    setListFormState: setState,
    isPending,
    onDrop,
    handleRemoveImage,
    handleRemoveAdmin,
    appendAdmin,
    removeAdmin
  }
}