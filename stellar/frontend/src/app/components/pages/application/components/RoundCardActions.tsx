import React from 'react'
import Button from '../../../commons/Button'

interface RoundCardActionsProps {
  actionText: string
  isDisabled: boolean
  onClick: () => void
  disableFundButton: boolean
  onFundRound: () => void
  showFundButton: boolean
}

const RoundCardActions: React.FC<RoundCardActionsProps> = ({
  actionText,
  isDisabled,
  onClick,
  showFundButton,
  disableFundButton,
  onFundRound,
}) => {
  return (
    <div className="w-full flex flex-row gap-2">
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        isFullWidth
        className="!border !border-grantpicks-black-200 !py-2"
        isDisabled={isDisabled}
      >
        {actionText}
      </Button>
      {showFundButton && (
        <Button
          onClick={(e) => {
            e.stopPropagation()
            onFundRound()
          }}
          color="white"

          isDisabled={disableFundButton}
          isFullWidth
          className="!border !border-grantpicks-black-200 !py-2"
        >
          Fund Round
        </Button>
      )}
    </div>
  )
}

export default RoundCardActions
