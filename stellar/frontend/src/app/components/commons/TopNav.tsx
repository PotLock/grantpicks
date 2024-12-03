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

const TopNav = () => {
	const { connectedWallet, nearAccounts, stellarPubKey, profileData } =
		useWallet()
	const { showMenu, setShowMenu } = useGlobalContext()

	const router = useRouter()

	return (
		<div className="flex fixed z-20 inset-x-0 items-center justify-between px-[5vw] md:px-[10vw] xl:px-[15vw] py-4 bg-white">
			<div
				className="cursor-pointer transition"
				onClick={() => router.push(`/rounds`)}
			>
				<p className="text-base md:text-lg xl:text-xl font-black text-grantpicks-black-950">
					GRANTPICKS
				</p>
			</div>
			<div className="flex items-center space-x-4">
				<Button
					onClick={() => router.push(`/rounds`)}
					className="!text-sm !font-semibold"
					color="alpha-50"
				>
					EXPLORE
				</Button>
				<div className="relative">
					{!!connectedWallet ? (
						<button
							onClick={() => setShowMenu((prev) => (!!prev ? null : 'user'))}
							className="flex"
						>
							<div className="md:pr-2">
								<Image
									src={
										connectedWallet === 'near'
											? // profileData?.near_social_profile_data?.image.nft
												// 		.media ||
												`https://www.tapback.co/api/avatar/${nearAccounts[0]?.accountId}`
											: `https://www.tapback.co/api/avatar/${stellarPubKey}`
									}
									alt="image"
									width={40}
									height={40}
								/>
							</div>
							<div className="items-center justify-between hidden md:flex">
								<div className="flex items-center mr-6">
									<div>
										<p className="text-sm font-semibold text-grantpicks-black-950">
											{connectedWallet === 'near'
												? profileData?.near_social_profile_data?.name ||
													formatNearAddress(nearAccounts[0]?.accountId)
												: prettyTruncate(stellarPubKey, 10, 'address')}
										</p>
										<p className="text-sm font-normal text-grantpicks-black-600">
											@
											{connectedWallet === 'near'
												? formatNearAddress(nearAccounts[0]?.accountId)
												: prettyTruncate(stellarPubKey, 10, 'address')}
										</p>
									</div>
								</div>
								{!!showMenu ? (
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
						</button>
					) : (
						<Button
							onClick={() =>
								setShowMenu(!!connectedWallet ? 'user' : 'choose-wallet')
							}
							className="!text-sm !font-semibold"
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
