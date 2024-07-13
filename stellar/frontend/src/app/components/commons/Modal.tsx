import { BaseModalProps } from '@/types/dialog'
import React, { useEffect, useRef } from 'react'

const Modal = ({
	isOpen,
	onClose,
	children,
	closeOnBgClick,
	closeOnEscape,
	zIndex = 100,
}: BaseModalProps) => {
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}
		if (closeOnEscape && isOpen) {
			document.addEventListener('keydown', onKeydown)
		}

		return () => {
			document.removeEventListener('keydown', onKeydown)
		}
	}, [onClose, closeOnEscape, isOpen])

	const bgClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === modalRef.current && closeOnBgClick) {
			onClose()
		}
	}
	if (!isOpen) return null
	return (
		<div
			ref={modalRef}
			onClick={(e) => bgClick(e)}
			className="fixed inset-0 bg-black/30 flex items-center"
			style={{
				zIndex,
			}}
		>
			{children}
		</div>
	)
}

export default Modal
