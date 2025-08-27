import React, { useMemo } from 'react'
import Drawer from '../../commons/Drawer'
import { IDrawerProps } from '@/types/dialog'
import useRoundStore from '@/stores/zustand/useRoundStore'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { useWallet } from '@/app/providers/WalletProvider'
import { getProjects, IGetProjectsResponse } from '@/services/stellar/project-registry'
import useSWRInfinite from 'swr/infinite'
import { LIMIT_SIZE } from '@/constants/query'
import { GPRound } from '@/models/round'
import { extractChainId } from '@/utils/helper'

// Components
import RoundStatusBadge from './components/RoundStatusBadge'
import RoundHeader from './components/RoundHeader'
import FundingInfo from './components/FundingInfo'
import OwnerAdminSection from './components/OwnerAdminSection'
import ContactsSection from './components/ContactsSection'
import ActionButtons from './components/ActionButtons'
import Button from '../../commons/Button'

interface RoundDetailDrawerProps extends IDrawerProps {
	doc: GPRound
	onOpenFundRound: () => void
	onApplyRound: () => void
	onVote: () => void
	isUserApplied: boolean
	showClose?: boolean
}

const RoundDetailDrawer = ({
	isOpen,
	onClose,
	doc,
	isUserApplied,
	onOpenFundRound,
	onApplyRound,
	onVote,
	showClose,
}: RoundDetailDrawerProps) => {
	const { selectedRoundType } = useRoundStore()
	const storage = useAppStorage()
	const chainId = extractChainId(doc)
	const { connectedWallet } = useWallet()

	const onFetchProjects = async (key: { skip: number; limit: number }) => {
		if (storage.chainId === 'stellar') {
			const contracts = storage.getStellarContracts()
			if (!contracts) return []

			return await getProjects(
				{
					skip: key.skip,
					limit: key.limit,
				},
				contracts,
			)
		} else {
			const contracts = storage.getNearContracts(null)
			if (!contracts) return []

			const listId = process.env.NEAR_PROJECTS_LIST_ID || '1'
			const resProjects = await contracts.lists.getRegistrations(
				listId,
				key.skip,
				key.limit,
			)

			const projectAddresses = resProjects.map(
				(project: any) => project.registrant_id,
			)

			const getProjectsDetail = projectAddresses.map((address: string) => {
				return contracts.near_social.getProjectData(address)
			})

			const resProjectsDetail = await Promise.all(getProjectsDetail)

			return resProjectsDetail.map((data: any, index: number) => {
				const json = data[`${projectAddresses[index]}`]['profile']['gp_project'] || '{}'
				return JSON.parse(json)
			})
		}
	}

	const getKey = (
		pageIndex: number,
		previousPageData: IGetProjectsResponse[],
	) => {
		if (!connectedWallet && !isOpen) return null
		if (previousPageData && !previousPageData.length) return null

		return {
			url: `get-projects`,
			skip: pageIndex,
			limit: LIMIT_SIZE,
			chainId: storage.chainId,
		}
	}

	const {
		data: projectData,
		isLoading: isLoadingProjects,
	} = useSWRInfinite(getKey, async (key) => await onFetchProjects(key), {
		revalidateFirstPage: false,
	})

	const projects = projectData
		? ([] as IGetProjectsResponse[]).concat(
			...(projectData as any as IGetProjectsResponse[]),
		)
		: []

	const currentTime = useMemo(() => {
		if (selectedRoundType === 'upcoming') {
			const now = new Date().getTime()
			const appStart = new Date(doc.application_start || '').getTime()
			const appEnd = new Date(doc.application_end || '').getTime()
			const votingStart = new Date(doc.voting_start || '').getTime()

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
			return 'on-going'
		} else {
			return doc.round_complete != null ? 'ended' : 'payout-pending'
		}
	}, [selectedRoundType, doc])





	return (
		<Drawer onClose={onClose} showClose={showClose} isOpen={isOpen}>
			<div className="bg-white p-4 flex flex-col w-full h-full overflow-y-auto">
				<div className="flex justify-end">
					<Button className='md:hidden bg-grantpicks-black-600 text-white' onClick={onClose}>X</Button>
				</div>
				<RoundStatusBadge
					selectedRoundType={selectedRoundType}
					currentTime={currentTime}
				/>

				<RoundHeader
					doc={doc}
					chainId={chainId}
					selectedRoundType={selectedRoundType}
					currentTime={currentTime}
				/>

				<FundingInfo
					doc={doc}
					chainId={chainId}
				/>

				<OwnerAdminSection
					doc={doc}
					admins={doc.admins || []}
					projects={projects}
					isLoading={false}
					isValidating={false}
					isLoadingProjects={isLoadingProjects}
				/>

				<ContactsSection contacts={doc.contacts} />

				<ActionButtons
					selectedRoundType={selectedRoundType}
					currentTime={currentTime}
					doc={doc}
					isUserApplied={isUserApplied}
					onApplyRound={onApplyRound}
					onOpenFundRound={onOpenFundRound}
					onVote={onVote}
					onClose={onClose}
				/>
			</div>
		</Drawer>
	)
}

export default RoundDetailDrawer
