import useAppStorage from "@/stores/zustand/useAppStorage"
import useSWRInfinite from "swr/infinite"
import { IGetListExternalResponse } from "@/types/on-chain"
import { usePotlockService } from "@/services/potlock"




export const useLists = () => {
  const storage = useAppStorage()
  const isReady = storage.chainId === 'stellar' && !!storage.getStellarContracts()
  const potlockApi = usePotlockService()

  const getKey = (pageIndex: number, previousPageData: IGetListExternalResponse[]) => {
    if (previousPageData && !previousPageData.length) return null
    return {
      url: `get-lists`,
      page: pageIndex,
    }
  }


  const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(
    getKey,
    async (key) => await onFetchLists(key),
    {
      revalidateFirstPage: false,
    },
  )

  const onFetchLists = async (key: { url: string; page: number }) => {
    const res = await potlockApi.getLists()
    console.log('res', res)
    return res
  }



  return {
    data,
    size,
    setSize,
    isValidating,
    isLoading: isLoading || !isReady,
  }
} 