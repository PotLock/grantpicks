import { IDrawerProps } from '@/types/dialog'
import React, { useEffect, useRef, useState } from 'react'
import Drawer from '../../commons/Drawer'
import IconPause from '../../svgs/IconPause'
import IconPlay from '../../svgs/IconPlay'
import { useModalContext } from '@/app/providers/ModalProvider'
import { fetchYoutubeIframe, prettyTruncate } from '@/utils/helper'
import Button from '../../commons/Button'
import IconArrowOutward from '../../svgs/IconArrowOutward'
import Link from 'next/link'
import { Project } from 'project-registry-client'
import Image from 'next/image'
import { Contact } from 'round-client'
import IconTelegram from '../../svgs/IconTelegram'
import IconInstagram from '../../svgs/IconInstagram'
import IconTwitter from '../../svgs/IconTwitter'
import IconEmail from '../../svgs/IconEmail'

interface ProjectDetailDrawerProps extends IDrawerProps {
	projectData?: Project
}

const RoundDetailContact = ({ contact }: { contact: Contact }) => {
	const generateLink = () => {
		if (contact.name.toLowerCase().includes('telegram')) {
			return `https://t.me/${contact.value}`
		} else if (contact.name.toLowerCase().includes('instagram')) {
			return `https://instagram.com/${contact.value}`
		} else if (contact.name.toLowerCase().includes('twitter')) {
			return `https://x.com/${contact.value}`
		} else if (contact.name.toLowerCase().includes('email')) {
			return `mailto:${contact.value}`
		} else return ``
	}
	return (
		<>
			<div className="flex items-center space-x-3">
				<div className="bg-grantpicks-black-50 rounded-full w-10 h-10 flex items-center justify-center">
					{contact.name.toLowerCase().includes('telegram') && (
						<IconTelegram size={18} className="fill-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('instagram') && (
						<IconInstagram size={18} className="stroke-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('twitter') && (
						<IconTwitter size={18} className="fill-grantpicks-black-400" />
					)}
					{contact.name.toLowerCase().includes('email') && (
						<IconEmail size={18} className="fill-grantpicks-black-400" />
					)}
				</div>
				<p className="text-grantpicks-black-950 font-semibold text-base">
					{contact.name.toLowerCase().includes('telegram') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('instagram') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('twitter') &&
						`@${contact.value}`}
					{contact.name.toLowerCase().includes('email') && `@${contact.value}`}
				</p>
			</div>
			<Link href={generateLink()} target="_blank">
				<Button
					color="alpha-50"
					onClick={() => {}}
					className="!text-sm !font-semibold"
				>
					Chat
				</Button>
			</Link>
		</>
	)
}

