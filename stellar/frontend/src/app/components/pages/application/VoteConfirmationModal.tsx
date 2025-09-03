import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconNear from '../../svgs/IconNear'
import IconStellar from '../../svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import useRoundStore from '@/stores/zustand/useRoundStore'
import IconCube from '../../svgs/IconCube'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import Button from '../../commons/Button'
import { getPairsRound, getRoundApplications } from '@/services/stellar/round'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import { formatNearAmount } from 'near-api-js/lib/utils/format'
import { ChainId } from '@/types/context'
import { ListExternal } from '../../../../../lists-client/src'
import Link from 'next/link'

interface VoteConfirmationModalProps extends BaseModalProps {
	data?: GPRound
	chainId?: ChainId
}

const VoteConfirmationModal = ({
	isOpen,
	onClose,
	data,
	chainId,
}: VoteConfirmationModalProps) => {
	const router = useRouter()
	const { connectedWallet, stellarPubKey, nearAccounts } = useWallet()
	const [totalProjects, setTotalProjects] = useState<number>(0)
	const storage = useAppStorage()
	const [isRegistered, setIsRegistered] = useState<boolean>(true)
	const [listDetails, setListDetails] = useState<ListExternal | undefined>(undefined)
	const [loading, setLoading] = useState<boolean>(true)

	const connectedChain = useMemo(() => {
		return storage.chainId || 'stellar'
	}, [storage])


	const fetchIsRegistered = useCallback(async () => {
		if (data?.application_wl_list_id) {
			const contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}
			try {
				const isRegistered = await contracts.lists_contract.is_registered({
					list_id: BigInt(data?.application_wl_list_id),
					registrant_id: stellarPubKey,
					required_status: undefined,
				})
				setIsRegistered(isRegistered.result)

				const listDetails = await contracts.lists_contract.get_list({
					list_id: BigInt(data?.application_wl_list_id),
				})
				setListDetails(listDetails.result || {})
				setLoading(false)
			} catch (error) {
				console.log('error fetch list details', error)
				setLoading(false)
			}
		}
	}, [stellarPubKey, data])



	const onFetchTotalProjects = useCallback(async () => {
		try {
			if (chainId === ChainId.STELLAR) {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const newRes = await getPairsRound(
					BigInt(data?.on_chain_id || ''),
					contracts,
				)
				const uniqueProjects = new Set()
				newRes.map((pair) => {
					uniqueProjects.add(pair.projects[0].toString())
					uniqueProjects.add(pair.projects[1].toString())
				})

				setTotalProjects(uniqueProjects.size)
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const pairs = await contracts.round.getPairsRound(
					Number(data?.on_chain_id || ''),
				)

				const uniqueProjects = new Set()

				pairs.map((pair) => {
					uniqueProjects.add(pair.projects[0])
					uniqueProjects.add(pair.projects[1])
				})

				setTotalProjects(uniqueProjects.size)
			}
		} catch (error: any) {
			console.log('error', error)
			setTotalProjects(0)
		}
	}, [chainId, data, storage])

	useEffect(() => {
		if (isOpen) {
			onFetchTotalProjects()
			fetchIsRegistered()
		}
	}, [isOpen, fetchIsRegistered, onFetchTotalProjects])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="w-11/12 md:w-[500px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4 md:p-8 lg:p-10">
				<div className="flex items-center">
					<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
						{connectedWallet === 'near' ? (
							<IconNear size={16} className="fill-grantpicks-black-950" />
						) : (
							<IconStellar size={16} className="fill-grantpicks-black-950" />
						)}
					</div>
				</div>
				<p className="text-grantpicks-black-950 text-2xl md:text-3xl lg:text-[32px] font-semibold mb-4">
					{data?.name}
				</p>
				<p className="text-sm font-normal text-grantpicks-black-600 line-clamp-5 mb-4">
					{data?.description}
				</p>
				<div className="flex items-center justify-between mb-6 md:mb-8 lg:mb-10">
					<div className="flex flex-1 items-center space-x-1">
						<IconGroup size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{totalProjects} Projects
						</p>
					</div>
					<div className="flex flex-1 items-center space-x-1">
						<IconCube size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							{data?.num_picks_per_voter} Vote
							{(data?.num_picks_per_voter || 0) > 1 && `s`} per person
						</p>
					</div>
					<div className="flex flex-1 items-center justify-end space-x-1">
						<IconClock size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-normal text-grantpicks-black-950">
							Ends{` `}
							{moment(new Date(data?.voting_end || '')).fromNow()}
						</p>
					</div>
				</div>
				<div className="flex items-center mb-6 md:mb-8 lg:mb-10">
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{connectedChain === 'stellar'
								? formatStroopToXlm(BigInt(data?.current_vault_balance || '0'))
								: formatNearAmount(data?.current_vault_balance || '0')}{' '}
							{connectedChain === 'stellar' ? 'XLM' : 'NEAR'}
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							AVAILABLE FUNDS
						</p>
					</div>
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{connectedChain === 'stellar'
								? formatStroopToXlm(BigInt(data?.expected_amount || '0'))
								: data?.expected_amount || '0'}{' '}
							{connectedChain === 'stellar' ? 'XLM' : 'NEAR'}
						</p>
						<p className="font-semibolEXPECTED FUNDSd text-xs text-grantpicks-black-600">

						</p>
					</div>
				</div>

				{listDetails?.name && (
					<div className="flex flex-col w-full mt-6">
						<p className="text-sm font-semibold text-grantpicks-black-950">
							This is a private round. You must be an approved registrant to{` `}
							<Link className='text-blue-500' href={`/list/${listDetails.id}`} target="_blank">{listDetails.name}</Link> list to vote.
						</p>
					</div>
				)}
				<div className="pt-4 pb-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-2 w-full">
					<div className="flex-1">
						<Button
							color="alpha-50"
							isFullWidth
							onClick={() => {
								onClose()
							}}
							className="!py-3 flex-1 !border !border-grantpicks-black-400"
						>
							Cancel
						</Button>
					</div>
					<div className="flex-1">
						<Button
							isFullWidth
							isDisabled={!isRegistered}
							onClick={() => {
								if (!stellarPubKey && !nearAccounts[0]?.accountId) {
									toast.error('Please connect your wallet to vote', {
										style: toastOptions.error.style,
									})
								} else if (!isRegistered) {
									toast.error('You are not eligible to vote in this round', {
										style: toastOptions.error.style,
									})
								} else {
									router.push(`/rounds/round-vote/${data?.on_chain_id}`)
								}
								onClose()
							}}
							className="!py-3 flex-1"
						>
							{isRegistered ? 'Proceed' : 'Not Eligible to Vote'}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default VoteConfirmationModal
