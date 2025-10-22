import { RegistrationExternal } from 'lists-client'
import { useState } from 'react'
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
						>
							<div className="flex flex-col divide-y divide-gray-100 bg-white rounded-xl shadow-lg">
								{Object.keys(listRegistrationStatuses).map((status) => (
									<button
										key={status}
										className={`px-4 py-2 text-left text-sm hover:bg-gray-100 ${selectedStatus === status ? 'font-semibold text-blue-600' : ''}`}
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
				<div className="flex flex-wrap gap-3">
					{isLoading && !filteredProjects ? (
						<div className="mt-8 mx-auto px-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{Array.from({ length: 4 }).map((_, i) => (
									<ProjectCardSkeleton key={i} />
								))}
							</div>
						</div>
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
	const { data, isLoading, error } = useProject({ projectId: project.registrant_id })


	const status = project.status.tag
	const badgeStyle =
		listRegistrationStatuses[status] || listRegistrationStatuses['Pending']
	const badge = (
		<span
			className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-2"
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
		<div className="flex flex-col w-full md:w-[360px] bg-white rounded-2xl border border-gray-200 shadow-sm p-6  min-h-[260px] transition-all hover:shadow-md hover:border-gray-300">
			<div className="flex items-center gap-4 w-full">
				<div className="relative">
					<div className="rounded-full p-[3px] bg-gradient-to-tr from-emerald-400 to-cyan-400">
						<Image
							src={`https://www.tapback.co/api/avatar/${project.registrant_id}`}
							alt=""
							className="rounded-full object-cover ring-2 ring-white"
							width={72}
							height={72}
						/>
					</div>
				</div>
				<div className="flex-1 min-w-0">
					<div className="font-semibold text-lg leading-snug">
						{data?.name || prettyTruncate(project.registrant_id, 20, 'address')}
					</div>
					<div
						onClick={() => {
							navigator.clipboard.writeText(project.registrant_id)
							toast.success('Address copied to clipboard', {
								style: toastOptions.success.style,
							})
						}}
						className="relative group flex items-center gap-2 mt-1"
					>
						<span className="text-sm cursor-pointer text-gray-500 font-mono truncate">
							{prettyTruncate(project.registrant_id, 20, 'address')}
						</span>
						<IconCopy
							size={16}
							className="fill-gray-300 cursor-pointer group-hover:opacity-80 transition"
						/>
						<div className="absolute w-[300px] z-50 left-0 top-full mt-2 rounded-md whitespace-normal break-all h-auto bg-grantpicks-black-950 text-white px-3 py-1 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition text-sm md:text-sm font-semibold">
							{project.registrant_id}
						</div>
					</div>
				</div>
			</div>
			<div className="mt-3">{badge}</div>
			<p
				className="mt-3 text-sm text-gray-600"
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
					>
						<div className="flex flex-col bg-white rounded-xl shadow-lg p-1">
							{Object.keys(listRegistrationStatuses).map((statusKey) => {
								const isActive = statusKey === status
								return (
									<button
										key={statusKey}
										className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm rounded-lg hover:bg-gray-100 ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
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
	<div className="flex flex-col items-center bg-white rounded-xl border border-black/10 shadow w-full md:w-[360px] p-6 min-h-[240px] animate-pulse">
		<div className="rounded-full bg-gray-200 w-16 h-16 mb-4" />
		<div className="h-5 w-24 bg-gray-200 rounded mb-2" />
		<div className="h-4 w-16 bg-gray-100 rounded" />
	</div>
)

const ProjectCardError = () => (
	<div className="flex flex-col items-center bg-white rounded-xl border border-red-200 shadow p-6 min-h-[240px]">
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
	Unregistered: {
		color: '#F6F5F3',
		background: '#DD3345',
	},
	Human: {
		color: '#0B7A74',
		background: '#EFFEFA',
	},
}
