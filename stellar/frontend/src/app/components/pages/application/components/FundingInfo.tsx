import React from 'react'
import { GPRound } from '@/models/round'
import { formatStroopToXlm } from '@/utils/helper'
import { formatNearAmount } from 'near-api-js/lib/utils/format'

interface FundingInfoProps {
	doc: GPRound
	chainId: string
}

const FundingInfo: React.FC<FundingInfoProps> = ({ doc, chainId }) => {
	const formatAmount = (amount: string | number) => {
		if (chainId === 'stellar') {
			return formatStroopToXlm(BigInt(amount))
		}
		return formatNearAmount(String(amount))
	}

	const getCurrency = () => (chainId === 'stellar' ? 'XLM' : 'NEAR')

	return (
		<div className="p-4 md:p-5">
			<div className="flex items-center mb-4 md:mb-5">
				<div className="flex-1">
					<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
						{formatAmount(doc.current_vault_balance)} {getCurrency()}
					</p>
					<p className="font-semibold text-xs text-grantpicks-black-600">
						AVAILABLE FUNDS
					</p>
				</div>
				<div className="flex-1">
					<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
						{formatAmount(doc.expected_amount)} {getCurrency()}
					</p>
					<p className="font-semibold text-xs text-grantpicks-black-600">
						EXPECTED FUNDS
					</p>
				</div>
			</div>
		</div>
	)
}

export default FundingInfo
