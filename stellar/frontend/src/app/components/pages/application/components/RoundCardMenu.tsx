import React from 'react'
import RoundMenu from '../RoundMenu'
import { GPRound } from '@/models/round'

interface RoundCardMenuProps {
  data: GPRound
  onUpdateTimePeriod: () => void
  onViewDetails: () => void
  onViewApps: () => void
  onFundRound: () => void
  onUpdateAdmins: () => void
}

const RoundCardMenu: React.FC<RoundCardMenuProps> = ({
  data,
  onUpdateTimePeriod,
  onViewDetails,
  onViewApps,
  onFundRound,
  onUpdateAdmins,
}) => {
  return (
    <div className="mt-6">
      <RoundMenu
        data={data}
        onUpdateTimePeriod={onUpdateTimePeriod}
        onViewDetails={onViewDetails}
        onViewApps={onViewApps}
        onFundRound={onFundRound}
        onUpdateAdmins={onUpdateAdmins}
      />
    </div>
  )
}

export default RoundCardMenu
