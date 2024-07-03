import { IMenuProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'

const Menu = ({
	onClose,
	className,
	position,
	closeOnBgClick = true,
	closeOnEscape = true,
	children,
}: IMenuProps) => {
	const menuRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const onKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose()
			}
		}
		if (closeOnEscape) {
			document.addEventListener('keydown', onKeydown)
		}
		return () => {
			document.removeEventListener('keydown', onKeydown)
		}
	}, [onClose, closeOnEscape])

	const _bgClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === menuRef.current && closeOnBgClick) {
			onClose()
		}
	}

	return (
		<>
			<div
				ref={menuRef}
				className={clsx('fixed inset-0 z-50 bg-black/10 max-w-full mx-auto')}
				onClick={(e) => _bgClick(e)}
			/>
			<div className={clsx(`absolute z-[60]`, position, className)}>
				{children}
			</div>
		</>
	)
}

export default Menu
