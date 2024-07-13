import { IconProps } from '@/types/icon'
import React from 'react'

const IconPlay = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/play">
				<path
					id="Polygon 1"
					d="M18 12L8 16L8 8L18 12Z"
					strokeWidth={2}
					strokeLinejoin="round"
				/>
			</g>
		</svg>
	)
}

export default IconPlay
