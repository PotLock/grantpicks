import React, { useMemo } from 'react'
import IconNear from '../../../svgs/IconNear'
import IconStellar from '../../../svgs/IconStellar'
import IconCube from '../../../svgs/IconCube'
import IconProject from '../../../svgs/IconProject'
import IconDollar from '../../../svgs/IconDollar'

interface RoundCardHeaderProps {
  chainId: string
  currentTime: string
  selectedRoundType: string
}

const RoundCardHeader: React.FC<RoundCardHeaderProps> = ({
  chainId,
  currentTime,
  selectedRoundType,
}) => {
  const config = useMemo(() => {
    if (currentTime === 'upcoming-open' || currentTime === 'on-going') {
      return {
        className: 'border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50',
        icon: selectedRoundType === 'on-going' ? (
          <IconCube size={18} className="fill-grantpicks-green-400" />
        ) : (
          <IconProject size={18} className="fill-grantpicks-green-400" />
        ),
        text: selectedRoundType === 'on-going' ? 'VOTING OPEN' : 'APPLICATION OPEN'
      }
    } else if (currentTime === 'upcoming' || currentTime === 'upcoming-closed' || currentTime === 'ended') {
      return {
        className: 'border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50',
        icon: currentTime === 'ended' ? (
          <IconDollar size={18} className="fill-grantpicks-black-950" />
        ) : (
          <IconProject size={18} className="fill-grantpicks-black-950" />
        ),
        text: currentTime === 'ended' ? 'COMPLETED' : 'APPLICATION CLOSED'
      }
    } else if (currentTime === 'upcoming-not-started') {
      return {
        className: 'border-grantpicks-black-400 text-grantpicks-black-950 bg-grantpicks-black-50',
        icon: <IconProject size={18} className="fill-grantpicks-black-950" />,
        text: 'NOT STARTED'
      }
    } else {
      return {
        className: 'border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50',
        icon: <IconDollar size={18} className="fill-grantpicks-amber-400" />,
        text: 'PAYOUT PENDING'
      }
    }
  }, [currentTime, selectedRoundType])


  return (
    <div className="flex items-center justify-between mb-4 md:mb-6">
      <div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
        {chainId === 'near' ? (
          <IconNear size={16} className="fill-grantpicks-black-950" />
        ) : (
          <IconStellar size={16} className="fill-grantpicks-black-950" />
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full ${config.className}`}>
          {config.icon}
          <p className="uppercase">{config.text}</p>
        </div>
      </div>
    </div>
  )
}

export default RoundCardHeader
