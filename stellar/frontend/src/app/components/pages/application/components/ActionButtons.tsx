import React from 'react'
import Button from '../../../commons/Button'
import { GPRound } from '@/models/round'

interface ActionButtonsProps {
  selectedRoundType: string
  currentTime: string
  doc: GPRound
  isUserApplied: boolean
  onApplyRound: () => void
  onOpenFundRound: () => void
  onVote: () => void
  onClose: () => void
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedRoundType,
  currentTime,
  doc,
  isUserApplied,
  onApplyRound,
  onOpenFundRound,
  onVote,
  onClose,
}) => {
  const isApplicationClosed = () => {
    return (
      new Date().getTime() > new Date(doc.application_end || '').getTime() ||
      !doc.allow_applications
    )
  }

  const getApplyButtonText = () => {
    if (isUserApplied && currentTime === 'upcoming-open') {
      return "You're already a part of this round."
    }
    if (isApplicationClosed()) {
      return 'Application Closed'
    }
    return 'Apply'
  }

  const isApplyDisabled = () => {
    return (
      (isUserApplied && currentTime === 'upcoming-open') ||
      isApplicationClosed()
    )
  }

  if (selectedRoundType === 'upcoming') {
    return (
      <div className="px-6 pt-4 pb-6 flex items-center space-x-4">
        <Button
          color="black-950"
          onClick={() => {
            onApplyRound()
            onClose()
          }}
          isDisabled={isApplyDisabled()}
          className="!py-3 flex-1"
        >
          {getApplyButtonText()}
        </Button>

        {doc.use_vault && (
          <Button
            color="alpha-50"
            onClick={() => {
              onOpenFundRound()
              onClose()
            }}
            className="!py-3 flex-1"
          >
            Fund Round
          </Button>
        )}
      </div>
    )
  }

  if (selectedRoundType === 'on-going') {
    return (
      <div className="px-6 flex items-center">
        <Button
          color="black-950"
          isFullWidth
          onClick={() => {
            onVote()
            onClose()
          }}
          className="!py-3 flex-1"
        >
          Vote
        </Button>
      </div>
    )
  }

  return null
}

export default ActionButtons
