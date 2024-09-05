import { useModalContext } from '@/app/providers/ModalProvider'
import clsx from 'clsx'
import React, {
	Dispatch,
	SetStateAction,
	useEffect,
	useRef,
	useState,
} from 'react'
import IconPause from '../../svgs/IconPause'
import IconPlay from '../../svgs/IconPlay'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'
import { Pair } from 'round-client'
import {
	getProject,
	GetProjectParams,
} from '@/services/on-chain/project-registry'
import CMDWallet from '@/lib/wallet'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import { useWallet } from '@/app/providers/WalletProvider'
import { IProjectDetailOwner } from '@/app/round-vote/[roundId]/page'
import { fetchYoutubeIframe, prettyTruncate } from '@/utils/helper'
import { Project } from 'project-registry-client'

interface RoundVotePairItemProps {
	index: number
	selectedPairs: string[]
	setSelectedPairs: Dispatch<SetStateAction<string[]>>
	data: Pair
	setShowProjectDetailDrawer: Dispatch<SetStateAction<IProjectDetailOwner>>
}

const RoundVotePairItem = ({
	index,
	selectedPairs,
	setSelectedPairs,
	data,
	setShowProjectDetailDrawer,
}: RoundVotePairItemProps) => {
	const wrapper1Ref = useRef<HTMLDivElement>(null)
	const wrapper2Ref = useRef<HTMLDivElement>(null)
	const [ytIframe1, setYtIframe1] = useState<string>('')
	const [ytIframe2, setYtIframe2] = useState<string>('')
	const video1Ref = useRef<HTMLVideoElement>(null)
	const [video1Played, setVideo1Played] = useState<boolean>(false)
	const video2Ref = useRef<HTMLVideoElement>(null)
	const [video2Played, setVideo2Played] = useState<boolean>(false)
	const { setVideoPlayerProps } = useModalContext()
	const [firstProjectData, setFirstProjectData] = useState<Project | undefined>(
		undefined,
	)
	const [secondProjectData, setSecondProjectData] = useState<
		Project | undefined
	>(undefined)
	const { stellarPubKey } = useWallet()

	const fetchProjectById = async () => {
		try {
			let cmdWallet = new CMDWallet({
				stellarPubKey: stellarPubKey,
			})
			const contracts = new Contracts(
				process.env.NETWORK_ENV as Network,
				cmdWallet,
			)
			const get1stProjectParams: GetProjectParams = {
				project_id: data.projects[0],
			}
			const get2ndProjectParams: GetProjectParams = {
				project_id: data.projects[1],
			}
			const firstRes = await getProject(get1stProjectParams, contracts)
			const secondRes = await getProject(get2ndProjectParams, contracts)
			console.log(
				'res first second',
				firstRes,
				secondRes,
				Math.floor(wrapper1Ref.current?.clientWidth || 0),
				Math.floor(wrapper2Ref.current?.clientWidth || 0),
			)
			setFirstProjectData(firstRes)
			setSecondProjectData(secondRes)
			if (firstRes?.video_url.includes('youtube')) {
				const res = await fetchYoutubeIframe(
					firstRes.video_url || '',
					wrapper1Ref.current?.clientWidth || 0,
				)
				setYtIframe1(res?.html)
			}
			if (secondRes?.video_url.includes('youtube')) {
				const res = await fetchYoutubeIframe(
					secondRes.video_url || '',
					wrapper2Ref.current?.clientWidth || 0,
				)
				setYtIframe2(res?.html)
			}
		} catch (error: any) {
			console.log('error project by id', error)
		}
	}

	useEffect(() => {
		if (data) {
			fetchProjectById()
		}
	}, [data])

	return (
		<div
			key={index}
			id={`boxing-${index}`}
			className="min-w-full flex items-center justify-between snap-center space-x-4"
		>
			{/* the first */}
			<div
				onClick={() => {
					let temp = [...selectedPairs]
					temp[index] = data.projects[0].toString()
					setSelectedPairs(temp)
				}}
				ref={wrapper1Ref}
				className={clsx(
					`rounded-3xl transition-all duration-200 w-[280px] md:w-[360px] lg:w-[448px] cursor-pointer`,
					selectedPairs[index] === data.projects[0].toString()
						? // true
							`border-4 border-grantpicks-purple-500`
						: `border-4 border-black/10`,
				)}
			>
				{!firstProjectData?.video_url.includes('youtube') && (
					<div className="relative">
						<video
							ref={video1Ref}
							src={firstProjectData?.video_url || `/assets/videos/video-2.mp4`}
							autoPlay={false}
							controls={false}
							className="w-[80%] mx-auto aspect-video"
						></video>
						<div className="flex items-center justify-center absolute inset-0 z-20">
							<button
								onClick={async () => {
									setVideoPlayerProps((prev) => ({
										...prev,
										isOpen: true,
										videoUrl:
											firstProjectData?.video_url ||
											`/assets/videos/video-2.mp4`,
									}))
								}}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
							>
								{video1Played ? (
									<IconPause size={28} className="fill-grantpicks-black-400" />
								) : (
									<IconPlay size={28} className="stroke-grantpicks-black-400" />
								)}
							</button>
						</div>
					</div>
				)}
				{ytIframe1 && (
					<div
						className="flex items-center justify-center"
						dangerouslySetInnerHTML={{ __html: ytIframe1 }}
					/>
				)}
				<div className="md:p-4 lg:p-5">
					<div className="flex items-center space-x-2 mb-4">
						<div className="rounded-full w-6 h-6 bg-grantpicks-black-400" />
						<p className="text-lg lg:text-xl font-semibold">
							{prettyTruncate(firstProjectData?.name, 30)}
						</p>
					</div>
					<p className="text-base font-normal text-grantpicks-black-600 mb-6 line-clamp-3 whitespace-pre-wrap break-words">
						{firstProjectData?.overview}
					</p>
					<Button
						color="white"
						className="!border !border-black/10 !rounded-full"
						isFullWidth
						onClick={() =>
							setShowProjectDetailDrawer((prev) => ({
								...prev,
								isOpen: true,
								project: firstProjectData as Project,
							}))
						}
					>
						<div className="flex items-center space-x-2">
							<IconEye size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">View Project</p>
						</div>
					</Button>
				</div>
			</div>
			<div className="rounded-full w-16 h-16 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center">
				<p className="text-[32px] font-black text-white">VS</p>
			</div>
			{/* The second */}
			<div
				ref={wrapper2Ref}
				onClick={() => {
					let temp = [...selectedPairs]
					temp[index] = data.projects[1].toString()
					setSelectedPairs(temp)
				}}
				className={clsx(
					`rounded-3xl transition-all duration-200 w-[280px] md:w-[360px] lg:w-[448px] cursor-pointer`,
					selectedPairs[index] === data.projects[1].toString()
						? `border-4 border-grantpicks-purple-500`
						: `border-4 border-black/10`,
				)}
			>
				{!firstProjectData?.video_url.includes('youtube') && (
					<div className="relative">
						<video
							ref={video2Ref}
							src={secondProjectData?.video_url || `/assets/videos/video-2.mp4`}
							autoPlay={false}
							controls={false}
							className="w-[80%] mx-auto aspect-video"
						></video>
						<div className="flex items-center justify-center absolute inset-0 z-20">
							<button
								onClick={async () => {
									setVideoPlayerProps((prev) => ({
										...prev,
										isOpen: true,
										videoUrl:
											secondProjectData?.video_url ||
											`/assets/videos/video-2.mp4`,
									}))
								}}
								className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
							>
								{video1Played ? (
									<IconPause size={28} className="fill-grantpicks-black-400" />
								) : (
									<IconPlay size={28} className="stroke-grantpicks-black-400" />
								)}
							</button>
						</div>
					</div>
				)}
				{ytIframe2 && (
					<div
						className="flex items-center justify-center"
						dangerouslySetInnerHTML={{ __html: ytIframe2 }}
					/>
				)}
				<div className="md:p-4 lg:p-5">
					<div className="flex items-center space-x-2 mb-4">
						<div className="rounded-full w-6 h-6 bg-grantpicks-black-400" />
						<p className="text-lg lg:text-xl font-semibold">
							{prettyTruncate(secondProjectData?.name, 24, 'address')}
						</p>
					</div>
					<p className="text-base font-normal text-grantpicks-black-600 mb-6 break-words text-wrap">
						{secondProjectData?.overview}
					</p>
					<Button
						color="white"
						className="!border !border-black/10 !rounded-full"
						isFullWidth
						onClick={() =>
							setShowProjectDetailDrawer((prev) => ({
								...prev,
								isOpen: true,
								project: secondProjectData as Project,
							}))
						}
					>
						<div className="flex items-center space-x-2">
							<IconEye size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">View Project</p>
						</div>
					</Button>
				</div>
			</div>
		</div>
	)
}

export default RoundVotePairItem
