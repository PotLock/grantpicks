import { IconProps } from '@/types/icon'
import React from 'react'

const IconSearch = ({ size, className, onClick, color }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill={color}
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			onClick={onClick}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M17 10.5C17 14.0899 14.0899 17 10.5 17C6.91015 17 4 14.0899 4 10.5C4 6.91015 6.91015 4 10.5 4C14.0899 4 17 6.91015 17 10.5ZM15.6402 17.2702C14.2128 18.3557 12.4316 19 10.5 19C5.80558 19 2 15.1944 2 10.5C2 5.80558 5.80558 2 10.5 2C15.1944 2 19 5.80558 19 10.5C19 12.542 18.2799 14.4159 17.0799 15.8814L21.5211 20.3226C21.9116 20.7132 21.9116 21.3463 21.5211 21.7369C21.1306 22.1274 20.4974 22.1274 20.1069 21.7369L15.6402 17.2702Z"
			/>
		</svg>
	)
}

export default IconSearch
