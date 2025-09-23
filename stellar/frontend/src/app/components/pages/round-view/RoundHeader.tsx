'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Button from '../../commons/Button';
import { prettyTruncate } from '@/utils/helper';
import IconCopy from '../../svgs/IconCopy';
import toast from 'react-hot-toast';
import { toastOptions } from '@/constants/style';
import Image from 'next/image';
import IconArrowLeft from '../../svgs/IconArrowLeft';
import { GPRound } from '@/models/round';
import { useWallet } from '@/app/providers/WalletProvider';
import { useModalContext } from '@/app/providers/ModalProvider';
import useAppStorage from '@/stores/zustand/useAppStorage';
import { getRoundApplication } from '@/services/stellar/round';
import Menu from '../../commons/Menu';
import IconMoreVert from '../../svgs/IconMoreVert';
import { useRouter } from 'next/navigation';

type RoundHeaderProps = {
  name: string;
  owner: string;
  closesIn: string;
  onGoBack: () => void;
  doc?: GPRound;
  openFundModal: () => void;
}

export enum RoundTimelineStatus {
  APPLICATION_NOT_STARTED = 'APPLICATION_NOT_STARTED',
  APPLICATION_OPEN = 'APPLICATION_OPEN',
  APPLICATION_ENDED = 'APPLICATION_ENDED',
  VOTING_OPEN = 'VOTING_OPEN',
  VOTING_ENDED = 'VOTING_ENDED',
}



const RoundHeader = ({ name, owner, closesIn, onGoBack, doc, openFundModal }: RoundHeaderProps) => {
  const { stellarPubKey } = useWallet()
  const { setApplyProjectInitProps, setVoteConfirmationProps } = useModalContext()
  const storage = useAppStorage()
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
  const router = useRouter()



  const currentTime = useMemo(() => resolveRoundTimelineStatus(doc), [doc])
  const isButtonDisabled = useMemo(() => {
    switch (currentTime) {
      case RoundTimelineStatus.APPLICATION_OPEN:
        return false
      case RoundTimelineStatus.APPLICATION_NOT_STARTED:
        return true
      case RoundTimelineStatus.APPLICATION_ENDED:
        return true
      case RoundTimelineStatus.VOTING_OPEN:
        return false
      case RoundTimelineStatus.VOTING_ENDED:
        return true
    }
  }, [currentTime])

  const currentText = useMemo(() => {
    switch (currentTime) {
      case RoundTimelineStatus.APPLICATION_OPEN:
        return isUserApplied ? 'You\'re already a part of this round.' : 'Apply to Round'
      case RoundTimelineStatus.APPLICATION_NOT_STARTED:
        return 'Application Not Started'
      case RoundTimelineStatus.APPLICATION_ENDED:
        return 'Application Ended'
      case RoundTimelineStatus.VOTING_OPEN:
        return 'Vote'
      case RoundTimelineStatus.VOTING_ENDED:
        return 'Voting Ended'
    }
  }, [currentTime, isUserApplied])

  const fetchRoundApplication = useCallback(async () => {
    if (currentTime !== RoundTimelineStatus.APPLICATION_OPEN) return

    try {
      if (doc?.on_chain_id) {
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
        }

      }
    } catch (error: any) {
      console.log('error fetch project applicant')
      setIsUserApplied(false)
    }
  }, [currentTime, doc, storage])

  useEffect(() => {
    fetchRoundApplication()
  }, [fetchRoundApplication, storage.my_address])

  const handleMainAction = () => {
    if (currentTime === RoundTimelineStatus.APPLICATION_OPEN) {
      setApplyProjectInitProps({
        isOpen: true,
        round_id: BigInt(doc?.on_chain_id || ''),
        roundData: doc,
      })
    }
    if (currentTime === RoundTimelineStatus.VOTING_OPEN) {
      setVoteConfirmationProps({
        isOpen: true,
        doc: doc,
      })
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <IconArrowLeft size={24} className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70" onClick={onGoBack} />
          <h1 className="text-2xl md:text-[32px] font-semibold text-grantpicks-black-950">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          {
            stellarPubKey !== owner && stellarPubKey && (
              <Button isDisabled={isButtonDisabled || isUserApplied} onClick={handleMainAction}>{currentText}</Button>
            )
          }
          <Button isDisabled={!doc?.use_vault} color="white" onClick={openFundModal}>{doc?.use_vault ? 'Fund Round' : 'Funding Not Allowed'}</Button>
          {(doc?.owner?.id === storage.my_address || doc?.admins?.includes(storage.my_address || '')) && (
            <div className="relative">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                type="button"
              >
                <IconMoreVert size={20} className="fill-grantpicks-black-600" />
              </button>
              <Menu
                position="right-0 mt-2"
                className="min-w-[180px]"
                onClose={() => setIsMenuOpen(false)} isOpen={isMenuOpen}>
                <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
                  <button
                    className="px-4 py-3 text-left text-grantpicks-black-950 text-sm hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      router.push(`/rounds/edit-round/${doc?.on_chain_id}`)
                      setIsMenuOpen(false)
                    }}
                  >
                    Edit Round
                  </button>
                </div>
              </Menu>
            </div>
          )}
        </div>
      </div>
      <div className="flex md:ml-8 items-center gap-3 text-sm text-grantpicks-black-600 flex-wrap">
        <div className="flex items-center space-x-2">
          <Image
            src={`https://www.tapback.co/api/avatar/${owner}`}
            alt="image"
            width={25}
            height={25}
          />
          <div>
            <p className="text-sm font-semibold text-grantpicks-black-950">
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-normal text-grantpicks-black-600" title={owner || ''}>
                {owner ? prettyTruncate(owner, 10, 'address') : ''}
              </p>
              <IconCopy
                size={16}
                className="stroke-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    owner,
                  )
                  toast.success('Address is copied', {
                    style: toastOptions.success.style,
                  })
                }}
              />
            </div>
          </div>
        </div>
        <span className="w-[4px] h-[4px] rounded-full bg-grantpicks-black-300" />
        <p>{closesIn}</p>
      </div>
    </div >
  )
}


