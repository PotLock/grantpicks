'use client'

import React, { useEffect, useState } from 'react'
import { ApplicationCardSkeleton } from '@/app/components/pages/round-view/RoundSkeletons'
import useSWR from 'swr'
import { usePotlockService } from '@/services/potlock'
import { useParams } from 'next/navigation'
import { GPApplication } from '@/models/application'
import clsx from 'clsx'
import { ApplicationItem } from '@/app/components/pages/application/ApplicationsDrawer'

const RoundApplicationsPage = () => {
	const potlockService = usePotlockService()
	const { roundId } = useParams()
	const [tab, setTab] = useState<string>('all')
	const [roundAppsData, setRoundAppsData] = useState<GPApplication[]>([])
	const { data, isLoading, error, mutate } = useSWR(
		`/rounds/${roundId}/applications`,
		() => potlockService.getApplications(Number(roundId)),
	)

	const totalCount = data?.length ?? 0
	const pendingCount = data?.filter((t) => t.status === 'Pending').length ?? 0
	const approvedCount = data?.filter((t) => t.status === 'Approved').length ?? 0
	const rejectedCount = data?.filter((t) => t.status === 'Rejected').length ?? 0

	useEffect(() => {
		if (data) {
			let temp = [...data]
			if (tab === 'all') {
				temp = temp
			} else if (tab === 'approved') {
				temp = temp.filter((t) => t.status === 'Approved')
			} else if (tab === 'pending') {
				temp = temp.filter((t) => t.status === 'Pending')
			} else if (tab === 'rejected') {
				temp = temp.filter((t) => t.status === 'Rejected')
			}
			setRoundAppsData(temp)
		}
	}, [tab, data])

	if (error) {
		return (
			<div className="text-center text-grantpicks-black-950">
				Error Loading Applications
			</div>
		)
	}

	if (isLoading) {
		return <ApplicationCardSkeleton />
	}
	return (
		<div className="max-w-7xl mx-auto px-4 md:px-6">
			<div className="sticky top-0 z-10 -mx-4 md:-mx-6 px-4 md:px-6 bg-white pt-4 pb-3 border-b border-black/10">
				<div
					className="flex items-center overflow-x-auto space-x-2 md:space-x-3"
					role="tablist"
					aria-label="Application filters"
				>
					<button
						onClick={() => setTab('all')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'all'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
						role="tab"
						aria-selected={tab === 'all'}
					>
						All ({totalCount})
					</button>
					<button
						onClick={() => setTab('pending')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'pending'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
						role="tab"
						aria-selected={tab === 'pending'}
					>
						Pending ({pendingCount})
					</button>
					<button
						onClick={() => setTab('approved')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'approved'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
						role="tab"
						aria-selected={tab === 'approved'}
					>
						Accepted ({approvedCount})
					</button>
					<button
						onClick={() => setTab('rejected')}
						className={clsx(
							`rounded-full px-4 py-2 flex-shrink-0 md:flex-shrink text-sm font-semibold cursor-pointer transition hover:opacity-70`,
							tab === 'rejected'
								? `bg-grantpicks-black-950 text-white`
								: `bg-grantpicks-black-50 text-grantpicks-black-950`,
						)}
						role="tab"
						aria-selected={tab === 'rejected'}
					>
						Rejected ({rejectedCount})
					</button>
				</div>
				<div className="flex items-center space-x-2 mt-3">
					<p className="text-xs font-semibold text-grantpicks-black-600 uppercase">
						<span className="text-sm font-bold text-grantpicks-black-950 mr-1">
							{roundAppsData.length}
						</span>
						{tab === 'all' ? 'applications' : tab}
					</p>
				</div>
			</div>
			<div className="py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
				{roundAppsData?.length > 0 ? (
					roundAppsData?.map((application, idx) => (
						<ApplicationItem
							key={idx}
							roundData={application?.round}
							type={application.status}
							index={idx}
							item={application}
							mutate={mutate}
						/>
					))
				) : (
					<div className="col-span-full">
						<div className="text-center border border-black/10 rounded-xl p-8 bg-white">
							<p className="text-base font-semibold text-grantpicks-black-950 mb-1">
								No applications found
							</p>
							<p className="text-sm text-grantpicks-black-600">
								Try switching tabs or check back later.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default RoundApplicationsPage
