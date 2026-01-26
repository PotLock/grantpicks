import React, { Dispatch, SetStateAction } from 'react'
import { useFormContext } from 'react-hook-form'
import Image from 'next/image'
import clsx from 'clsx'
import InfiniteScroll from 'react-infinite-scroll-component'
import IconAdd from '@/app/components/svgs/IconAdd'
import IconClose from '@/app/components/svgs/IconClose'
import IconInfoCircle from '@/app/components/svgs/IconInfoCircle'
import IconLoading from '@/app/components/svgs/IconLoading'
import IconExpandLess from '@/app/components/svgs/IconExpandLess'
import IconExpandMore from '@/app/components/svgs/IconExpandMore'
import { Tooltip } from 'react-tooltip'
import { CreateRoundData } from '@/types/form'
import { IndexerProjectResponse } from '@/services/stellar/project-registry'
import { prettyTruncate } from '@/utils/helper'
import AddProjectsModal from '../AddProjectsModal'
import AddAdminsModal from '../AddAdminsModal'

interface Step4ProjectsPermissionsProps {
	selectedProjects: IndexerProjectResponse[]
	setSelectedProjects: Dispatch<SetStateAction<IndexerProjectResponse[]>>
	selectedAdmins: string[]
	setSelectedAdmins: Dispatch<SetStateAction<string[]>>
	showAddProjectsModal: boolean
	setShowAddProjectsModal: (show: boolean) => void
	showAddAdminsModal: boolean
	setShowAddAdminsModal: (show: boolean) => void
	appendProject: any
	removeProject: any
	appendAdmin: any
	removeAdmin: any
	showLists: boolean
	setShowLists: (show: boolean) => void
	lists: any[]
	checkedListIds: bigint[]
	setCheckedListIds: (ids: bigint[]) => void
	showApplicationLists: boolean
	setShowApplicationLists: (show: boolean) => void
	checkedApplicationListIds: bigint[]
	setCheckedApplicationListIds: (ids: bigint[]) => void
	isValidating: boolean
	setSize: (size: number) => void
	size: number
	isReachingEnd: boolean
	networkError: any
	isLoading: boolean
	isOwner: (id: string) => boolean
	isAdmin: (admins: string[]) => boolean
}

