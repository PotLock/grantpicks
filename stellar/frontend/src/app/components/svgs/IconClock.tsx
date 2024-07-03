import { IconProps } from '@/types/icon'
import React from 'react'

const IconClock = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 19 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/clock">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M3.5 9C3.5 5.68629 6.18629 3 9.5 3C12.8137 3 15.5 5.68629 15.5 9C15.5 12.3137 12.8137 15 9.5 15C6.18629 15 3.5 12.3137 3.5 9ZM9.5 1.5C5.35786 1.5 2 4.85786 2 9C2 13.1421 5.35786 16.5 9.5 16.5C13.6421 16.5 17 13.1421 17 9C17 4.85786 13.6421 1.5 9.5 1.5ZM10.25 5.97656C10.25 5.56235 9.91421 5.22656 9.5 5.22656C9.08579 5.22656 8.75 5.56235 8.75 5.97656V10.0078C8.75 10.2842 8.90197 10.5381 9.1455 10.6687L11.7236 12.0516C12.0886 12.2473 12.5433 12.1101 12.7391 11.7451C12.9348 11.3801 12.7976 10.9255 12.4326 10.7297L10.25 9.55901V5.97656Z"
				/>
			</g>
		</svg>
	)
}

export default IconClock
