import React from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'
import clsx from 'clsx'

const Footer = ({ isWhiteBgColor = true }: { isWhiteBgColor?: boolean }) => {
	return (
		<div
			className={clsx(
				`flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-around py-4 mt-20 md:mt-28 lg:mt-32 w-full`,
				isWhiteBgColor ? `bg-white` : `bg-transparent`,
			)}
		>
			<p className="text-sm font-semibold text-grantpicks-black-600 z-10">
				BUILT BY POTLOCK
			</p>
			<div
				className={clsx(
					`py-2 px-3 hidden md:flex rounded-full items-center space-x-4 justify-between z-10`,
					isWhiteBgColor ? `bg-grantpicks-black-50` : `bg-transparent`,
				)}
			>
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
			<div
				className={clsx(
					`py-2 px-3 flex md:hidden rounded-full items-center space-x-4 justify-between z-10`,
					isWhiteBgColor ? `bg-grantpicks-black-50` : `bg-transparent`,
				)}
			>
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
