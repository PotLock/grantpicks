import { IconProps } from '@/types/icon'
import React from 'react'

const IconTwitter = ({ size, className, onClick }: IconProps) => {
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
				d="M21 20.5375L13.9609 10.2776L13.9729 10.2872L20.3197 2.93359H18.1988L13.0285 8.91892L8.92262 2.93359H3.36015L9.93187 12.5125L9.93108 12.5117L3 20.5375H5.12094L10.8691 13.8784L15.4375 20.5375H21ZM8.08225 4.53394L17.9586 18.9372H16.2779L6.39353 4.53394H8.08225Z"
				fill="currentColor"
			/>
		</svg>
	)
}

export default IconTwitter
