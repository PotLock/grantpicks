import React, { useState } from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'
import Link from 'next/link'
import Image from 'next/image'
import IconGithub from '../svgs/IconGithub'
import IconPotlock from '../svgs/IconPotlock'
import IconDorg from '../svgs/IconDorg'
import IconColony from '../svgs/IconColony'
import Menu from './Menu'
import IconExpandLess from '../svgs/IconExpandLess'
import IconExpandMore from '../svgs/IconExpandMore'
import clsx from 'clsx'
import IconNear from '../svgs/IconNear'
import IconStellar from '../svgs/IconStellar'
import IconCopy from '../svgs/IconCopy'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { prettyTruncate } from '@/utils/helper'

const Footer = () => {
	const [chainSelect, setChainSelect] = useState<boolean>(false)
	const [chainName, setChainName] = useState<string>('Near')

	const chains = [
		{
			name: 'Near',
			icon: <IconNear size={16} className="fill-grantpicks-black-950" />,
			contract: 'v2.grantpicks.potlock.near',
		},
		{
			name: 'Stellar',
			icon: <IconStellar size={16} className="fill-grantpicks-black-950" />,
			contract: 'Not Audited',
		},
	]

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-16 justify-items-center py-20 px-4 md:px-12 xl:px-20 lg:justify-items-start">
			<div className="grid gap-y-6 z-10 content-start justify-items-center lg:justify-items-start">
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
			<div className="z-10 grid content-start justify-items-center lg:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">About</p>
				<div className="grid gap-y-[14px] justify-items-center lg:justify-items-start">
					<Link href={'https://www.potlock.org/privacy'} target="_blank">
						<p className="text-xl text-[#737373]">Privacy</p>
					</Link>
					<Link href={'https://www.potlock.org/license'} target="_blank">
						<p className="text-xl text-[#737373]">Terms of service</p>
					</Link>
				</div>
			</div>
			<div className="z-10 grid content-start justify-items-center lg:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">Built By</p>
				<Link href={`https://www.potlock.org/`} target="_blank">
					<div className="flex items-center gap-x-2">
						<div className="text-xl">🫕</div> <IconPotlock />
					</div>
				</Link>
			</div>
			<div className="z-10 grid content-start justify-items-center lg:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">Inspired By</p>
				<div className="flex gap-x-6">
					<Link href={`https://pairdrop.daodrops.io/`} target="_blank">
						<IconDorg />
					</Link>
					<Link
						href={`https://uploads-ssl.webflow.com/61840fafb9a4c433c1470856/639b50ee30b729cb016806c1_BudgetingBoxes.pdf`}
						target="_blank"
					>
						<IconColony />
					</Link>
				</div>
			</div>
			<div className="z-10 grid content-start justify-items-center lg:justify-items-start gap-y-[14px]">
				<p className="font-semibold text-xl text-[#171717]">Smart Contracts</p>
				<div className="grid gap-y-[14px] justify-items-center lg:justify-items-start">
					<div className="grid grid-cols-2 items-center">
						<p className="text-grantpicks-purple-800 font-bold text-sm">
							{chainName}
						</p>
						<div className="relative">
							<div
								onClick={() => setChainSelect(true)}
								className="border bg-white border-grantpicks-black-200 px-1 py-0.5 h-full w-fit rounded-[4px] flex items-center justify-between cursor-pointer hover:opacity-80 transition"
							>
								<p className="text-xs font-normal text-grantpicks-black-950">
									More
								</p>
								{chainSelect ? (
									<IconExpandLess
										size={20}
										className="stroke-grantpicks-black-400"
									/>
								) : (
									<IconExpandMore
										size={20}
										className="stroke-grantpicks-black-400"
									/>
								)}
							</div>
							<Menu
								isOpen={chainSelect}
								onClose={() => setChainSelect(false)}
								position="right-0 -bottom-[105px]"
							>
								<div className="border border-black/10 rounded-lg py-3 px-4 grid gap-y-2 bg-white">
									{chains.map((chain) => (
										<button
											key={chain.name}
											onClick={() => {
												setChainName(chain.name)
												setChainSelect(false)
											}}
											className={clsx(
												'rounded-md py-1 px-2 flex items-center gap-x-2',
												chainName === chain.name
													? 'bg-[#1E1E1E] text-white'
													: 'bg-white text-grantpicks-black-950',
											)}
										>
											<div className="border border-black/10 rounded-full p-1 flex items-center justify-center bg-white">
												{chain.icon}
											</div>
											<p>{chain.name}</p>
										</button>
									))}
								</div>
							</Menu>
						</div>
					</div>
					<button
						onClick={async () => {
							await navigator.clipboard.writeText(
								chains.find((chain) => chain.name === chainName)
									?.contract as string,
							)
							toast.success('Contract copied', {
								style: toastOptions.success.style,
							})
						}}
						className="border border-black/10 rounded-full bg-white py-1 px-2 flex items-center gap-x-2 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={
							chains.find((chain) => chain.name === chainName)?.contract ===
							'Not Audited'
						}
					>
						<div className="border border-black/10 rounded-full p-1 flex items-center justify-center bg-white">
							{chains.find((chain) => chain.name === chainName)?.icon}
						</div>
						<p className="text-grantpicks-black-950">
							{prettyTruncate(
								chains.find((chain) => chain.name === chainName)?.contract,
								11,
								'address',
							)}
						</p>
						<IconCopy size={14} className="stroke-grantpicks-black-600" />
					</button>
				</div>
			</div>
		</div>
	)
}

export default Footer
