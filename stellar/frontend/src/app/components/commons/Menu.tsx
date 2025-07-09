import { IMenuProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { useEffect, useRef, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const Menu = ({
	onClose,
	isOpen,
	className,
	position,
	closeOnBgClick = true,
	closeOnEscape = true,
	children,
	buttonRef,
}: IMenuProps) => {
	const menuRef = useRef<HTMLDivElement>(null)
	const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
	const [isDesktop, setIsDesktop] = useState(false)

	// Detect desktop (md: 768px and up)
	useLayoutEffect(() => {
		const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
		checkDesktop()
		window.addEventListener('resize', checkDesktop)
		return () => window.removeEventListener('resize', checkDesktop)
	}, [])

	// Position menu for desktop portal if buttonRef is provided
	useLayoutEffect(() => {
		if (isOpen && isDesktop && buttonRef?.current && menuRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			setMenuStyle({
				position: 'absolute',
				top: buttonRect.bottom + window.scrollY + 8, // 8px gap
				left: buttonRect.right - menuRef.current.offsetWidth,
				zIndex: 60,
			})
		}
	}, [isOpen, isDesktop, buttonRef])

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

	// Desktop: render menu in portal if buttonRef is provided
	const shouldUsePortal = isOpen && isDesktop && buttonRef?.current && typeof window !== 'undefined'

	const desktopMenu = shouldUsePortal
		? createPortal(
			<div
				ref={menuRef}
				style={menuStyle}
				className={clsx(
					'hidden md:block',
					className,
				)}
			>
				{children}
			</div>,
			document.body
		)
		: null

	// Fallback: render menu in place if no buttonRef (for custom-positioned menus)
	const fallbackMenu = isOpen && isDesktop && !buttonRef
		? (
			<div
				className={clsx(
					'absolute hidden md:block z-[60]',
					position,
					className,
				)}
			>
				{children}
			</div>
		)
		: null

	return (
		<>
			{/* Overlay for closing on background click */}
			{isOpen && (
				<div
					ref={menuRef}
					className={clsx('fixed inset-0 z-50 max-w-full mx-auto')}
					onClick={(e) => _bgClick(e)}
					style={{ display: isDesktop ? 'none' : undefined }}
				/>
			)}
			{/* Desktop menu in portal (dropdown) */}
			{desktopMenu}
			{/* Desktop fallback menu (custom position) */}
			{fallbackMenu}
			{/* Mobile menu (fixed at bottom) */}
			<div
				className={clsx(
					'fixed block md:hidden bottom-0 inset-x-0 z-[60] transition-transform transform-gpu duration-500',
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
