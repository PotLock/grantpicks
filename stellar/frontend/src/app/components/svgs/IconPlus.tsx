import { IconProps } from '@/types/icon'
import React from 'react'

const IconPlus = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			onClick={onClick}
		>
			<path
				d="M9 2V16M2 9H16"
				stroke="#1E1E1E"
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	)
}

export default IconPlus
