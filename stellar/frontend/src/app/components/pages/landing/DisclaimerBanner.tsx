import React from 'react'
import IconClose from '../../svgs/IconClose'

const DisclaimerBanner = ({
	isBannerVisible,
	setIsBannerVisible,
}: {
	isBannerVisible: boolean
	setIsBannerVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
	if (!isBannerVisible) return null

	return (
		<div className="flex py-[14px] z-30 fixed inset-x-0 items-center px-4 md:px-12 xl:px-20 bg-purple-600">
			<div className="flex items-center justify-center w-full">
				<p className="text-white text-xs text-center">
					<span className="font-bold">Disclaimer:</span> Please Note the smart
					contract has not undergone an audit. We advise exercising caution with
					any transactions.
				</p>
			</div>
			<button
				className="text-white absolute right-6"
				onClick={() => setIsBannerVisible(false)}
			>
				<IconClose size={16} className="fill-white" />
			</button>
		</div>
	)
}

export default DisclaimerBanner
