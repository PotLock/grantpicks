import React from 'react'
import Modal from './Modal'
import { BaseModalProps } from '@/types/dialog'

interface VideoPlayerModalProps extends BaseModalProps {
	videoUrl?: string
}

const VideoPlayerModal = ({
	isOpen,
	onClose,
	videoUrl,
}: VideoPlayerModalProps) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			closeOnBgClick={true}
			closeOnEscape={true}
		>
			<div className="max-w-[90%] mx-auto max-h-[90vh] relative">
				<video
					src={videoUrl}
					autoPlay={false}
					controls={true}
					className="w-full h-full mx-auto"
				></video>
			</div>
		</Modal>
	)
}

export default VideoPlayerModal
