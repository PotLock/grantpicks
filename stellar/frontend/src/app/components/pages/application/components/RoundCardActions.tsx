import React from 'react'
import Button from '../../../commons/Button'

interface RoundCardActionsProps {
  actionText: string
  isDisabled: boolean
  onClick: () => void
}

const RoundCardActions: React.FC<RoundCardActionsProps> = ({
  actionText,
  isDisabled,
  onClick,
}) => {
  return (
    <div className="w-full">
      <Button
        onClick={onClick}
        isFullWidth
        className="!border !border-grantpicks-black-200 !py-2"
        color="white"
        isDisabled={isDisabled}
      >
        {actionText}
      </Button>
    </div>
  )
}

export default RoundCardActions
