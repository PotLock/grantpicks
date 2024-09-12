import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import IconSearch from '../../svgs/IconSearch'
import Image from 'next/image'
import Button from '../../commons/Button'
import IconAdd from '../../svgs/IconAdd'
import IconTrash from '../../svgs/IconTrash'
import { useWallet } from '@/app/providers/WalletProvider'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import {
	getProjects,
	IGetProjectsResponse,
} from '@/services/on-chain/project-registry'
import { Network } from '@/types/on-chain'
import { LIMIT_SIZE } from '@/constants/query'
import useSWRInfinite from 'swr/infinite'
import InfiniteScroll from 'react-infinite-scroll-component'
import IconLoading from '../../svgs/IconLoading'
import { UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form'
import { CreateRoundData } from '@/types/form'
import { prettyTruncate } from '@/utils/helper'
import ProjectDetailDrawer from '../round-vote/ProjectDetailDrawer'
import { IProjectDetailOwner } from '@/app/round-vote/[roundId]/page'
import { Project } from 'project-registry-client'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'

interface AddProjectsModalProps extends BaseModalProps {
	selectedProjects: IGetProjectsResponse[]
	setSelectedProjects: Dispatch<SetStateAction<IGetProjectsResponse[]>>
	append: UseFieldArrayAppend<CreateRoundData, 'projects'>
	remove: UseFieldArrayRemove
}

const AddProjectsModal = ({
	isOpen,
	onClose,
	selectedProjects,
	setSelectedProjects,
	append,
	remove,
}: AddProjectsModalProps) => {
	const { stellarPubKey, connectedWallet } = useWallet()
	const [tempSelectedProjects, setTempSelectedProjects] = useState<
		IGetProjectsResponse[]
	>([])
	const [searchProject, setSearchProject] = useState<string>('')
	const [showProjectDetailDrawer, setShowProjectDetailDrawer] =
		useState<IProjectDetailOwner>({ isOpen: false, project: null })
	const onFetchProjects = async (key: { skip: number; limit: number }) => {
		const contracts = new Contracts(
			process.env.NETWORK_ENV as Network,
			undefined,
		)
		const resProjects = await getProjects(
			{
				skip: key.skip,
				limit: key.limit,
			},
			contracts,
		)
		return resProjects
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
		}
	}
	const {
		data: projectData,
		size,
		setSize,
		isValidating,
		isLoading,
	} = useSWRInfinite(getKey, async (key) => await onFetchProjects(key), {
		revalidateFirstPage: false,
	})
	const projects = projectData
		? ([] as IGetProjectsResponse[]).concat(...projectData)
		: []
	const hasMore = projectData
		? projectData[projectData.length - 1].length >= LIMIT_SIZE
		: false

	useEffect(() => {
		if (isOpen) {
			setTempSelectedProjects(selectedProjects)
		}
	}, [isOpen])

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-white w-11/12 md:w-[60vw] lg:w-[45vw] mx-auto rounded-xl border border-black/10 shadow">
				<div className="p-4 bg-grantpicks-black-50 flex items-center justify-between rounded-t-xl">
					<div>
						<p className="text-base font-bold text-grantpicks-black-950">
							Add Projects
						</p>
						<p className="text-base font-normal text-grantpicks-black-950">
							Select projects you want to add
						</p>
					</div>
					<IconClose
						size={24}
						className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
						onClick={() => onClose()}
					/>
				</div>
				{tempSelectedProjects.length > 0 && (
					<div className="p-4">
						<p className="text-sm font-normal text-grantpicks-black-600 mb-2">
							ADDED PROJECTS
						</p>
						<div className="overflow-y-auto max-h-[20vh]">
							{tempSelectedProjects.map((selected, index) => (
								<div
									className="flex items-center justify-between p-2 hover:bg-grantpicks-black-200 transition"
									key={index}
								>
									<div className="flex items-center space-x-2">
										<Image
											src="/assets/images/ava-1.png"
											alt=""
											className="rounded-full object-fill"
											width={24}
											height={24}
										/>
										<button
											onClick={() => {
												setShowProjectDetailDrawer((prev) => ({
													...prev,
													isOpen: true,
													project: selected as Project,
												}))
											}}
											className="text-base font-normal"
										>
											{prettyTruncate(selected.name, 20, 'address')}
										</button>
									</div>
									<IconTrash
										size={24}
										className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...tempSelectedProjects]
											temp.splice(index, 1)
											setTempSelectedProjects(temp)
										}}
									/>
								</div>
							))}
						</div>
					</div>
				)}
				<div className="py-3 px-4 flex items-center space-x-2 border-b border-black/10">
					<IconSearch size={18} className="fill-grantpicks-black-400" />
					<input
						type="text"
						className="outline-none border-none placeholder-grantpicks-black-600"
						placeholder="Search projects.."
						onChange={(e) => setSearchProject(e.target.value)}
						value={searchProject}
					/>
				</div>
				<div className="p-4">
					<p className="text-sm font-normal text-grantpicks-black-600 mb-2">
						ALL PROJECTS
					</p>
					{projects.length === 0 ? (
						<div className="h-20 flex items-center justify-center">
							<p className="text-sm font-light text-grantpicks-black-600">
								No projects found yet
							</p>
						</div>
					) : isLoading ? (
						<div className="h-20 flex items-center justify-center">
							<IconLoading size={24} className="fill-grantpicks-black-600" />
						</div>
					) : (
						<div
							id="scrollProjectsContainer"
							className="overflow-y-auto max-h-[30vh]"
						>
							<InfiniteScroll
								dataLength={projects.length}
								next={() => !isValidating && setSize(size + 1)}
								hasMore={hasMore}
								style={{ display: 'flex', flexDirection: 'column' }}
								scrollableTarget="scrollProjectsContainer"
								loader={
									<div className="my-2 flex items-center justify-center">
										<IconLoading
											size={24}
											className="fill-grantpicks-black-600"
										/>
									</div>
								}
							>
								{projects
									.filter(
										(project) =>
											!tempSelectedProjects
												.map((tsp) => BigInt(tsp.id).toString())
												.includes(BigInt(project.id).toString()),
									)
									?.map((project, index) => (
										<div
											className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-grantpicks-black-200 transition"
											key={index}
											onClick={() =>
												tempSelectedProjects.length < 10
													? setTempSelectedProjects((prev) => [
															project,
															...prev,
														])
													: toast.error('Max. 10 projects', {
															style: toastOptions.error.style,
														})
											}
										>
											<Image
												src={`/assets/images/ava-1.png`}
												alt=""
												className="rounded-full object-fill"
												width={24}
												height={24}
											/>
											<p className="text-base font-normal">
												{prettyTruncate(project.name, 20, 'address')}
											</p>
										</div>
									))}
							</InfiniteScroll>
						</div>
					)}
				</div>
				<div className="px-4 py-3">
					<Button
						color="black"
						className="!rounded-full !py-3"
						isFullWidth
						onClick={() => {
							setSelectedProjects(tempSelectedProjects)
							onClose()
						}}
					>
						<div className="flex items-center space-x-2">
							<IconAdd size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Add</p>
						</div>
					</Button>
				</div>
			</div>
			<ProjectDetailDrawer
				isOpen={showProjectDetailDrawer?.isOpen || false}
				onClose={() =>
					setShowProjectDetailDrawer((prev) => ({
						...prev,
						isOpen: false,
					}))
				}
				projectData={showProjectDetailDrawer.project || undefined}
			/>
		</Modal>
	)
}

export default AddProjectsModal
