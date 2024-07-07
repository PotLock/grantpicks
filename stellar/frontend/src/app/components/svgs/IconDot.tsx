import { IconProps } from '@/types/icon'
import React from 'react'

const IconDot = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 8 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<circle id="dot" cx={4} cy={4} r={4} fill="#292929" />
		</svg>
	)
}

export default IconDot
