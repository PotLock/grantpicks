'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { useWallet } from '@/app/providers/WalletProvider'
import { usePotlockService } from '@/services/potlock'
import { RoundCard } from '@/app/components/pages/application/RoundCard'
import IconLoading from '@/app/components/svgs/IconLoading'
import { GPRound } from '@/models/round'
import ApplicationLayout from '@/app/components/pages/application/Layout'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconSearch from '@/app/components/svgs/IconSearch'
import IconClose from '@/app/components/svgs/IconClose'
import IconUnfoldMore from '@/app/components/svgs/IconUnfoldMore'
import Menu from '@/app/components/commons/Menu'
import clsx from 'clsx'

const MyRoundsPage = () => {
  const { connectedWallet, stellarPubKey } = useWallet()
  const potlockApi = usePotlockService()
  const { selectedRoundType, setSelectedRoundType } = useRoundStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [myRoundsData, setMyRoundsData] = useState<GPRound[]>([])
  const filterButtonRef = useRef<HTMLDivElement>(null)

  const onFetchMyRounds = async (accountId: string): Promise<GPRound[]> => {
    const res = await potlockApi.getMyRounds(accountId)
    return res
  }

  const {
    data: dataMyRounds,
    isLoading: isLoadingMyRounds,
    mutate: mutateMyRounds,
  } = useSWR(
    () => {
      if (!connectedWallet) return null
      return stellarPubKey ? `get-my-rounds:${stellarPubKey}` : null
    },
    () => onFetchMyRounds(stellarPubKey),
  )

  const filterRoundsByType = (rounds: GPRound[], type: string) => {
    switch (type) {
      case 'upcoming':
        return rounds.filter((t) => {
          const now = new Date().getTime()
          const votingStart = new Date(t.voting_start).getTime()
          const appStart = t.application_start
            ? new Date(t.application_start).getTime()
            : null
          const appEnd = t.application_end
            ? new Date(t.application_end).getTime()
            : null

          // Only show in upcoming if voting hasn't started
          if (now >= votingStart) return false

          // If application exists and has ended, don't show in upcoming (should be in on-going)
          if (appEnd && now >= appEnd) return false

          // If no application dates exist, don't show in upcoming (should be in on-going)
          if (!appStart && !appEnd) return false

          // If application exists and hasn't started, show in upcoming
          if (appStart && now < appStart) return true

          // If application exists and is open, show in upcoming
          if (appStart && appEnd && now >= appStart && now < appEnd) return true

          return false
        })
      case 'on-going':
        return rounds.filter((t) => {
          const now = new Date().getTime()
          const votingStart = new Date(t.voting_start).getTime()
          const votingEnd = new Date(t.voting_end).getTime()
          const appEnd = t.application_end
            ? new Date(t.application_end).getTime()
            : null
          const appStart = t.application_start
            ? new Date(t.application_start).getTime()
            : null

          // Case 1: Voting has started (normal on-going case)
          if (
            now >= votingStart &&
            now < votingEnd &&
            t.approved_projects.length > 0
          ) {
            return true
          }

          // Case 2: Voting hasn't started BUT application has ended
          if (now < votingStart && appEnd && now >= appEnd) {
            return true
          }

          // Case 3: Voting hasn't started AND application doesn't exist
          if (now < votingStart && !appStart && !appEnd) {
            return true
          }

          return false
        })
      case 'ended':
        return rounds.filter(
          (t) => new Date(t.voting_end).getTime() <= new Date().getTime(),
        )
      default:
        return rounds
    }
  }

  useEffect(() => {
    if (dataMyRounds) {
      const temp = filterRoundsByType([...dataMyRounds], selectedRoundType)
      setMyRoundsData(temp)
    }
  }, [selectedRoundType, dataMyRounds])

  const filteredMyRounds = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    if (!q) return myRoundsData
    return myRoundsData.filter((r) => {
      const name = (r.name || '').toLowerCase()
      const description = (r.description || '').toLowerCase()
      return name.includes(q) || description.includes(q)
    })
  }, [myRoundsData, searchQuery])

  const getFilterLabel = (type: string) => {
    switch (type) {
      case 'on-going':
        return 'Ongoing Rounds'
      case 'upcoming':
        return 'Upcoming Rounds'
      case 'ended':
        return 'Past Rounds'
      default:
        return 'Select Filter'
    }
  }

  return (
    <ApplicationLayout>
      <div className="flex flex-col">
        <p className="text-[44px] md:text-[50px] lg:text-[62px] font-black text-grantpicks-black-950 uppercase mb-8 md:mb-10 lg:mb-12">
          My Rounds
        </p>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex h-14 items-center gap-x-3 rounded-xl px-4 border-2 border-grantpicks-black-100 bg-white w-full focus-within:border-grantpicks-black-200 transition-all">
              <IconSearch size={22} color="#656565" />
              <input
                type="text"
                placeholder="Search your rounds..."
                className="flex-1 text-grantpicks-black-950 placeholder:text-grantpicks-black-400 outline-none bg-transparent font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <IconClose size={18} color="#656565" />
                </button>
              )}
            </div>
          </div>

          <div className="relative w-full md:w-auto">
            <div
              ref={filterButtonRef}
              onClick={() => setShowFilter(!showFilter)}
              className="h-14 border-2 border-grantpicks-black-100 bg-white rounded-xl px-4 flex items-center justify-between cursor-pointer hover:border-grantpicks-black-200 min-w-[200px]"
            >
              <p className="text-sm font-semibold text-grantpicks-black-950">
                {getFilterLabel(selectedRoundType)}
              </p>
              <IconUnfoldMore size={20} className="fill-grantpicks-black-400" />
            </div>
            {showFilter && (
              <Menu
                isOpen={showFilter}
                onClose={() => setShowFilter(false)}
                position="top-16 right-0"
                className="w-full md:w-[200px]"
              >
                <div className="bg-white rounded-xl shadow-xl border border-grantpicks-black-100 p-2 space-y-1">
                  {['on-going', 'upcoming', 'ended'].map((type) => (
                    <div
                      key={type}
                      onClick={() => {
                        setSelectedRoundType(type as any)
                        setShowFilter(false)
                      }}
                      className={clsx(
                        'px-3 py-2 rounded-lg cursor-pointer text-sm font-medium transition-colors',
                        selectedRoundType === type
                          ? 'bg-grantpicks-black-50 text-grantpicks-black-950'
                          : 'text-grantpicks-black-600 hover:bg-grantpicks-black-50 hover:text-grantpicks-black-950',
                      )}
                    >
                      {getFilterLabel(type)}
                    </div>
                  ))}
                </div>
              </Menu>
            )}
          </div>
        </div>

        {!connectedWallet ? (
          <div>
            <div className="mt-8 flex items-center justify-center">
              <Image
                src="/assets/images/empty-state.png"
                alt=""
                className="object-fill animate-bounce duration-1000"
                width={100}
                height={100}
              />
            </div>
            <p className="text-base font-bold text-grantpicks-black-950 text-center">
              Please connect wallet to view your rounds.
            </p>
          </div>
        ) : isLoadingMyRounds ? (
          <div className="h-52 flex items-center justify-center w-full">
            <IconLoading size={40} className="fill-grantpicks-black-600" />
          </div>
        ) : filteredMyRounds.length === 0 ? (
          <div>
            <div className="mt-8 flex items-center justify-center">
              <Image
                src="/assets/images/empty-state.png"
                alt=""
                className="object-fill animate-bounce duration-1000"
                width={100}
                height={100}
              />
            </div>
            <p className="text-base font-bold text-grantpicks-black-950 text-center">
              {searchQuery
                ? 'No rounds found matching your search.'
                : `No ${getFilterLabel(selectedRoundType).toLowerCase()} found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {filteredMyRounds.map((doc, idx) => (
              <RoundCard key={idx} doc={doc} mutateRounds={mutateMyRounds} />
            ))}
          </div>
        )}
      </div>
    </ApplicationLayout>
  )
}

export default MyRoundsPage
