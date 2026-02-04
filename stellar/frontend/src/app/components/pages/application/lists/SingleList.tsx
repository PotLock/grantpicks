'use client'

import Button from '@/app/components/commons/Button'
import Modal from '@/app/components/commons/Modal'
import Menu from '@/app/components/commons/Menu'
import { useSingleList } from '@/app/components/pages/application/lists/hooks/useSingleList'
import { useWallet } from '@/app/providers/WalletProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { prettyTruncate } from '@/utils/helper'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
	FaUsers,
	FaCheckCircle,
	FaUserFriends,
	FaCalendar,
} from 'react-icons/fa'
import { useCallback, useEffect, useState } from 'react'
import { RegisterUsersModal } from './RegisterUsersModal'
import { ListProjects } from './ListProjects'
import IconMoreVert from '@/app/components/svgs/IconMoreVert'
import { getProjectApplicant } from '@/services/stellar/project-registry'
import { useModalContext } from '@/app/providers/ModalProvider'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import IconCopy from '@/app/components/svgs/IconCopy'
import ShareButton from '@/app/components/pages/round-view/ShareButton'

export const SingleListPage = () => {
	const params = useParams()
	const storage = useAppStorage()
	const router = useRouter()
	const searchParams = useSearchParams()
	const listId = params.listId as string
	const { stellarPubKey, onOpenStellarWallet } = useWallet()
	const {
		data: list,
		isLoading,
		isError,
		handleDeleteList,
	} = useSingleList({ listId })
	const [isOpen, setIsOpen] = useState<{
		open: boolean
		type: 'SINGLE' | 'BATCH' | null
	}>({ open: false, type: null })
	const [menuOpen, setMenuOpen] = useState(false)
	const [isDeleteOpen, setIsDeleteOpen] = useState(false)
	const [isRegistered, setIsRegistered] = useState(false)
	const [isUserAProject, setIsUserAProject] = useState(true)
	const { setCreateProjectFormMainProps } = useModalContext()

	const isUserAProjectCallback = useCallback(async () => {
		const contracts = storage.getStellarContracts()
		if (!contracts) {
			return false
		}
		try {
			if (!stellarPubKey) return false
			const res = await getProjectApplicant(stellarPubKey, contracts)
			const candidate = (res as any)?.ok ?? (res as any)?.result ?? (res as any)?.value ?? res
			const looksLikeProject =
				!!candidate &&
				typeof candidate === 'object' &&
				!('error' in (candidate as any)) &&
				!('err' in (candidate as any)) &&
				typeof (candidate as any).owner === 'string' &&
				typeof (candidate as any).name === 'string'

			setIsUserAProject(looksLikeProject)
			return looksLikeProject
		} catch (error) {
			console.log('error', error)
			return false
		}
	}, [stellarPubKey, storage])

	const addApplyQuery = () => {
		const currentParams = new URLSearchParams(searchParams.toString())
		currentParams.set('apply_list', listId)
		router.push(`?${currentParams.toString()}`, {
			scroll: false,
		})
	}

	const fetchIsRegistered = useCallback(async () => {
		if (list) {
			if (!stellarPubKey) {
				return
			}
			const contracts = storage.getStellarContracts()
			if (!contracts) {
				return
			}
			try {
				const isRegistered = await contracts.lists_contract.is_registered({
					list_id: BigInt(listId),
					registrant_id: stellarPubKey,
					required_status: undefined,
				})
				setIsRegistered(isRegistered?.result || false)
			} catch (error) {
				console.log('error fetch is registered', error)
			}
		}
	}, [listId, stellarPubKey, storage, list])

	useEffect(() => {
		isUserAProjectCallback()
		fetchIsRegistered()
	}, [fetchIsRegistered, isUserAProjectCallback])

	if (isLoading && !list) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="w-full max-w-5xl">
					<div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden animate-pulse">
						<div className="h-56 md:h-64 bg-grantpicks-black-100" />
						<div className="p-6 md:p-10">
							<div className="h-7 w-2/3 bg-grantpicks-black-100 rounded mb-3" />
							<div className="h-4 w-1/3 bg-grantpicks-black-100 rounded mb-8" />
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="h-24 bg-grantpicks-black-100 rounded-2xl" />
								<div className="h-24 bg-grantpicks-black-100 rounded-2xl" />
								<div className="h-24 bg-grantpicks-black-100 rounded-2xl" />
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center px-4">
				<div className="bg-white rounded-3xl border border-black/5 shadow-sm p-8 text-center max-w-xl w-full">
					<h2 className="text-2xl font-black text-grantpicks-black-950 mb-2">Failed to load list</h2>
					<p className="text-grantpicks-black-600 mb-6">Please refresh the page or try again later.</p>
					<Button className="!rounded-full !px-7" onClick={() => router.push('/lists')}>
						Back to Lists
					</Button>
				</div>
			</div>
		)
	}

	const isOwner = list?.owner?.id === stellarPubKey

	const adminsCount = list?.admins.length || 0
	const membersCount = Number(list?.registrations_count) || 0
	const applicationStatus =
		list?.default_registration_status === 'Approved'
			? 'Auto-Approve'
			: list?.default_registration_status || 'Pending'
	const createdAt = list?.created_at
		? new Date(list.created_at).toLocaleDateString()
		: 'N/A'

	const canManage = !!stellarPubKey && (isOwner || list?.admins.includes(stellarPubKey))
	const registerDisabled =
		(list?.admin_only_registrations &&
			list?.owner?.id !== stellarPubKey &&
			!list?.admins.includes(stellarPubKey || '')) ||
		isRegistered

	const handlePrimaryAction = () => {
		if (!stellarPubKey) {
			onOpenStellarWallet()
			return
		}

		if (!isUserAProject) {
			addApplyQuery()
			setCreateProjectFormMainProps((prev) => ({
				...prev,
				isOpen: true,
			}))
			return
		}

		setIsOpen({
			open: true,
			type: list?.owner?.id === stellarPubKey ? 'BATCH' : 'SINGLE',
		})
	}

	return (
		<div className="min-h-screen text-grantpicks-black-950 bg-grantpicks-black-50/40 pb-14">
			<div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-10 pt-8">
				{/* Top bar */}
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<button
						type="button"
						onClick={() => router.push('/lists')}
						className="inline-flex items-center gap-2 text-sm font-semibold text-grantpicks-black-700 hover:text-grantpicks-black-950 transition-colors"
					>
						<span className="text-lg leading-none">←</span> Back to Lists
					</button>

					<div className="flex items-center gap-2">
						{list && (
							<ShareButton
								roundId={listId}
								userAccount={stellarPubKey || undefined}
								title={list.name}
								type="list"
							/>
						)}

						{canManage && (
							<div className="relative">
								<button
									className="h-10 w-10 rounded-full bg-white border border-black/10 shadow-sm flex items-center justify-center hover:bg-grantpicks-black-50 transition-colors"
									onClick={() => setMenuOpen(!menuOpen)}
									type="button"
								>
									<IconMoreVert size={20} className="fill-grantpicks-black-600" />
								</button>
								<Menu
									isOpen={menuOpen}
									onClose={() => setMenuOpen(false)}
									position="right-0 mt-2"
									className="min-w-[200px]"
								>
									<div className="flex flex-col divide-y divide-gray-100 bg-white rounded-2xl shadow-lg overflow-hidden">
										<button
											className="px-4 py-3 text-left text-sm font-semibold hover:bg-gray-50 transition-colors"
											onClick={() => {
												setMenuOpen(false)
												router.push(`/list/update/${listId}`)
											}}
										>
											Edit List
										</button>
										<button
											className="px-4 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:hover:bg-white"
											disabled={!isOwner}
											onClick={() => {
												setMenuOpen(false)
												setIsDeleteOpen(true)
											}}
										>
											Delete List
										</button>
									</div>
								</Menu>
							</div>
						)}
					</div>
				</div>

				{/* Hero */}
				<div className="mt-6 bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
					<div className="relative h-48 md:h-56">
						<Image
							src={list?.cover_image_url || '/assets/images/default-list-image.png'}
							alt="List cover"
							fill
							className="object-cover"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
						<div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
							<div className="min-w-0">
								<div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold">
									<FaCalendar className="opacity-90" />
									Created {createdAt}
								</div>
							</div>
							<div className="hidden sm:flex items-center gap-2">
								<Button
									isDisabled={registerDisabled}
									onClick={handlePrimaryAction}
									className="!rounded-full !px-6 shadow-lg"
								>
									{!stellarPubKey
										? 'Login to Apply'
										: isRegistered
											? 'Already Registered'
											: list?.owner?.id === stellarPubKey
												? 'Register Project(s)'
												: !isUserAProject
													? 'Create a Project to Apply'
													: 'Apply to List'}
								</Button>
							</div>
						</div>
					</div>

					<div className="p-5 sm:p-6 md:p-10">
						<div className="flex flex-col gap-5">
							<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
								<div className="min-w-0">
									<h1 className="text-3xl md:text-4xl font-black text-grantpicks-black-950 leading-tight break-words">
										{list?.name}
									</h1>

									<div className="mt-3 flex flex-wrap items-center gap-2">
										<div className="inline-flex items-center gap-2 bg-grantpicks-black-50 border border-black/5 px-3 py-2 rounded-full">
											<Image
												src={`https://www.tapback.co/api/avatar/${list?.owner?.id}`}
												alt="Owner avatar"
												width={22}
												height={22}
												className="rounded-full"
											/>
											<span className="text-sm font-bold text-grantpicks-black-800" title={list?.owner?.id || ''}>
												{list?.owner?.id ? prettyTruncate(list?.owner?.id, 12, 'address') : ''}
											</span>
											<IconCopy
												size={16}
												className="stroke-grantpicks-black-600 cursor-pointer hover:opacity-70 transition"
												onClick={async () => {
													await navigator.clipboard.writeText(list?.owner?.id || '')
													toast.success('Address copied', { style: toastOptions.success.style })
												}}
											/>
										</div>

										{list?.admin_only_registrations && (
											<span className="inline-flex items-center bg-grantpicks-amber-50 text-grantpicks-black-900 border border-black/5 px-3 py-2 rounded-full text-xs font-bold">
												Admin-only registrations
											</span>
										)}

										<span
											className="inline-flex items-center bg-grantpicks-purple-50 text-grantpicks-black-900 border border-black/5 px-3 py-2 rounded-full text-xs font-bold"
											title={
												applicationStatus === 'Auto-Approve'
													? 'New registrations are automatically approved.'
													: 'New registrations require manual approval.'
											}
											aria-label={
												applicationStatus === 'Auto-Approve'
													? 'Default registration status: Auto-Approve. New registrations are automatically approved.'
													: 'Default registration status: Pending. New registrations require manual approval.'
											}
										>
											Default: {applicationStatus}
										</span>
									</div>
								</div>

								{/* Mobile CTA */}
								<div className="sm:hidden">
									<Button
										isDisabled={registerDisabled}
										onClick={handlePrimaryAction}
										className="w-full !rounded-full !py-3"
									>
										{!stellarPubKey
											? 'Login to Apply'
											: isRegistered
												? 'Already Registered'
												: list?.owner?.id === stellarPubKey
													? 'Register Project(s)'
													: !isUserAProject
														? 'Create a Project to Apply'
														: 'Apply to List'}
									</Button>
								</div>
							</div>

							{/* Stats */}
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex items-center gap-4">
									<div className="p-4 rounded-2xl bg-grantpicks-purple-50 flex-shrink-0">
										<FaUsers className="text-2xl text-grantpicks-purple-600" />
									</div>
									<div>
										<div className="text-[11px] font-semibold text-grantpicks-black-500 tracking-[0.12em] uppercase">
											Members
										</div>
										<div className="text-3xl font-semibold text-grantpicks-black-950 leading-none">
											{membersCount}
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex items-center gap-4">
									<div className="p-4 rounded-2xl bg-grantpicks-blue-50 flex-shrink-0">
										<FaUserFriends className="text-2xl text-grantpicks-blue-600" />
									</div>
									<div>
										<div className="text-[11px] font-semibold text-grantpicks-black-500 tracking-[0.12em] uppercase">
											Admins
										</div>
										<div className="text-3xl font-semibold text-grantpicks-black-950 leading-none">
											{adminsCount}
										</div>
									</div>
								</div>

								<div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex items-center gap-4">
									<div className="p-4 rounded-2xl bg-grantpicks-amber-50 flex-shrink-0">
										<FaCheckCircle className="text-2xl text-grantpicks-amber-600" />
									</div>
									<div className="min-w-0">
										<div className="text-[11px] font-semibold text-grantpicks-black-500 tracking-[0.12em] uppercase">
											Registration
										</div>
										<div className="text-lg font-semibold text-grantpicks-black-950 leading-tight break-words">
											{applicationStatus}
										</div>
									</div>
								</div>
							</div>

							{/* About */}
							<div className="bg-grantpicks-black-50/40 border border-black/5 rounded-2xl p-5 md:p-6">
								<h2 className="text-lg font-black text-grantpicks-black-950 mb-2">
									About this list
								</h2>
								<p className="text-grantpicks-black-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
									{list?.description || 'No description provided.'}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Projects / Registrants */}
				<div className="mt-8">
					<ListProjects listId={listId} isOwner={isOwner} />
				</div>

				<Modal
					isOpen={isOpen.open}
					onClose={() => setIsOpen({ open: false, type: null })}
					closeOnBgClick={true}
					closeOnEscape={true}
				>
					<RegisterUsersModal
						type={isOpen.type || 'SINGLE'}
						listId={listId}
						onClose={() => setIsOpen({ open: false, type: null })}
					/>
				</Modal>
				<Modal
					isOpen={isDeleteOpen}
					onClose={() => setIsDeleteOpen(false)}
					closeOnBgClick={true}
					closeOnEscape={true}
				>
					<div className="flex bg-white rounded-3xl flex-col items-center justify-center p-6 max-w-md mx-auto border border-black/5 shadow-lg">
						{/* Warning Icon */}
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>

						{/* Title */}
						<h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
							Delete List
						</h2>

						{/* Description */}
						<p className="text-gray-600 text-sm text-center mb-6 leading-relaxed">
							Are you sure you want to delete{' '}
							<span className="font-semibold text-gray-900">
								&ldquo;{list?.name}&rdquo;
							</span>
							? This action cannot be undone and will permanently remove the list
							and all associated data.
						</p>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-3 w-full">
							<Button
								onClick={() => setIsDeleteOpen(false)}
								className="flex-1 bg-gray-100 !text-black hover:bg-gray-200 border border-gray-300 !rounded-full"
							>
								Cancel
							</Button>
							<Button
								onClick={handleDeleteList}
								className="flex-1 bg-red-600 hover:bg-red-700 text-white !rounded-full"
							>
								Delete List
							</Button>
						</div>
					</div>
				</Modal>
			</div>
		</div>
	)
}
