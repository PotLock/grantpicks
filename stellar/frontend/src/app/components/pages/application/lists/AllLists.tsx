'use client'

import Button from '@/app/components/commons/Button'
import IconPlus from '@/app/components/svgs/IconPlus'
import IconSearch from '@/app/components/svgs/IconSearch'
import IconClose from '@/app/components/svgs/IconClose'
import { useRouter } from 'next/navigation'
import { useLists } from './hooks/useLists'
import { IGetListExternalResponse } from '@/types/on-chain'
import { APIListExternal, ListCard } from './ListCard'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { useWallet } from '@/app/providers/WalletProvider'
import { useState, useMemo, useEffect } from 'react'

export const AllLists = () => {
	const router = useRouter()
	const storage = useAppStorage()
	const { data, isValidating, isLoading } = useLists()
	const { stellarPubKey } = useWallet()
	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

	// Debounce search query to improve performance
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearchQuery(searchQuery)
		}, 300)

		return () => clearTimeout(timer)
	}, [searchQuery])

	// Filter lists based on debounced search query
	const filteredLists = useMemo(() => {
		if (!data?.[0] || !debouncedSearchQuery.trim()) {
			return data?.[0] || []
		}

		const query = debouncedSearchQuery.toLowerCase().trim()
		return data[0].filter((list: IGetListExternalResponse) => {
			const name = list.name?.toLowerCase() || ''
			const description = list.description?.toLowerCase() || ''
			return name.includes(query) || description.includes(query)
		})
	}, [data, debouncedSearchQuery])

	const isSearching = searchQuery !== debouncedSearchQuery
	const totalLists = data?.[0]?.length || 0
	const filteredCount = filteredLists?.length || 0

	const skeletonCards = useMemo(() => Array.from({ length: 6 }), [])

	const clearSearch = () => setSearchQuery('')
	const goCreateList = () => router.push('/list/create')

	return (
		<div className="flex min-h-[90vh] flex-col gap-y-6 pb-12">
			{/* Page header */}
			<div className="mt-10 flex flex-col gap-4">
				<div className="flex items-start justify-between gap-4 flex-wrap">

				</div>

				{/* Search + meta */}
				<div className="bg-white rounded-2xl border border-black/5 shadow-sm p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
					<div className="relative flex-1">
						<div className="absolute left-3 top-1/2 -translate-y-1/2">
							<IconSearch size={20} color="#292929" />
						</div>
						<input
							type="text"
							placeholder="Search lists…"
							className="w-full h-11 pl-10 pr-10 rounded-xl border border-black/10 focus:border-grantpicks-black-950 outline-none text-grantpicks-black-950 bg-white"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Escape') clearSearch()
							}}
						/>
						{searchQuery && (
							<button
								onClick={clearSearch}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-grantpicks-black-50 rounded-full transition-colors"
								title="Clear search"
							>
								<IconClose size={16} color="#292929" />
							</button>
						)}
					</div>

					<div className="flex items-center gap-2 flex-wrap">
						{/* searching state is shown in the cards grid */}
					</div>
					<Button
						icon={<IconPlus size={22} color="" />}
						className="!text-sm !font-semibold !rounded-full !px-6"
						onClick={goCreateList}
					>
						Create List
					</Button>
				</div>

			</div>

			<div>
				{isLoading || isSearching ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6">
						{skeletonCards.map((_, i) => (
							<div
								key={i}
								className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 animate-pulse"
							>
								{isSearching && !isLoading && i === 0 && (
									<div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-grantpicks-black-600 bg-grantpicks-black-50 px-3 py-1.5 rounded-full">
										<div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-b border-grantpicks-black-950" />
										Searching…
									</div>
								)}
								<div className="h-5 w-2/3 bg-grantpicks-black-100 rounded mb-3" />
								<div className="h-4 w-full bg-grantpicks-black-100 rounded mb-2" />
								<div className="h-4 w-5/6 bg-grantpicks-black-100 rounded mb-6" />
								<div className="flex items-center justify-between">
									<div className="h-8 w-24 bg-grantpicks-black-100 rounded-full" />
									<div className="h-8 w-20 bg-grantpicks-black-100 rounded-full" />
								</div>
							</div>
						))}
					</div>
				) : !isValidating && filteredLists?.length === 0 ? (
					<div className="flex items-center w-full flex-col gap-y-4 justify-center py-14 mt-6 bg-white rounded-3xl border border-black/5 shadow-sm px-6 text-center">
						<div className="w-14 h-14 rounded-2xl bg-grantpicks-black-50 flex items-center justify-center">
							<IconSearch size={26} color="#292929" />
						</div>
						<h2 className="text-grantpicks-black-950 text-2xl font-black">
							{debouncedSearchQuery ? 'No matching lists' : 'No lists yet'}
						</h2>
						<p className="text-grantpicks-black-600 max-w-md">
							{debouncedSearchQuery
								? `We couldn't find any lists matching “${debouncedSearchQuery}”. Try a different keyword or clear your search.`
								: 'Create your first list to manage who can apply or vote in a round.'}
						</p>
						<div className="flex flex-col sm:flex-row gap-3 pt-2">
							{debouncedSearchQuery ? (
								<Button
									color="white"
									className="!rounded-full !px-7 !py-3"
									onClick={clearSearch}
								>
									Clear search
								</Button>
							) : (
								<Button
									color="black-950"
									className="!rounded-full !px-7 !py-3"
									onClick={goCreateList}
								>
									Create List
								</Button>
							)}
							<Button
								color="white"
								className="!rounded-full !px-7 !py-3"
								onClick={goCreateList}
							>
								Create List
							</Button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 text-grantpicks-black-950 w-full">
						{filteredLists.map((list: APIListExternal) => (
							<div key={list.on_chain_id} className="w-full">
								<ListCard
									stellarPubKey={stellarPubKey || ''}
									chainId={storage.chainId}
									list={list}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
