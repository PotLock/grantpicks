import { IconProps } from '@/types/icon'
import React from 'react'

const IconInfoCircle = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			strokeWidth="2.5"
			fill="none"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
			<path d="M12 9h.01" />
			<path d="M11 12h1v4h1" />
		</svg>
	)
}

export default IconInfoCircle
