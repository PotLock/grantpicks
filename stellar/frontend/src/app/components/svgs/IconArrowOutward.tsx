import { IconProps } from '@/types/icon'
import React from 'react'

const IconArrowOutward = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/arrow_outward">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M10 7C9.44772 7 9 7.44772 9 8C9 8.55228 9.44772 9 10 9H13.5858L6.29289 16.2929C5.90237 16.6834 5.90237 17.3166 6.29289 17.7071C6.68342 18.0976 7.31658 18.0976 7.70711 17.7071L15 10.4142V14C15 14.5523 15.4477 15 16 15C16.5523 15 17 14.5523 17 14V8V7H16H10Z"
				/>
			</g>
		</svg>
	)
}

export default IconArrowOutward