const Step4ProjectsPermissions: React.FC<Step4ProjectsPermissionsProps> = ({
	selectedProjects,
	setSelectedProjects,
	selectedAdmins,
	setSelectedAdmins,
	showAddProjectsModal,
	setShowAddProjectsModal,
	showAddAdminsModal,
	setShowAddAdminsModal,
	appendProject,
	removeProject,
	appendAdmin,
	removeAdmin,
	showLists,
	setShowLists,
	lists,
	checkedListIds,
	setCheckedListIds,
	showApplicationLists,
	setShowApplicationLists,
	checkedApplicationListIds,
	setCheckedApplicationListIds,
	isValidating,
	setSize,
	size,
	isReachingEnd,
	networkError,
	isLoading,
	isOwner,
	isAdmin,
}) => {
	const { watch, setValue } = useFormContext<CreateRoundData>()
	const allowApplication = watch('allow_application')
	const isProjectsRequired = !allowApplication
	const hasMinimumProjects = selectedProjects.length >= 2
	const showProjectsError = isProjectsRequired && !hasMinimumProjects

	return (
		<div className="space-y-6 animate-fadeIn pb-10">
			{/* Projects Section */}
			<div className={clsx(
				"p-6 rounded-2xl shadow-md bg-white border-2 transition-colors",
				showProjectsError ? "border-red-500 bg-red-50/30" : "border-transparent"
			)}>
				<div className="flex items-center justify-between w-full">
					<div className="flex-1">
						<div className="flex items-center space-x-2 mb-1">
							<p className="text-base font-bold text-grantpicks-black-950">
								Add Projects
								{isProjectsRequired && (
									<span className="text-red-600 ml-1">*</span>
								)}
							</p>
							<a data-tooltip-id="add_projects_tooltip">
								<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
							</a>
							<Tooltip
								id="add_projects_tooltip"
								place="top"
								content={
									!allowApplication
										? 'Minimum 2 projects required since applications are disabled'
										: 'Add initial projects for the round (optional)'
								}
							/>
						</div>
						<p className="text-sm font-normal text-grantpicks-black-600">
							{isProjectsRequired
								? 'You must add at least 2 projects since applications are disabled.'
								: 'Add projects that will participate in this round.'
							}
						</p>
						{showProjectsError && (
							<p className="text-red-600 text-xs font-medium mt-2 flex items-center gap-1">
								<span>⚠️</span>
								<span>At least 2 projects are required when applications are disabled</span>
							</p>
						)}
					</div>
					<button
						type="button"
						onClick={() => setShowAddProjectsModal(true)}
						className="rounded-full w-12 h-12 flex items-center justify-center bg-grantpicks-black-50 hover:bg-grantpicks-black-100 transition"
					>
						<IconAdd size={24} className="fill-grantpicks-black-950" />
					</button>
				</div>

				{isProjectsRequired && (
					<div className="mt-4 p-3 bg-grantpicks-black-50 rounded-xl border border-grantpicks-black-200">
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium text-grantpicks-black-700">
								Projects added: <span className={clsx("font-bold", hasMinimumProjects ? "text-green-600" : "text-red-600")}>{selectedProjects.length}</span>
							</p>
							{hasMinimumProjects ? (
								<span className="text-xs font-bold text-green-600">✓ Requirement met</span>
							) : (
								<span className="text-xs font-bold text-red-600">⚠ Need {2 - selectedProjects.length} more</span>
							)}
						</div>
					</div>
				)}
				{selectedProjects.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
						{selectedProjects.map((selected, index) => (
							<div
								key={selected.on_chain_id}
								className="bg-grantpicks-black-50 p-2 rounded-full flex items-center justify-between border border-black/5"
							>
								<div className="flex items-center space-x-2">
									<Image
										src={`https://www.tapback.co/api/avatar/${selected.owner?.id}`}
										alt=""
										className="rounded-full"
										width={28}
										height={28}
									/>
									<p className="text-xs font-bold text-grantpicks-black-950 truncate max-w-[100px]">
										{selected.name}
									</p>
								</div>
								<button
									type="button"
									onClick={() => {
										const temp = [...selectedProjects]
										temp.splice(index, 1)
										setSelectedProjects(temp)
										removeProject(index)
									}}
								>
									<IconClose size={18} className="fill-grantpicks-black-400 hover:fill-red-500 transition" />
								</button>
							</div>
						))}
					</div>
				) : (
					<div className={clsx(
						"mt-6 py-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors",
						showProjectsError
							? "border-red-300 bg-red-50/50"
							: "border-grantpicks-black-100"
					)}>
						<p className={clsx(
							"text-sm font-medium",
							showProjectsError ? "text-red-600" : "text-grantpicks-black-400"
						)}>
							{showProjectsError
								? "⚠️ No projects added - at least 2 required"
								: "No projects added yet"
							}
						</p>
					</div>
				)}
			</div>

			{/* Admins Section */}
			<div className="p-5 rounded-2xl shadow-md bg-white">
				<div className="flex items-center justify-between w-full">
					<div>
						<p className="text-base font-bold text-grantpicks-black-950">Add Admins</p>
						<p className="text-sm font-normal text-grantpicks-black-600">
							Grant permissions to others to help manage this round.
						</p>
					</div>
					<button
						type="button"
						onClick={() => setShowAddAdminsModal(true)}
						className="rounded-full w-12 h-12 flex items-center justify-center bg-grantpicks-black-50 hover:bg-grantpicks-black-100 transition"
					>
						<IconAdd size={24} className="fill-grantpicks-black-950" />
					</button>
				</div>

				{selectedAdmins.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
						{selectedAdmins.map((selected, index) => (
							<div
								key={selected}
								className="bg-grantpicks-black-50 p-2 rounded-full flex items-center justify-between border border-black/5"
							>
								<div className="flex items-center space-x-2">
									<Image
										src={`https://www.tapback.co/api/avatar/${selected}`}
										alt="admin"
										className="rounded-full"
										width={28}
										height={28}
									/>
									<p className="text-xs font-bold text-grantpicks-black-950">
										{prettyTruncate(selected, 8, 'address')}
									</p>
								</div>
								<button
									type="button"
									onClick={() => {
										const temp = [...selectedAdmins]
										temp.splice(index, 1)
										setSelectedAdmins(temp)
										removeAdmin(index)
									}}
								>
									<IconClose size={18} className="fill-grantpicks-black-400 hover:fill-red-500 transition" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Voter Requirements */}
			<div className="p-5 rounded-2xl shadow-md bg-white">
				<div className="flex items-center justify-between pb-4 border-b border-black/10">
					<div className="flex items-center space-x-2">
						<p className="text-base font-semibold text-grantpicks-black-950">Voter Requirements</p>
						<a data-tooltip-id="voter_req_tooltip">
							<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
						</a>
						<Tooltip
							id="voter_req_tooltip"
							place="top"
							content="Restrict voting to users on a specific whitelist"
						/>
					</div>
				</div>

				<button
					type="button"
					onClick={() => setShowLists(!showLists)}
					className="flex justify-between w-full items-center py-4 hover:bg-grantpicks-black-50 px-2 rounded-xl transition mt-2"
				>
					<p className="font-bold text-sm text-grantpicks-black-950">Select Whitelist</p>
					{showLists ? (
						<IconExpandLess size={24} className="stroke-grantpicks-black-400" />
					) : (
						<IconExpandMore size={24} className="stroke-grantpicks-black-400" />
					)}
				</button>

				{showLists && (
					<div id="scrollListsContainer" className="max-h-[400px] overflow-y-auto pr-2 mt-2 space-y-2">
						<InfiniteScroll
							scrollableTarget="scrollListsContainer"
							dataLength={lists.length}
							next={() => !isValidating && setSize(size + 1)}
							hasMore={!isReachingEnd}
							loader={
								<div className="py-4 flex justify-center">
									<IconLoading size={24} className="fill-grantpicks-black-600" />
								</div>
							}
						>
							{lists.map((list) => (
								<label
									key={list.on_chain_id}
									className={clsx(
										'flex items-center gap-x-4 p-3 rounded-xl border cursor-pointer transition-all',
										checkedListIds.includes(BigInt(list.on_chain_id))
											? 'border-grantpicks-black-950 bg-grantpicks-black-50'
											: 'border-transparent hover:bg-grantpicks-black-50',
									)}
								>
									<input
										type="radio"
										className="h-5 w-5 accent-grantpicks-black-950"
										checked={checkedListIds.includes(BigInt(list.on_chain_id))}
										onChange={() => {
											setCheckedListIds([BigInt(list.on_chain_id)])
											setValue('voting_wl_list_id', BigInt(list.on_chain_id))
										}}
									/>
									<div className="flex flex-1 items-center justify-between">
										<div className="flex items-center gap-x-3">
											<div className="w-12 h-8 relative rounded overflow-hidden">
												<Image src="/assets/images/default-list-image.png" alt="list" fill className="object-cover" />
											</div>
											<div>
												<p className="font-bold text-sm text-grantpicks-black-950">{list.name}</p>
												<p className="text-xs text-grantpicks-black-500">{list.registrations_count} Eligible</p>
											</div>
										</div>
										<div className="flex gap-x-1">
											{isOwner(list.owner.id) && (
												<span className="px-2 py-0.5 bg-grantpicks-black-950 text-[10px] text-white rounded-full font-bold">OWNER</span>
											)}
											{isAdmin(list.admins) && (
												<span className="px-2 py-0.5 bg-grantpicks-black-100 text-[10px] text-grantpicks-black-950 rounded-full font-bold">ADMIN</span>
											)}
										</div>
									</div>
								</label>
							))}
						</InfiniteScroll>
					</div>
				)}
			</div>

			{/* Application Requirements */}
			{
				allowApplication && (
					<div className="p-5 rounded-2xl shadow-md bg-white">
						<div className="flex items-center justify-between pb-4 border-b border-black/10">
							<div className="flex items-center space-x-2">
								<p className="text-base font-semibold text-grantpicks-black-950">Application Requirements</p>
								<a data-tooltip-id="app_req_tooltip">
									<IconInfoCircle size={16} className="stroke-grantpicks-black-600" />
								</a>
								<Tooltip
									id="app_req_tooltip"
									place="top"
									content="Only projects on this whitelist can apply"
								/>
							</div>
						</div>

						<button
							type="button"
							onClick={() => setShowApplicationLists(!showApplicationLists)}
							className="flex justify-between w-full items-center py-4 hover:bg-grantpicks-black-50 px-2 rounded-xl transition mt-2"
						>
							<p className="font-bold text-sm text-grantpicks-black-950">Select Whitelist</p>
							{showApplicationLists ? (
								<IconExpandLess size={24} className="stroke-grantpicks-black-400" />
							) : (
								<IconExpandMore size={24} className="stroke-grantpicks-black-400" />
							)}
						</button>

						{showApplicationLists && (
							<div id="scrollAppListsContainer" className="max-h-[400px] overflow-y-auto pr-2 mt-2 space-y-2">
								<InfiniteScroll
									scrollableTarget="scrollAppListsContainer"
									dataLength={lists.length}
									next={() => !isValidating && setSize(size + 1)}
									hasMore={!isReachingEnd}
									loader={
										<div className="py-4 flex justify-center">
											<IconLoading size={24} className="fill-grantpicks-black-600" />
										</div>
									}
								>
									{lists.map((list) => (
										<label
											key={list.on_chain_id}
											className={clsx(
												'flex items-center gap-x-4 p-3 rounded-xl border cursor-pointer transition-all',
												checkedApplicationListIds.includes(BigInt(list.on_chain_id))
													? 'border-grantpicks-black-950 bg-grantpicks-black-50'
													: 'border-transparent hover:bg-grantpicks-black-50',
											)}
										>
											<input
												type="radio"
												className="h-5 w-5 accent-grantpicks-black-950"
												checked={checkedApplicationListIds.includes(BigInt(list.on_chain_id))}
												onChange={() => {
													setCheckedApplicationListIds([BigInt(list.on_chain_id)])
													setValue('application_wl_list_id', BigInt(list.on_chain_id))
												}}
											/>
											<div className="flex flex-1 items-center justify-between">
												<div className="flex items-center gap-x-3">
													<div className="w-12 h-8 relative rounded overflow-hidden">
														<Image src="/assets/images/default-list-image.png" alt="list" fill className="object-cover" />
													</div>
													<div>
														<p className="font-bold text-sm text-grantpicks-black-950">{list.name}</p>
														<p className="text-xs text-grantpicks-black-500">{list.registrations_count} Eligible</p>
													</div>
												</div>
											</div>
										</label>
									))}
								</InfiniteScroll>
							</div>
						)}
					</div>
				)
			}

			<AddProjectsModal
				isOpen={showAddProjectsModal}
				onClose={() => setShowAddProjectsModal(false)}
				selectedProjects={selectedProjects}
				setSelectedProjects={setSelectedProjects}
				append={appendProject}
				remove={removeProject}
			/>
			<AddAdminsModal
				isOpen={showAddAdminsModal}
				onClose={() => setShowAddAdminsModal(false)}
				selectedAdmins={selectedAdmins}
				setSelectedAdmins={setSelectedAdmins}
				append={appendAdmin}
				remove={removeAdmin}
			/>
		</div >
	)
}

export default Step4ProjectsPermissions