export function resolveRoundTimelineStatus(doc?: GPRound, nowDate?: Date): RoundTimelineStatus {
  const now = (nowDate ?? new Date()).getTime()
  const appStart = doc?.application_start ? new Date(doc.application_start).getTime() : NaN
  const appEnd = doc?.application_end ? new Date(doc.application_end).getTime() : NaN
  const votingStart = doc?.voting_start ? new Date(doc.voting_start).getTime() : NaN
  const votingEnd = doc?.voting_end ? new Date(doc.voting_end).getTime() : NaN

  const hasApplication = !Number.isNaN(appStart) && !Number.isNaN(appEnd)

  if (hasApplication) {
    if (now < appStart) return RoundTimelineStatus.APPLICATION_NOT_STARTED
    if (now >= appStart && now < appEnd) return RoundTimelineStatus.APPLICATION_OPEN
    if (!Number.isNaN(votingStart) && now < votingStart) return RoundTimelineStatus.APPLICATION_ENDED
    if (!Number.isNaN(votingStart) && !Number.isNaN(votingEnd) && now >= votingStart && now < votingEnd)
      return RoundTimelineStatus.VOTING_OPEN
    return RoundTimelineStatus.VOTING_ENDED
  }

  // No application configured: proceed with voting timeline
  if (!Number.isNaN(votingStart) && now < votingStart) return RoundTimelineStatus.APPLICATION_ENDED
  if (!Number.isNaN(votingStart) && !Number.isNaN(votingEnd) && now >= votingStart && now < votingEnd)
    return RoundTimelineStatus.VOTING_OPEN
  return RoundTimelineStatus.VOTING_ENDED
}

export default RoundHeader
