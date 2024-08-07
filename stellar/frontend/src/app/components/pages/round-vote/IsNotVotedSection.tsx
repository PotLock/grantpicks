import clsx from 'clsx'
import React, { Dispatch, SetStateAction, useRef, useState } from 'react'
import IconPlay from '../../svgs/IconPlay'
import IconPause from '../../svgs/IconPause'
import { useModalContext } from '@/app/providers/ModalProvider'
import Button from '../../commons/Button'
import IconEye from '../../svgs/IconEye'
import IconArrowLeft from '../../svgs/IconArrowLeft'
import IconArrowRight from '../../svgs/IconArrowRight'

const IsNotVotedSection = ({
	setShowEvalGuide,
	setShowProjectDetailDrawer,
	setHasVoted,
}: {
	setShowEvalGuide: Dispatch<SetStateAction<boolean>>
	setShowProjectDetailDrawer: Dispatch<SetStateAction<boolean>>
	setHasVoted: Dispatch<SetStateAction<boolean>>
}) => {
	const [currBoxing, setCurrBoxing] = useState<number>(0)
	const [selectedVotes, setSeletedVotes] = useState<string[]>([])
	const video1Ref = useRef<HTMLVideoElement>(null)
	const [video1Played, setVideo1Played] = useState<boolean>(false)
	const video2Ref = useRef<HTMLVideoElement>(null)
	const [video2Played, setVideo2Played] = useState<boolean>(false)
	const { setVideoPlayerProps } = useModalContext()

	const onPreviousBoxing = (currIdx: number) => {
		if (currIdx > 0) {
			setCurrBoxing(currIdx - 1)
			const el = document.getElementById(`boxing-${currIdx - 1}`)
			el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}

	const onNextBoxing = (currIdx: number) => {
		if (currIdx < 2) {
			setCurrBoxing(currIdx + 1)
			const el = document.getElementById(`boxing-${currIdx + 1}`)
			el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
		}
	}
	return (
		<div className="flex flex-col items-center text-grantpicks-black-950">
			<p className="text-xl md:text-[26px] lg:text-[32px] font-black text-grantpicks-black-300 mb-5 md:mb-8">
				PAIR {currBoxing + 1} OF 5
			</p>
			<p className="text-3xl md:text-4xl lg:text-[50px] font-black text-center mb-5 w-96 leading-[50px]">
				WHICH ONE DO YOU CHOOSE?
			</p>
			<p className="text-center text-sm md:text-base font-normal">
				Ensure you’re reviewing each in consideration of public impact.{' '}
			</p>
			<span
				className="text-xs md:text-base font-bold cursor-pointer mb-10 md:mb-12 lg:mb-16"
				onClick={() => setShowEvalGuide(true)}
			>
				See Evaluation guide
			</span>
			<div className="hidden md:flex items-center overflow-x-auto snap-x snap-mandatory mb-10 md:mb-12 lg:mb-16 no-scrollbar">
				{[
					{ key: '1', name: 'satu' },
					{ key: '2', name: 'dua' },
					{ key: '3', name: 'tiga' },
				].map((doc, idx) => (
					<div
						key={idx}
						id={`boxing-${idx}`}
						className="min-w-full flex items-center justify-between snap-center space-x-4"
					>
						{/* the first */}
						<div
							className={clsx(
								`rounded-3xl transition-all duration-200 max-w-[448px]`,
								selectedVotes[idx] === doc.key
									? `border-4 border-grantpicks-purple-500`
									: `border border-black/10`,
							)}
						>
							<div className="relative">
								<video
									ref={video1Ref}
									src={`/assets/videos/video-2.mp4`}
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
												videoUrl: `/assets/videos/video-2.mp4`,
											}))
										}}
										className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
									>
										{video1Played ? (
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
							<div className="md:p-4 lg:p-5">
								<div className="flex items-center space-x-2 mb-4">
									<div className="rounded-full w-6 h-6 bg-grantpicks-black-400" />
									<p className="text-lg lg:text-xl font-semibold">
										ArtCulture Fusion
									</p>
								</div>
								<p className="text-base font-normal text-grantpicks-black-600 mb-6">
									Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
									Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
									natoque penatibus
								</p>
								<Button
									color="white"
									className="!border !border-black/10 !rounded-full"
									isFullWidth
									onClick={() => {}}
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
							onClick={() => {
								const searchIdx = selectedVotes.findIndex((v) => v === doc.key)
								if (searchIdx === -1) {
									setSeletedVotes((prev) => [...prev, doc.key])
								} else {
									let temp = [...selectedVotes]
									temp.splice(searchIdx, 1)
									setSeletedVotes(temp)
								}
							}}
							className={clsx(
								`rounded-3xl transition-all duration-200 max-w-[448px] cursor-pointer`,
								selectedVotes[idx] === doc.key
									? `border-4 border-grantpicks-purple-500`
									: `border-4 border-black/10`,
							)}
						>
							<div className="relative">
								<video
									ref={video2Ref}
									src={`/assets/videos/video-2.mp4`}
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
												videoUrl: `/assets/videos/video-2.mp4`,
											}))
										}}
										className="w-10 h-10 flex items-center justify-center rounded-full bg-grantpicks-black-950 cursor-pointer hover:opacity-70 transition"
									>
										{video1Played ? (
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
							<div className="md:p-4 lg:p-5">
								<div className="flex items-center space-x-2 mb-4">
									<div className="rounded-full w-6 h-6 bg-grantpicks-black-400" />
									<p className="text-lg lg:text-xl font-semibold">
										ArtCulture Fusion
									</p>
								</div>
								<p className="text-base font-normal text-grantpicks-black-600 mb-6">
									Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
									Aenean commodo ligula eget dolor. Aenean massa. Cum sociis
									natoque penatibus
								</p>
								<Button
									color="white"
									className="!border !border-black/10 !rounded-full"
									isFullWidth
									onClick={() => setShowProjectDetailDrawer(true)}
								>
									<div className="flex items-center space-x-2">
										<IconEye size={18} className="fill-grantpicks-black-400" />
										<p className="text-sm font-semibold">View Project</p>
									</div>
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="flex items-center justify-center space-x-6 md:space-x-10">
				{currBoxing > 0 && (
					<Button color="alpha-50" onClick={() => onPreviousBoxing(currBoxing)}>
						<div className="flex items-center space-x-2">
							<IconArrowLeft size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Previous</p>
						</div>
					</Button>
				)}
				{currBoxing < 2 ? (
					<Button color="alpha-50" onClick={() => onNextBoxing(currBoxing)}>
						<div className="flex items-center space-x-2">
							<IconArrowRight size={18} className="fill-grantpicks-black-400" />
							<p className="text-sm font-semibold">Next</p>
						</div>
					</Button>
				) : (
					<Button color="alpha-50" onClick={() => setHasVoted(true)}>
						<p className="text-sm font-semibold">Finish</p>
					</Button>
				)}
			</div>
		</div>
	)
}

export default IsNotVotedSection
