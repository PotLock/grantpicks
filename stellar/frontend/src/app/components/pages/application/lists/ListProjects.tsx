import { RegistrationExternal } from 'lists-client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Menu from '@/app/components/commons/Menu'
import { useSingleList } from './hooks/useSingleList'
import { mutate } from 'swr'
import { prettyTruncate } from '@/utils/helper'
import IconCopy from '@/app/components/svgs/IconCopy'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { useProject } from '@/app/components/hooks/useProject'

type StatusTag =
	| 'Pending'
	| 'Approved'
	| 'Rejected'
	| 'Graylisted'
	| 'Blacklisted'

export const ListProjects = ({
	listId,
	isOwner,
}: {
	listId: string
	isOwner: boolean
}) => {
	const [selectedStatus, setSelectedStatus] = useState<StatusTag>('Approved')
	const [menuOpen, setMenuOpen] = useState(false)
	const filterButtonRef = useRef<HTMLButtonElement>(null)

	const {
		registrations: projects,
		isLoadingRegistrations: isLoading,
		handleUpdateProjectStatus,
	} = useSingleList({
		listId,
		requiredStatus: { tag: selectedStatus, values: undefined },
	})

	const handleStatusUpdate = async (
		projectId: bigint,
		status: { tag: StatusTag; values: undefined },
	) => {
		await handleUpdateProjectStatus(projectId, status)
		await mutate(`list-registrations-${listId}-${selectedStatus}`)
	}

	const filteredProjects = projects || []

	return (
		<div className="mt-8 mx-auto md:px-0 px-4">
			<div className="bg-white rounded-xl shadow p-6">
				<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
					<div className="font-semibold text-lg">
						Members{' '}
						<span className="text-gray-500 font-normal">
							({filteredProjects.length})
						</span>
					</div>
					<div className="relative">
						<button
							ref={filterButtonRef}
							className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 min-w-[160px] flex items-center justify-between gap-2 bg-white"
							onClick={() => setMenuOpen((open) => !open)}
							type="button"
						>
							{selectedStatus}
							<svg
								className="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</button>
						<Menu
							isOpen={menuOpen}
							onClose={() => setMenuOpen(false)}
							position="right-0 mt-2"
							className="min-w-[160px]"
							buttonRef={filterButtonRef}
							mobileAsPortal={true}
						>
							<div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
								{Object.keys(listRegistrationStatuses).map((status) => (
									<button
										key={status}
										type="button"
										className={`px-4 py-2 text-left text-sm hover:bg-gray-100 ${selectedStatus === status ? 'font-semibold text-blue-600' : 'text-gray-500'}`}
										onMouseDown={(e) => {
											// Ensure selection happens even if menu closes on mousedown.
											e.preventDefault()
											e.stopPropagation()
											setSelectedStatus(status as StatusTag)
											setMenuOpen(false)
										}}
										onClick={() => {
											setSelectedStatus(status as StatusTag)
											setMenuOpen(false)
										}}
									>
										{status}
									</button>
								))}
							</div>
						</Menu>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{isLoading ? (
						<>
							{Array.from({ length: 6 }).map((_, i) => (
								<ProjectCardSkeleton key={i} />
							))}
						</>
					) : filteredProjects.length === 0 ? (
						<div className="col-span-full text-center h-[200px] flex items-center justify-center text-gray-400">
							No projects found for this status.
						</div>
					) : (
						filteredProjects.map((project: RegistrationExternal) => (
							<ProjectCard
								key={project.id}
								project={project}
								isOwner={isOwner}
								handleUpdateProjectStatus={handleStatusUpdate}
							/>
						))
					)}
				</div>
			</div>
		</div>
	)
}

