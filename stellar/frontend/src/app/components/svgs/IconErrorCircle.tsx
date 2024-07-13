import { IconProps } from '@/types/icon'
import React from 'react'

const IconErrorCircle = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/error_circle">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M9 15C12.3137 15 15 12.3137 15 9C15 5.68629 12.3137 3 9 3C5.68629 3 3 5.68629 3 9C3 12.3137 5.68629 15 9 15ZM9 16.5C13.1421 16.5 16.5 13.1421 16.5 9C16.5 4.85786 13.1421 1.5 9 1.5C4.85786 1.5 1.5 4.85786 1.5 9C1.5 13.1421 4.85786 16.5 9 16.5ZM9 4.5C9.41421 4.5 9.75 4.83579 9.75 5.25V9.75C9.75 10.1642 9.41421 10.5 9 10.5C8.58579 10.5 8.25 10.1642 8.25 9.75V5.25C8.25 4.83579 8.58579 4.5 9 4.5ZM9 13.5C9.41421 13.5 9.75 13.1642 9.75 12.75C9.75 12.3358 9.41421 12 9 12C8.58579 12 8.25 12.3358 8.25 12.75C8.25 13.1642 8.58579 13.5 9 13.5Z"
				/>
			</g>
		</svg>
	)
}

export default IconErrorCircle
