import { IconProps } from '@/types/icon'
import React from 'react'

const IconExpandLess = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M7 15L12.0625 9.00001L17 15"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default IconExpandLess
