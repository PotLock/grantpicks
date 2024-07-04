import { IconProps } from '@/types/icon'
import React from 'react'

const IconUser = ({ size, className }: IconProps) => {
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
				d="M9.5 6.5C9.5 5.11929 10.6193 4 12 4C13.3807 4 14.5 5.11929 14.5 6.5C14.5 7.88071 13.3807 9 12 9C10.6193 9 9.5 7.88071 9.5 6.5ZM12 2C9.51472 2 7.5 4.01472 7.5 6.5C7.5 8.98528 9.51472 11 12 11C14.4853 11 16.5 8.98528 16.5 6.5C16.5 4.01472 14.4853 2 12 2ZM12 12C7.58172 12 4 15.5817 4 20V21C4 21.5523 4.44772 22 5 22H19C19.5523 22 20 21.5523 20 21V20C20 15.5817 16.4183 12 12 12ZM6 20C6 16.6863 8.68629 14 12 14C15.3137 14 18 16.6863 18 20H6Z"
			/>
		</svg>
	)
}

export default IconUser
