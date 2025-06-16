import { IGetListExternalResponse } from "@/types/on-chain"
import { prettyTruncate } from "@/utils/helper"
import Image from "next/image"
import { useRouter } from "next/navigation"

type ListCardProps = {
  list: IGetListExternalResponse
  chainId: string | null
  stellarPubKey: string
}


export const ListCard = ({ list, chainId, stellarPubKey }: ListCardProps) => {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/list/${list.id}`)}
      className="flex transition-all duration-500 hover:shadow-[0_6px_10px_rgba(0,0,0,0.2)] cursor-pointer flex-col h-[394px] w-[357px] p-0 m-0 border border-[#E5E7EB] rounded-lg">
      <Image src={list.cover_img_url || '/assets/images/default-list-image.png'} alt={list.name}
        className="w-[357px] h-[300px] object-cover rounded-t-lg"
        width={357} height={300} />
      <div className="flex flex-col gap-y-2 p-5">
        <h2 className="text-grantpicks-black-950 text-xl font-bold">{list.name}</h2>
        <p className="text-[#4B5563]  text-sm">{list.description}</p>
      </div>
      <div className="flex items-center gap-x-2 p-5 text-grantpicks-black-950">
        <Image
          src={`https://www.tapback.co/api/avatar/${list.owner}`}
          alt="image"
          width={24}
          height={24}
        />
        Created by
        <p className="text-grantpicks-black-950 font-semibold text-sm">{chainId === 'stellar' ? prettyTruncate(list.owner, 10, 'address') : list.owner}</p>
      </div>
      <div className="flex items-center justify-between gap-x-2 p-5 text-grantpicks-black-950">
        <p className="text-grantpicks-black-950 font-semibold text-sm">{Number(list.total_registrations_count)} Member(s)</p>
        {list.owner === stellarPubKey && (
          <div className="text-grantpicks-black-950 font-semibold text-sm">
            Your're the owner
          </div>
        )}
      </div>
    </div>
  )
}