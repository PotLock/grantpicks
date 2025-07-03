'use client'

import Button from "@/app/components/commons/Button"
import Modal from "@/app/components/commons/Modal"
import Menu from "@/app/components/commons/Menu"
import { useSingleList } from "@/app/components/pages/application/lists/hooks/useSingleList"
import { useWallet } from "@/app/providers/WalletProvider"
import useAppStorage from "@/stores/zustand/useAppStorage"
import { prettyTruncate } from "@/utils/helper"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { FaUsers, FaCheckCircle, FaUserFriends, FaCalendar } from "react-icons/fa"
import { useState } from "react"
import { RegisterUsersModal } from "./RegisterUsersModal"
import { ListProjects } from "./ListProjects"
import IconMoreVert from "@/app/components/svgs/IconMoreVert"

export const SingleListPage = () => {
  const params = useParams()
  const storage = useAppStorage()
  const router = useRouter()
  const listId = params.listId as string
  const { stellarPubKey } = useWallet()
  const { data: list, isLoading, isError, handleDeleteList } = useSingleList({ listId })
  const [isOpen, setIsOpen] = useState<{ open: boolean, type: 'SINGLE' | 'BATCH' | null }>({ open: false, type: null })
  const [menuOpen, setMenuOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  if (isLoading && !list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-grantpicks-black-950"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load list</div>
      </div>
    )
  }

  const isOwner = list?.owner === stellarPubKey

  const adminsCount = list?.admins.length || 0
  const membersCount = Number(list?.total_registrations_count) || 0
  const applicationStatus = list?.default_registration_status?.tag === 'Approved' ? 'Auto-Approve' : list?.default_registration_status?.tag || 'Pending'
  const createdAt = list?.created_ms ? new Date(Number(list.created_ms)).toLocaleDateString() : 'N/A'

  return (
    <div className="min-h-screen text-grantpicks-black-950 pb-10">
      <div
        className="relative w-full flex justify-center"
        style={{ minHeight: 320 }}
      >

        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url(${list?.cover_img_url || '/assets/images/default-list-image.png'})`,
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
        <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 pt-2">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 relative" style={{ marginTop: 80 }}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl mb-0 font-bold break-words">{list?.name}</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 sm:gap-x-2 py-2 text-gray-500 text-sm">
                  <div className="flex items-center gap-x-2">
                    <Image
                      src={`https://www.tapback.co/api/avatar/${list?.owner}`}
                      alt="image"
                      width={24}
                      height={24}
                    />
                    <span>Created by</span>
                    <p className="font-semibold text-grantpicks-black-950 text-base">{storage.chainId === 'stellar' ? prettyTruncate(list?.owner, 10, 'address') : list?.owner}</p>
                  </div>
                  <span className="hidden sm:inline mx-2">•</span>
                  <div className="flex items-center gap-x-2">
                    <FaCalendar />
                    <p className="text-gray-500 text-sm">Created on {createdAt}</p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Button
                  isDisabled={list?.admin_only_registrations && list?.owner !== stellarPubKey}
                  onClick={() => setIsOpen({ open: true, type: list?.owner === stellarPubKey ? 'BATCH' : 'SINGLE' })}
                  className="w-full sm:w-auto"
                >
                  {list?.owner === stellarPubKey ? 'Register Project(s)' : 'Apply to List'}
                </Button>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 mt-4">
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 sm:p-6">
                <FaUsers className="text-2xl sm:text-3xl mb-2 text-gray-700" />
                <div className="text-xl sm:text-2xl text-gray-500 font-bold">{membersCount}</div>
                <div className="text-gray-500 text-sm">Members</div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 sm:p-6 border-2 border-blue-400">
                <FaUserFriends className="text-2xl sm:text-3xl mb-2 text-gray-700" />
                <div className="text-xl sm:text-2xl text-gray-500 font-bold">{adminsCount}</div>
                <div className="text-gray-500 text-sm">Admins</div>
              </div>
              <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <FaCheckCircle className="text-2xl sm:text-3xl mb-2 text-gray-700" />
                <div className="text-lg sm:text-xl font-bold">{applicationStatus}</div>
                <div className="text-gray-500 text-sm">Application Status</div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">About this List</h2>
                {isOwner && (
                  <div className="relative">
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      onClick={() => setMenuOpen(!menuOpen)}
                      type="button"
                    >
                      <IconMoreVert size={20} className="fill-grantpicks-black-600" />
                    </button>
                    <Menu
                      isOpen={menuOpen}
                      onClose={() => setMenuOpen(false)}
                      position="right-0 mt-2"
                      className="min-w-[180px]"
                    >
                      <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
                        <button
                          className="px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setMenuOpen(false)
                            router.push(`/list/update/${listId}`)
                          }}
                        >
                          Edit List
                        </button>
                        {/* <button
                          className="px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            setMenuOpen(false)
                            setIsDeleteOpen(true)
                          }}
                        >
                          Delete List
                        </button> */}

                      </div>
                    </Menu>
                  </div>
                )}
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{list?.description}</p>
            </div>
          </div>
        </div>
      </div>

      <ListProjects listId={listId} isOwner={isOwner} />
      <Modal isOpen={isOpen.open} onClose={() => setIsOpen({ open: false, type: null })} closeOnBgClick={true} closeOnEscape={true}>
        <RegisterUsersModal
          type={isOpen.type || 'SINGLE'}
          listId={listId}
          onClose={() => setIsOpen({ open: false, type: null })} />
      </Modal>
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} closeOnBgClick={true} closeOnEscape={true}>
        <div className="flex bg-white rounded-xl flex-col items-center justify-center p-6 max-w-md mx-auto">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete List</h2>

          {/* Description */}
          <p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-gray-900">&ldquo;{list?.name}&rdquo;</span>? This action cannot be undone and will permanently remove the list and all associated data.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 bg-gray-100 !text-black hover:bg-gray-200 border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteList}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
