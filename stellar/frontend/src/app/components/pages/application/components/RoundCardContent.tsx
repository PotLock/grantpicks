import React from 'react'
import IconCube from '../../../svgs/IconCube'
import IconGroup from '../../../svgs/IconGroup'
import IconProject from '../../../svgs/IconProject'
import IconClock from '../../../svgs/IconClock'
import moment from 'moment'
import { GPRound } from '@/models/round'
import { formatStroopToXlm } from '@/utils/helper'

interface RoundCardContentProps {
  doc: GPRound
  selectedRoundType: string
  currentTime: string
  totalApprovedProjects: number
  chainId: string
  onOpenDetailDrawer: () => void
}

const RoundCardContent: React.FC<RoundCardContentProps> = ({
  doc,
  selectedRoundType,
  currentTime,
  totalApprovedProjects,
  chainId,
  onOpenDetailDrawer,
}) => {
  const renderLeftMetadata = () => {
    if (selectedRoundType === 'on-going') {
      return (
        <div className="flex items-center space-x-1">
          <IconCube size={18} className="fill-grantpicks-black-400" />
          <p className="text-sm font-normal text-grantpicks-black-950">
            {doc.num_picks_per_voter} Vote{doc.num_picks_per_voter > 1 && 's'} per person
          </p>
        </div>
      )
    } else if (selectedRoundType === 'upcoming') {
      return (
        <div className="flex items-center space-x-1">
          <IconGroup size={18} className="fill-grantpicks-black-400" />
          <p className="text-sm font-normal text-grantpicks-black-950">
            Max. {doc.max_participants} {doc.max_participants > 1 ? 'applicants' : 'applicant'}
          </p>
        </div>
      )
    } else {
      return (
        <div className="flex items-center space-x-1">
          <IconProject size={18} className="fill-grantpicks-black-400" />
          <p className="text-sm font-normal text-grantpicks-black-950">
            {totalApprovedProjects} Projects
          </p>
        </div>
      )
    }
  }

  const renderRightMetadata = () => {
    if (selectedRoundType === 'on-going') {
      return (
        <div className="flex items-center space-x-1">
          <IconClock size={18} className="fill-grantpicks-black-400" />
          <p className="text-sm font-normal text-grantpicks-black-950">
            Ends {moment(new Date(doc.voting_end)).fromNow()}
          </p>
        </div>
      )
    } else if (selectedRoundType === 'upcoming') {
      if (currentTime === 'upcoming') {
        return (
          <div className="flex items-center space-x-1">
            <IconClock size={18} className="fill-grantpicks-black-400" />
            <p className="text-sm font-normal text-grantpicks-black-950">
              Open {moment(new Date(doc.application_start || '')).fromNow()}
            </p>
          </div>
        )
      } else if (currentTime === 'upcoming-open') {
        return (
          <div className="flex items-center space-x-1">
            <IconClock size={18} className="fill-grantpicks-black-400" />
            <p className="text-sm font-normal text-grantpicks-black-950">
              Closing {moment(new Date(doc.application_end || '')).fromNow()}
            </p>
          </div>
        )
      } else if (currentTime === 'upcoming-closed') {
        return (
          <div className="flex items-center space-x-1">
            <IconClock size={18} className="fill-grantpicks-black-400" />
            <p className="text-sm font-normal text-grantpicks-black-950">
              Voting {moment(new Date(doc.voting_start)).fromNow()}
            </p>
          </div>
        )
      }
    } else {
      return (
        <p className="text-lg md:text-xl font-normal text-grantpicks-black-950">
          {chainId === 'stellar'
            ? formatStroopToXlm(BigInt(doc.expected_amount))
            : doc.expected_amount}{' '}
          <span className="text-sm font-normal text-grantpicks-black-600">
            {chainId === 'near' ? 'NEAR' : 'XLM'}
          </span>
        </p>
      )
    }
    return null
  }

  return (
    <>
      <button
        onClick={onOpenDetailDrawer}
        className="font-semibold text-base md:text-lg lg:text-xl max-w-60 mb-4 text-grantpicks-black-950 text-left"
      >
        {doc.name}
      </button>
      <div className="flex items-center justify-between mb-6">
        {renderLeftMetadata()}
        {renderRightMetadata()}
      </div>
    </>
  )
}

export default RoundCardContent
