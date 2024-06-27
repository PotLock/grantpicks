import { IconProps } from '@/types/icon'
import React from 'react'

const IconArrowRight = ({ size, className }: IconProps) => {
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
				fillRule="evenodd"
				clipRule="evenodd"
				d="M14.7071 7.29289C14.3166 6.90237 13.6834 6.90237 13.2929 7.29289C12.9024 7.68342 12.9024 8.31658 13.2929 8.70711L15.5858 11H6C5.44772 11 5 11.4477 5 12C5 12.5523 5.44772 13 6 13H15.5858L13.2929 15.2929C12.9024 15.6834 12.9024 16.3166 13.2929 16.7071C13.6834 17.0976 14.3166 17.0976 14.7071 16.7071L18.7071 12.7071C19.0976 12.3166 19.0976 11.6834 18.7071 11.2929L14.7071 7.29289Z"
			/>
		</svg>
	)
}

export default IconArrowRight
