import { IMenuProps } from '@/types/dialog'
import clsx from 'clsx'
import React, { useEffect, useRef, useState } from 'react'
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
	mobileAsPortal,
}: IMenuProps) => {
	const menuRef = useRef<HTMLDivElement>(null)
	const overlayRef = useRef<HTMLDivElement>(null)
	const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({})
	const [isDesktop, setIsDesktop] = useState<boolean>(() =>
		typeof window !== 'undefined' ? window.innerWidth >= 768 : false,
	)

	// Detect desktop (md: 768px and up) - only on resize, not on initial render
	useEffect(() => {
		const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
		// Run once on mount to fix SSR/hydration mismatch.
		checkDesktop()
		window.addEventListener('resize', checkDesktop)
		return () => window.removeEventListener('resize', checkDesktop)
	}, [])

	useEffect(() => {
		if (isOpen && buttonRef?.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			setMenuStyle({
				position: 'fixed',
				top: buttonRect.bottom + 8,
				left: buttonRect.left,
				width: buttonRect.width,
				zIndex: 60,
			})
		}
	}, [isOpen, buttonRef])

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

	// Desktop: close on clicking outside the menu (including outside the trigger button)
	useEffect(() => {
		if (!isOpen || !closeOnBgClick || !isDesktop) return

		const handleClickOutside = (e: MouseEvent | TouchEvent) => {
			const target = e.target as Node
			const menuEl = menuRef.current
			const buttonEl = buttonRef?.current || null
			if (
				menuEl &&
				!menuEl.contains(target) &&
				(!buttonEl || !buttonEl.contains(target))
			) {
				onClose()
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('touchstart', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('touchstart', handleClickOutside)
		}
	}, [isOpen, closeOnBgClick, isDesktop, onClose, buttonRef])

	const _bgClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === overlayRef.current && closeOnBgClick) {
			onClose()
		}
	}

	// Desktop: render menu in portal if buttonRef is provided
	const shouldUsePortal =
		isOpen && buttonRef?.current && typeof window !== 'undefined'

	const desktopMenu = shouldUsePortal
		? createPortal(
			<div
				ref={menuRef}
				style={menuStyle}
				className={clsx('hidden md:block', className)}
			>
				{children}
			</div>,
			document.body,
		)
		: null

	// Fallback: render menu in place if no buttonRef (for custom-positioned menus)
	const fallbackMenu =
		isOpen && isDesktop && !buttonRef ? (
			<div
				ref={menuRef}
				className={clsx(
					'absolute hidden md:block z-[60]',
					position || '',
					className,
				)}
			>
				{children}
			</div>
		) : null

	return (
		<>
			{/* Overlay for closing on background click */}
			{isOpen && !isDesktop && !mobileAsPortal && (
				<div
					ref={overlayRef}
					className={clsx('fixed inset-0 z-50 max-w-full mx-auto')}
					onClick={(e) => _bgClick(e)}
				/>
			)}
			{isOpen && !isDesktop && mobileAsPortal && (
				<div
					ref={overlayRef}
					className={clsx('fixed inset-0 z-[59] max-w-full mx-auto')}
					onClick={(e) => _bgClick(e)}
				/>
			)}
			{/* Desktop menu in portal (dropdown) */}
			{desktopMenu}
			{/* Desktop fallback menu (custom position) */}
			{fallbackMenu}
			{/* Mobile menu (fixed at bottom) */}
			{!mobileAsPortal && (
				<div
					className={clsx(
						'fixed block md:hidden bottom-0 inset-x-0 z-[60] transition-transform transform-gpu duration-500',
						isOpen ? 'translate-y-[0%]' : 'translate-y-[100%]',
						className,
					)}
				>
					{children}
				</div>
			)}
			{mobileAsPortal && isOpen && createPortal(
				<div
					ref={menuRef}
					style={menuStyle}
					className={clsx('md:hidden', className)}
				>
					{children}
				</div>,
				document.body,
			)}
		</>
	)
}

export default Menu
