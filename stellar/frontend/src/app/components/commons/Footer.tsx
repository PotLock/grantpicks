import React from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'
import Link from 'next/link'
import Image from 'next/image'
import IconGithub from '../svgs/IconGithub'
import IconPotlock from '../svgs/IconPotlock'
import IconDorg from '../svgs/IconDorg'
import IconColony from '../svgs/IconColony'

const Footer = () => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-16 justify-items-center py-16 w-full px-4 md:px-12 xl:px-20">
			<div className="grid gap-y-6 z-10 content-start justify-items-center md:justify-items-start">
				<div className="flex items-center gap-x-[2px]">
					<Image
						src="/assets/images/grantpicks-logo-new.png"
						alt="grantpicks-logo"
						width={46}
						height={26}
					/>
					<p className="text-[#020909] font-black text-xl">GrantPicks</p>
				</div>
				<div className="flex gap-x-3">
					<Link href={`https://x.com/potlock_`} target="_blank">
						<IconTwitter
							size={20}
							className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
						/>
					</Link>
					<Link href={`https://t.me/+27V0rWUiq5liZmIx`} target="_blank">
						<IconTelegram
							size={20}
							className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
						/>
					</Link>
					<Link href={`https://github.com/potlock`} target="_blank">
						<IconGithub
							size={20}
							className="cursor-pointer hover:opacity-80 transition fill-grantpicks-black-400"
						/>
					</Link>
				</div>
			</div>
			<div className="z-10 grid content-start justify-items-center md:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">About</p>
				<div className="grid gap-y-[14px] justify-items-center md:justify-items-start">
					<Link href={'https://www.potlock.org/privacy'} target="_blank">
						<p className="text-xl text-[#737373]">Privacy</p>
					</Link>
					<Link href={'https://www.potlock.org/license'} target="_blank">
						<p className="text-xl text-[#737373]">Terms of service</p>
					</Link>
				</div>
			</div>
			<div className="z-10 grid content-start justify-items-center md:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">Built By</p>
				<div className="flex items-center gap-x-2">
					<div className="text-xl">🫕</div> <IconPotlock />
				</div>
			</div>
			<div className="z-10 grid content-start justify-items-center md:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">Inspired By</p>
				<div className="flex gap-x-6">
					<IconDorg />
					<IconColony />
				</div>
			</div>
		</div>
	)
}

export default Footer
