import React, { useEffect, useRef, useState } from 'react'
import Modal from './Modal'
import { BaseModalProps } from '@/types/dialog'
import { fetchYoutubeIframe } from '@/utils/helper'

interface VideoPlayerModalProps extends BaseModalProps {
	videoUrl?: string
}

const VideoPlayerModal = ({
	isOpen,
	onClose,
	videoUrl,
}: VideoPlayerModalProps) => {
	const wrapperRef = useRef<HTMLDivElement>(null)
	const [ytIframe, setYtIframe] = useState<string>('')
	useEffect(() => {
		const fetchIframe = async () => {
			const res = await fetchYoutubeIframe(
				videoUrl || '',
				wrapperRef.current?.clientWidth || 0,
			)
			setYtIframe(res?.html)
		}
		if (isOpen && videoUrl && videoUrl.includes('youtube')) {
			fetchIframe()
		}
	}, [videoUrl])

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			closeOnBgClick={true}
			closeOnEscape={true}
		>
			<div
				ref={wrapperRef}
				className="max-w-[90%] mx-auto max-h-[90vh] relative"
			>
				{videoUrl?.includes('youtube') && ytIframe ? (
					<div dangerouslySetInnerHTML={{ __html: ytIframe }} />
				) : (
					<video
						src={videoUrl}
						autoPlay={false}
						controls={true}
						className="w-full h-full mx-auto"
					></video>
				)}
			</div>
		</Modal>
	)
}

export default VideoPlayerModal
