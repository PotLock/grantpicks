import { IDrawerProps } from '@/types/dialog'
import React, { useRef, useState } from 'react'
import Drawer from '../../commons/Drawer'
import { Project } from 'round-client'
import IconPause from '../../svgs/IconPause'
import IconPlay from '../../svgs/IconPlay'
import { useModalContext } from '@/app/providers/ModalProvider'
import { prettyTruncate } from '@/utils/helper'
import { useWallet } from '@/app/providers/WalletProvider'
import Button from '../../commons/Button'
import IconArrowOutward from '../../svgs/IconArrowOutward'
import Link from 'next/link'

interface ProjectDetailDrawerProps extends IDrawerProps {
	projectData?: Project
}

const ProjectDetailDrawer = ({
	onClose,
	isOpen,
	projectData,
}: ProjectDetailDrawerProps) => {
	const [videoPlayed, setVideoPlayed] = useState<boolean>(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const { setVideoPlayerProps } = useModalContext()
	const { stellarPubKey } = useWallet()
	const [copied, setCopied] = useState<boolean>(false)

	return (
		<Drawer onClose={onClose} isOpen={isOpen}>
			<div className="bg-white flex flex-col w-full h-full overflow-y-auto text-grantpicks-black-950">
				<div className="bg-grantpicks-black-50 flex items-center justify-center pt-10 md:pt-12 px-3 md:px-5 pb-6">
					<div className="w-14 h-14 rounded-full bg-grantpicks-black-400 mb-2 md:mb-3" />
					<p className="text-[25px] font-semibold text-center">
						HealthSci Community Impact Fund
					</p>
				</div>
				<div className="px-3 md:px-5 py-6">
					<div className="relative mb-6 md:mb-8">
						<video
							ref={videoRef}
							src={`/assets/videos/video-2.mp4`}
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
										videoUrl: `/assets/videos/video-2.mp4`,
									}))
								}}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
							>
								{videoPlayed ? (
									<IconPause size={28} className="fill-grantpicks-black-400" />
								) : (
									<IconPlay size={28} className="stroke-grantpicks-black-400" />
								)}
							</button>
						</div>
					</div>
					<div className="mb-6 md:mb-8">
						<p className="text-base md:text-xl font-semibold mb-3">Overview</p>
						<p className="text-sm md:text-base text-grantpicks-black-600">
							In response to this urgent need, CCCL is venturing into the world
							of NFTs. The unique properties of NFTs allow for direct global
							engagement, breaking down barriers. By creating NFTs tied to the
							stories and artworks of brave children, CCCL aims to overcome
							financial challenges and continue providing life-saving
							treatments.
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<p className="text-base md:text-xl font-semibold mb-3">
							Why we are a public good
						</p>
						<p className="text-sm md:text-base text-grantpicks-black-600">
							Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean
							commodo ligula eget dolor. Aenean massa. Cum sociis natoque
							penatibus et magnis dis parturient montes, nascetur ridiculus mus.
							Donec quam felis. Nulla consequat massa quis enim. Donec pede
							justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim
							justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam
							dictum felis eu pede mollis pretium.
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<p className="text-xs font-semibold text-grantpicks-black-600 mb-3">
							TOTAL FUNDING RAISED
						</p>
						<p className="text-base md:text-xl lg:text-[25px] font-normal">
							USD 40,000
						</p>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-2 border-b border-black/10 mb-4">
							<p className="text-base md:text-xl font-semibold">
								Team Size{' '}
								<span className="text-grantpicks-black-600 ml-2">2</span>
							</p>
						</div>
						<div className="space-y-3 md:space-y-4">
							{[...Array(2)].map((admin, index) => (
								<div className="flex items-center space-x-2" key={index}>
									<div className="rounded-full bg-grantpicks-black-400" />
									<div>
										<p className="text-sm md:text-base font-bold">
											Abdul Hamid
										</p>
										<p className="text-xs md:text-sm font-normal text-grantpicks-black-600">
											@abdul.near
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
							{[...Array(2)].map((admin, index) => (
								<div
									className="flex items-center py-2 justify-between"
									key={index}
								>
									<div>
										<p className="text-sm md:text-base font-normal">
											{prettyTruncate(stellarPubKey, 20)}
										</p>
										<p className="text-xs font-normal">Ethereum (ETH)</p>
									</div>
									<Button
										color="alpha-50"
										onClick={async () => {
											setCopied(true)
											await navigator.clipboard.writeText(stellarPubKey)
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
							{[...Array(2)].map((admin, index) => (
								<div
									className="flex items-center py-2 justify-between"
									key={index}
								>
									<p className="text-sm md:text-base font-normal">
										github.com/CCCLebanon
									</p>
									<Link href={`https://github.com/yuesth`}>
										<IconArrowOutward
											size={24}
											className="fill-grantpicks-black-400 cursor-pointer"
										/>
									</Link>
								</div>
							))}
						</div>
					</div>
					<div className="mb-6 md:mb-8">
						<div className="flex items-center pb-4 border-b border-black/10">
							<p className="text-base md:text-xl font-semibold">Contacts</p>
						</div>
					</div>{' '}
				</div>
			</div>
		</Drawer>
	)
}

export default ProjectDetailDrawer
