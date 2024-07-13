import { IconProps } from '@/types/icon'
import React from 'react'

const IconCloseFilled = ({ size, className, onClick }: IconProps) => {
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
				d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM15.1819 8.81801C14.7914 8.42748 14.1582 8.42748 13.7677 8.81801L12 10.5858L10.2322 8.81801C9.84168 8.42748 9.20851 8.42748 8.81799 8.81801C8.42746 9.20853 8.42746 9.8417 8.81799 10.2322L10.5858 12L8.81798 13.7678C8.42745 14.1583 8.42745 14.7914 8.81798 15.182C9.2085 15.5725 9.84167 15.5725 10.2322 15.182L12 13.4142L13.7677 15.182C14.1583 15.5725 14.7914 15.5725 15.1819 15.182C15.5725 14.7914 15.5725 14.1583 15.1819 13.7678L13.4142 12L15.1819 10.2322C15.5725 9.8417 15.5725 9.20853 15.1819 8.81801Z"
			/>
		</svg>
	)
}

export default IconCloseFilled
