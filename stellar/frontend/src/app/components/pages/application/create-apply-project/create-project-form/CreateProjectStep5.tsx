import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import IconCheckCircle from '@/app/components/svgs/IconCheckCircle'
import IconProject from '@/app/components/svgs/IconProject'
import IconTrash from '@/app/components/svgs/IconTrash'
import { CreateProjectStep5Data } from '@/types/form'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateProject } from './CreateProjectFormMainModal'
import { useDropzone } from 'react-dropzone'
import IconVideo from '@/app/components/svgs/IconVideo'
import toast from 'react-hot-toast'
import { toastOptions } from '@/constants/style'
import { YOUTUBE_URL_REGEX } from '@/constants/regex'
import IconPlay from '@/app/components/svgs/IconPlay'
import IconPause from '@/app/components/svgs/IconPause'
import PreviousConfirmationModal from './PreviousConfirmationModal'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { getSrc } from '@livepeer/react/external'
import IconLoading from '@/app/components/svgs/IconLoading'
import { GetAssetResponse } from 'livepeer/models/operations'
import { requestUpload, retrieveAsset, uploadFile } from '@/services/upload'
import * as tus from 'tus-js-client'
import { Src } from '@livepeer/react'

const CreateProjectStep5 = () => {
	const { setStep, onProceedApply, setData } = useCreateProject()
	const { livepeer } = useGlobalContext()
	const [showPrevConfirm, setShowPrevConfirm] = useState<boolean>(false)
	const {
		handleSubmit,
		setValue,
		reset,
		formState: { errors },
	} = useForm<CreateProjectStep5Data>()
	const [accFiles, setAccFiles] = useState<File[]>([])
	const [accFileUrls, setAccFileUrls] = useState<string[]>([])
	const [linkInput, setLinkInput] = useState<string>('')
	const [isDirtyInput, setIsDirtyInput] = useState<boolean>(false)
	const videoRef = useRef<HTMLVideoElement>(null)
	const [videoPlayed, setVideoPlayed] = useState<boolean>(false)
	const [playbackSrc, setPlaybackSrc] = useState<Src[] | null>(null)
	const [loadingFlow, setLoadingFlow] = useState<
		'Preparing' | 'Uploading' | 'Finishing' | null
	>(null)
	const [uploadResult, setUploadResult] = useState<
		| { upload?: tus.Upload; uploadedUrl: string | null; percentage?: string }
		| undefined
	>(undefined)

	const onDrop = useCallback(async (acceptedFiles: File[]) => {
		if (acceptedFiles[0].size / 10 ** 6 > 25) {
			toast.error('Max. file size is 25 MB', {
				style: toastOptions.error.style,
			})
			return
		}
		try {
			setLoadingFlow('Preparing')
			setAccFiles((prev) => [...prev, acceptedFiles[0]])
			const objectUrl = URL.createObjectURL(acceptedFiles[0])
			setAccFileUrls((prev) => [...prev, objectUrl])
			const resLivepeer = await requestUpload(livepeer, acceptedFiles[0].name)
			await uploadFile(
				acceptedFiles[0],
				setUploadResult,
				(percentage) => {
					setLoadingFlow('Uploading')
					//@ts-ignore
					setUploadResult((prev) => ({ ...prev, percentage }))
				},
				async (uploadedUrl) => {
					setUploadResult((prev) => ({
						...prev,
						uploadedUrl: uploadedUrl,
						percentage: ``,
					}))
					let assetResult: GetAssetResponse | undefined = undefined
					assetResult = await retrieveAsset(livepeer, resLivepeer)
					const closePoolingAsset = setInterval(async () => {
						setLoadingFlow('Finishing')
						assetResult = await retrieveAsset(livepeer, resLivepeer)
						if (assetResult?.asset?.status?.phase.includes('ready')) {
							const playbackInfo = await livepeer?.playback.get(
								assetResult.asset.playbackId as string,
							)
							const src = getSrc(playbackInfo?.playbackInfo)
							setValue('video', {
								url: src?.[0].src || '',
								file: acceptedFiles[0],
							})
							setData((prev) => ({
								...prev,
								video: { file: acceptedFiles[0], url: src?.[0].src as string },
							}))
							setPlaybackSrc(src)
							setLoadingFlow(null)
							clearInterval(closePoolingAsset)
							return
						}
					}, 1000)
				},
				resLivepeer,
			)
		} catch (error: any) {
			setAccFiles([])
			setAccFileUrls([])
			setLoadingFlow(null)
			console.log('error uploading', error)
		}
	}, [])

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		accept: {
			'video/mp4': ['.mp4'],
			'video/mov': ['.mov'],
		},
	})

	const onProceed = async () => {
		await onProceedApply()
	}

	return (
		<div className="bg-grantpicks-black-50 rounded-b-xl w-full relative overflow-y-auto max-h-[80vh]">
			<div className="pt-10 pb-6 px-4 md:px-6 border-b border-black/10">
				<div className="flex items-center space-x-2 mb-4">
					<IconCheckCircle size={18} className="fill-grantpicks-green-600" />
					<p className="text-sm font-semibold text-grantpicks-black-950">
						YOUR PROGRESS HAS BEEN SAVED
					</p>
				</div>
				<div className="flex items-center mb-4">
					<div className="bg-grantpicks-alpha-50/5 border border-grantpicks-alpha-50/[0.07] flex items-center space-x-2 px-2 py-1 rounded-full">
						<IconProject size={18} className="fill-grantpicks-black-400" />
						<p className="text-sm font-bold text-grantpicks-black-950">
							Step 5 of 5
						</p>
					</div>
				</div>
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					You’ve made it all the way here, add a 3min video to give more
					insights about your project.{' '}
				</p>
				{loadingFlow ? (
					<div className="w-full aspect-video relative flex items-center justify-center">
						<div className="flex flex-col items-center">
							<IconLoading size={24} className="fill-grantpicks-black-900" />
							<p className="text-sm font-normal text-grantpicks-black-950/80">
								{loadingFlow}{' '}
								{loadingFlow === 'Uploading' &&
									`- ${uploadResult?.percentage || 0}%`}
							</p>
						</div>
					</div>
				) : accFiles.length === 0 ? (
					<div className="bg-white rounded-xl p-4 md:p-6 border border-black/10">
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
					<div className="rounded-xl relative bg-white w-full border border-black/10">
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
								src={playbackSrc?.[0].src || ''}
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
			<div className="p-5 md:p-6 flex items-center space-x-4">
				<div className="flex-1">
					<Button
						color="white"
						isFullWidth
						onClick={() => setShowPrevConfirm(true)}
						className="!py-3 !border !border-grantpicks-black-400"
					>
						Previous
					</Button>
				</div>
				<div className="flex-1">
					<Button
						color={accFiles.length === 0 ? `disabled` : `black-950`}
						isFullWidth
						isDisabled={accFiles.length === 0}
						onClick={handleSubmit(onProceed)}
						className="!py-3"
					>
						Proceed to apply
					</Button>
				</div>
			</div>
			<PreviousConfirmationModal
				isOpen={showPrevConfirm}
				onPrevious={() => {
					reset({})
					setShowPrevConfirm(false)
					setAccFiles([])
					setAccFileUrls([])
					setLinkInput('')
					setIsDirtyInput(false)
					setVideoPlayed(false)
					setStep(4)
				}}
				onClose={() => setShowPrevConfirm(false)}
			/>
		</div>
	)
}

export default CreateProjectStep5
