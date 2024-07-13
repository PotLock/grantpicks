import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'
import IconPause from '@/app/components/svgs/IconPause'
import IconPlay from '@/app/components/svgs/IconPlay'
import IconTrash from '@/app/components/svgs/IconTrash'
import IconVideo from '@/app/components/svgs/IconVideo'
import { YOUTUBE_URL_REGEX } from '@/constants/regex'
import { toastOptions } from '@/constants/style'
import {
	CreateProjectStep1Data,
	CreateProjectStep2Data,
	CreateProjectStep5Data,
} from '@/types/form'
import React, { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const MyProjectMedia = () => {
	const [members, setMembers] = useState<string[]>([])
	const {
		control,
		register,
		watch,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CreateProjectStep5Data>()
	const [accFiles, setAccFiles] = useState<File[]>([])
	const [accFileUrls, setAccFileUrls] = useState<string[]>([])
	const [linkInput, setLinkInput] = useState<string>('')
	const [isDirtyInput, setIsDirtyInput] = useState<boolean>(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const [videoPlayed, setVideoPlayed] = useState<boolean>(false)

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		console.log('accfile', acceptedFiles)
		if (acceptedFiles[0].size / 10 ** 6 > 25) {
			toast.error('Max. file size is 25 MB', {
				style: toastOptions.error.style,
			})
			return
		}
		setAccFiles((prev) => [...prev, acceptedFiles[0]])
		const objectUrl = URL.createObjectURL(acceptedFiles[0])
		setAccFileUrls((prev) => [...prev, objectUrl])
		setValue('video', { url: objectUrl, file: acceptedFiles[0] })
	}, [])

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'video/mp4': ['.mp4'],
			'video/mov': ['.mov'],
		},
	})

	const onSaveChangesMedia = () => {}

	return (
		<div className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950">
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Media
				</p>
				{accFiles.length === 0 ? (
					<div className="bg-white rounded-xl p-4 md:p-6 border border-black/10 w-full">
						<div
							{...getRootProps()}
							className="border border-dashed rounded-xl border-black/10 p-4 flex flex-col items-center relative"
						>
							<input
								className="absolute inset-0 opacity-0 z-10"
								{...getInputProps()}
							/>
							<div className="border border-black/10 p-2 rounded-full mb-4">
								<IconVideo size={24} className="fill-grantpicks-black-400" />
							</div>
							<p className="text-center text-sm font-normal text-grantpicks-black-950 mb-1">
								Drag and drop,{` `}
								<span className="text-sm font-semibold">Upload video</span>
								{` `}or Paste video link{' '}
							</p>
							<div className="flex items-center space-x-4 mb-4">
								<p className="text-xs font-normal text-grantpicks-black-950">
									Supported format: MP4, YouTube link
								</p>
								<p className="text-xs font-normal text-grantpicks-black-950">
									Maximum size: 25MB{' '}
								</p>
							</div>
							<div className="w-[90%]">
								<InputText
									value={linkInput}
									onChange={(e) => setLinkInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											console.log('asaksa')
											setIsDirtyInput(true)
										}
									}}
									placeholder="Paste video link here"
									className="!py-2"
									isStopPropagation={true}
									errorMessage={
										isDirtyInput &&
										(linkInput === '' || !YOUTUBE_URL_REGEX.test(linkInput)) ? (
											<p className="text-xs text-grantpicks-red-600">
												Invalid link
											</p>
										) : undefined
									}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="rounded-xl relative bg-white w-full border border-black/10 w-full">
						<div className="flex items-center justify-between px-4 py-3">
							<p className="text-sm font-semibold text-grantpicks-black-950">
								{accFiles[0].name}
							</p>
							<IconTrash
								size={24}
								className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70 transition"
								onClick={() => {
									console.log('hahaha')
									let temp = [...accFiles]
									temp.splice(0, 1)
									setAccFiles(temp)
									let temp2 = [...accFileUrls]
									temp2.splice(0, 1)
									setAccFileUrls(temp2)
								}}
							/>
						</div>
						<div className="relative">
							<video
								ref={videoRef}
								src={accFileUrls[0]}
								autoPlay={false}
								controls={false}
								className="w-[80%] mx-auto aspect-video"
							></video>
							<div className="flex items-center justify-center absolute inset-0 z-20">
								<button
									onClick={async () => {
										if (!videoPlayed) {
											setVideoPlayed(true)
											await videoRef.current?.play()
										} else {
											setVideoPlayed(false)
											videoRef.current?.pause()
										}
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
					</div>
				)}
			</div>
			<div className="p-3 md:p-5 flex flex-col md:flex-row items-center md:justify-end space-x-0 md:space-x-4 space-y-4 md:space-y-0">
				<div className="w-full lg:w-auto">
					<Button
						color="white"
						isFullWidth
						onClick={() => {}}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						isFullWidth
						color="black-950"
						onClick={handleSubmit(onSaveChangesMedia)}
						className="!py-3"
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectMedia
