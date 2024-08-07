import React from 'react'
import IconCheckCircle from '../../svgs/IconCheckCircle'
import IconCube from '../../svgs/IconCube'
import IconClock from '../../svgs/IconClock'
import { useWallet } from '@/app/providers/WalletProvider'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import clsx from 'clsx'

const IsVotedSection = () => {
	const { connectedWallet } = useWallet()
	return (
		<div>
			<div className="bg-grantpicks-black-50 flex items-center justify-between text-grantpicks-black-950 py-4 md:py-6 px-4 md:px-6 rounded-xl">
				<div className="flex items-center space-x-2">
					<IconCheckCircle size={18} className="fill-grantpicks-purple-500" />
					<p className="text-xs font-semibold">VOTING COMPLETED</p>
				</div>
				<div className="flex items-center space-x-4 md:space-x-6">
					<div className="flex items-center space-x-2">
						<IconCube size={18} className="fill-grantpicks-black-600" />
						<p className="text-xs md:text-sm">5 Matches</p>
					</div>
					<div className="flex items-center space-x-2">
						<IconClock size={18} className="fill-grantpicks-black-600" />
						<p className="text-xs md:text-sm">Ends in 3 days</p>
					</div>
				</div>
			</div>
			<div className="mt-10 md:mt-14 flex items-center space-x-2 md:space-x-4">
				<div className="border border-black/10 rounded-full p-3 flex items-center justify-center">
					{connectedWallet === 'near' ? (
						<IconNear size={16} className="fill-grantpicks-black-950" />
					) : (
						<IconStellar size={16} className="fill-grantpicks-black-950" />
					)}
				</div>
				<p className="text-[40px] font-black uppercase text-grantpicks-black-950">
					Web3 Education & Skill Development
				</p>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">
				{[...Array(6)].map((doc, idx) => (
					<div
						key={idx}
						className="p-4 md:p-6 rounded-2xl bg-grantpicks-black-50"
					>
						<div className="relative justify-center flex items-center space-x-4 md:space-x-6 mb-4 md:mb-6">
							<div
								className={clsx(
									`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300`,
									`border-2 border-grantpicks-purple-500`,
								)}
							></div>
							<div
								className={clsx(
									`w-20 md:w-24 lg:w-28 h-20 md:h-24 lg:h-28 rounded-full bg-grantpicks-black-300`,
									`border-2 border-grantpicks-black-300`,
								)}
							></div>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="rounded-full w-16 h-16 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center">
									<p className="text-[32px] font-black text-white">VS</p>
								</div>
							</div>
						</div>
						<div className="flex items-center justify-center space-x-2">
							<IconCheckCircle
								size={18}
								className="fill-grantpicks-purple-500"
							/>
							<p className="text-xs font-semibold text-grantpicks-black-950">
								Voted
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default IsVotedSection
