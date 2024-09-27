import { IconProps } from '@/types/icon'
import React from 'react'

const IconBurger = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			className={className}
			onClick={onClick}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
			/>
		</svg>
	)
}

export default IconBurger
