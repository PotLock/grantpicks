import Button from "@/app/components/commons/Button"
import IconPlus from "@/app/components/svgs/IconPlus"
import IconSearch from "@/app/components/svgs/IconSearch"
import { useRouter } from "next/navigation"
import { useLists } from "./hooks/useLists"
import { IGetListExternalResponse } from "@/types/on-chain"
import { ListCard } from "./ListCard"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { useWallet } from "@/app/providers/WalletProvider"

export const AllLists = () => {
  const router = useRouter()
  const storage = useAppStorage()
  const { data, size, setSize, isValidating, isLoading } = useLists()
  const { stellarPubKey } = useWallet()

  console.log(data)


  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col justify-between items-center md:flex-row mt-10 gap-y-4">
        <div className="flex items-center gap-x-2  rounded-full p-2 border border-grantpicks-black-950 w-full md:w-[40%]">
          <IconSearch size={24} color="#292929" />
          <input type="text" placeholder="Search Lists by name or description" className="w-full text-grantpicks-black-950 outline-none" />
        </div>
        <div>
          <Button
            icon={<IconPlus size={24} color="" />}
            className="!text-sm !font-semibold" onClick={() => router.push('/list/create')}>
            Create List
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-4 h-[500px] text-grantpicks-black-950">
        {
          isLoading ? (
            <div className="flex items-center w-full flex-col gap-y-4 justify-center min-h-[500px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-black-950"></div>
              <h2 className="text-grantpicks-black-950 text-xl font-semibold">Loading Lists...</h2>
            </div>
          ) : (
            data?.[0]?.map((list: IGetListExternalResponse) => (
              <ListCard stellarPubKey={stellarPubKey || ''} chainId={storage.chainId} key={list.id} list={list} />
            ))
          )
        }
      </div>

    </div>
  )
}