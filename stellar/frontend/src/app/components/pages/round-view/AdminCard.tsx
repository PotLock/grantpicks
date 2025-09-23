'use client'
import React from 'react'
import Image from 'next/image'
import { prettyTruncate } from '@/utils/helper'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'

type AdminCardProps = {
  address?: string
  avatarSrc?: string
  className?: string
}

const AdminCard: React.FC<AdminCardProps> = ({
  address,
  avatarSrc = '/assets/images/ava-1.png',
  className,
}) => (
  <div className={`border border-black/10 rounded-xl p-6 bg-white flex flex-col items-center text-center gap-4 ${className || ''}`}>
    <div className="w-16 h-16 rounded-full bg-grantpicks-black-200 overflow-hidden flex items-center justify-center">
      <Image src={avatarSrc} alt="Admin avatar" width={64} height={64} className="w-full h-full object-cover" />
    </div>
    <div className="relative group">
      <p
        className="text-xl font-semibold cursor-pointer hover:underline text-grantpicks-black-950 tracking-wide"
        onClick={() => {
          navigator.clipboard.writeText(address as string)
          toast.success('Address copied to clipboard', {
            style: toastOptions.success.style,
          })
        }}
      >
        {prettyTruncate(address, 18, 'address')}
      </p>
      <div className="absolute left-1/2 -translate-x-1/2 mt-2 rounded-md bg-grantpicks-black-950 text-white px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition whitespace-nowrap text-sm md:text-sm font-semibold">
        {address}
      </div>
    </div>
  </div>
)

export default AdminCard
