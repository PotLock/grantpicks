import Button from '@/app/components/commons/Button'
import InputText from '@/app/components/commons/InputText'
import InputTextArea from '@/app/components/commons/InputTextArea'
import IconCloseFilled from '@/app/components/svgs/IconCloseFilled'
import IconPause from '@/app/components/svgs/IconPause'
import IconPlay from '@/app/components/svgs/IconPlay'
import IconTrash from '@/app/components/svgs/IconTrash'
import IconVideo from '@/app/components/svgs/IconVideo'
import { useGlobalContext } from '@/app/providers/GlobalProvider'
import { useWallet } from '@/app/providers/WalletProvider'
import { YOUTUBE_URL_REGEX } from '@/constants/regex'
import { toastOptions } from '@/constants/style'
import { requestUpload, retrieveAsset, uploadFile } from '@/services/upload'
import {
	CreateProjectStep1Data,
	CreateProjectStep2Data,
	CreateProjectStep5Data,
} from '@/types/form'
import { fetchYoutubeIframe, onFetchingBlobToFile } from '@/utils/helper'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as tus from 'tus-js-client'
import { Src } from '@livepeer/react'
import { GetAssetResponse } from 'livepeer/models/operations'
import { getSrc } from '@livepeer/react/external'
import IconLoading from '@/app/components/svgs/IconLoading'
import CMDWallet from '@/lib/wallet'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import {
	IUpdateProjectParams,
	updateProject,
} from '@/services/stellar/project-registry'
import { DEFAULT_IMAGE_URL } from '@/constants/project'
import Contracts from '@/lib/contracts'
import { Network } from '@/types/on-chain'
import { useMyProject } from './MyProjectProvider'
import useAppStorage from '@/stores/zustand/useAppStorage'
import {
	NearProjectFundingHistory,
	NearSocialGPProject,
} from '@/services/near/type'

