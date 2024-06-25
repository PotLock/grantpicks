import { IconProps } from '@/types/icon'
import React from 'react'

const IconStellar = ({ size, className }: IconProps) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path d="M21.4674 8.1641V9.79308L20.7784 10.1435C20.2552 10.4104 19.9435 10.9649 19.9877 11.5501C20.003 11.7533 20.011 11.9589 20.011 12.1645C20.01 15.1722 18.3202 17.9252 15.637 19.2907C12.9537 20.6562 9.73041 20.4034 7.29344 18.6364L8.70819 17.9163L8.7883 17.8739C10.8186 19.0109 13.3003 18.9879 15.3091 17.8135C17.318 16.6391 18.5531 14.4893 18.5546 12.1645C18.5545 11.8767 18.5357 11.5891 18.4985 11.3036L7.47769 16.9122L5.19775 18.0724L2.53247 19.4285V17.7955L5.21617 16.4298L6.52037 15.7649L21.4674 8.1641ZM8.36092 5.03595C11.0442 3.66952 14.2681 3.92169 16.7056 5.68864L16.5109 5.78785L15.2059 6.45192C13.1761 5.31972 10.6978 5.34537 8.69193 6.51934C6.68604 7.69332 5.45236 9.84015 5.44929 12.1621C5.44941 12.4481 5.46814 12.7338 5.50537 13.0174L16.515 7.41682L18.7949 6.2567L21.4674 4.89496V6.52873L18.7717 7.90088L17.4675 8.56415L5.86106 14.4704L5.21457 14.7992L4.55846 15.1336L2.53247 16.165V14.5304L3.22062 14.1799C3.74434 13.9134 4.05647 13.3588 4.01211 12.7734C3.99662 12.5712 3.98888 12.3683 3.98888 12.1645C3.98857 9.15644 5.67767 6.40237 8.36092 5.03595Z" />
		</svg>
	)
}

export default IconStellar
