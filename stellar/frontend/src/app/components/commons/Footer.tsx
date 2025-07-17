import React, { useState } from 'react'
import IconTwitter from '../svgs/IconTwitter'
import IconTelegram from '../svgs/IconTelegram'
import Link from 'next/link'
import Image from 'next/image'
import IconGithub from '../svgs/IconGithub'
import IconPotlock from '../svgs/IconPotlock'
import IconDorg from '../svgs/IconDorg'
import IconColony from '../svgs/IconColony'
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
		<footer className="bg-white border-t  border-gray-100">
			<div className="max-w-7xl mx-auto px-4 z-10 sm:px-6 lg:px-8 py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
					{/* Brand Section */}
					<div className="lg:col-span-1">
						<div className="flex items-center gap-x-2 mb-4">
							<Image
								src="/assets/images/grantpicks-logo-new.png"
								alt="grantpicks-logo"
								width={40}
								height={22}
							/>
							<p className="text-[#020909] font-black text-lg">GrantPicks</p>
						</div>
						<p className="text-sm text-gray-600 mb-4 max-w-xs">
							Decentralized grant funding platform built on blockchain technology.
						</p>
						<div className="flex gap-x-3">
							<Link href={`https://x.com/potlock_`} target="_blank" className="group">
								<IconTwitter
									size={20}
									className="cursor-pointer transition-colors fill-gray-400 group-hover:fill-grantpicks-black-950"
								/>
							</Link>
							<Link href={`https://t.me/+27V0rWUiq5liZmIx`} target="_blank" className="group">
								<IconTelegram
									size={20}
									className="cursor-pointer transition-colors fill-gray-400 group-hover:fill-grantpicks-black-950"
								/>
							</Link>
							<Link href={`https://github.com/potlock`} target="_blank" className="group">
								<IconGithub
									size={20}
									className="cursor-pointer transition-colors fill-gray-400 group-hover:fill-grantpicks-black-950"
								/>
							</Link>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="font-semibold text-base text-gray-900 mb-4">Quick Links</h3>
						<div className="space-y-2">
							<Link href={'/privacy-policy'} className="block" target="_blank" rel="noopener noreferrer">
								<p className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</p>
							</Link>
							<Link href={'/terms'} className="block" target="_blank" rel="noopener noreferrer">
								<p className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</p>
							</Link>
						</div>
					</div>

					{/* Built By & Inspired By */}
					<div>
						<h3 className="font-semibold text-base text-gray-900 mb-4">Built By</h3>
						<Link href={`https://www.potlock.org/`} target="_blank" className="block mb-6">
							<div className="flex items-center gap-x-2 group">
								<div className="text-lg">🫕</div>
								<IconPotlock />
							</div>
						</Link>

						<h3 className="font-semibold text-base text-gray-900 mb-4">Inspired By</h3>
						<div className="flex gap-x-4">
							<Link href={`https://pairdrop.daodrops.io/`} target="_blank" className="group">
								<IconDorg />
							</Link>
							<Link
								href={`https://uploads-ssl.webflow.com/61840fafb9a4c433c1470856/639b50ee30b729cb016806c1_BudgetingBoxes.pdf`}
								target="_blank"
								className="group"
							>
								<IconColony />
							</Link>
						</div>
					</div>

					{/* Smart Contracts */}
					{envVarConfigs.NETWORK_ENV === 'testnet' && (
						<div>
							<h3 className="font-semibold text-base text-gray-900 mb-4">Smart Contracts</h3>
							<div className="space-y-3">
								<button
									onClick={async () => {
										await navigator.clipboard.writeText(
											chains.find((chain) => chain.name === chainName)?.contract as string,
										)
										toast.success('Contract copied', {
											style: toastOptions.success.style,
										})
									}}
									className="w-full border border-gray-200 rounded-lg bg-gray-50 py-2 px-3 flex items-center gap-x-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100 transition-colors"
									disabled={
										chains.find((chain) => chain.name === chainName)?.contract ===
										'Not Audited'
									}
								>
									<div className="border border-gray-200 rounded-full p-1 flex items-center justify-center bg-white">
										{chains.find((chain) => chain.name === chainName)?.icon}
									</div>
									<p className="text-sm text-gray-900 flex-1 text-left">
										{prettyTruncate(
											chains.find((chain) => chain.name === chainName)?.contract,
											12,
											'address',
										)}
									</p>
									<IconCopy size={14} className="stroke-gray-500" />
								</button>

								<a
									href="https://github.com/PotLock/grantpicks/blob/main/VAR_PotLock_250113_GrantPicks-V3.pdf"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
								>
									<svg width="16" height="16" fill="none" viewBox="0 0 24 24">
										<path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.828A2 2 0 0 0 19.414 7.414l-4.828-4.828A2 2 0 0 0 12.172 2H6zm7 1.414L18.586 9H15a2 2 0 0 1-2-2V3.414z" stroke="currentColor" strokeWidth="1.5" />
										<text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor">AUDIT</text>
									</svg>
									Audit Report
								</a>
							</div>
						</div>
					)}
				</div>

				{/* Testnet Disclaimer */}
				{envVarConfigs.NETWORK_ENV === 'testnet' && (
					<div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
						<div className="flex items-center gap-x-3">
							<div className="flex-shrink-0">
								<svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
								</svg>
							</div>
							<div className="flex-1">
								<h4 className="text-sm font-semibold text-gray-800 mb-1">
									Reset Disclaimer
								</h4>
								<p className="text-sm text-gray-700">
									The Stellar testnet network is bound to be reset and when that is done all data will be lost in the contract including user tokens as well. Everything will be wiped.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Bottom Section */}
				<div className="mt-8 pt-8 border-t border-gray-100">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<p className="text-sm text-gray-500">
							© 2025 GrantPicks. All rights reserved.
						</p>
						<div className="flex items-center gap-x-4 text-sm text-gray-500">
							<span>Powered by</span>
							<Link href="https://www.potlock.org/" target="_blank" className="hover:text-gray-700 flex items-center gap-x-2 transition-colors">
								<div className="text-lg">🫕</div>
								Potlock
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	)
}

export default Footer
