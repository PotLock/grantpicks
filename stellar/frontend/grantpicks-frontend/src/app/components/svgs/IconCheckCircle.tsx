import { IconProps } from '@/types/icon'
import React from 'react'

const IconCheckCircle = ({ size, className }: IconProps) => {
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
				d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12ZM22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM17.7071 9.69199C18.0976 9.30146 18.0976 8.6683 17.7071 8.27777C17.3166 7.88725 16.6834 7.88725 16.2929 8.27777L10 14.5707L7.70711 12.2778C7.31658 11.8872 6.68342 11.8872 6.29289 12.2778C5.90237 12.6683 5.90237 13.3015 6.29289 13.692L9.29289 16.692C9.68342 17.0825 10.3166 17.0825 10.7071 16.692L17.7071 9.69199Z"
			/>
		</svg>
	)
}

export default IconCheckCircle
