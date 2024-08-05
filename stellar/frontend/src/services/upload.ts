import { Livepeer } from 'livepeer'
import {
	TranscodeProfileEncoder,
	TranscodeProfileProfile,
} from 'livepeer/models/components'
import { RequestUploadResponse } from 'livepeer/models/operations'
import { Dispatch, SetStateAction } from 'react'
import * as tus from 'tus-js-client'

export const requestUpload = async (
	livepeer: Livepeer | null,
	filename: string,
) => {
	const resLivepeer = await livepeer?.asset.create({
		name: filename + '/' + new Date().toISOString(),
		staticMp4: true,
	})
	if (resLivepeer) {
		const resTypedLivePeer: RequestUploadResponse = resLivepeer
		return resTypedLivePeer
	}
}

export const uploadFile = async (
	file: File,
	setUploadResult: Dispatch<
		SetStateAction<
			| { upload?: tus.Upload; uploadedUrl: string | null; percentage?: string }
			| undefined
		>
	>,
	onCbProgress: (percentage: string) => void,
	onCbSuccess: (uploadedUrl: string | null) => Promise<void>,
	livepeerRes?: RequestUploadResponse,
) => {
	let uploadedUrl: string = ''
	let percentage: string = ''
	const upload = new tus.Upload(file, {
		endpoint: livepeerRes?.data?.tusEndpoint,
		metadata: {
			filename: livepeerRes?.data?.asset.name || '',
			filetype: 'video/mp4',
		},
		uploadSize: file.size,
		onError(err) {
			console.error('Error uploading file:', err)
		},
		onProgress(bytesUploaded, bytesTotal) {
			percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2)
			onCbProgress(percentage)
			// setUploadResult((prev) => ({ ...prev, percentage: percentage || '' }))
			// console.log('Uploaded ' + percentage + '%')
		},
		async onSuccess() {
			console.log('Upload finished:', upload.url)
			await onCbSuccess(upload.url)
			// setUploadResult((prev) => ({ ...prev, uploadedUrl: upload.url || '' }))
			uploadedUrl = upload.url || ''
		},
	})
	const previousUploads = await upload.findPreviousUploads()
	if (previousUploads.length > 0) {
		upload.resumeFromPreviousUpload(previousUploads[0])
	}
	upload.start()
	return { upload, uploadedUrl, percentage }
}

export const retrieveAsset = async (
	livepeer: Livepeer | null,
	livepeerRes?: RequestUploadResponse,
) => {
	try {
		const result = await livepeer?.asset.get(livepeerRes?.data?.asset.id || '')
		return result
	} catch (error: any) {
		console.log('error retrieve asset', error)
	}
}
