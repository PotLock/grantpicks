import React, { useState } from 'react'
import Button from './Button'
import ChooseWalletMenu from '../pages/application/ChooseWalletMenu'
import { useWallet } from '@/app/providers/WalletProvider'
import UserMenu from '../pages/application/UserMenu'
import IconExpandMore from '../svgs/IconExpandMore'
import IconExpandLess from '../svgs/IconExpandLess'
import { formatNearAddress, prettyTruncate } from '@/utils/helper'
import { useRouter } from 'next/navigation'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import Image from 'next/image'

// Add a simple hamburger icon
const HamburgerIcon = ({ open }: { open: boolean }) => (
	<div className="flex flex-col justify-center items-center w-8 h-8 cursor-pointer">
		<span className={`block h-0.5 w-6 bg-black rounded transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
		<span className={`block h-0.5 w-6 bg-black rounded my-1 transition-all duration-200 ${open ? 'opacity-0' : ''}`}></span>
		<span className={`block h-0.5 w-6 bg-black rounded transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
	</div>
)

const TopNav = () => {
	const { connectedWallet, nearAccounts, stellarPubKey, profileData } =
		useWallet()
	const { showMenu, setShowMenu } = useGlobalContext()
	const [navOpen, setNavOpen] = useState(false)
	const router = useRouter()

	// Close nav dropdown on route change
	const handleNavClick = (path: string) => {
		setNavOpen(false)
		router.push(path)
	}

	return (
		<div className="flex fixed z-20 inset-x-0 items-center justify-between px-3 sm:px-[5vw] md:px-[10vw] xl:px-[15vw] py-3 sm:py-4 bg-white">
			{/* Mobile Hamburger - now first */}
			<div className="flex sm:hidden items-center mr-2">
				<button onClick={() => setNavOpen((prev) => !prev)} aria-label="Open navigation menu">
					<HamburgerIcon open={navOpen} />
				</button>
				{/* Dropdown menu */}
				{navOpen && (
					<div className="absolute top-16 left-0 w-full bg-white shadow-lg rounded-b-xl flex flex-col items-center py-2 animate-fade-in z-30">
						<button
							className="w-full text-left px-6 py-3 text-base font-bold text-grantpicks-black-950 hover:bg-gray-100"
							onClick={() => handleNavClick('/lists')}
						>
							LISTS
						</button>
						<button
							className="w-full text-left px-6 py-3 text-base font-bold text-grantpicks-black-950 hover:bg-gray-100"
							onClick={() => handleNavClick('/rounds')}
						>
							ROUNDS
						</button>
					</div>
				)}
			</div>
			{/* Logo and GrantPicks text */}
			<button
				onClick={() => router.push(`/rounds`)}
				className="flex items-center gap-x-[2px] px-2 sm:px-[10px]"
			>
				<Image
					src="/assets/images/grantpicks-logo-new.png"
					alt="grantpicks-logo"
					width={40}
					height={22}
					className="sm:w-[46px] sm:h-[26px]"
				/>
				<p className="text-sm sm:text-base md:text-lg xl:text-xl font-black text-grantpicks-black-950">
					GrantPicks
				</p>
			</button>
			{/* Desktop Nav */}
			<div className="hidden sm:flex items-center gap-x-2 sm:gap-x-4">
				<p className="text-xs sm:text-sm md:text-base font-bold hover:underline text-grantpicks-black-950 cursor-pointer" onClick={() => router.push(`/lists`)}>
					LISTS
				</p>
				<p className="text-xs sm:text-sm md:text-base font-bold hover:underline text-grantpicks-black-950 cursor-pointer" onClick={() => router.push(`/rounds`)}>
					ROUNDS
				</p>
			</div>
			{/* User/Wallet section */}
			<div className="flex items-center space-x-2 sm:space-x-4">
				<div className="relative">
					{!!connectedWallet ? (
						<button
							onClick={() => setShowMenu((prev) => (!!prev ? null : 'user'))}
							className="flex items-center"
						>
							<div className="sm:pr-2">
								<Image
									src={
										connectedWallet === 'near'
											? `https://www.tapback.co/api/avatar/${nearAccounts[0]?.accountId}`
											: `https://www.tapback.co/api/avatar/${stellarPubKey}`
									}
									alt="image"
									width={32}
									height={32}
									className="sm:w-10 sm:h-10"
								/>
							</div>
							<div className="items-center justify-between hidden sm:flex">
								<div className="flex items-center mr-4 lg:mr-6">
									<div>
										<p className="text-xs lg:text-sm font-semibold text-grantpicks-black-950">
											{connectedWallet === 'near'
												? profileData?.near_social_profile_data?.name ||
												formatNearAddress(nearAccounts[0]?.accountId)
												: prettyTruncate(stellarPubKey, 10, 'address')}
										</p>
										<p className="text-xs lg:text-sm font-normal text-grantpicks-black-600">
											@
											{connectedWallet === 'near'
												? formatNearAddress(nearAccounts[0]?.accountId)
												: prettyTruncate(stellarPubKey, 10, 'address')}
										</p>
									</div>
								</div>
								{!!showMenu ? (
									<IconExpandLess
										size={18}
										className="stroke-grantpicks-black-400 sm:w-5 sm:h-5"
									/>
								) : (
									<IconExpandMore
										size={18}
										className="stroke-grantpicks-black-400 sm:w-5 sm:h-5"
									/>
								)}
							</div>
						</button>
					) : (
						<Button
							onClick={() =>
								setShowMenu(!!connectedWallet ? 'user' : 'choose-wallet')
							}
							className="!text-xs sm:!text-sm !font-semibold !px-3 sm:!px-4 !py-2"
							color="black-950"
						>
							CONNECT WALLET
						</Button>
					)}
					<UserMenu
						isOpen={showMenu === 'user'}
						onShowChooseWallet={() => setShowMenu('choose-wallet')}
						onCloseChooseWalletMenu={() => setShowMenu(null)}
						onClose={() => setShowMenu(null)}
					/>
					<ChooseWalletMenu
						isOpen={showMenu === 'choose-wallet'}
						isConnected={!!connectedWallet}
						onClose={() => setShowMenu(null)}
						onBack={() => setShowMenu('user')}
					/>
				</div>
			</div>
		</div>
	)
}

export default TopNav
