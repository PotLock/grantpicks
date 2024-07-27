import { IconProps } from '@/types/icon'
import React from 'react'

const IconEmail = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/mail">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5 4C3.34315 4 2 5.34315 2 7V17C2 18.6569 3.34315 20 5 20H19C20.6569 20 22 18.6569 22 17V7C22 5.34315 20.6569 4 19 4H5ZM4 7.41421V17C4 17.5523 4.44772 18 5 18H19C19.5523 18 20 17.5523 20 17V7.41421L13.4142 14C12.6332 14.7811 11.3668 14.781 10.5858 14L4 7.41421ZM18.5858 6H5.41421L12 12.5858L18.5858 6Z"
				/>
			</g>
		</svg>
	)
}

export default IconEmail
