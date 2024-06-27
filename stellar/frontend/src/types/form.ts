import { ChangeEvent, HTMLAttributes } from 'react'

export interface InputProps {
	value?: string | number
	placeholder?: string
	className?: string
	type?: 'email' | 'password' | 'number'
	id?: string
	name?: string
	required?: boolean
	onChange?: React.ChangeEventHandler<HTMLElement>
	disabled?: boolean
	customLabel?: React.ReactNode
	label?: string
	hintLabel?: string
	rows?: number
	preffixIcon?: React.ReactNode
	suffixIcon?: React.ReactNode
	errorMessage?: string | JSX.Element
}

export interface CheckboxProps {
	checked: boolean
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	parentClassName?: HTMLAttributes<HTMLDivElement>['className']
	className?: HTMLAttributes<HTMLDivElement>['className']
	label?: string
	disabled?: boolean
}
