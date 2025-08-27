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
      className="group h-[400px] relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 w-[350px] flex flex-col">

      {/* Image Container */}
      <div className="relative h-[180px] overflow-hidden">
        <Image
          src={list.cover_img_url || '/assets/images/default-list-image.png'}
          alt={list.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          width={300}
          height={180}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Stats Badges */}
        <div className="absolute top-2 right-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-semibold text-gray-700">
              {Number(list.total_registrations_count)} Projects
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 transition-colors duration-200">
          {list.name}
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-4 flex-1">
          {list.description}
        </p>

        {/* Creator Info - Fixed to bottom */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Image
                src={`https://www.tapback.co/api/avatar/${list.owner}`}
                alt="Creator"
                width={24}
                height={24}
                className="rounded-full ring-1 ring-gray-200"
              />
              {list.owner === stellarPubKey && (
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-black rounded-full flex items-center justify-center">
                  <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex flex-row items-center gap-x-1">
              <p className="text-xs text-gray-500">by</p>
              <p className="text-xs font-semibold text-gray-900">
                {chainId === 'stellar' ? prettyTruncate(list.owner, 8, 'address') : list.owner}
              </p>
            </div>
          </div>

          {/* Owner Badge */}
          {list.owner === stellarPubKey && (
            <div className="bg-blue-50 text-black-700 px-2 py-1 rounded-full text-xs font-semibold">
              You&apos;re the owner
            </div>
          )}
        </div>

        {/* Hover Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </div>
  )
}