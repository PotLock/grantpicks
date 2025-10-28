import { formatStroopToXlm } from '@/utils/helper'
import React, { ComponentType } from 'react'

type StatCardProps = {
	label: string
	value: string | number
	Icon: React.ReactNode
	global?: any
}

const StatCard = ({ label, value, Icon, global }: StatCardProps) => (
	<div className="p-3 md:p-4 lg:p-5 rounded-xl border border-black/10 flex items-center space-x-4 bg-white">
		<div className="border border-black/10 p-2 rounded-full">{Icon}</div>
		<div>
			<p className="text-[25px] font-normal text-grantpicks-black-950">
				{global ? `${formatStroopToXlm(BigInt(value || 0))} XLM` : value}

				<span className="text-xs pl-1 md:text-base font-normal text-grantpicks-black-600">
					{global
						? `${(Number(formatStroopToXlm(BigInt(value || 0))) * global.stellarPrice).toFixed(2)} USD`
						: ''}
				</span>
			</p>
			<p className="text-xs font-semibold text-grantpicks-black-600">{label}</p>
		</div>
	</div>
)

export default StatCard
