import { IDrawerProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'
import IconClose from '../svgs/IconClose'

const Drawer = ({
	isOpen,
	className,
	closeOnBgClick = true,
	closeOnEscape = true,
	onClose,
	children,
}: IDrawerProps) => {
	const drawerRef = useRef<HTMLDivElement>(null)
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
		console.log('lalla')
		if (e.target === drawerRef.current && closeOnBgClick) {
			onClose()
		}
	}
	return (
		<>
			{isOpen && (
				<div
					ref={drawerRef}
					className={clsx('fixed inset-0 z-50 bg-black/10 max-w-full mx-auto')}
					onClick={(e) => _bgClick(e)}
				/>
			)}
			<div
				className={clsx(
					`fixed right-0 inset-y-0 w-full md:w-[360px] z-[60] transition-transform transform-gpu duration-500 min-h-screen`,
					isOpen ? 'translate-x-[0%]' : 'translate-x-[100%]',
					className,
				)}
			>
				<IconClose
					size={24}
					className="fill-grantpicks-black-600 absolute top-5 right-5 cursor-pointer hover:opacity-70 transition"
					onClick={onClose}
				/>
				{children}
			</div>
		</>
	)
}

export default Drawer
