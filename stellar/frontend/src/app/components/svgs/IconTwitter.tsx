import { IconProps } from '@/types/icon'
import React from 'react'

const IconTwitter = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/twitter">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M21.1009 3H18.9999H17.9999H17.5239L17.2238 3.36941L12.9176 8.66938L9.57485 3.45995L9.27971 3H8.73321H4.99988H3.17005L4.15824 4.54005L9.50385 12.8709L4.22378 19.3694L2.89893 21H4.9999H5.9999H6.47587L6.77601 20.6306L11.0822 15.3307L14.4249 20.54L14.72 21H15.2665H18.9999H20.8297L19.8415 19.46L14.4959 11.1292L19.776 4.63059L21.1009 3ZM15.813 19L6.82971 5H8.18671L17.17 19H15.813Z"
				/>
			</g>
		</svg>
	)
}

export default IconTwitter
