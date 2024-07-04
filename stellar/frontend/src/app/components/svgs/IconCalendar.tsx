import { IconProps } from '@/types/icon'
import React from 'react'

const IconCalendar = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/calendar">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M9 3C9 2.44772 8.55228 2 8 2C7.44772 2 7 2.44772 7 3V5H5C3.34315 5 2 6.34315 2 8V13V17V19C2 20.6569 3.34315 22 5 22H19C20.6569 22 22 20.6569 22 19V17V13V8C22 6.34315 20.6569 5 19 5H17V3C17 2.44772 16.5523 2 16 2C15.4477 2 15 2.44772 15 3V5H9V3ZM20 10.1707V8C20 7.44772 19.5523 7 19 7H16H8H5C4.44772 7 4 7.44772 4 8V10.1707C4.31278 10.0602 4.64936 10 5 10H19C19.3506 10 19.6872 10.0602 20 10.1707ZM4 13V17V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V17V13C20 12.4477 19.5523 12 19 12H5C4.44772 12 4 12.4477 4 13Z"
				/>
			</g>
		</svg>
	)
}

export default IconCalendar
