import React, { useEffect } from 'react'
import IconArrowLeft from '../../svgs/IconArrowLeft'
import IconStellar from '../../svgs/IconStellar'
import IconNear from '../../svgs/IconNear'
import { useWallet } from '@/app/providers/WalletProvider'
import clsx from 'clsx'

const ChooseWalletMenu = ({
	onClose,
	onBack,
	isConnected,
}: {
	onClose: () => void
	onBack: () => void
	isConnected: boolean
}) => {
	const { onOpenNearWallet, onOpenStellarWallet } = useWallet()

	useEffect(() => {
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				onClose()
			}
		})
	}, [])
	return (
		<div
			className={clsx(
				`p-4 rounded-2xl bg-white shadow-xl border border-grantpicks-black-200 absolute right-0`,
				isConnected ? `-bottom-[220px]` : `-bottom-48`,
			)}
		>
			{isConnected && (
				<div className="flex items-center mb-2">
					<IconArrowLeft
						size={24}
						onClick={() => onBack()}
						className="fill-grantpicks-black-400 cursor-pointer hover:opacity-80 transition"
					/>
				</div>
			)}
			<p className="text-center font-bold text-base mb-4 text-grantpicks-black-950">
				{isConnected ? `Switch Wallet` : `Connect Walet`}
			</p>
			<div className="flex items-center space-x-3">
				<div
					onClick={() => {
						onOpenStellarWallet()
					}}
					className="border border-grantpicks-black-200 rounded-xl flex-1 px-8 py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-grantpicks-black-200/10 transition"
				>
					<IconStellar size={32} className="fill-grantpicks-black-400 mb-2" />
					<p className="text-base font-normal text-grantpicks-black-950">XLM</p>
				</div>
				<div
					onClick={() => {
						onOpenNearWallet()
					}}
					className="border border-grantpicks-black-200 rounded-xl flex-1 px-8 py-4 flex flex-col items-center justify-center cursor-pointer hover:bg-grantpicks-black-200/10 transition"
				>
					<IconNear size={32} className="fill-grantpicks-black-400 mb-2" />
					<p className="text-base font-normal text-grantpicks-black-950">
						NEAR
					</p>
				</div>
			</div>
		</div>
	)
}

export default ChooseWalletMenu
