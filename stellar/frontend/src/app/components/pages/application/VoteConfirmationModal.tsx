import React, { useCallback, useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconStellar from '../../svgs/IconStellar'
import { useWallet } from '@/app/providers/WalletProvider'
import IconCube from '../../svgs/IconCube'
import IconGroup from '../../svgs/IconGroup'
import IconClock from '../../svgs/IconClock'
import moment from 'moment'
import { formatStroopToXlm } from '@/utils/helper'
import Button from '../../commons/Button'
import { getPairsRound } from '@/services/stellar/round'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { GPRound } from '@/models/round'
import { ListExternal } from '../../../../../lists-client/src'
import Link from 'next/link'
import IconClose from '../../svgs/IconClose'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { useGlobalContext } from '@/app/providers/GlobalProvider'

interface VoteConfirmationModalProps extends BaseModalProps {
	data?: GPRound
}

const VoteConfirmationModal = ({
	isOpen,
	onClose,
	data,
}: VoteConfirmationModalProps) => {
	const router = useRouter()
	const { stellarPubKey, onOpenStellarWallet, stellarKit } = useWallet()
	const { openPageLoading, dismissPageLoading } = useGlobalContext()
	const [totalProjects, setTotalProjects] = useState<number>(0)
	const storage = useAppStorage()
	const [isRegistered, setIsRegistered] = useState<boolean>(true)
	const [listDetails, setListDetails] = useState<ListExternal | undefined>(
		undefined,
	)
	const [loading, setLoading] = useState<boolean>(true)
	const [isRegistering, setIsRegistering] = useState<boolean>(false)

	// Check if user can auto-register
	const canAutoRegister = useCallback(() => {
		if (!listDetails || isRegistered) return false
		return (
			listDetails.admin_only_registrations === false &&
			listDetails.default_registration_status?.tag === 'Approved'
		)
	}, [listDetails, isRegistered])

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
					required_status: {
						tag: 'Approved',
						values: undefined,
					},
				})
				setIsRegistered(isRegistered.result)

				const listDetails = await contracts.lists_contract.get_list({
					list_id: BigInt(data?.application_wl_list_id),
				})
				console.log(listDetails)
				setListDetails(listDetails.result || {})
				setLoading(false)
			} catch (error) {
				console.log('error fetch list details', error)
				setLoading(false)
			}
		}
	}, [stellarPubKey, data, storage])

	const handleAutoRegisterAndVote = useCallback(async () => {
		if (!stellarPubKey || !data?.application_wl_list_id || !listDetails) return

		try {
			setIsRegistering(true)
			openPageLoading()

			const contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}

			// Register to list
			const txRegisterList = await contracts.lists_contract.register_batch({
				submitter: stellarPubKey,
				list_id: BigInt(data.application_wl_list_id),
				notes: 'Auto-registered to vote in round',
				registrations: undefined,
			})

			const txHashRegister = await contracts.signAndSendTx(
				stellarKit as StellarWalletsKit,
				txRegisterList.toXDR(),
				stellarPubKey,
			)

			if (txHashRegister) {
				dismissPageLoading()
				setIsRegistered(true)
				toast.success('Successfully registered to list!', {
					style: toastOptions.success.style,
				})
				// Proceed to vote
				router.push(`/rounds/round-vote/${data?.on_chain_id}`)
				onClose()
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(error?.message || 'Failed to register to list', {
				style: toastOptions.error.style,
			})
			console.log('error auto-registering', error)
		} finally {
			setIsRegistering(false)
		}
	}, [stellarPubKey, data, listDetails, storage, stellarKit, router, onClose, openPageLoading, dismissPageLoading])

	const onFetchTotalProjects = useCallback(async () => {
		try {
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
		} catch (error: any) {
			console.log('error', error)
			setTotalProjects(0)
		}
	}, [data, storage])

	useEffect(() => {
		if (isOpen) {
			onFetchTotalProjects()
			fetchIsRegistered()
		}
	}, [isOpen, fetchIsRegistered, onFetchTotalProjects])

	return (
		<Modal
			closeOnBgClick={true}
			closeOnEscape={true}
			isOpen={isOpen}
			onClose={onClose}
		>
			<div className="w-11/12 md:w-[500px] mx-auto bg-white rounded-2xl border border-black/10 shadow p-4 md:p-8 lg:p-10">
				<div className="flex items-center justify-between">
					<div className="border border-black/10 rounded-full p-3 flex items-center justify-center mb-4">
						<IconStellar size={16} className="fill-grantpicks-black-950" />
					</div>
					<IconClose
						onClick={onClose}
						size={24}
						className="cursor-pointer fill-grantpicks-black-950 mb-4"
					/>
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
							{formatStroopToXlm(BigInt(data?.current_vault_balance || '0'))}{' '}
							XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							AVAILABLE FUNDS
						</p>
					</div>
					<div className="flex-1">
						<p className="font-semibold text-lg md:text-xl text-grantpicks-black-950">
							{formatStroopToXlm(BigInt(data?.expected_amount || '0'))} XLM
						</p>
						<p className="font-semibold text-xs text-grantpicks-black-600">
							EXPECTED FUNDS
						</p>
					</div>
				</div>

				{listDetails?.name && !isRegistered && (
					<div className="flex flex-col w-full mt-6">
						{canAutoRegister() ? (
							<p className="text-sm font-semibold text-grantpicks-black-950">
								This is a private round. You will be automatically registered to the{' '}
								<Link
									className="text-blue-500"
									href={`/list/${listDetails.id}`}
									target="_blank"
								>
									{listDetails.name}
								</Link>{' '}
								list when you proceed to vote.
							</p>
						) : (
							<p className="text-sm font-semibold text-grantpicks-black-950">
								This is a private round. You must be an approved registrant to
								{` `}
								<Link
									className="text-blue-500"
									href={`/list/${listDetails.id}`}
									target="_blank"
								>
									{listDetails.name}
								</Link>{' '}
								list to vote.
							</p>
						)}
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
							isDisabled={!isRegistered && !canAutoRegister()}
							isLoading={isRegistering}
							onClick={async () => {
								if (!stellarPubKey) {
									onOpenStellarWallet()
									onClose()
								} else if (!isRegistered && canAutoRegister()) {
									// Auto-register and proceed to vote
									await handleAutoRegisterAndVote()
								} else if (!isRegistered) {
									toast.error('You are not eligible to vote in this round', {
										style: toastOptions.error.style,
									})
									onClose()
								} else {
									router.push(`/rounds/round-vote/${data?.on_chain_id}`)
									onClose()
								}
							}}
							className="!py-3 flex-1"
						>
							{!stellarPubKey
								? 'Connect Wallet'
								: isRegistering
									? 'Registering...'
									: isRegistered
										? 'Proceed'
										: canAutoRegister()
											? 'Register & Vote'
											: 'Not Eligible to Vote'}
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	)
}

export default VoteConfirmationModal
