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
import { envVarConfigs } from '@/configs/env-var'

const Footer = () => {
	const [chainSelect, setChainSelect] = useState<boolean>(false)
	const [chainName, setChainName] = useState<string>('Stellar')

	const chains = [
		{
			name: 'Stellar',
			icon: <IconStellar size={16} className="fill-grantpicks-black-950" />,
			contract: envVarConfigs.ROUND_CONTRACT_ID,
		},
		{
			name: 'Near',
			icon: <IconNear size={16} className="fill-grantpicks-black-950" />,
			contract: 'v2.grantpicks.potlock.near',
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
					<button
						onClick={async () => {
							await navigator.clipboard.writeText(
								chains.find((chain) => chain.name === chainName)?.contract as string,
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

					<a
						href="https://github.com/PotLock/grantpicks/blob/main/VAR_PotLock_250113_GrantPicks-V3.pdf"
						target="_blank"
						rel="noopener noreferrer"
						className="mt-2 flex items-center justify-center gap-x-2 text-grantpicks-black-950 font-medium hover:underline"
					>
						<svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z" stroke="#000" strokeWidth="1.5" /><text x="12" y="16" textAnchor="middle" fontSize="8" fill="#000">AUDIT</text></svg>
						Audit Report
					</a>

				</div>
			</div>
		</div>
	)
}

export default Footer
