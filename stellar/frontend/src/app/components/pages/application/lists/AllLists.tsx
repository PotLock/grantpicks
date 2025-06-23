import Button from "@/app/components/commons/Button"
import IconPlus from "@/app/components/svgs/IconPlus"
import IconSearch from "@/app/components/svgs/IconSearch"
import IconClose from "@/app/components/svgs/IconClose"
import { useRouter } from "next/navigation"
import { useLists } from "./hooks/useLists"
import { IGetListExternalResponse } from "@/types/on-chain"
import { ListCard } from "./ListCard"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { useWallet } from "@/app/providers/WalletProvider"
import { useState, useMemo, useEffect } from "react"

export const AllLists = () => {
  const router = useRouter()
  const storage = useAppStorage()
  const { data, size, setSize, isValidating, isLoading } = useLists()
  const { stellarPubKey } = useWallet()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

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
      const name = list.name?.toLowerCase() || ""
      const description = list.description?.toLowerCase() || ""
      return name.includes(query) || description.includes(query)
    })
  }, [data, debouncedSearchQuery])

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col justify-between items-center md:flex-row mt-10 gap-y-4">
        <div className="flex items-center gap-x-2  rounded-full p-2 border border-grantpicks-black-950 w-full md:w-[40%]">
          <IconSearch size={24} color="#292929" />
          <input
            type="text"
            placeholder="Search Lists by name or description"
            className="w-full text-grantpicks-black-950 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery("")
              }
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Clear search"
            >
              <IconClose size={16} color="#292929" />
            </button>
          )}
        </div>
        <div>
          <Button
            icon={<IconPlus size={24} color="" />}
            className="!text-sm !font-semibold" onClick={() => router.push('/list/create')}>
            Create List
          </Button>
        </div>
      </div>

      {/* Search results count */}
      {debouncedSearchQuery && (
        <div className="text-sm text-grantpicks-black-950 opacity-70 flex items-center gap-2">
          {searchQuery !== debouncedSearchQuery && (
            <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-grantpicks-black-950"></div>
          )}
          {filteredLists?.length === 1
            ? `1 list found`
            : `${filteredLists?.length} lists found`
          }
          {data?.[0] && data[0]?.length !== filteredLists?.length && (
            <span> out of {data[0]?.length} total lists</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap md:items-start items-center justify-center md:justify-start gap-x-4 mt-8 gap-y-4 text-grantpicks-black-950">
        {
          isLoading ? (
            <div className="flex items-center w-full flex-col gap-y-4 justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-black-950"></div>
              <h2 className="text-grantpicks-black-950 text-xl font-semibold">Loading Lists...</h2>
            </div>
          ) : filteredLists?.length === 0 ? (
            <div className="flex items-center w-full flex-col gap-y-4 justify-center py-12">
              <h2 className="text-grantpicks-black-950 text-xl font-semibold">
                {debouncedSearchQuery ? `No lists found for "${debouncedSearchQuery}"` : "No lists available"}
              </h2>
              {debouncedSearchQuery && (
                <p className="text-grantpicks-black-950 text-sm opacity-70">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            filteredLists.map((list: IGetListExternalResponse) => (
              <ListCard stellarPubKey={stellarPubKey || ''} chainId={storage.chainId} key={list.id} list={list} />
            ))
          )
        }
      </div>

    </div>
  )
}