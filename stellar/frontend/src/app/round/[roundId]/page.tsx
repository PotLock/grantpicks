'use client'

import React, { useEffect, useState } from 'react'
import { usePotlockService } from '@/services/potlock'
import { GPRound } from '@/models/round'
import { useParams } from 'next/navigation'
import moment from 'moment'
import useSWR from 'swr'
import { RoundAboutSkeleton } from '@/app/components/pages/round-view/RoundSkeletons'
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
	<h2 className="text-lg md:text-xl font-bold text-grantpicks-black-950 mb-3 md:mb-4">
		{children}
	</h2>
)

const Label = ({ children }: { children: React.ReactNode }) => (
	<p className="text-xs font-semibold text-grantpicks-black-600 mb-1">
		{children}
	</p>
)

const Value = ({ children }: { children: React.ReactNode }) => (
	<p className="text-sm md:text-base font-semibold text-grantpicks-black-950">
		{children}
	</p>
)

const Card = ({
	title,
	children,
	tinted,
}: {
	title: string
	children: React.ReactNode
	tinted?: boolean
}) => (
	<div
		className={`rounded-xl border border-black/10 p-4 md:p-5 ${tinted ? 'bg-gray-50' : 'bg-white'}`}
	>
		<p className="text-sm md:text-base font-bold text-grantpicks-black-950 mb-1">
			{title}
		</p>
		<div className="text-sm text-grantpicks-black-700">{children}</div>
	</div>
)

const RoundAboutPage = () => {
	const params = useParams<{ roundId: string }>()
	const potlockService = usePotlockService()
	const [roundInfo, setRoundInfo] = useState<GPRound | undefined>(undefined)

	const { data, isLoading, error } = useSWR(`/rounds/${params.roundId}`, () =>
		potlockService.getRound(Number(params.roundId)),
	)

	useEffect(() => {
		if (data) {
			setRoundInfo(data as unknown as GPRound)
		}
	}, [data])

	if (error) {
		return (
			<div className="text-center text-grantpicks-black-950">
				Error Loading Round Information
			</div>
		)
	}

	if (isLoading) {
		return <RoundAboutSkeleton />
	}

	return (
		<div className="grid gap-8 md:gap-10">
			{/* About */}
			<div>
				<SectionTitle>About</SectionTitle>
				<p className="text-sm md:text-base text-grantpicks-black-700 leading-relaxed">
					{roundInfo?.description}
				</p>
			</div>

			{/* Duration */}
			<div>
				<div className="flex items-center justify-between flex-wrap gap-3 mb-3">
					<SectionTitle>Duration</SectionTitle>
					<button className="flex items-center gap-2 text-sm font-semibold text-grantpicks-black-950 hover:opacity-80 transition">
						Edit Duration
					</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<Label>Application duration</Label>
						<Value>
							{roundInfo?.application_start
								? moment(roundInfo?.application_start).format(
									'DD, MMM YYYY HH:mm a',
								)
								: 'N/A'}{' '}
							—{' '}
							{roundInfo?.application_end
								? moment(roundInfo?.application_end).format(
									'DD, MMM YYYY HH:mm a',
								)
								: 'N/A'}
						</Value>
					</div>
					<div>
						<Label>Voting duration</Label>
						<Value>
							{roundInfo?.voting_start
								? moment(roundInfo?.voting_start).format('DD, MMM YYYY HH:mm a')
								: 'N/A'}{' '}
							—{' '}
							{roundInfo?.voting_end
								? moment(roundInfo?.voting_end).format('DD, MMM YYYY HH:mm a')
								: 'N/A'}
						</Value>
					</div>
				</div>
			</div>

			{/* Application Requirement */}
			<div>
				<SectionTitle>Requirements</SectionTitle>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card title="Project Application Eligibility" tinted>
						{roundInfo?.application_wl_list_id ? (
							<p className="text-sm text-grantpicks-black-700">
								This is a whitelisted round. Projects must be added to the
								whitelist to apply to this round.
							</p>
						) : (
							<p className="text-sm text-grantpicks-black-700">
								This is public. Projects can apply to this round.
							</p>
						)}
					</Card>
					<Card title="Voting Eligibility">
						{roundInfo?.voting_wl_list_id ? (
							<p className="text-sm text-grantpicks-black-700">
								This is whitelisted. You must be a part of the whitelist to vote
								in this round.
							</p>
						) : (
							<p className="text-sm text-grantpicks-black-700">
								This is public. You can vote in this round.
							</p>
						)}
					</Card>
				</div>
			</div>
		</div>
	)
}

export default RoundAboutPage
