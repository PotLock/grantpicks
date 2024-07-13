import { IconProps } from '@/types/icon'
import React from 'react'

const IconVideo = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g id="Icon/video">
				<path
					id="Union"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M5 6C3.34315 6 2 7.34315 2 9V15C2 16.6569 3.34315 18 5 18H14C15.4994 18 16.742 16.8999 16.9645 15.4628L20.6286 16.9285C20.9367 17.0517 21.2859 17.0141 21.5606 16.8281C21.8354 16.642 22 16.3318 22 16V8C22 7.66818 21.8354 7.35796 21.5606 7.17193C21.2859 6.9859 20.9367 6.94829 20.6286 7.07152L16.9645 8.53716C16.742 7.10006 15.4994 6 14 6H5ZM17 10.677V13.323L20 14.523V9.47703L17 10.677ZM15 10V9C15 8.44772 14.5523 8 14 8H5C4.44772 8 4 8.44772 4 9V15C4 15.5523 4.44772 16 5 16H14C14.5523 16 15 15.5523 15 15V14V10Z"
				/>
			</g>
		</svg>
	)
}

export default IconVideo
