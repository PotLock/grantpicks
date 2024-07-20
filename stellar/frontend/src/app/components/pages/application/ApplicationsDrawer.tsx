import React, { useEffect, useRef, useState } from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import clsx from 'clsx'
import { TApplicationDrawerTab } from '@/types/application'
import IconDot from '../../svgs/IconDot'
import IconCloseFilled from '../../svgs/IconCloseFilled'
import IconCalendar from '../../svgs/IconCalendar'
import IconCheckCircle from '../../svgs/IconCheckCircle'
import { useWallet } from '@/app/providers/WalletProvider'
import useSWRInfinite from 'swr/infinite'
import { LIMIT_SIZE } from '@/constants/query'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
	Network,
} from '@/types/on-chain'
import { getRoundApplications } from '@/services/on-chain/round-factory'
import InfiniteScroll from 'react-infinite-scroll-component'
import IconLoading from '../../svgs/IconLoading'
import moment from 'moment'

interface ApplicationsDrawerProps extends IDrawerProps {
	doc: IGetRoundsResponse
}

const ApplicationItem = ({
	type,
	index,
	doc,
}: {
	type: 'Pending' | 'Approved' | 'Rejected'
	index: number
	doc: IGetRoundApplicationsResponse
}) => {
	return (
		<div className="bg-grantpicks-black-50 rounded-xl border border-grantpicks-black-200">
			{type === 'Pending' ? (
				<div className="flex items-center justify-between bg-white px-3 md:px-4 py-2 rounded-t-xl">
					<div className="flex items-center space-x-1 py-1">
						<IconCalendar size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Applied {moment(new Date(Number(doc.submited_ms))).fromNow()}
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
							type === 'Approved'
								? 'border-grantpicks-green-300'
								: 'border-grantpicks-red-300',
						)}
					>
						{type === 'Approved' ? (
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
								type === 'Approved'
									? 'text-grantpicks-green-600'
									: 'text-grantpicks-red-600',
							)}
						>
							{type === 'Approved' ? 'ACCEPTED' : 'REJECTED'}
						</p>
					</div>
					<p className="text-sm font-normal text-grantpicks-black-950">
						{moment(new Date(Number(doc.submited_ms))).fromNow()}
					</p>
				</div>
			)}
			<div className="flex items-center space-x-3 px-3 md:px-4 py-2">
				<div className="bg-grantpicks-black-200 rounded-full w-6 h-6" />
				<p>
					<span className="text-base font-bold text-grantpicks-black-950 mr-1">
						{doc.applicant}
					</span>
					{/* <span className="text-base font-normal text-grantpicks-black-600">
						@magicbuild.near
					</span> */}
				</p>
			</div>
			{doc.review_note && (
				<div className="px-3 md:px-4 pt-2 pb-4">
					<div className="border border-grantpicks-black-200 rounded-xl p-3 bg-white">
						<p className="text-sm font-semibold text-grantpicks-black-950">
							{doc.applicant}
						</p>
						<p className="text-sm font-normal text-grantpicks-black-600">
							{doc.review_note || ''}
						</p>
					</div>
				</div>
			)}
		</div>
	)
}

const ApplicationsDrawer = ({
	isOpen,
	onClose,
	doc,
}: ApplicationsDrawerProps) => {
	const [tab, setTab] = useState<TApplicationDrawerTab>('all')
	const { stellarPubKey, connectedWallet } = useWallet()
	const [roundAppsData, setRoundAppsData] = useState<
		IGetRoundApplicationsResponse[]
	>([])
	const containerScrollRef = useRef<HTMLDivElement>(null)

	const onFetchRoundApplications = async (key: {
		url: string
		skip: number
		limit: number
	}) => {
		let cmdWallet = new CMDWallet({
			stellarPubKey: stellarPubKey,
		})
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			cmdWallet,
		)
		const res = await getRoundApplications(
			{ round_id: BigInt(doc.id), skip: key.skip, limit: key.limit },
			contracts,
		)
		return res
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetRoundApplicationsResponse[],
	) => {
		if (!connectedWallet) return null
		if (previousPageData && !previousPageData.length) return null
		return {
			url: `get-round-applications`,
			skip: pageIndex,
			limit: LIMIT_SIZE,
		}
	}
	const { data, size, setSize, isValidating, isLoading } = useSWRInfinite(
		getKey,
		async (key) => await onFetchRoundApplications(key),
		{
			revalidateFirstPage: false,
		},
	)
	const applications = data
		? ([] as IGetRoundApplicationsResponse[]).concat(...data)
		: []
	const hasMore = data ? data[data.length - 1].length >= LIMIT_SIZE : false

	useEffect(() => {
		if (data) {
			let temp = [...applications]
			if (tab === 'all') {
				temp = temp
			} else if (tab === 'approved') {
				temp = temp.filter((t) => t.status.tag === 'Approved')
			} else if (tab === 'pending') {
				temp = temp.filter((t) => t.status.tag === 'Pending')
			} else if (tab === 'rejected') {
				temp = temp.filter((t) => t.status.tag === 'Rejected')
			}
			setRoundAppsData(temp)
		}
	}, [tab, data])

	return (
		<Drawer onClose={onClose} isOpen={isOpen}>
			<div
				ref={containerScrollRef}
				id="containerScroll"
				className="bg-white flex flex-col w-full h-full overflow-y-auto"
			>
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
						onClick={() => setTab('approved')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'approved'
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
								{roundAppsData.length}
							</span>
							{tab === 'all' ? 'applications' : 'pending'}
						</p>
					</div>
					<InfiniteScroll
						dataLength={applications.length}
						next={() => !isValidating && setSize(size + 1)}
						hasMore={hasMore}
						style={{ display: 'flex', flexDirection: 'column' }}
						loader={
							<div className="my-2 flex items-center justify-center">
								<IconLoading size={24} className="fill-grantpicks-black-600" />
							</div>
						}
						scrollableTarget="containerScroll"
					>
						<div className="overflow-y-auto h-full flex flex-col space-y-6">
							{tab === 'all' &&
								roundAppsData?.map((doc, idx) => (
									<ApplicationItem
										key={idx}
										type={doc.status.tag}
										index={idx}
										doc={doc}
									/>
								))}
							{tab === 'pending' &&
								roundAppsData
									?.filter((app) => app.status.tag === 'Pending')
									.map((doc, idx) => (
										<ApplicationItem
											key={idx}
											type="Pending"
											index={idx}
											doc={doc}
										/>
									))}
							{tab === 'approved' &&
								roundAppsData
									?.filter((app) => app.status.tag === 'Approved')
									.map((doc, idx) => (
										<ApplicationItem
											key={idx}
											type="Approved"
											index={idx}
											doc={doc}
										/>
									))}
							{tab === 'rejected' &&
								roundAppsData
									?.filter((app) => app.status.tag === 'Rejected')
									.map((doc, idx) => (
										<ApplicationItem
											key={idx}
											type="Rejected"
											index={idx}
											doc={doc}
										/>
									))}
						</div>
					</InfiniteScroll>
				</div>
			</div>
		</Drawer>
	)
}

export default ApplicationsDrawer
