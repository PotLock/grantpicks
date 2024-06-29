export interface DialogProps {
	onClose: () => void
	isOpen?: boolean
}

export interface IMenuProps extends DialogProps {
	children: React.ReactNode
	closeOnBgClick?: boolean
	closeOnEscape?: boolean
	className?: string
	position?: string
}
