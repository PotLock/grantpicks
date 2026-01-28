import clsx from 'clsx'
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'
import { Pair } from 'round-client'
import {
	getProject,
	GetProjectParams,
} from '@/services/stellar/project-registry'
import { IProjectDetailOwner } from '@/app/rounds/round-vote/[roundId]/page'
import { fetchYoutubeIframe, prettyTruncate } from '@/utils/helper'
import { Project } from 'project-registry-client'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { NearPair } from '@/services/near/type'
import Image from 'next/image'
import Hls from 'hls.js'

interface RoundVotePairItemProps {
	index: number
	selectedPairs: string[]
	setSelectedPairs: Dispatch<SetStateAction<string[]>>
	data: Pair | NearPair
	setShowProjectDetailDrawer: Dispatch<SetStateAction<IProjectDetailOwner>>
	onSelect?: (index: number) => void
}

const RoundVotePairItem = ({
	index,
	selectedPairs,
	setSelectedPairs,
	data,
	setShowProjectDetailDrawer,
	onSelect,
}: RoundVotePairItemProps) => {
	const wrapper1Ref = useRef<HTMLDivElement>(null)
	const wrapper2Ref = useRef<HTMLDivElement>(null)
	const [ytIframe1, setYtIframe1] = useState<string>('')
	const [ytIframe2, setYtIframe2] = useState<string>('')
	const video1Ref = useRef<HTMLVideoElement>(null)
	const [video1Played, setVideo1Played] = useState<boolean>(false)
	const video2Ref = useRef<HTMLVideoElement>(null)
	const [video2Played, setVideo2Played] = useState<boolean>(false)
	const hls1Ref = useRef<Hls | null>(null)
	const hls2Ref = useRef<Hls | null>(null)
	const [firstProjectData, setFirstProjectData] = useState<Project | undefined>(
		undefined,
	)
	const [secondProjectData, setSecondProjectData] = useState<
		Project | undefined
	>(undefined)
	const storage = useAppStorage()

	const isHlsStream = useCallback((url?: string) => {
		return Boolean(url && /\.m3u8($|\?)/.test(url))
	}, [])

	const fetchProjectById = useCallback(async () => {
		try {
			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const get1stProjectParams: GetProjectParams = {
					project_id: data.projects[0] as bigint,
				}
				const get2ndProjectParams: GetProjectParams = {
					project_id: data.projects[1] as bigint,
				}
				const firstRes = await getProject(get1stProjectParams, contracts)
				const secondRes = await getProject(get2ndProjectParams, contracts)

				setFirstProjectData(firstRes)
				setSecondProjectData(secondRes)
				if (firstRes?.video_url && firstRes.video_url.includes('youtube')) {
					const res = await fetchYoutubeIframe(
						firstRes.video_url || '',
						wrapper1Ref.current?.clientWidth || 0,
					)
					setYtIframe1(res?.html)
				}
				if (secondRes?.video_url && secondRes.video_url.includes('youtube')) {
					const res = await fetchYoutubeIframe(
						secondRes.video_url || '',
						wrapper2Ref.current?.clientWidth || 0,
					)
					setYtIframe2(res?.html)
				}
			} else {
				const contracts = storage.getNearContracts(null)

				if (!contracts) {
					return
				}

				const [firstRes, secondRes] = await Promise.all([
					contracts.near_social.getProjectData(data.projects[0] as string),
					contracts.near_social.getProjectData(data.projects[1] as string),
				])

				const project1JSON =
					firstRes[`${data.projects[0] as string}`]['profile']['gp_project'] ||
					'{}'
				const project2JSON =
					secondRes[`${data.projects[1] as string}`]['profile']['gp_project'] ||
					'{}'
				const firstProject = JSON.parse(project1JSON)
				const secondProject = JSON.parse(project2JSON)

				setFirstProjectData(firstProject)
				setSecondProjectData(secondProject)

				if (firstProject?.video_url.includes('youtube')) {
					const res = await fetchYoutubeIframe(
						firstProject.video_url || '',
						wrapper1Ref.current?.clientWidth || 0,
					)
					setYtIframe1(res?.html)
				}
				if (secondProject?.video_url.includes('youtube')) {
					const res = await fetchYoutubeIframe(
						secondProject.video_url || '',
						wrapper2Ref.current?.clientWidth || 0,
					)
					setYtIframe2(res?.html)
				}
			}
		} catch (error: any) {
			console.log('error project by id', error)
		}
	}, [data, storage])

	useEffect(() => {
		if (data) {
			fetchProjectById()
		}
	}, [data, fetchProjectById])

	useEffect(() => {
		const videoUrl = firstProjectData?.video_url
		if (!videoUrl || videoUrl.includes('youtube')) return
		const videoEl = video1Ref.current
		if (!videoEl) return

		if (isHlsStream(videoUrl)) {
			if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
				videoEl.src = videoUrl
				return
			}
			if (Hls.isSupported()) {
				hls1Ref.current?.destroy()
				const hls = new Hls()
				hls.loadSource(videoUrl)
				hls.attachMedia(videoEl)
				hls1Ref.current = hls
				return () => {
					hls.destroy()
					hls1Ref.current = null
				}
			}
		} else {
			videoEl.src = videoUrl
		}
	}, [firstProjectData?.video_url, isHlsStream])

	useEffect(() => {
		const videoUrl = secondProjectData?.video_url
		if (!videoUrl || videoUrl.includes('youtube')) return
		const videoEl = video2Ref.current
		if (!videoEl) return

		if (isHlsStream(videoUrl)) {
			if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
				videoEl.src = videoUrl
				return
			}
			if (Hls.isSupported()) {
				hls2Ref.current?.destroy()
				const hls = new Hls()
				hls.loadSource(videoUrl)
				hls.attachMedia(videoEl)
				hls2Ref.current = hls
				return () => {
					hls.destroy()
					hls2Ref.current = null
				}
			}
		} else {
			videoEl.src = videoUrl
		}
	}, [secondProjectData?.video_url, isHlsStream])

	const firstVideoComponent = useMemo(() => {
		const videoUrl = firstProjectData?.video_url
		const hasVideo = videoUrl && videoUrl.trim() !== ''
		const isYouTube = hasVideo && videoUrl.includes('youtube')
		const isHls = isHlsStream(videoUrl)

		return (
			<div className="w-full h-[220px] md:h-[260px] lg:h-[280px] rounded-t-2xl overflow-hidden bg-grantpicks-black-50 flex items-center justify-center">
				{hasVideo && isYouTube && ytIframe1 && (
					<div
						className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:block"
						dangerouslySetInnerHTML={{ __html: ytIframe1 }}
					/>
				)}
				{hasVideo && !isYouTube && videoUrl && (
					<div className="relative w-full h-full">
						<video
							ref={video1Ref}
							src={isHls ? undefined : videoUrl}
							autoPlay={false}
							controls={true}
							playsInline
							onEnded={() => setVideo1Played(false)}
							onPause={() => setVideo1Played(false)}
							className="w-full h-full object-cover"
						></video>
					</div>
				)}
				{!hasVideo && (
					<div className="flex items-center justify-center w-full h-full">
						<Image
							src={`https://www.tapback.co/api/avatar/${firstProjectData?.owner}`}
							alt=""
							className="rounded-full object-fill opacity-50"
							width={80}
							height={80}
						/>
					</div>
				)}
			</div>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		firstProjectData?.video_url,
		ytIframe1,
		firstProjectData?.owner,
		isHlsStream,
	])

	const secondVideoComponent = useMemo(() => {
		const videoUrl = secondProjectData?.video_url
		const hasVideo = videoUrl && videoUrl.trim() !== ''
		const isYouTube = hasVideo && videoUrl.includes('youtube')
		const isHls = isHlsStream(videoUrl)

		return (
			<div className="w-full h-[220px] md:h-[260px] lg:h-[280px] rounded-t-2xl overflow-hidden bg-grantpicks-black-50 flex items-center justify-center">
				{hasVideo && isYouTube && ytIframe2 && (
					<div
						className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:block"
						dangerouslySetInnerHTML={{ __html: ytIframe2 }}
					/>
				)}
				{hasVideo && !isYouTube && videoUrl && (
					<div className="relative w-full h-full">
						<video
							ref={video2Ref}
							src={isHls ? undefined : videoUrl}
							autoPlay={false}
							controls={true}
							playsInline
							onEnded={() => setVideo2Played(false)}
							onPause={() => setVideo2Played(false)}
							className="w-full h-full object-cover"
						></video>
					</div>
				)}
				{!hasVideo && (
					<div className="flex items-center justify-center w-full h-full">
						<Image
							src={`https://www.tapback.co/api/avatar/${secondProjectData?.owner}`}
							alt=""
							className="rounded-full object-fill opacity-50"
							width={80}
							height={80}
						/>
					</div>
				)}
			</div>
		)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		secondProjectData?.video_url,
		ytIframe2,
		secondProjectData?.owner,
		isHlsStream,
	])

	return (
		<div
			key={index}
			className="min-w-full grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch gap-4 md:gap-6 snap-start"
		>
			{/* the first */}
			<div
				onClick={() => {
					let temp = [...selectedPairs]
					temp[index] = data.projects[0].toString()
					setSelectedPairs(temp)
					onSelect?.(index)
				}}
				ref={wrapper1Ref}
				className={clsx(
					`relative rounded-2xl transition-all duration-200 w-full cursor-pointer bg-white flex flex-col overflow-hidden border shadow-sm hover:shadow-md`,
					selectedPairs[index] === data.projects[0].toString()
						? `border-grantpicks-purple-500 ring-2 ring-grantpicks-purple-200`
						: `border-black/10`,
				)}
			>
				{selectedPairs[index] === data.projects[0].toString() && (
					<div className="absolute top-4 right-4 z-10 rounded-full bg-grantpicks-purple-500 px-3 py-1 text-xs font-semibold text-white shadow">
						Selected
					</div>
				)}
				{firstVideoComponent}
				<div className="p-4 md:p-5">
					<div className="flex items-center space-x-2 mb-4">
						<Image
							src={`https://www.tapback.co/api/avatar/${firstProjectData?.owner}`}
							alt=""
							className="rounded-full object-fill h-6 w-6"
							width={56}
							height={56}
						/>
						<p className="text-lg lg:text-xl font-semibold">
							{prettyTruncate(firstProjectData?.name, 30)}
						</p>
					</div>
					<p className="text-sm md:text-base font-normal text-grantpicks-black-600 mb-5 line-clamp-3 whitespace-pre-wrap break-words">
						{firstProjectData?.overview}
					</p>
					<Button
						color="white"
						className="!border !border-black/10 !rounded-full hover:!border-grantpicks-black-300"
						isFullWidth
						onClick={() =>
							setShowProjectDetailDrawer((prev: any) => ({
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
			<div className="flex items-center justify-center">
				<div className="rounded-full w-10 h-10 md:w-12 md:h-12 bg-gradient-to-t from-grantpicks-purple-500 to-grantpicks-purple-100 flex items-center justify-center shadow-sm">
					<p className="text-base md:text-xl font-black text-white">VS</p>
				</div>
			</div>
			{/* The second */}
			<div
				ref={wrapper2Ref}
				onClick={() => {
					let temp = [...selectedPairs]
					temp[index] = data.projects[1].toString()
					setSelectedPairs(temp)
					onSelect?.(index)
				}}
				className={clsx(
					`relative rounded-2xl transition-all duration-200 w-full cursor-pointer bg-white flex flex-col overflow-hidden border shadow-sm hover:shadow-md`,
					selectedPairs[index] === data.projects[1].toString()
						? `border-grantpicks-purple-500 ring-2 ring-grantpicks-purple-200`
						: `border-black/10`,
				)}
			>
				{selectedPairs[index] === data.projects[1].toString() && (
					<div className="absolute top-4 right-4 z-10 rounded-full bg-grantpicks-purple-500 px-3 py-1 text-xs font-semibold text-white shadow">
						Selected
					</div>
				)}
				{secondVideoComponent}
				<div className="p-4 md:p-5">
					<div className="flex items-center space-x-2 mb-4">
						<Image
							src={`https://www.tapback.co/api/avatar/${secondProjectData?.owner}`}
							alt=""
							className="rounded-full object-fill h-6 w-6"
							width={56}
							height={56}
						/>
						<p className="text-lg lg:text-xl font-semibold">
							{prettyTruncate(secondProjectData?.name, 24, 'address')}
						</p>
					</div>
					<p className="text-sm md:text-base font-normal text-grantpicks-black-600 mb-5 line-clamp-3 break-words text-wrap">
						{secondProjectData?.overview}
					</p>
					<Button
						color="white"
						className="!border !border-black/10 !rounded-full hover:!border-grantpicks-black-300"
						isFullWidth
						onClick={() =>
							setShowProjectDetailDrawer((prev: any) => ({
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
