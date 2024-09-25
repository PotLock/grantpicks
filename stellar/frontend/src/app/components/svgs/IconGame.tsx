import React from 'react'

const IconGame = () => {
	return (
		<svg
			width="88"
			height="89"
			viewBox="0 0 88 89"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<g filter="url(#filter0_ddd_2814_48210)">
				<rect
					x="20"
					y="1"
					width="48"
					height="48"
					rx="10"
					fill="url(#paint0_linear_2814_48210)"
					shape-rendering="crispEdges"
				/>
				<path
					d="M49 21.25H39C34.8581 21.25 31.5 24.6081 31.5 28.75C31.5 32.8919 34.8581 36.25 39 36.25H49C53.1419 36.25 56.5 32.8919 56.5 28.75C56.5 24.6081 53.1419 21.25 49 21.25Z"
					stroke="#F59E0B"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
				<path
					d="M39 26.25V31.25M36.5 28.75H41.5M44 20V16.0712H49V12.5"
					stroke="#F59E0B"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M49 31.25C49.663 31.25 50.2989 30.9866 50.7678 30.5178C51.2366 30.0489 51.5 29.413 51.5 28.75C51.5 28.087 51.2366 27.4511 50.7678 26.9822C50.2989 26.5134 49.663 26.25 49 26.25C48.337 26.25 47.7011 26.5134 47.2322 26.9822C46.7634 27.4511 46.5 28.087 46.5 28.75C46.5 29.413 46.7634 30.0489 47.2322 30.5178C47.7011 30.9866 48.337 31.25 49 31.25Z"
					stroke="#F59E0B"
					stroke-width="2.5"
					stroke-linejoin="round"
				/>
			</g>
			<defs>
				<filter
					id="filter0_ddd_2814_48210"
					x="0"
					y="0"
					width="88"
					height="89"
					filterUnits="userSpaceOnUse"
					color-interpolation-filters="sRGB"
				>
					<feFlood flood-opacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feMorphology
						radius="6"
						operator="erode"
						in="SourceAlpha"
						result="effect1_dropShadow_2814_48210"
					/>
					<feOffset dy="8" />
					<feGaussianBlur stdDeviation="5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.960784 0 0 0 0 0.619608 0 0 0 0 0.0431373 0 0 0 0.3 0"
					/>
					<feBlend
						mode="normal"
						in2="BackgroundImageFix"
						result="effect1_dropShadow_2814_48210"
					/>
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feMorphology
						radius="5"
						operator="erode"
						in="SourceAlpha"
						result="effect2_dropShadow_2814_48210"
					/>
					<feOffset dy="20" />
					<feGaussianBlur stdDeviation="12.5" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.960784 0 0 0 0 0.619608 0 0 0 0 0.0431373 0 0 0 0.3 0"
					/>
					<feBlend
						mode="normal"
						in2="effect1_dropShadow_2814_48210"
						result="effect2_dropShadow_2814_48210"
					/>
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feMorphology
						radius="1"
						operator="dilate"
						in="SourceAlpha"
						result="effect3_dropShadow_2814_48210"
					/>
					<feOffset />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0.984314 0 0 0 0 0.74902 0 0 0 0 0.141176 0 0 0 0.6 0"
					/>
					<feBlend
						mode="normal"
						in2="effect2_dropShadow_2814_48210"
						result="effect3_dropShadow_2814_48210"
					/>
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="effect3_dropShadow_2814_48210"
						result="shape"
					/>
				</filter>
				<linearGradient
					id="paint0_linear_2814_48210"
					x1="20"
					y1="1"
					x2="68"
					y2="49"
					gradientUnits="userSpaceOnUse"
				>
					<stop stop-color="#FEF08A" stop-opacity="0.75" />
					<stop offset="1" stop-color="#FED7AA" stop-opacity="0.75" />
				</linearGradient>
			</defs>
		</svg>
	)
}

export default IconGame
