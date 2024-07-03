import { ChangeEvent, HTMLAttributes } from 'react'

export interface InputProps {
	value?: string | number
	placeholder?: string
	className?: string
	type?: 'email' | 'password' | 'number'
	id?: string
	name?: string
	required?: boolean
	onChange?: React.ChangeEventHandler<HTMLInputElement>
	disabled?: boolean
	customLabel?: React.ReactNode
	label?: string
	hintLabel?: string
	rows?: number
	preffixIcon?: React.ReactNode
	suffixIcon?: React.ReactNode
	errorMessage?: JSX.Element
	textAlign?: 'left' | 'center' | 'right'
}

export interface InputTextAreaProps {
	value?: string | number
	placeholder?: string
	className?: string
	type?: 'email' | 'password' | 'number'
	id?: string
	name?: string
	required?: boolean
	onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
	disabled?: boolean
	customLabel?: React.ReactNode
	label?: string
	hintLabel?: string
	rows?: number
	preffixIcon?: React.ReactNode
	suffixIcon?: React.ReactNode
	errorMessage?: JSX.Element
	textAlign?: 'left' | 'center' | 'right'
}

export interface CheckboxProps {
	checked: boolean
	onChange: (e: ChangeEvent<HTMLInputElement>) => void
	parentClassName?: HTMLAttributes<HTMLDivElement>['className']
	className?: HTMLAttributes<HTMLDivElement>['className']
	label?: string
	disabled?: boolean
}

export type IProjectCreateRound = {
	project_id: string
}

export type IAdminCreateRound = {
	admin_id: string
}

export type CreateRoundData = {
	title: string
	description: string
	vote_per_person: number
	contact_type: string
	contact_address: string
	amount: string
	expected_amount: string
	open_funding: boolean
	allow_application: boolean
	max_participants: number
	apply_duration: Date
	video_required: boolean
	voting_duration: Date
	projects: IProjectCreateRound[]
	admins: IAdminCreateRound[]
}