const ProjectDetailDrawer = ({
	onClose,
	isOpen,
	projectData,
}: ProjectDetailDrawerProps) => {
	const [videoPlayed, setVideoPlayed] = useState<boolean>(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const { setVideoPlayerProps } = useModalContext()
	const [copied, setCopied] = useState<boolean>(false)
	const [ytIframe, setYtIframe] = useState<string>('')
	const embededYtHtmlRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const fetchIframe = async () => {
			const res = await fetchYoutubeIframe(
				projectData?.video_url || '',
				embededYtHtmlRef.current?.clientWidth || 0,
			)
			setYtIframe(res?.html)
		}
		if (
			isOpen &&
			projectData?.video_url &&
			projectData?.video_url.includes('youtube')
		) {
			fetchIframe()
		}
	}, [isOpen])

	return (
		<Drawer onClose={onClose} isOpen={true}>
			<div className="bg-white flex flex-col w-full h-full overflow-y-auto text-grantpicks-black-950">
				<div className="bg-grantpicks-black-50 flex flex-col items-center justify-center pt-10 md:pt-12 px-3 md:px-5 pb-6">
					<Image
						src="/assets/images/ava-1.png"
						alt=""
						className="rounded-full object-fill mb-2 md:mb-3"
						width={56}
						height={56}
					/>
					<p className="text-[25px] font-semibold text-center">
						{projectData?.name}
					</p>
				</div>
				<div ref={embededYtHtmlRef} className="px-3 md:px-5 py-6">
					{!ytIframe && (
						<div className="relative mb-6 md:mb-8">
							<video
								ref={videoRef}
								src={projectData?.video_url || `/assets/videos/video-2.mp4`}
								autoPlay={false}
								controls={false}
								className="w-full mx-auto aspect-video"
							></video>
							<div className="flex items-center justify-center absolute inset-0 z-20">
								<button
									onClick={async () => {
										setVideoPlayerProps((prev) => ({
											...prev,
											isOpen: true,
											videoUrl:
												projectData?.video_url || `/assets/videos/video-2.mp4`,
										}))
									}}
									className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
								>
									{videoPlayed ? (
										<IconPause
											size={28}
											className="fill-grantpicks-black-400"
										/>
									) : (
										<IconPlay
											size={28}
											className="stroke-grantpicks-black-400"
										/>
									)}
								</button>
							</div>
						</div>
					)}
					{ytIframe && (
						<div
							className="mb-6 md:mb-8"
							dangerouslySetInnerHTML={{ __html: ytIframe }}
						/>
					)}
					<div className="mb-6 md:mb-8">
						<p className="text-base md:text-xl font-semibold mb-3">Overview</p>
						<p className="text-sm md:text-base text-grantpicks-black-600">
							{projectData?.overview}
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<p className="text-base md:text-xl font-semibold mb-3">
							Why we are a public good
						</p>
						<p className="text-sm md:text-base text-grantpicks-black-600">
							{projectData?.overview}
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<p className="text-xs font-semibold text-grantpicks-black-600 mb-3">
							TOTAL FUNDING RAISED
						</p>
						<p className="text-base md:text-xl lg:text-[25px] font-normal">
							--
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-2 border-b border-black/10 mb-4">
							<p className="text-base md:text-xl font-semibold">
								Team Size{' '}
								<span className="text-grantpicks-black-600 ml-2">
									{(projectData?.admins.length || 0) + 1}
								</span>
							</p>
						</div>
						<div className="space-y-3 md:space-y-4">
							{projectData?.admins.map((admin, index) => (
								<div className="flex items-center space-x-2" key={index}>
									<Image
										src={`https://www.tapback.co/api/avatar/${admin}`}
										alt="admin"
										width={24}
										height={24}
									/>
									<div>
										<p className="text-sm md:text-base font-bold">
											{prettyTruncate(admin, 20, 'address')}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-4 border-b border-black/10">
							<p className="text-base md:text-xl font-semibold">
								Smart contracts{' '}
							</p>
						</div>
						<div className="divide-y divide-black/10">
							{projectData?.contracts.map((contract, index) => (
								<div
									className="flex items-center py-2 justify-between"
									key={index}
								>
									<div>
										<p className="text-sm md:text-base font-normal">
											{prettyTruncate(contract.contract_address, 20)}
										</p>
										<p className="text-xs font-normal">{contract.name}</p>
									</div>
									<Button
										color="alpha-50"
										onClick={async () => {
											setCopied(true)
											await navigator.clipboard.writeText(
												contract.contract_address,
											)
											setTimeout(() => {
												setCopied(false)
											}, 2000)
										}}
									>
										{copied ? 'Copied' : 'Copy'}
									</Button>
								</div>
							))}
						</div>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-4 border-b border-black/10">
							<p className="text-base md:text-xl font-semibold">
								Repositories{' '}
							</p>
						</div>
						<div className="divide-y divide-black/10">
							{projectData?.repositories.map((repo, index) => (
								<Link
									key={index}
									href={repo.url || `https://github.com`}
									target="_blank"
								>
									<div className="flex items-center py-2 justify-between">
										<p className="text-sm md:text-base font-normal">
											{repo.label}
										</p>
										<IconArrowOutward
											size={24}
											className="fill-grantpicks-black-400 cursor-pointer"
										/>
									</div>
								</Link>
							))}
						</div>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-4 border-b border-black/10">
							<p className="text-base md:text-xl font-semibold">Contacts</p>
						</div>
						{projectData?.contacts.length === 0 ? (
							<div className="flex items-center justify-center h-20">
								<p className="text-center text-sm text-grantpicks-black-400">
									No contacts yet
								</p>
							</div>
						) : (
							<div>
								{projectData?.contacts.map((contact, idx) => (
									<div
										key={idx}
										className="flex items-center justify-between pt-3"
									>
										<RoundDetailContact contact={contact} />
									</div>
								))}
							</div>
						)}
					</div>{' '}
				</div>
			</div>
		</Drawer>
	)
}

export default ProjectDetailDrawer
