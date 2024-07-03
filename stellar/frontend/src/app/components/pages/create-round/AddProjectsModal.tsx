import React, { Dispatch, SetStateAction, useState } from 'react'
import Modal from '../../commons/Modal'
import { BaseModalProps } from '@/types/dialog'
import IconClose from '../../svgs/IconClose'
import IconSearch from '../../svgs/IconSearch'
import Image from 'next/image'
import Button from '../../commons/Button'
import IconAdd from '../../svgs/IconAdd'
import IconTrash from '../../svgs/IconTrash'

interface AddProjectsModalProps extends BaseModalProps {
	selectedProjects: string[]
	setSelectedProjects: Dispatch<SetStateAction<string[]>>
}

const AddProjectsModal = ({
	isOpen,
	onClose,
	selectedProjects,
	setSelectedProjects,
}: AddProjectsModalProps) => {
	const [searchProject, setSearchProject] = useState<string>('')
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className="bg-white w-[45vw] mx-auto rounded-xl border border-black/10 shadow">
				<div className="p-4 bg-grantpicks-black-200 flex items-center justify-between rounded-t-xl">
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
				{selectedProjects.length > 0 && (
					<div className="p-4">
						<p className="text-sm font-normal text-grantpicks-black-600 mb-2">
							ADDED PROJECTS
						</p>
						<div className="overflow-y-auto max-h-[20vh]">
							{selectedProjects.map((selected, index) => (
								<div
									className="flex items-center justify-between p-2 cursor-pointer hover:bg-grantpicks-black-200 transition"
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
										<p className="text-base font-normal">{selected}</p>
									</div>
									<IconTrash
										size={24}
										className="fill-grantpicks-black-400 cursor-pointer transition hover:opacity-80"
										onClick={() => {
											let temp = [...selectedProjects]
											temp.splice(index, 1)
											setSelectedProjects(temp)
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
					<div className="overflow-y-auto max-h-[30vh]">
						{[...Array(10)].map((d, index) => (
							<div
								className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-grantpicks-black-200 transition"
								key={index}
								onClick={() =>
									setSelectedProjects((prev) => [...prev, `Label-${index}`])
								}
							>
								<Image
									src="/assets/images/ava-1.png"
									alt=""
									className="rounded-full object-fill"
									width={24}
									height={24}
								/>
								<p className="text-base font-normal">Label</p>
							</div>
						))}
					</div>
				</div>
				<div className="px-4 py-3">
					<Button
						color="black"
						className="!rounded-full !py-3"
						isFullWidth
						onClick={() => {}}
					>
						<div className="flex items-center space-x-2">
							<IconAdd size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Add</p>
						</div>
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default AddProjectsModal
