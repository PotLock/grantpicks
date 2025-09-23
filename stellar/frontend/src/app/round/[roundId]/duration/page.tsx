'use client'

import { useParams } from "next/navigation"

import { TimePeriodDrawer } from "@/app/components/pages/application/TimePeriodDrawer"
import { usePotlockService } from "@/services/potlock"
import useSWR from "swr"
import { useState } from "react"
import { useWallet } from "@/app/providers/WalletProvider"

const RoundDurationPage = () => {
  const params = useParams<{ roundId: string }>()
  const potlockService = usePotlockService()
  const { data, isLoading, mutate, error } = useSWR(`/rounds/${params.roundId}`, () => potlockService.getRound(Number(params.roundId)))
  const { stellarPubKey } = useWallet()

  if (error) {
    return <div className="text-center text-grantpicks-black-950">Error Loading Round Duration</div>
  }

  if (isLoading) {
    return <div className="text-center text-grantpicks-black-950">Loading Round Duration</div>
  }

  const isOwner = data?.owner?.id === stellarPubKey
  const isAdmin = Array.isArray(data?.admins) && data?.admins.includes(stellarPubKey)
  const canView = isOwner || isAdmin

  if (!canView) {
    return <div className="text-center text-grantpicks-black-950">You do not have permission to view this page.</div>
  }

  return (
    <div>
      <TimePeriodDrawer
        doc={data || {}}
        mutateRounds={mutate}
      />
    </div>
  )
}

export default RoundDurationPage