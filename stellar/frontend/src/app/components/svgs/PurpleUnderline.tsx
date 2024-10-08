import React from 'react'

const PurpleUnderline = ({ className }: { className?: string }) => {
	return (
		<svg
			viewBox="0 0 255 12"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`${className}`}
		>
			<path
				d="M254.394 5.7514C254.89 3.49714 249.584 3.88836 247.888 3.31071C227.922 0.610486 191.213 0.122244 170.982 0.10873C154.634 0.148753 138.293 -0.208852 121.946 0.192067C109.886 0.266395 97.8676 1.26003 85.809 1.47123C60.4142 2.40509 34.8911 3.33393 9.83097 7.04997C7.24127 7.6193 4.46252 7.78718 2.00654 8.67877C-4.17785 12.6608 7.68707 12.1699 10.2787 11.6647C85.3029 3.39977 86.3112 3.64961 143.673 2.83373C169.04 2.3992 194.371 3.98729 233.449 6.16774C234.443 6.23774 235.331 5.46916 235.126 4.64515C238.959 4.9211 242.782 5.2896 246.589 5.75019C248.567 6.0695 250.554 6.37097 252.518 6.74278C253.358 6.88815 254.199 6.44513 254.394 5.75313V5.7514Z"
				fill="url(#paint0_radial_2831_16782)"
			/>
			<defs>
				<radialGradient
					id="paint0_radial_2831_16782"
					cx="0"
					cy="0"
					r="1"
					gradientUnits="userSpaceOnUse"
					gradientTransform="translate(133.815) rotate(90) scale(16.223 212.967)"
				>
					<stop stopColor="#7B3AED" />
					<stop offset="0.996031" stopColor="#5A21B6" />
				</radialGradient>
			</defs>
		</svg>
	)
}

export default PurpleUnderline
