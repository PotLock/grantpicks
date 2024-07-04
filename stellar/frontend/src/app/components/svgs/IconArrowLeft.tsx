import { IconProps } from '@/types/icon'
import React from 'react'

const IconArrowLeft = ({ size, className, onClick }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			onClick={onClick}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M9.29289 7.29289C9.68342 6.90237 10.3166 6.90237 10.7071 7.29289C11.0976 7.68342 11.0976 8.31658 10.7071 8.70711L8.41421 11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H8.41421L10.7071 15.2929C11.0976 15.6834 11.0976 16.3166 10.7071 16.7071C10.3166 17.0976 9.68342 17.0976 9.29289 16.7071L5.29289 12.7071C4.90237 12.3166 4.90237 11.6834 5.29289 11.2929L9.29289 7.29289Z"
			/>
		</svg>
	)
}

export default IconArrowLeft
