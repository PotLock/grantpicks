import { IconProps } from '@/types/icon'
import React from 'react'

const IconRemove = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/remove">
				<path
					id="Vector 8"
					d="M19 12L5 12"
					strokeWidth={2}
					strokeLinecap="round"
				/>
			</g>
		</svg>
	)
}

export default IconRemove
