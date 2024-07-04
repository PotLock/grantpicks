import React from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'

const Footer = () => {
	return (
		<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-around py-4 w-full bg-white">
			<p className="text-sm font-semibold text-grantpicks-black-600 z-10">
				BUILT BY POTLOCK
			</p>
			<div className="py-2 px-3 hidden md:flex bg-grantpicks-black-50 rounded-full items-center space-x-4 justify-between z-10">
				<p className="text-sm font-semibold text-grantpicks-black-600">
					FOLLOW US ON
				</p>
				<IconTwitter
					size={24}
					className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
				/>
				<IconTelegram
					size={24}
					className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
				/>
			</div>
			<p className="text-sm font-semibold text-grantpicks-black-600 z-10">
				INSPIRED BY COLONY.IO & DORG.TECH
			</p>
			<div className="py-2 px-3 flex md:hidden bg-grantpicks-black-50 rounded-full items-center space-x-4 justify-between z-10">
				<p className="text-sm font-semibold text-grantpicks-black-600">
					FOLLOW US ON
				</p>
				<IconTwitter
					size={24}
					className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
				/>
				<IconTelegram
					size={24}
					className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
				/>
			</div>
		</div>
	)
}

export default Footer
