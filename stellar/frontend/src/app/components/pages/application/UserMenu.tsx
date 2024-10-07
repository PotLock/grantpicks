import { useWallet } from '@/app/providers/WalletProvider'
import React from 'react'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import Button from '../../commons/Button'
import IconCube from '../../svgs/IconCube'
import IconProject from '../../svgs/IconProject'
import IconCheckCircle from '../../svgs/IconCheckCircle'
import { prettyTruncate } from '@/utils/helper'
import Menu from '../../commons/Menu'
import { useRouter } from 'next/navigation'
import IconCopy from '../../svgs/IconCopy'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import IconLogout from '../../svgs/IconLogout'
import Image from 'next/image'

const UserMenu = ({
	onShowChooseWallet,
	onCloseChooseWalletMenu,
	onClose,
	isOpen,
}: {
	isOpen: boolean
	onShowChooseWallet: () => void
	onCloseChooseWalletMenu: () => void
	onClose: () => void
}) => {
	const router = useRouter()
	const { connectedWallet, nearAccounts, onSignOut, stellarPubKey } =
		useWallet()
	return (
		<Menu isOpen={isOpen} onClose={onClose} position={`right-0 -bottom-72`}>
			<div className="p-4 rounded-t-2xl md:rounded-2xl bg-white shadow-xl border border-grantpicks-black-200 min-w-[320px]">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center space-x-2">
						<Image
							src={`https://www.tapback.co/api/avatar/${
								connectedWallet === 'near'
									? nearAccounts[0]?.accountId
									: stellarPubKey
							}`}
							alt="image"
							width={40}
							height={40}
						/>
						<div>
							<div className="flex items-center space-x-2">
								<p className="text-sm font-semibold text-grantpicks-black-950">
									{connectedWallet === 'near'
										? nearAccounts[0]?.accountId
										: prettyTruncate(stellarPubKey, 10, 'address')}
								</p>
								<IconCopy
									size={16}
									className="stroke-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
									onClick={async () => {
										await navigator.clipboard.writeText(
											connectedWallet === 'near'
												? nearAccounts[0]?.accountId
												: stellarPubKey,
										)
										toast.success('Addess is copied', {
											style: toastOptions.success.style,
										})
									}}
								/>
							</div>
							<p className="text-sm font-normal text-grantpicks-black-600">
								@
								{connectedWallet === 'near'
									? nearAccounts[0]?.accountId
									: prettyTruncate(stellarPubKey, 10, 'address')}
							</p>
						</div>
					</div>
					<div>
						<div className="rounded-full border border-grantpicks-black-200/10 p-1">
							<div className="bg-black p-1 rounded-full flex items-center justify-center">
								{connectedWallet === 'near' ? (
									<IconNear size={16} className="fill-white" />
								) : (
									<IconStellar size={16} className="fill-white" />
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="w-full mb-4">
					<Button
						color="alpha-50"
						isFullWidth
						className="!font-semibold !text-sm"
						onClick={() => onShowChooseWallet()}
					>
						Switch Wallet
					</Button>
				</div>
				<div className="flex flex-col space-y-3">
					<div
						onClick={() => router.push(`/application/create-round`)}
						className="flex items-center space-x-3 cursor-pointer hover:opacity-70 transition"
					>
						<IconCube size={24} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Create Round
						</p>
					</div>
					<div
						onClick={() => router.push(`/application/my-project`)}
						className="flex items-center space-x-3 cursor-pointer hover:opacity-70 transition"
					>
						<IconProject size={24} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							My Project
						</p>
					</div>
					<div
						onClick={() => router.push(`/application/my-votes`)}
						className="flex items-center space-x-3 cursor-pointer hover:opacity-70 transition"
					>
						<IconCheckCircle size={24} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							My Votes
						</p>
					</div>
					<div
						className="flex items-center space-x-3 cursor-pointer hover:opacity-70 transition"
						onClick={async () => {
							await onSignOut()
							onCloseChooseWalletMenu()
							router.push(`/application`)
						}}
					>
						<IconLogout size={24} className="fill-grantpicks-red-400" />
						<p className="text-sm font-normal text-grantpicks-red-600">
							Disconnect
						</p>
					</div>
				</div>
			</div>
		</Menu>
	)
}

export default UserMenu
