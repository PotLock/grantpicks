import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import useRoundStore from '@/stores/zustand/useRoundStore'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import { extractChainId, formatStroopToXlm } from '@/utils/helper'
import moment from 'moment'

// Components
import RoundCardHeader from './components/RoundCardHeader'
import RoundCardContent from './components/RoundCardContent'
import RoundCardActions from './components/RoundCardActions'
import RoundCardMenu from './components/RoundCardMenu'
import RoundDetailDrawer from './RoundDetailDrawer'
import ApplicationsDrawer from './ApplicationsDrawer'
import FundRoundModal from './FundRoundModal'
import { TimePeriodDrawer } from './TimePeriodDrawer'
import { UpdateRoundAdmins } from './UpdateRoundAdmins'

// Services
import {
  getRoundApplication,
  HasVotedRoundParams,
  isHasVotedRound,
} from '@/services/stellar/round'

export const RoundCard = ({
  doc,
  mutateRounds,
}: {
  doc: GPRound
  mutateRounds: any
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { selectedRoundType } = useRoundStore()
  const { setApplyProjectInitProps, setVoteConfirmationProps } = useModalContext()
  const { connectedWallet, stellarPubKey } = useWallet()
  const { setShowMenu } = useGlobalContext()
  const storage = useAppStorage()

  // State
  const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false)
  const [showAppsDrawer, setShowAppsDrawer] = useState<boolean>(false)
  const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
  const [showTimePeriodDrawer, setShowTimePeriodDrawer] = useState<boolean>(false)
  const [showUpdateRoundAdmins, setShowUpdateRoundAdmins] = useState<boolean>(false)
  const [totalApprovedProjects, setTotalApprovedProjects] = useState<number>(0)
  const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
  const [hasVoted, setHasVoted] = useState<boolean>(false)

  const chainId = extractChainId(doc)

  // Memoized values
  const currentTime = useMemo(() => {
    if (selectedRoundType === 'upcoming') {
      const now = new Date().getTime()
      const appStart = new Date(doc.application_start || '').getTime()
      const appEnd = new Date(doc.application_end || '').getTime()
      const votingStart = new Date(doc.voting_start).getTime()

      if (now >= appStart && now < appEnd) {
        return 'upcoming-open'
      } else if (now >= appEnd && now < votingStart) {
        return 'upcoming-closed'
      } else if (now < appStart) {
        return 'upcoming-not-started'
      } else if (doc.allow_applications) {
        return 'upcoming'
      } else {
        return 'upcoming-closed'
      }
    } else if (selectedRoundType === 'on-going') {
      return 'on-going'
    } else {
      return doc.round_complete ? 'ended' : 'payout-pending'
    }
  }, [doc, selectedRoundType])


  const isApplicationOpen = currentTime === 'upcoming-open'
  const isVotingOpen = currentTime === 'on-going'
  const isApplicationClosed = currentTime === 'upcoming-closed' || currentTime === 'upcoming'
  const isNotStarted = currentTime === 'upcoming-not-started'
  const isCompleted = currentTime === 'ended' || currentTime === 'payout-pending'



  const fetchTotalApprovedProjects = useCallback(async () => {
    if (chainId === 'stellar') {
      const contracts = storage.getStellarContracts()
      if (!contracts) return

      try {
        const res = await contracts.round_contract.get_approved_projects({
          round_id: BigInt(doc.on_chain_id),
        })
        setTotalApprovedProjects(res.result.length)
      } catch (error: any) {
        console.log('error fetching total approved projects')
      }
    } else {
      const contracts = storage.getNearContracts(null)
      if (!contracts) return

      try {
        const results = await contracts.round.getVotingResults(Number(doc.on_chain_id))
        setTotalApprovedProjects(results.length)
      } catch (error: any) {
        console.log('error fetching total approved projects')
      }
    }
  }, [chainId, doc.on_chain_id, storage])

  const fetchRoundApplication = useCallback(async () => {
    if (selectedRoundType !== 'upcoming') return

    try {
      if (chainId === 'stellar') {
        const contracts = storage.getStellarContracts()
        if (!contracts) return

        try {
          const res = await getRoundApplication(
            {
              round_id: BigInt(doc.on_chain_id),
              applicant: storage.my_address || '',
            },
            contracts,
          )
          if (res?.applicant_id) {
            setIsUserApplied(true)
          }

        } catch (error) {
          console.log('error fetching round application')
          setIsUserApplied(false)
        }

      } else {
        const contracts = storage.getNearContracts(null)
        if (!contracts) return

        const application = await contracts.round.getApplicationForRound(
          Number(doc.on_chain_id),
          storage.my_address || '',
        )

        if (application) {
          setIsUserApplied(true)
        }
      }
    } catch (error: any) {
      console.log('error fetch project applicant')
      setIsUserApplied(false)
    }
  }, [selectedRoundType, chainId, doc.on_chain_id, storage])

  const checkIfUserHasVoted = useCallback(async () => {
    if (!isVotingOpen) return

    try {
      if (chainId === 'stellar') {
        const contracts = storage.getStellarContracts()
        if (!contracts) return

        const params: HasVotedRoundParams = {
          round_id: BigInt(doc.on_chain_id),
          voter: storage.my_address || '',
        }
        const hasVoted = await isHasVotedRound(params, contracts)
        setHasVoted(hasVoted)
      } else {
        const contracts = storage.getNearContracts(null)
        if (!contracts) return

        const hasVoted = await contracts.round.hasVote(
          Number(doc.on_chain_id),
          storage.my_address || '',
        )
        setHasVoted(hasVoted)
      }
    } catch (error: any) {
      console.log('error checking if user has voted', error)
    }
  }, [isVotingOpen, chainId, doc.on_chain_id, storage])

  // Effects
  useEffect(() => {
    fetchRoundApplication()
    checkIfUserHasVoted()
    fetchTotalApprovedProjects()
  }, [doc.on_chain_id, connectedWallet, stellarPubKey])

  useEffect(() => {
    if (searchParams.get('round_id') === doc.on_chain_id.toString()) {
      setShowDetailDrawer(true)
    }
  }, [searchParams, doc.on_chain_id])

  // Event handlers
  const handleOpenDetailDrawer = () => {
    setShowDetailDrawer(true)
    router.push(
      `?round_type=${selectedRoundType}&round_id=${doc.on_chain_id}`,
      { scroll: false },
    )
  }

  const handleCloseDetailDrawer = () => {
    setShowDetailDrawer(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('round_id')
    router.replace(url.toString(), { scroll: false })
  }

  const handleMainAction = () => {
    if (isNotStarted) return

    if (isVotingOpen) {
      if (hasVoted) {
        router.push(`/rounds/round-vote/${doc.on_chain_id}?is_voted=true`)
      } else {
        setVoteConfirmationProps((prev) => ({
          ...prev,
          isOpen: true,
          doc: doc,
          chainId: doc.chain as any,
        }))
      }
    } else if (isApplicationOpen) {
      setApplyProjectInitProps((prev) => ({
        ...prev,
        isOpen: true,
        round_id: BigInt(doc.on_chain_id),
        roundData: doc,
      }))
    } else {
      router.push(`/rounds/round-result/${doc.id}`)
    }
  }

  const handleFundRound = () => {
    if (!connectedWallet) {
      setShowMenu('choose-wallet')
      return
    }
    setShowFundRoundModal(true)
  }

  const getMainActionText = () => {
    if (isUserApplied && isApplicationOpen) {
      return "You're already a part of this round."
    }
    if (isVotingOpen) {
      return hasVoted ? "You've voted in this round" : 'Vote'
    }
    if (isNotStarted) {
      return `Application starts in ${moment(new Date(doc.application_start || '')).fromNow()}`
    }
    if (isApplicationClosed) {
      return 'No application allowed'
    }
    if (isApplicationOpen) {
      return 'Apply'
    }
    if (isCompleted) {
      if (!storage.my_address) return 'Connect Wallet'
      if (totalApprovedProjects === 0) return 'No projects Participated'
      return 'View Result'
    }
    return 'Application Closed'
  }

  const isMainActionDisabled = () => {
    return (
      (isCompleted && totalApprovedProjects === 0) ||
      isApplicationClosed ||
      (isUserApplied && isApplicationOpen) ||
      isNotStarted
    )
  }

  const shouldShowMenu = () => {
    return (
      isVotingOpen ||
      isApplicationOpen ||
      isNotStarted ||
      isApplicationClosed
    )
  }

  return (
    <div className="p-4 md:p-5 rounded-xl border border-black/10">
      <RoundCardHeader
        chainId={chainId}
        currentTime={currentTime}
        selectedRoundType={selectedRoundType}
      />

      <RoundCardContent
        doc={doc}
        selectedRoundType={selectedRoundType}
        currentTime={currentTime}
        totalApprovedProjects={totalApprovedProjects}
        chainId={chainId}
        onOpenDetailDrawer={handleOpenDetailDrawer}
      />

      <RoundCardActions
        actionText={getMainActionText()}
        isDisabled={isMainActionDisabled()}
        onClick={handleMainAction}
      />

      {shouldShowMenu() && (
        <RoundCardMenu
          data={doc}
          onUpdateTimePeriod={() => setShowTimePeriodDrawer(true)}
          onViewDetails={handleOpenDetailDrawer}
          onViewApps={() => setShowAppsDrawer(true)}
          onFundRound={handleFundRound}
          onUpdateAdmins={() => setShowUpdateRoundAdmins(true)}
        />
      )}

      {showDetailDrawer && (
        <RoundDetailDrawer
          isUserApplied={isUserApplied}
          isOpen={showDetailDrawer}
          onClose={handleCloseDetailDrawer}
          onOpenFundRound={handleFundRound}
          showClose={true}
          onApplyRound={() => {
            setApplyProjectInitProps((prev) => ({
              ...prev,
              isOpen: true,
            }))
          }}
          onVote={() => {
            setVoteConfirmationProps((prev) => ({
              ...prev,
              isOpen: true,
              doc: doc,
            }))
          }}
          doc={doc}
        />
      )}

      {showAppsDrawer && (
        <ApplicationsDrawer
          isOpen={showAppsDrawer}
          onClose={() => setShowAppsDrawer(false)}
          doc={doc}
        />
      )}

      {showFundRoundModal && (
        <FundRoundModal
          isOpen={showFundRoundModal}
          doc={doc}
          mutateRounds={mutateRounds}
          onClose={() => setShowFundRoundModal(false)}
        />
      )}

      {showTimePeriodDrawer && (
        <TimePeriodDrawer
          isOpen={showTimePeriodDrawer}
          onClose={() => setShowTimePeriodDrawer(false)}
          mutateRounds={mutateRounds}
          doc={doc}
        />
      )}

      {showUpdateRoundAdmins && (
        <UpdateRoundAdmins
          isOpen={showUpdateRoundAdmins}
          onClose={() => setShowUpdateRoundAdmins(false)}
          doc={doc}
          mutateRounds={mutateRounds}
        />
      )}
    </div>
  )
}
