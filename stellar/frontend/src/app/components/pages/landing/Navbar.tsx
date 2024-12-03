import Image from 'next/image'
import React, { useState } from 'react'
import IconRocket from '../../svgs/IconRocket'
import { useRouter } from 'next/navigation'
import Button from '../../commons/Button'
import IconBurger from '../../svgs/IconBurger'
import IconClose from '../../svgs/IconClose'
import { envVarConfigs } from '@/configs/env-var'
import clsx from 'clsx'

const Navbar = ({ isBannerVisible }: { isBannerVisible: boolean }) => {
	const router = useRouter()
	const [showMenu, setShowMenu] = useState<boolean>(false)

	const scrollToSection = (sectionId: string) => {
		const section = document.getElementById(sectionId)
		if (section) {
			section.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<div
			className={clsx(
				'flex py-5 z-20 fixed inset-x-0 items-center justify-between px-4 md:px-12 xl:px-20 bg-white bg-opacity-30 backdrop-blur-3xl shadow-md',
				isBannerVisible ? 'mt-[60px] sm:mt-[44px]' : 'mt-0',
			)}
		>
			<div className="flex items-center relative">
				<button
					onClick={() => setShowMenu(!showMenu)}
					className="flex lg:hidden"
				>
					{showMenu ? (
						<IconClose size={28} className="fill-black" />
					) : (
						<IconBurger size={28} className="stroke-black" />
					)}
				</button>
				{showMenu && (
					<div className="absolute top-10 left-0 lg:hidden">
						<div className="grid gap-y-3 text-[#202237] font-medium text-sm gap-x-[6px] border border-grantpicks-purple-500/20 h-full rounded-xl p-4 bg-[#EEF2FE]">
							<button
								className="px-3"
								onClick={() => {
									scrollToSection('home')
									setShowMenu(false)
								}}
							>
								Home
							</button>
							<button
								className="px-3"
								onClick={() => {
									scrollToSection('how-it-works')
									setShowMenu(false)
								}}
							>
								How it Works
							</button>
							<button
								className="px-3"
								onClick={() => {
									scrollToSection('features')
									setShowMenu(false)
								}}
							>
								Features
							</button>
							<button
								className="px-3"
								onClick={() => {
									scrollToSection('faqs')
									setShowMenu(false)
								}}
							>
								FAQs
							</button>
						</div>
					</div>
				)}
				<button
					onClick={() => {
						router.push('/')
					}}
					className="flex items-center gap-x-[2px] px-[10px]"
				>
					<Image
						src="/assets/images/grantpicks-logo-new.png"
						alt="grantpicks-logo"
						width={46}
						height={26}
					/>
					<p className="text-[#020909] font-black text-xl">GrantPicks</p>
				</button>
			</div>
			<div className="hidden lg:flex text-[#202237] font-medium gap-x-[6px] border border-grantpicks-purple-500/20 h-full rounded-full px-7 bg-[#EEF2FE]">
				<button
					className="px-3 py-[10.5px]"
					onClick={() => scrollToSection('home')}
				>
					Home
				</button>
				<button
					className="px-3 py-[10.5px]"
					onClick={() => scrollToSection('how-it-works')}
				>
					How it Works
				</button>
				<button
					className="px-3 py-[10.5px]"
					onClick={() => scrollToSection('features')}
				>
					Features
				</button>
				<button
					className="px-3 py-[10.5px]"
					onClick={() => scrollToSection('faqs')}
				>
					FAQs
				</button>
			</div>
			<Button
				color="purple"
				icon={<IconRocket size={18} className="fill-white hidden sm:block" />}
				iconPosition="right"
				className="h-12 sm:px-7"
				onClick={() => {
					router.push('/rounds')
				}}
				isDisabled={envVarConfigs.NETWORK_ENV !== 'testnet'}
			>
				{envVarConfigs.NETWORK_ENV === 'testnet' ? 'Launch App' : 'Coming Soon'}
			</Button>
		</div>
	)
}

export default Navbar