const ProjectCard = ({
	project,
	isOwner,
	handleUpdateProjectStatus,
}: {
	project: RegistrationExternal
	isOwner: boolean
	handleUpdateProjectStatus: (
		projectId: bigint,
		status: { tag: StatusTag; values: undefined },
	) => Promise<void>
}) => {
	const [menuOpen, setMenuOpen] = useState(false)
	const updateStatusButtonRef = useRef<HTMLButtonElement>(null)
	const { data, isLoading, error } = useProject({ projectId: project.registrant_id })


	const status = project.status.tag
	const badgeStyle =
		listRegistrationStatuses[status] || listRegistrationStatuses['Pending']
	const badge = (
		<span
			className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
			style={{
				color: badgeStyle.color,
				background: badgeStyle.background,
				border: `1px solid ${badgeStyle.color}`,
			}}
		>
			{status}
		</span>
	)

	if (isLoading) return <ProjectCardSkeleton />
	if (error) return <ProjectCardError />


	return (
		<div className="flex flex-col w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-[260px] transition-all hover:shadow-md hover:border-gray-300">
			<div className="flex items-start gap-4 w-full">
				<div className="relative">
					<div className="rounded-full p-[3px] bg-gradient-to-tr from-emerald-400 to-cyan-400 shadow-sm">
						<Image
							src={`https://www.tapback.co/api/avatar/${project.registrant_id}`}
							alt=""
							className="rounded-full object-cover ring-2 ring-white"
							width={72}
							height={72}
						/>
					</div>
				</div>
				<div className="flex-1 min-w-0 overflow-hidden">
					<div className="font-semibold text-lg leading-tight truncate">
						{data?.name || prettyTruncate(project.registrant_id, 20, 'address')}
					</div>
					<div
						onClick={() => {
							navigator.clipboard.writeText(project.registrant_id)
							toast.success('Address copied to clipboard', {
								style: toastOptions.success.style,
							})
						}}
						className="relative group flex items-center gap-2 mt-1 w-full min-w-0"
					>
						<span className="text-sm cursor-pointer text-gray-500 font-mono truncate flex-1 min-w-0">
							{prettyTruncate(project.registrant_id, 20, 'address')}
						</span>
						<IconCopy
							size={16}
							className="fill-gray-300 cursor-pointer group-hover:opacity-80 transition flex-shrink-0"
						/>
						<div className="absolute w-[300px] z-50 left-0 top-full mt-2 rounded-md whitespace-normal break-all h-auto bg-grantpicks-black-950 text-white px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition text-xs md:text-sm font-semibold">
							{project.registrant_id}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-2">{badge}</div>
			<p
				className="mt-2 text-[15px] leading-relaxed text-gray-700"
				style={{
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
				}}
			>
				{data?.overview ?? ''}
			</p>
			<div className="h-px w-full bg-gray-100 mt-4" />
			{isOwner && (
				<div className="relative mt-4">
					<button
						ref={updateStatusButtonRef}
						className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 min-w-[160px] flex items-center justify-between gap-2 bg-white hover:border-gray-400"
						onClick={() => setMenuOpen((open) => !open)}
						type="button"
					>
						Update Status
						<svg
							className="w-4 h-4 ml-2"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<Menu
						isOpen={menuOpen}
						onClose={() => setMenuOpen(false)}
						position="right-0 mt-2"
						className="min-w-[200px]"
						buttonRef={updateStatusButtonRef}
						mobileAsPortal={true}
					>
						<div className="flex flex-col bg-white rounded-xl shadow-lg p-1">
							{Object.keys(listRegistrationStatuses).map((statusKey) => {
								const isActive = statusKey === status
								return (
									<button
										key={statusKey}
										type="button"
										className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-100 ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
										onMouseDown={(e) => {
											e.preventDefault()
											e.stopPropagation()
											handleUpdateProjectStatus(project.id, {
												tag: statusKey as StatusTag,
												values: undefined,
											})
											setMenuOpen(false)
										}}
										onClick={() => {
											handleUpdateProjectStatus(project.id, {
												tag: statusKey as StatusTag,
												values: undefined,
											})
											setMenuOpen(false)
										}}
									>
										<span>{statusKey}</span>
										{isActive && (
											<svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										)}
									</button>
								)
							})}
						</div>
					</Menu>
				</div>
			)}
		</div>
	)
}

const ProjectCardSkeleton = () => (
	<div className="flex flex-col items-center bg-white rounded-xl border border-black/10 shadow w-full p-6 min-h-[240px] animate-pulse">
		<div className="rounded-full bg-gray-200 w-16 h-16 mb-4" />
		<div className="h-5 w-24 bg-gray-200 rounded mb-2" />
		<div className="h-4 w-16 bg-gray-100 rounded" />
	</div>
)

const ProjectCardError = () => (
	<div className="flex flex-col items-center bg-white rounded-xl border border-red-200 shadow p-6 min-h-[240px] w-full">
		<div className="rounded-full bg-red-100 w-16 h-16 mb-4 flex items-center justify-center text-red-400 text-2xl">
			!
		</div>
		<div className="font-bold text-xl text-center mt-4 mb-2 text-red-600">
			Error
		</div>
		<div className="text-sm text-red-400">Failed to load project</div>
	</div>
)

const listRegistrationStatuses = {
	Approved: {
		color: '#0B7A74',
		background: '#EFFEFA',
	},
	Rejected: {
		color: '#ED464F',
		background: '#FEF3F2',
	},
	Pending: {
		color: '#EA6A25',
		background: '#FEF6EE',
	},
	Graylisted: {
		color: '#fff',
		background: '#7b7b7bd8',
	},
	Blacklisted: {
		color: '#fff',
		background: '#292929',
	},
}
