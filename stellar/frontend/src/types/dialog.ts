export interface DialogProps {
	onClose: () => void
	isOpen: boolean
}

export interface IMenuProps extends DialogProps {
	children: React.ReactNode
	position: string
	closeOnBgClick?: boolean
	closeOnEscape?: boolean
	className?: string
}

export interface IDrawerProps extends DialogProps {
	children?: React.ReactNode
	closeOnBgClick?: boolean
	closeOnEscape?: boolean
	className?: string
}

export interface BaseModalProps {
	isOpen: boolean
	onClose: () => void
	children?: React.ReactNode
	closeOnEscape?: boolean
	closeOnBgClick?: boolean
	zIndex?: number
}
