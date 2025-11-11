'use client'

import React, { useEffect, useMemo, useState } from 'react'
import StatCard from '@/app/components/pages/round-view/StatCard'
import ProgressBar from '@/app/components/pages/round-view/ProgressBar'
import RoundHeader from '@/app/components/pages/round-view/RoundHeader'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ApplicationLayout from '@/app/components/pages/application/Layout'
import { GPRound } from '@/models/round'
import { usePotlockService } from '@/services/potlock'
import toast from 'react-hot-toast'
import moment from 'moment'
import PageLoading from '@/app/components/commons/PageLoading'
import IconErrorCircle from '@/app/components/svgs/IconErrorCircle'
import Button from '@/app/components/commons/Button'
import IconStellar from '@/app/components/svgs/IconStellar'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import IconProject from '@/app/components/svgs/IconProject'
import { formatStroopToXlm } from '@/utils/helper'
import FundRoundModal from '@/app/components/pages/application/FundRoundModal'
import { useWallet } from '@/app/providers/WalletProvider'
import ShareButton from '@/app/components/pages/round-view/ShareButton'

const SubNav = ({
	basePath,
	isOwnerOrAdmin,
}: {
	basePath: string
	isOwnerOrAdmin: boolean
}) => {
	const pathname = usePathname()
	const tabs = [
		{ href: `${basePath}`, label: 'About', exact: true, show: true },
		{ href: `${basePath}/applications`, label: 'Applications', show: true },
		{ href: `${basePath}/admins`, label: 'Admins', show: true },
		{
			href: `${basePath}/duration`,
			label: 'Duration Settings',
			show: isOwnerOrAdmin,
		},
	]
	return (
		<div className="flex items-center gap-6 border-b border-black/10 mt-6">
			{tabs
				?.filter((t) => t.show)
				.map((t) => {
					const isActive = t.exact
						? pathname === t.href
						: pathname.startsWith(t.href)
					return (
						<Link
							key={t.href}
							href={t.href}
							className={`relative py-3 text-sm font-semibold ${isActive ? 'text-grantpicks-black-950' : 'text-grantpicks-black-500'}`}
						>
							{t.label}
							{isActive && (
								<span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-grantpicks-black-950 rounded-full" />
							)}
						</Link>
					)
				})}
		</div>
	)
}

