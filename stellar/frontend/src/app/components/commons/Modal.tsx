import { BaseModalProps } from '@/types/dialog'
import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const Modal = ({
	isOpen,
	onClose,
	children,
	closeOnBgClick,
	closeOnEscape,
	zIndex = 100,
}: BaseModalProps) => {
	const modalRef = useRef<HTMLDivElement>(null)
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		return () => setMounted(false)
	}, [])

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
			onClose(e)
		}
	}
	if (!isOpen || !mounted) return null

	return createPortal(
		<div
			ref={modalRef}
			onClick={(e) => bgClick(e)}
			className="fixed inset-0 bg-black/30 flex items-center"
			style={{ zIndex }}
		>
			{children}
		</div>,
		document.body,
	)
}

export default Modal
