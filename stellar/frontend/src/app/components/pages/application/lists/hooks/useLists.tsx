import useAppStorage from "@/stores/zustand/useAppStorage"
import useSWRInfinite from "swr/infinite"
import { IGetListExternalResponse } from "@/types/on-chain"
import { LIMIT_SIZE } from "@/constants/query"
import { getLists } from "@/services/stellar/list"




export const useLists = () => {
  const storage = useAppStorage()
  const getKey = (
    pageIndex: number,
    previousPageData: IGetListExternalResponse[],
  ) => {
    if (previousPageData && !previousPageData.length) return null
    return {
      url: `get-lists`,
      skip: pageIndex * LIMIT_SIZE,
      limit: LIMIT_SIZE,
      chain: storage.chainId,
    }
  }

  const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(
    getKey,
    async (key) => await onFetchLists(key),
    {
      revalidateFirstPage: false,
    },
  )

  const onFetchLists = async (key: {
    url: string
    skip: number
    limit: number
  }) => {
    if (storage.chainId === 'stellar') {
      let contracts = storage.getStellarContracts()
      if (!contracts) {
        return []
      }
      const res = await getLists(
        { skip: key.skip, limit: key.limit },
        contracts
      )
      return res
    }
  }


  return {
    data,
    size,
    setSize,
    isValidating,
    isLoading,
  }
} 