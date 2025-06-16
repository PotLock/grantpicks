'use client'

import Button from "@/app/components/commons/Button"
import Modal from "@/app/components/commons/Modal"
import { useSingleList } from "@/app/components/pages/application/lists/hooks/useSingleList"
import { useWallet } from "@/app/providers/WalletProvider"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { prettyTruncate } from "@/utils/helper"
import Image from "next/image"
import { useParams } from "next/navigation"
import { FaUsers, FaCheckCircle, FaUserFriends, FaCalendar } from "react-icons/fa"
import { useState } from "react"
import { RegisterUsersModal } from "./RegisterUsersModal"


export const SingleListPage = () => {
  const params = useParams()
  const storage = useAppStorage()
  const listId = params.listId as string
  const { stellarPubKey } = useWallet()
  const { data: list, isLoading, isError } = useSingleList({ listId })
  const [isOpen, setIsOpen] = useState<{ open: boolean, type: 'SINGLE' | 'BATCH' | null }>({ open: false, type: null })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-black-950"></div>
      </div>
    )
  }

  if (isError || !list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load list</div>
      </div>
    )
  }

  const adminsCount = list.admins.length || 0
  const membersCount = Number(list.total_registrations_count) || 0
  const applicationStatus = list.default_registration_status?.tag === 'Approved' ? 'Auto-Approve' : list.default_registration_status?.tag || 'Manual'
  const createdAt = list.created_ms ? new Date(Number(list.created_ms)).toLocaleDateString() : 'N/A'

  return (
    <div className="min-h-screen text-grantpicks-black-950 pb-10">
      <div
        className="relative w-full flex justify-center"
        style={{ minHeight: 320 }}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${list.cover_img_url || '/assets/images/default-list-image.png'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '80%',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Dark overlay for blending */}
          <div className="absolute inset-0 bg-black/10" style={{ height: '100%' }} />
          <div className="absolute inset-0" />
        </div>
        {/* Card content on top of background */}
        <div className="relative z-10 w-full  md:px-12 px-4 pt-2">
          <div className="bg-white rounded-xl shadow-lg p-8 relative" style={{ marginTop: 80 }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl mb-0 font-bold">{list.name}</h1>
                <div className="flex items-center gap-x-2 py-2 text-gray-500 text-sm">
                  <Image
                    src={`https://www.tapback.co/api/avatar/${list.owner}`}
                    alt="image"
                    width={24}
                    height={24}
                  />
                  Created by
                  <p className="font-semibold text-grantpicks-black-950 text-base">{storage.chainId === 'stellar' ? prettyTruncate(list.owner, 10, 'address') : list.owner}</p>
                  <span className="mx-2">•</span>
                  <div className="flex items-center gap-x-2">
                    <FaCalendar />
                    <p className="text-gray-500 text-sm">Created on {createdAt}</p>
                  </div>
                </div>
              </div>
              <Button
                isDisabled={list.admin_only_registrations && list.owner !== stellarPubKey}
                onClick={() => setIsOpen({ open: true, type: list.owner === stellarPubKey ? 'BATCH' : 'SINGLE' })}>
                {list.owner === stellarPubKey ? 'Register Project(s)' : 'Apply to List'}
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8 mt-4">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6">
                <FaUsers className="text-3xl mb-2 text-gray-700" />
                <div className="text-2xl text-gray-500 font-bold">{membersCount}</div>
                <div className="text-gray-500 text-sm">Members</div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6 border-2 border-blue-400">
                <FaUserFriends className="text-3xl mb-2 text-gray-700" />
                <div className="text-2xl text-gray-500 font-bold">{adminsCount}</div>
                <div className="text-gray-500 text-sm">Admins</div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-6">
                <FaCheckCircle className="text-3xl mb-2 text-gray-700" />
                <div className="text-xl font-bold">{applicationStatus}</div>
                <div className="text-gray-500 text-sm">Application Status</div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <h2 className="text-lg  font-semibold mb-2">About this List</h2>
              <p className="text-gray-700">{list.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="mt-8  mx-auto px-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-lg">Members <span className="text-gray-500 font-normal">{membersCount}</span></div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Lists by name or description.."
                className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ width: 260 }}
              />

            </div>
          </div>
          {/* Members list would go here */}
        </div>
      </div>
      <Modal isOpen={isOpen.open} onClose={() => setIsOpen({ open: false, type: null })} closeOnBgClick={true} closeOnEscape={true}>
        <RegisterUsersModal
          type={isOpen.type || 'SINGLE'}
          listId={listId}
          onClose={() => setIsOpen({ open: false, type: null })} />
      </Modal>
    </div>
  )
}
