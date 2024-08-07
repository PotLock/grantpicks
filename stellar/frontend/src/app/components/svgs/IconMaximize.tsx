import { IconProps } from '@/types/icon'
import React from 'react'

const IconMaximize = ({ size, className, onClick }: IconProps) => {
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
			onClick={onClick}
		>
			<path stroke="none" d="M0 0h24v24H0z" fill="none" />
			<path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
			<path d="M4 16v2a2 2 0 0 0 2 2h2" />
			<path d="M16 4h2a2 2 0 0 1 2 2v2" />
			<path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
		</svg>
	)
}

export default IconMaximize
