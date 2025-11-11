import React, { useMemo } from 'react'

const ProgressBar = ({
	value,
	max,
	label,
	large,
}: {
	value: number
	max: number
	label?: string
	large?: boolean
}) => {
	const pct = useMemo(() => {
		if (!max || max <= 0) return 0
		const p = Math.min(100, Math.max(0, (value / max) * 100))
		return Number(p.toFixed(2))
	}, [value, max])
	const textSize = large ? 'text-xl' : 'text-sm'
	const barColor =
		pct <= 79
			? 'bg-yellow-400'
			: 'bg-grantpicks-green-700'
	const textColor = pct <= 79
		? 'text-yellow-400'
		: 'text-grantpicks-green-700'
	return (
		<div>
			<div className="flex justify-between items-center mb-2">
				<p className={`${textSize} font-semibold text-[#656565]`}>
					{label || 'Funding Progress'}
				</p>
				<p className={`${textSize} font-semibold ${textColor}`}>
					{value} / {max} XLM
				</p>
			</div>
			<div className="w-full h-3 bg-grantpicks-black-100 rounded-full overflow-hidden">
				<div
					className={`h-3 ${barColor} rounded-full`}
					style={{ width: `${pct}%` }}
				/>
			</div>
		</div>
	)
}

export default ProgressBar
