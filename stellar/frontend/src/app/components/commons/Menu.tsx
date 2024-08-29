import { IMenuProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { useEffect, useRef } from 'react'

const Menu = ({
	onClose,
	isOpen,
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
			{isOpen && (
				<div
					ref={menuRef}
					className={clsx('fixed inset-0 z-50 bg-black/10 max-w-full mx-auto')}
					onClick={(e) => _bgClick(e)}
				/>
			)}
			{isOpen && (
				<div
					className={clsx(
						`absolute hidden md:block z-[60]`,
						position,
						className,
					)}
				>
					{children}
				</div>
			)}
			<div
				className={clsx(
					`fixed block md:hidden bottom-0 inset-x-0 z-[60] transition-transform transform-gpu duration-500`,
					isOpen ? 'translate-y-[0%]' : 'translate-y-[100%]',
					className,
				)}
			>
				{children}
			</div>
		</>
	)
}

export default Menu