const MyProjectMedia = () => {
	const { projectData, fetchProjectApplicant } = useMyProject()
	const { stellarKit, stellarPubKey, nearWallet } = useWallet()
	const { openPageLoading, dismissPageLoading, livepeer } = useGlobalContext()
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
	const [loadingFlow, setLoadingFlow] = useState<
		'Preparing' | 'Uploading' | 'Finishing' | null
	>(null)
	const [uploadResult, setUploadResult] = useState<
		| { upload?: tus.Upload; uploadedUrl: string | null; percentage?: string }
		| undefined
	>(undefined)
	const [playbackSrc, setPlaybackSrc] = useState<Src[] | null>(null)
	const [ytIframe, setYtIframe] = useState<string>('')
	const embededYtHtmlRef = useRef<HTMLDivElement>(null)
	const storage = useAppStorage()

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
							setPlaybackSrc(src)
							setLoadingFlow(null)
							clearInterval(closePoolingAsset)
							return
						}
					}, 1000)
				},
				resLivepeer,
			)

			setValue('video', { url: objectUrl, file: acceptedFiles[0] })
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

	const onSaveChanges: SubmitHandler<CreateProjectStep5Data> = async (data) => {
		try {
			openPageLoading()

			if (storage.chainId === 'stellar') {
				let contracts = storage.getStellarContracts()

				if (!contracts) {
					return
				}

				const params: IUpdateProjectParams = {
					...projectData,
					name: projectData?.name || '',
					overview: projectData?.overview || '',
					fundings: [],
					contacts: projectData?.contacts || [],
					contracts: projectData?.contracts || [],
					image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
					payout_address: projectData?.payout_address || '',
					repositories: projectData?.repositories || [],
					team_members: projectData?.team_members || [],
					video_url: watch().video.url || '',
				}
				const txUpdateProject = await updateProject(
					stellarPubKey,
					projectData?.id as bigint,
					params,
					contracts,
				)
				const txHashUpdateProject = await contracts.signAndSendTx(
					stellarKit as StellarWalletsKit,
					txUpdateProject.toXDR(),
					stellarPubKey,
				)
				if (txHashUpdateProject) {
					dismissPageLoading()
					setTimeout(async () => {
						await fetchProjectApplicant()
					}, 2000)
					toast.success(`Update project media is succeed`, {
						style: toastOptions.success.style,
					})
				}
			} else {
				const contracts = storage.getNearContracts(nearWallet)

				if (!contracts) {
					return
				}

				const params: NearSocialGPProject = {
					name: projectData?.name || '',
					overview: projectData?.overview || '',
					fundings:
						(projectData?.funding_histories as unknown as NearProjectFundingHistory[]) ||
						[],
					contacts: projectData?.contacts || [],
					contracts: projectData?.contracts || [],
					image_url: projectData?.image_url || DEFAULT_IMAGE_URL,
					payout_address: projectData?.payout_address || '',
					repositories: projectData?.repositories || [],
					team_members:
						(projectData?.team_members as unknown as string[]) || [],
					video_url: watch().video.url || '',
					owner: projectData?.owner || '',
				}

				const txUpdateProject = await contracts.near_social.setProjectData(
					storage.my_address || '',
					params,
				)

				if (txUpdateProject) {
					dismissPageLoading()
					setTimeout(async () => {
						await fetchProjectApplicant()
					}, 2000)
					toast.success(`Update project media is succeed`, {
						style: toastOptions.success.style,
					})
				}
			}
		} catch (error: any) {
			dismissPageLoading()
			toast.error(`Update project media is failed`, {
				style: toastOptions.error.style,
			})
			console.log('error to update media project', error)
		}
	}
	const setDefaultData = async () => {
		if (projectData && projectData.video_url && projectData.video_url !== '') {
			if (projectData.video_url.includes('youtube')) {
				const res = await fetchYoutubeIframe(
					projectData.video_url || '',
					embededYtHtmlRef.current?.clientWidth || 0,
				)
				setYtIframe(res?.html)
			} else {
				const blobRes = await onFetchingBlobToFile(
					projectData.video_url,
					projectData.name,
				)
				setAccFiles((prev) => [...prev, blobRes as File])
				setAccFileUrls((prev) => [...prev, projectData.video_url])
				setValue('video.file', blobRes)
				setValue('video.url', projectData.video_url)
			}
		}
	}

	const onProcessYoutubeInput = async () => {
		setIsDirtyInput(true)
		if (!YOUTUBE_URL_REGEX.test(linkInput)) {
			setYtIframe('')
			return
		}
		const ytRes = await fetchYoutubeIframe(
			linkInput,
			embededYtHtmlRef.current?.clientWidth || 0,
		)
		setYtIframe(ytRes?.html)
		setValue('video', {
			url: linkInput || '',
			file: undefined,
		})
	}

	useEffect(() => {
		if (projectData) {
			setDefaultData()
		}
	}, [projectData])

	return (
		<div
			ref={embededYtHtmlRef}
			className="w-full lg:w-[70%] border border-black/10 bg-white rounded-xl text-grantpicks-black-950"
		>
			<div className="p-3 md:p-5">
				<p className="text-lg md:text-xl lg:text-2xl font-semibold text-grantpicks-black-950 mb-6">
					Media
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
				) : accFiles.length === 0 && (!ytIframe || ytIframe === '') ? (
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
									onKeyDown={async (e) => {
										if (e.key === 'Enter') {
											await onProcessYoutubeInput()
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
									suffixIcon={
										<Button
											color="transparent"
											className="!text-sm !font-semibold !bg-white"
											onClick={async (e) => {
												e.stopPropagation()
												await onProcessYoutubeInput()
											}}
										>
											Add
										</Button>
									}
								/>
							</div>
						</div>
					</div>
				) : (
					<div className="rounded-xl relative bg-white w-full border border-black/10">
						<div className="flex items-center justify-between px-4 py-3">
							<p className="text-sm font-semibold text-grantpicks-black-950">
								{accFiles[0] ? accFiles[0].name : ''}
							</p>
							<IconTrash
								size={24}
								className="fill-grantpicks-black-400 cursor-pointer hover:opacity-70 transition"
								onClick={() => {
									if (accFiles.length > 0) {
										let temp = [...accFiles]
										temp.splice(0, 1)
										setAccFiles(temp)
										let temp2 = [...accFileUrls]
										temp2.splice(0, 1)
										setAccFileUrls(temp2)
									} else {
										setValue('video', {
											url: '',
											file: undefined,
										})
										setYtIframe('')
									}
								}}
							/>
						</div>
						{accFiles.length > 0 && (
							<div className="relative">
								<video
									ref={videoRef}
									src={watch().video.url || playbackSrc?.[0].src || ''}
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
						)}
						{ytIframe && <div dangerouslySetInnerHTML={{ __html: ytIframe }} />}
					</div>
				)}
			</div>
			<div className="p-3 md:p-5 flex flex-col md:flex-row items-center md:justify-end space-x-0 md:space-x-4 space-y-4 md:space-y-0">
				<div className="w-full lg:w-auto">
					<Button
						color="white"
						isFullWidth
						onClick={async () => {
							await setDefaultData()
							setLinkInput('')
						}}
						className="!py-3 !border !border-grantpicks-black-400"
						isDisabled={
							accFiles.length > 0 || Boolean(ytIframe) || linkInput === ''
						}
					>
						Discard
					</Button>
				</div>
				<div className="w-full lg:w-auto">
					<Button
						isFullWidth
						color="black-950"
						onClick={handleSubmit(onSaveChanges)}
						className="!py-3 disabled:cursor-not-allowed"
						isDisabled={linkInput === ''}
					>
						Save changes
					</Button>
				</div>
			</div>
		</div>
	)
}

export default MyProjectMedia
