import React from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import clsx from 'clsx'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconCube from '../../svgs/IconCube'
import IconProject from '../../svgs/IconProject'
import IconDollar from '../../svgs/IconDollar'
import IconStellar from '../../svgs/IconStellar'
import IconClock from '../../svgs/IconClock'
import IconGroup from '../../svgs/IconGroup'
import IconTelegram from '../../svgs/IconTelegram'
import Button from '../../commons/Button'

interface RoundDetailDrawerProps extends IDrawerProps {}

const RoundDetailDrawer = ({ isOpen, onClose }: RoundDetailDrawerProps) => {
	const { selectedRoundType, setSelectedRoundType } = useRoundStore()
	return (
		<Drawer onClose={onClose} isOpen={isOpen}>
			<div className="bg-white flex flex-col w-full h-full overflow-y-auto">
				<div className="p-4 md:p-5 flex items-center">
					<div
						className={clsx(
							`px-5 py-2 border text-xs font-semibold flex items-center justify-center space-x-2 rounded-full`,
							selectedRoundType === 'on-going' ||
								selectedRoundType === 'upcoming'
								? `border-grantpicks-green-400 text-grantpicks-green-700 bg-grantpicks-green-50`
								: `border-grantpicks-amber-400 text-grantpicks-amber-700 bg-grantpicks-amber-50`,
						)}
					>
						{selectedRoundType === 'on-going' ? (
							<IconCube size={18} className="fill-grantpicks-green-400" />
						) : selectedRoundType === 'upcoming' ? (
							<IconProject size={18} className="fill-grantpicks-green-400" />
						) : (
							<IconDollar size={18} className="fill-grantpicks-amber-400" />
						)}
						<p className="uppercase">
							{selectedRoundType === 'on-going'
								? `voting open`
								: selectedRoundType === 'upcoming'
									? `application open`
									: `payout pending`}
						</p>
					</div>
				</div>
				<div className="px-5 py-4">
					<div className="flex items-center">
						<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
							<IconStellar size={16} className="fill-grantpicks-black-950" />
						</div>
					</div>
					<p className="text-grantpicks-black-950 text-2xl md:text-3xl lg:text-[32px] font-semibold mb-4">
						Web3 Education & Skill Development
					</p>
					<p className="text-sm font-normal text-grantpicks-black-600 line-clamp-5 mb-4">
						Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
						commodo ligula eget dolor. Aenean massa. Cum sociis natoque
						penatibus
					</p>
					<div className="flex items-center">
						{selectedRoundType === 'on-going' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconCube size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									15 Votes per person
								</p>
							</div>
						) : selectedRoundType === 'upcoming' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconGroup size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									8 Participating
								</p>
							</div>
						) : (
							<div className="flex flex-1 items-center space-x-1">
								<IconProject size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									50 Projects
								</p>
							</div>
						)}
						{selectedRoundType === 'on-going' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Ends in 3days
								</p>
							</div>
						) : selectedRoundType === 'upcoming' ? (
							<div className="flex flex-1 items-center space-x-1">
								<IconClock size={18} className="fill-grantpicks-black-400" />
								<p className="text-sm font-normal text-grantpicks-black-950">
									Closes in 3days
								</p>
							</div>
						) : (
							<p className="text-lg flex-1 md:text-xl font-normal text-grantpicks-black-950">
								407,121{' '}
								<span className="text-sm font-normal text-grantpicks-black-600">
									XLM
								</span>
							</p>
						)}
					</div>
				</div>
				<div className="p-4 md:p-5">
					<div className="flex items-center mb-4 md:mb-5">
						<div className="flex-1">
							<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
								407,389 XLM
							</p>
							<p className="font-semibold text-xs text-grantpicks-black-600">
								AVAILABLE FUNDS
							</p>
						</div>
						<div className="flex-1">
							<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
								407,389 XLM
							</p>
							<p className="font-semibold text-xs text-grantpicks-black-600">
								EXPECTED FUNDS
							</p>
						</div>
					</div>
					<div className="mb-4 md:mb-5">
						<div className="border-b border-black/10 pb-2 flex items-center">
							<p className="text-xs font-semibold text-grantpicks-black-600">
								ADMIN{' '}
								<span className="text-sm font-bold text-grantpicks-black-600 ml-2">
									2
								</span>
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4 pt-3">
							{[...Array(4)].map((doc, idx) => (
								<div key={idx} className="flex items-center space-x-2">
									<div className="bg-grantpicks-black-600 rounded-full w-10 h-10" />
									<div>
										<p className="text-base font-bold text-grantpicks-black-950">
											Abdul Hamid
										</p>
										<p className="text-sm font-normal text-grantpicks-black-600">
											@abdul.near
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					<div>
						<div className="border-b border-black/10 pb-2 flex items-center">
							<p className="text-xs font-semibold text-grantpicks-black-600">
								CONTACTS
							</p>
						</div>
						<div>
							{[...Array(1)].map((doc, idx) => (
								<div
									key={idx}
									className="flex items-center justify-between pt-3"
								>
									<div className="flex items-center space-x-3">
										<div className="bg-grantpicks-black-50 rounded-full w-10 h-10 flex items-center justify-center">
											<IconTelegram
												size={18}
												className="fill-grantpicks-black-400"
											/>
										</div>
										<p className="text-grantpicks-black-950 font-semibold text-base">
											Tele Address
										</p>
									</div>
									<Button
										color="alpha-50"
										onClick={() => {}}
										className="!text-sm !font-semibold"
									>
										Chat
									</Button>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="px-6 pt-4 pb-6 flex items-center space-x-4">
					<Button color="black-950" onClick={() => {}} className="!py-3 flex-1">
						Apply
					</Button>
					<Button color="alpha-50" onClick={() => {}} className="!py-3 flex-1">
						Fund Round
					</Button>
				</div>
			</div>
		</Drawer>
	)
}

export default RoundDetailDrawer
