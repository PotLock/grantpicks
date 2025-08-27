import { MouseEventHandler } from 'react'

export type TColor =
	| 'black-950'
	| 'black'
	| 'disabled'
	| 'alpha-50'
	| 'white'
	| 'transparent'
	| 'red'
	| 'purple'

export interface ButtonProps {
	color?: TColor
	children: React.ReactNode
	onClick: MouseEventHandler<HTMLButtonElement>
	isDisabled?: boolean
	isFullWidth?: boolean
	isLoading?: boolean
	className?: string
	style?: React.CSSProperties
	icon?: React.ReactNode
	type?: 'button' | 'reset' | 'submit'
	iconPosition?: 'left' | 'right'
	textAlign?: 'left' | 'center' | 'right'
}
