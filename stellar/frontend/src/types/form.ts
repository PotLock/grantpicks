import { IGetProjectsResponse } from '@/services/on-chain/project-registry'
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
	onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
	disabled?: boolean
	customLabel?: React.ReactNode
	label?: string
	hintLabel?: string
	rows?: number
	preffixIcon?: React.ReactNode
	suffixIcon?: React.ReactNode
	errorMessage?: JSX.Element
	textAlign?: 'left' | 'center' | 'right'
	isStopPropagation?: boolean
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
	allow_application: boolean
	max_participants: number
	apply_duration_start: Date | null
	apply_duration_end: Date | null
	video_required: boolean
	voting_duration_start: Date | null
	voting_duration_end: Date | null
	projects: IGetProjectsResponse[]
	admins: IAdminCreateRound[]
	allow_remaining_dist: boolean
	allow_compliance: boolean
	allow_cooldown: boolean
	compliance_req_desc: string
	compliance_end_ms: Date | null
	compliance_period_ms: number | null
	cooldown_end_ms: Date | null
	cooldown_period_ms: number | null
	remaining_dist_address: string
	referrer_fee_basis_points: number
	use_vault: boolean
	is_video_required: boolean
}

export type UpdateRoundData = {
	title: string
	description: string
	vote_per_person: number
	contact_type: string
	contact_address: string
	amount: string
	expected_amount: string
	allow_application: boolean
	max_participants: number
	apply_duration_start: Date | null
	apply_duration_end: Date | null
	video_required: boolean
	voting_duration_start: Date | null
	voting_duration_end: Date | null
	projects: IGetProjectsResponse[]
	admins: IAdminCreateRound[]
	allow_remaining_dist: boolean
	allow_compliance: boolean
	allow_cooldown: boolean
	compliance_req_desc: string
	compliance_end_ms: Date | null
	compliance_period_ms: number | null
	cooldown_end_ms: Date | null
	cooldown_period_ms: number | null
	remaining_dist_address: string
	referrer_fee_basis_points: number
	use_vault: boolean
	is_video_required: boolean
}

export type CreateProjectStep1Data = {
	title: string
	project_id: string
	description: string
	considering_desc: string
}

export type CreateProjectStep2Data = {
	member: string
}

export type CreateProjectStep3Data = {
	smart_contracts: {
		id: string
		chain: string
		address: string
	}[]
	is_open_source: boolean
	github_urls: { id: string; github_url: string }[]
	contacts: {
		id: string
		platform: string
		link_url: string
	}[]
}

export type CreateProjectStep4Data = {
	funding_histories: {
		id: string
		source: string
		date: Date
		denomination: string
		amount: string
		description: string
	}[]
	is_havent_raised: boolean
}

export type CreateProjectStep5Data = {
	video: {
		url: string
		file?: File
	}
}