const RoundLayout = ({
	children,
	params,
}: {
	children: React.ReactNode
	params: { roundId: string }
}) => {
	const basePath = `/round/${params.roundId}`
	const potlockService = usePotlockService()
	const [roundInfo, setRoundInfo] = useState<GPRound | undefined>(undefined)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [error, setError] = useState<boolean>(false)
	const router = useRouter()
	const [showFundModal, setShowFundModal] = useState<boolean>(false)
	const global = useGlobalContext()
	const { stellarPubKey } = useWallet()

	const onFetchRoundInfo = async (): Promise<Omit<GPRound, 'admins'> & { admins: { id: string }[] } | undefined> => {
		setIsLoading(true)
		try {
			const roundInfo = await potlockService.getRound(Number(params.roundId))
			setIsLoading(false)
			return roundInfo
		} catch (error) {
			setIsLoading(false)
			setError(true)
			return undefined
		}
	}

	const isOwnerOrAdmin = useMemo(() => {
		return (
			roundInfo?.owner?.id === stellarPubKey ||
			roundInfo?.admins.includes(stellarPubKey)
		)
	}, [roundInfo, stellarPubKey])

	useEffect(() => {
		onFetchRoundInfo()
			.then((roundInfo) => {
				setRoundInfo(roundInfo as unknown as GPRound)
			})
			.catch((error) => {
				toast.error(error.message || 'Error fetching round information')
			})
	}, [params.roundId])

	const closesText = useMemo(() => {
		const now = new Date()
		const appStart = roundInfo?.application_start
			? new Date(roundInfo.application_start)
			: undefined
		const appEnd = roundInfo?.application_end
			? new Date(roundInfo.application_end)
			: undefined
		const voteStart = roundInfo?.voting_start
			? new Date(roundInfo.voting_start)
			: undefined
		const voteEnd = roundInfo?.voting_end
			? new Date(roundInfo.voting_end)
			: undefined

		// 1) Application phase (optional)
		if (appStart && now < appStart) {
			return `Applications start at ${moment(appStart).fromNow()}`
		}
		if (appStart && appEnd && now >= appStart && now < appEnd) {
			return `Application open till ${moment(appEnd).format('DD, MMM YYYY HH:mm A')}`
		}

		// 2) Between application end and voting start
		if (appEnd && now >= appEnd && voteStart && now < voteStart) {
			return `Voting starts at ${moment(voteStart).format('DD, MMM YYYY HH:mm A')}`
		}

		// 3) If no application, handle voting directly
		if (!appStart && voteStart && now < voteStart) {
			return `Voting starts at ${moment(voteStart).format('DD, MMM YYYY HH:mm A')}`
		}

		// 4) Voting open
		if (voteStart && voteEnd && now >= voteStart && now < voteEnd) {
			return `Voting open till ${moment(voteEnd).format('DD, MMM YYYY HH:mm A')}`
		}

		// 5) Voting ended / round completion
		if (roundInfo?.round_complete) {
			return `Round Completed`
		}
		if (voteEnd && now >= voteEnd) {
			return `Voting Ended`
		}
		return ''
	}, [roundInfo])

	if (error) {
		return (
			<ApplicationLayout>
				<div className="flex border border-grantpicks-black-600 border-dashed rounded-2xl p-4 items-center justify-center h-100">
					<div className="flex flex-col items-center justify-center">
						<IconErrorCircle size={52} className="fill-grantpicks-black-600" />
						<h1 className="font-bold text-xl text-center mt-4 mb-2 text-red-600">
							Error
						</h1>
						<div className="text-sm text-red-400">
							Failed to load round information
						</div>
						<p className="text-sm text-red-400">
							If this is a new round, please wait for atleast 30 seconds and
							refresh the page.
						</p>
						<Button className="mt-4" onClick={() => router.push('/rounds')}>
							Go back to rounds
						</Button>
					</div>
				</div>
			</ApplicationLayout>
		)
	}

	return (
		<ApplicationLayout>
			{isLoading && <PageLoading isOpen={isLoading} />}
			<div className={`${isLoading ? 'opacity-50' : 'opacity-100'}`}>
				<div className="flex items-start justify-between">
					<div className="flex-1">
						<RoundHeader
							doc={roundInfo}
							name={roundInfo?.name || ''}
							owner={roundInfo?.owner?.id || ''}
							closesIn={closesText}
							onGoBack={() => router.push('/rounds')}
							openFundModal={() => setShowFundModal(true)}
						/>
					</div>
					{roundInfo && (
						<div className="ml-1">
							<ShareButton
								roundId={params.roundId}
								userAccount={stellarPubKey || undefined}
								title={roundInfo.name}
								type="round"
							/>
						</div>
					)}
				</div>
				<div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
					<StatCard
						label="Approved Projects"
						value={roundInfo?.approved_projects?.length || 0}
						Icon={
							<IconProject size={24} className="fill-grantpicks-black-400" />
						}
					/>
					<StatCard
						label="Expected Amount"
						value={roundInfo?.expected_amount || 0}
						Icon={
							<IconStellar size={24} className="fill-grantpicks-black-400" />
						}
						global={global}
					/>
					<StatCard
						label="Total Vault Balance"
						value={roundInfo?.current_vault_balance || 0}
						Icon={
							<IconStellar size={24} className="fill-grantpicks-black-400" />
						}
						global={global}
					/>
				</div>
				<div className="mt-6">
					<ProgressBar
						large={true}
						value={
							Number(
								formatStroopToXlm(BigInt(roundInfo?.vault_total_deposits || 0)),
							) || 0
						}
						max={
							Number(
								formatStroopToXlm(BigInt(roundInfo?.expected_amount || 0)),
							) || 0
						}
						label="Funding Progress"
					/>
				</div>
				<SubNav basePath={basePath} isOwnerOrAdmin={isOwnerOrAdmin || false} />
				<div className="mt-6">{children}</div>
			</div>
			{roundInfo && (
				<FundRoundModal
					isOpen={showFundModal}
					onClose={() => setShowFundModal(false)}
					doc={roundInfo}
					mutateRounds={() => { }}
				/>
			)}
		</ApplicationLayout>
	)
}

export default RoundLayout
