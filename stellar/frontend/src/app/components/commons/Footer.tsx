import React from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'
import IconGithub from '../svgs/IconGithub'
import clsx from 'clsx'
import Link from 'next/link'

const Footer = ({ isWhiteBgColor = true }: { isWhiteBgColor?: boolean }) => {
	return (
		<div
			className={clsx(
				`flex flex-col md:flex-row space-y-4 md:space-y-0 items-center justify-around py-4 mt-20 md:mt-28 lg:mt-32 w-full`,
				isWhiteBgColor ? `bg-white` : `bg-transparent`,
			)}
		>
			<p className="text-sm font-semibold text-grantpicks-black-600 z-10">
				BUILT BY 🫕 <Link href={`https://potlock.org`} target="_blank">POTLOCK</Link>
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
				<Link href={`https://x.com/potlock_`} target="_blank">
					<IconTwitter
						size={24}
						className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
					/>
				</Link>
				<Link href={`https://t.me/+27V0rWUiq5liZmIx`} target="_blank">
					<IconTelegram
						size={24}
						className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
					/>
				</Link>
			</div>
			<p className="text-sm font-semibold text-grantpicks-black-600 z-10">
				INSPIRED BY <Link href={`https://news.colony.io/ideas/en/budget-box`} target="_blank">COLONY</Link> & <Link href={`https://pairdrop.daodrops.io/`} target="_blank">dORG</Link>
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
				{/* <IconGithub
					size={24}
					className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
				/> */}
			</div>
		</div>
	)
}

export default Footer
