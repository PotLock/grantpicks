import useSWRInfinite from 'swr/infinite'
import { IGetListExternalResponse } from '@/types/on-chain'
import { usePotlockService } from '@/services/potlock'

export const useLists = () => {
	const potlockApi = usePotlockService()

	const getKey = (
		pageIndex: number,
		previousPageData: IGetListExternalResponse[],
	) => {
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
		return res
	}

	return {
		data,
		size,
		setSize,
		isValidating,
		isLoading,
	}
}
