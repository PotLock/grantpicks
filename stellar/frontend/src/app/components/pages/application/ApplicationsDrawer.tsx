import React, { useState } from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import clsx from 'clsx'
import { TApplicationDrawerTab } from '@/types/application'
import IconDot from '../../svgs/IconDot'
import IconCloseFilled from '../../svgs/IconCloseFilled'
import IconCalendar from '../../svgs/IconCalendar'
import IconCheckCircle from '../../svgs/IconCheckCircle'

interface ApplicationsDrawerProps extends IDrawerProps {}

const ApplicationItem = ({ type, index }: { type: string; index: number }) => {
	return (
		<div className="bg-grantpicks-black-50 rounded-xl border border-grantpicks-black-200">
			{type === 'pending' ? (
				<div className="flex items-center justify-between bg-white px-3 md:px-4 py-2 rounded-t-xl">
					<div className="flex items-center space-x-1 py-1">
						<IconCalendar size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Applied 3 days ago
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<p className="text-grantpicks-green-600 text-sm font-semibold cursor-pointer transition hover:opacity-70">
							ACCEPT
						</p>
						<p className="text-grantpicks-black-500 text-sm font-semibold cursor-pointer transition hover:opacity-70">
							REJECT
						</p>
					</div>
				</div>
			) : (
				<div className="flex items-center justify-between px-3 md:px-4 py-2">
					<div
						className={clsx(
							`flex items-center space-x-1 border rounded-full px-3 py-1`,
							type === 'accepted'
								? 'border-grantpicks-green-300'
								: 'border-grantpicks-red-300',
						)}
					>
						{type === 'accepted' ? (
							<IconCheckCircle
								size={18}
								className="fill-grantpicks-green-400"
							/>
						) : (
							<IconCloseFilled size={18} className="fill-grantpicks-red-400" />
						)}
						<p
							className={clsx(
								`text-xs font-semibold`,
								type === 'accepted'
									? 'text-grantpicks-green-600'
									: 'text-grantpicks-red-600',
							)}
						>
							{type === 'accepted' ? 'ACCEPTED' : 'REJECTED'}
						</p>
					</div>
					<p className="text-sm font-normal text-grantpicks-black-950">
						3 days ago
					</p>
				</div>
			)}
			<div className="flex items-center space-x-3 px-3 md:px-4 py-2">
				<div className="bg-grantpicks-black-200 rounded-full w-6 h-6" />
				<p>
					<span className="text-base font-bold text-grantpicks-black-950 mr-1">
						Magicbuild
					</span>
					<span className="text-base font-normal text-grantpicks-black-600">
						@magicbuild.near
					</span>
				</p>
			</div>
			{index % 2 === 0 && (
				<div className="px-3 md:px-4 pt-2 pb-4">
					<div className="border border-grantpicks-black-200 rounded-xl p-3 bg-white">
						<p className="text-sm font-semibold text-grantpicks-black-950">
							@AdminID
						</p>
						<p className="text-sm font-normal text-grantpicks-black-600">
							Lorem ipsum dolor sit amet consectetur. Viverra dolor dolor amet
							arcu eget hac augue. Nunc at risus mauris lacus massa imperdiet
							tortor.{' '}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}

const ApplicationsDrawer = ({ isOpen, onClose }: ApplicationsDrawerProps) => {
	const [tab, setTab] = useState<TApplicationDrawerTab>('all')
	return (
		<Drawer onClose={onClose} isOpen={isOpen}>
			<div className="bg-white flex flex-col w-full h-full overflow-y-auto">
				<div className="p-5 bg-grantpicks-black-50">
					<p className="text-lg md:text-xl font-semibold text-grantpicks-black-950">
						Applications
					</p>
				</div>
				<div className="p-4 md:p-5 flex items-center overflow-x-auto space-x-2 md:space-x-3 mt-4">
					<button
						onClick={() => setTab('all')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'all'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
					>
						All
					</button>
					<button
						onClick={() => setTab('pending')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'pending'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
					>
						Pending
					</button>
					<button
						onClick={() => setTab('accepted')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'accepted'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
					>
						Accepted
					</button>
					<button
						onClick={() => setTab('rejected')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'rejected'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
					>
						Rejected
					</button>
				</div>
				<div className="p-4 md:p-5">
					<div className="flex items-center space-x-1 mb-4">
						<IconDot size={8} className="fill-black" />
						<p className="text-xs font-semibold text-grantpicks-black-600 uppercase">
							<span className="text-sm font-bold text-grantpicks-black-950 mr-1">
								9
							</span>
							{tab === 'all' ? 'applications' : 'pending'}
						</p>
					</div>
					<div className="overflow-y-auto h-full flex flex-col space-y-6">
						{tab === 'all' &&
							['rejected', 'accepted', 'rejected', 'rejected', 'accepted'].map(
								(doc, idx) => (
									<ApplicationItem key={idx} type={doc} index={idx} />
								),
							)}
						{tab === 'pending' &&
							[...Array(8)].map((doc, idx) => (
								<ApplicationItem key={idx} type="pending" index={idx} />
							))}
						{tab === 'accepted' &&
							[...Array(8)].map((doc, idx) => (
								<ApplicationItem key={idx} type="accepted" index={idx} />
							))}
						{tab === 'rejected' &&
							[...Array(8)].map((doc, idx) => (
								<ApplicationItem key={idx} type="rejected" index={idx} />
							))}
					</div>
				</div>
			</div>
		</Drawer>
	)
}

export default ApplicationsDrawer
