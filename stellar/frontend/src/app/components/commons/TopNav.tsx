import React, { useState } from 'react'
import Button from './Button'
import ChooseWalletMenu from '../pages/application/ChooseWalletMenu'
import { useWallet } from '@/app/providers/WalletProvider'
import UserMenu from '../pages/application/UserMenu'
import IconExpandMore from '../svgs/IconExpandMore'
import IconExpandLess from '../svgs/IconExpandLess'
import { prettyTruncate } from '@/utils/helper'

const TopNav = () => {
	const { connectedWallet, nearAccounts, stellarPubKey } = useWallet()
	const [showMenu, setShowMenu] = useState<'choose-wallet' | 'user' | null>(
		null,
	)
	return (
		<div className="flex fixed z-20 inset-x-0 items-center justify-between px-[5vw] md:px-[10vw] xl:px-[15vw] py-4 bg-white">
			<div>
				<p className="text-xl md:text-3xl xl:text-5xl font-black text-grantpicks-black-950">
					GRANTPICKS
				</p>
			</div>
			<div className="flex items-center space-x-4">
				<Button
					onClick={() => {}}
					className="!text-sm !font-semibold"
					color="alpha-50"
				>
					EXPLORE
				</Button>
				<div className="relative">
					{!!connectedWallet ? (
						<Button
							color="transparent"
							onClick={() => setShowMenu((prev) => (!!prev ? null : 'user'))}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2 mr-6">
									<div className="bg-grantpicks-black-200 rounded-full w-10 h-10" />
									<div>
										<p className="text-sm font-semibold text-grantpicks-black-950">
											{connectedWallet === 'near'
												? nearAccounts[0]?.accountId
												: prettyTruncate(stellarPubKey, 10, 'address')}
										</p>
										<p className="text-sm font-normal text-grantpicks-black-600">
											@
											{connectedWallet === 'near'
												? nearAccounts[0]?.accountId
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
						</Button>
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
