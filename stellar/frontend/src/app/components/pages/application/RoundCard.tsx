import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useModalContext } from '@/app/providers/ModalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import useRoundStore from '@/stores/zustand/useRoundStore'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import { extractChainId } from '@/utils/helper'
import moment from 'moment'

// Components
import RoundCardHeader from './components/RoundCardHeader'
import RoundCardContent from './components/RoundCardContent'
import RoundCardActions from './components/RoundCardActions'

// Services
import {
	getRoundApplication,
	HasVotedRoundParams,
	isHasVotedRound,
} from '@/services/stellar/round'
import FundRoundModal from './FundRoundModal'
import clsx from 'clsx'

export const RoundCard = ({
	doc,
	mutateRounds,
}: {
	doc: GPRound
	mutateRounds: any
}) => {
	const router = useRouter()
	const { selectedRoundType } = useRoundStore()
	const { setApplyProjectInitProps, setVoteConfirmationProps } =
		useModalContext()
	const { connectedWallet, stellarPubKey, onOpenStellarWallet } = useWallet()
	const storage = useAppStorage()

	// State
	const [totalApprovedProjects, setTotalApprovedProjects] = useState<number>(
		doc.approved_projects?.length || 0,
	)
	const [isUserApplied, setIsUserApplied] = useState<boolean>(false)
	const [hasVoted, setHasVoted] = useState<boolean>(false)
	const [isAdminOrOwner, setIsAdminOrOwner] = useState<boolean>(false)
	const [pendingApplicationsCount, setPendingApplicationsCount] =
		useState<number>(0)
	const [showFundRoundModal, setShowFundRoundModal] = useState<boolean>(false)
	const chainId = extractChainId(doc)


	// Memoized values
	const currentTime = useMemo(() => {
		if (selectedRoundType === 'upcoming') {
			const now = new Date().getTime()
			const appStart = new Date(doc.application_start || '').getTime()
			const appEnd = new Date(doc.application_end || '').getTime()
			const votingStart = new Date(doc.voting_start).getTime()

			if (now >= appStart && now < appEnd) {
				return 'upcoming-open'
			} else if (now >= appEnd && now < votingStart) {
				return 'upcoming-closed'
			} else if (now < appStart) {
				return 'upcoming-not-started'
			} else if (doc.allow_applications) {
				return 'upcoming'
			} else {
				return 'upcoming-closed'
			}
		} else if (selectedRoundType === 'on-going') {
			const now = new Date().getTime()
			const votingStart = new Date(doc.voting_start).getTime()
			const votingEnd = new Date(doc.voting_end).getTime()
			const appEnd = doc.application_end ? new Date(doc.application_end).getTime() : null
			const appStart = doc.application_start ? new Date(doc.application_start).getTime() : null

			// Check if voting has started
			if (now >= votingStart && now < votingEnd) {
				return 'on-going'
			}

			// Voting hasn't started yet - check if application ended or doesn't exist
			if (now < votingStart) {
				// Case 1: Application has ended but voting hasn't started
				if (appEnd && now >= appEnd) {
					return 'on-going-voting-not-started'
				}
				// Case 2: Application doesn't exist, voting hasn't started
				if (!appStart && !appEnd) {
					return 'on-going-voting-not-started'
				}
			}

			return 'on-going'
		} else {
			// Round Results tab - verify voting has actually ended
			const now = new Date().getTime()
			const votingEnd = new Date(doc.voting_end).getTime()

			// If voting hasn't ended yet, this shouldn't be in Round Results
			if (now < votingEnd) {
				return 'on-going'
			}

			if (doc.round_complete) return 'ended'

			if (
				doc.use_vault &&
				doc.current_vault_balance === '0' &&
				doc.vault_total_deposits !== '0'
			)
				return 'payout-done'

			return 'payout-pending'
		}
	}, [doc, selectedRoundType])

	const isApplicationOpen = currentTime === 'upcoming-open'
	const isVotingOpen = currentTime === 'on-going'
	const isVotingNotStarted = currentTime === 'on-going-voting-not-started'
	const isApplicationClosed =
		currentTime === 'upcoming-closed' || currentTime === 'upcoming'
	const isNotStarted = currentTime === 'upcoming-not-started'
	const isCompleted =
		currentTime === 'ended' ||
		currentTime === 'payout-pending' ||
		currentTime === 'payout-done'

	const fetchTotalApprovedProjects = useCallback(async () => {
		if (chainId === 'stellar') {
			const contracts = storage.getStellarContracts()
			if (!contracts) return

			try {
				const res = await contracts.round_contract.get_approved_projects({
					round_id: BigInt(doc.on_chain_id),
				})
				setTotalApprovedProjects(res.result.length)
			} catch (error: any) {
				console.log('error fetching total approved projects')
			}
		} else {
			const contracts = storage.getNearContracts(null)
			if (!contracts) return

			try {
				const results = await contracts.round.getVotingResults(
					Number(doc.on_chain_id),
				)
				setTotalApprovedProjects(results.length)
			} catch (error: any) {
				console.log('error fetching total approved projects')
			}
		}
	}, [chainId, doc.on_chain_id, storage])

	const fetchRoundApplication = useCallback(async () => {
		if (selectedRoundType !== 'upcoming') return

		try {
			if (doc?.on_chain_id) {
				const contracts = storage.getStellarContracts()
				if (!contracts) return

				try {
					const res = await getRoundApplication(
						{
							round_id: BigInt(doc.on_chain_id),
							applicant: storage.my_address || '',
						},
						contracts,
					)
					if (res?.applicant_id) {
						setIsUserApplied(true)
					}
				} catch (error) {
					console.log('error fetching round application')
					setIsUserApplied(false)
				}
			}
		} catch (error: any) {
			console.log('error fetch project applicant')
			setIsUserApplied(false)
		}
	}, [selectedRoundType, stellarPubKey, chainId, doc.on_chain_id, storage])

	const checkIfUserHasVoted = useCallback(async () => {
		if (!isVotingOpen) return

		try {
			const contracts = storage.getStellarContracts()
			if (!contracts) return

			const params: HasVotedRoundParams = {
				round_id: BigInt(doc.on_chain_id),
				voter: storage.my_address || '',
			}
			const hasVoted = await isHasVotedRound(params, contracts)
			setHasVoted(hasVoted)
		} catch (error: any) {
			console.log('error checking if user has voted', error)
		}
	}, [isVotingOpen, chainId, doc.on_chain_id, storage])

	const checkIsAdminOrOwner = useCallback(async () => {
		try {
			let isOwner = doc.owner?.id === storage.my_address
			let isAdmin = Array.isArray(doc.admins)
				? doc.admins.includes(storage.my_address || '')
				: false

			if (!isAdmin && chainId === 'stellar') {
				const contracts = storage.getStellarContracts()
				if (contracts) {
					try {
						const admins = (
							await contracts.round_contract.admins({
								round_id: BigInt(doc.on_chain_id),
							})
						).result as string[]
						isAdmin = admins.includes(storage.my_address || '')
					} catch (e) {
						// ignore
					}
				}
			}

			setIsAdminOrOwner(Boolean(isOwner || isAdmin))
		} catch (e) {
			setIsAdminOrOwner(false)
		}
	}, [chainId, doc.admins, doc.on_chain_id, doc.owner?.id, storage])

	const fetchPendingApplicationsCount = useCallback(async () => {
		if (!isAdminOrOwner || selectedRoundType !== 'upcoming') {
			setPendingApplicationsCount(0)
			return
		}

		try {
			let total = 0
			const LIMIT = BigInt(50)

			if (chainId === 'stellar') {
				const contracts = storage.getStellarContracts()
				if (!contracts) return

				let from = BigInt(0)
				let keepFetching = true
				while (keepFetching) {
					const res = (
						await contracts.round_contract.get_applications_for_round({
							round_id: BigInt(doc.on_chain_id),
							from_index: from,
							limit: LIMIT,
						})
					).result
					res.forEach((app: any) => {
						if (app.status.tag === 'Pending') total += 1
					})
					if (res.length < Number(LIMIT)) keepFetching = false
					from = from + LIMIT
				}
			} else {
				const contracts = storage.getNearContracts(null)
				if (!contracts) return
				let from = 0
				const limit = 50
				let keepFetching = true
				while (keepFetching) {
					const res = await contracts.round.getApplicationsForRound(
						Number(doc.on_chain_id),
						from,
						limit,
					)
					res.forEach((app: any) => {
						if (app.status === 'Pending') total += 1
					})
					if (res.length < limit) keepFetching = false
					from += limit
				}
			}

			setPendingApplicationsCount(total)
		} catch (e) {
			setPendingApplicationsCount(0)
		}
	}, [chainId, doc.on_chain_id, isAdminOrOwner, selectedRoundType, storage])

	// Effects
	useEffect(() => {
		fetchRoundApplication()
		checkIfUserHasVoted()
		fetchTotalApprovedProjects()
		checkIsAdminOrOwner()
	}, [
		doc.on_chain_id,
		connectedWallet,
		stellarPubKey,
		fetchRoundApplication,
		checkIfUserHasVoted,
		fetchTotalApprovedProjects,
		checkIsAdminOrOwner,
	])

	useEffect(() => {
		fetchPendingApplicationsCount()
	}, [fetchPendingApplicationsCount])

	const handleMainAction = () => {
		if (isNotStarted || isVotingNotStarted) return

		// For completed rounds, always go to results page (regardless of admin status)
		if (isCompleted) {
			router.push(`/rounds/round-result/${doc.on_chain_id}`)
			return
		}

		if (isAdminOrOwner) {
			router.push(`/round/${doc.on_chain_id}/applications`)
			return
		}

		if (isVotingOpen) {
			if (hasVoted) {
				router.push(`/rounds/round-vote/${doc.on_chain_id}?is_voted=true`)
			} else {
				setVoteConfirmationProps((prev) => ({
					...prev,
					isOpen: true,
					doc: doc,
					chainId: doc.chain as any,
				}))
			}
		} else if (isApplicationOpen) {
			setApplyProjectInitProps((prev) => ({
				...prev,
				isOpen: true,
				round_id: BigInt(doc.on_chain_id),
				roundData: doc,
			}))
		} else {
			router.push(`/rounds/round-result/${doc.on_chain_id}`)
		}
	}

	const getMainActionText = () => {
		if (isUserApplied && isApplicationOpen) {
			return "Apply"
		}
		if (isVotingOpen && !isAdminOrOwner) {
			return 'Vote'
		}
		if (isVotingNotStarted) {
			return 'Vote'
		}
		if (isNotStarted) {
			return 'Apply'
		}
		if (isApplicationClosed) {
			return 'Apply'
		}
		if (isApplicationOpen && !isAdminOrOwner) {
			return 'Apply'
		}
		if ((isApplicationOpen || isVotingOpen || isVotingNotStarted) && isAdminOrOwner) {
			return 'View'
		}
		if (isCompleted) {
			if (!storage.my_address) return 'Login'
			return 'View Result'
		}
		return 'Application Closed'
	}

	const isMainActionDisabled = () => {
		// For completed rounds (Round Results tab), only disable if no approved projects
		if (isCompleted) {
			return totalApprovedProjects === 0
		}

		// For other tabs, use the existing logic
		return (
			isApplicationClosed ||
			(isUserApplied && isApplicationOpen) ||
			isNotStarted ||
			isVotingNotStarted
		)
	}

	const handleFundRound = () => {
		if (!connectedWallet) {
			onOpenStellarWallet()
			return
		}
		setShowFundRoundModal(true)
	}

	const getHelperText = () => {
		if (currentTime === 'upcoming-not-started') {
			return `Application starts ${moment(new Date(doc.application_start || '')).fromNow()}`
		}
		if (currentTime === 'upcoming-open') {
			return 'Accepting Applications'
		}
		if (currentTime === 'upcoming' || currentTime === 'upcoming-closed') {
			return 'Applications Closed'
		}
		if (currentTime === 'on-going-voting-not-started') {
			return `Voting starts ${moment(new Date(doc.voting_start)).fromNow()}`
		}
		if (currentTime === 'on-going') {
			return 'Voting Open'
		}
		if (currentTime === 'ended') {
			return 'Round Completed'
		}
		if (currentTime === 'payout-pending' && totalApprovedProjects === 0) {
			return 'No results'
		}
		if (currentTime === 'payout-pending') {
			return 'Payout Pending'
		}
		if (currentTime === 'payout-done') {
			return 'Payout Distributed'
		}
		return ''
	}

	const currentStageColorClass = () => {
		if (isApplicationOpen) return 'fill-grantpicks-green-700'
		if (isVotingOpen) return 'fill-grantpicks-green-700'
		if (isVotingNotStarted) return 'fill-amber-500'
		if (isNotStarted) return 'fill-amber-500'
		if (isApplicationClosed) return 'fill-grantpicks-black-400'
		if (isCompleted) return 'fill-grantpicks-amber-500'
		return 'fill-grantpicks-black-400'
	}


	return (
		<div
			onClick={() => router.push(`/round/${doc.on_chain_id}`)}
			className="group relative bg-white rounded-2xl border-2 border-grantpicks-black-100 hover:border-grantpicks-black-200 cursor-pointer transition-all duration-300 h-full flex flex-col overflow-hidden shadow-sm hover:shadow-xl"
		>
			{/* Gradient Accent Bar */}
			<div
				className={clsx(
					'h-1.5 w-full',
					selectedRoundType === 'upcoming'
						? 'bg-gradient-to-r from-orange-400 to-orange-600'
						: selectedRoundType === 'ended'
							? 'bg-gradient-to-r from-purple-500 to-purple-700'
							: 'bg-gradient-to-r from-green-400 to-green-600',
				)}
			/>

			<div className="p-6 flex-1 flex flex-col">
				<RoundCardHeader
					currentTime={currentTime}
					selectedRoundType={selectedRoundType}
				/>

				<div className="flex-1">
					<RoundCardContent
						doc={doc}
						selectedRoundType={selectedRoundType}
						currentTime={currentTime}
						totalApprovedProjects={totalApprovedProjects}
						isAdminOrOwner={isAdminOrOwner}
						pendingApplicationsCount={pendingApplicationsCount}
					/>
				</div>

				<div className="mt-6 pt-4 border-t border-grantpicks-black-100">
					<RoundCardActions
						actionText={getMainActionText()}
						isDisabled={isMainActionDisabled()}
						onClick={handleMainAction}
						showFundButton={!doc?.round_complete}
						disableFundButton={!doc?.use_vault}
						onFundRound={handleFundRound}
						helperText={getHelperText()}
						helperColorClass={currentStageColorClass()}
						hasVoted={hasVoted}
						isUserApplied={isUserApplied}
						isVotingOpen={isVotingOpen}
						isApplicationOpen={isApplicationOpen}
						isAdminOrOwner={isAdminOrOwner}
					/>
				</div>
			</div>

			{/* Hover Effect Overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-grantpicks-black-950/0 to-grantpicks-black-950/0 group-hover:from-grantpicks-black-950/2 group-hover:to-grantpicks-black-950/5 transition-all duration-300 pointer-events-none rounded-2xl" />

			{showFundRoundModal && (
				<FundRoundModal
					isOpen={showFundRoundModal}
					onClose={(e?: any) => {
						e?.stopPropagation()
						setShowFundRoundModal(false)
					}}
					doc={doc}
					mutateRounds={mutateRounds}
				/>
			)}
		</div>
	)
}
