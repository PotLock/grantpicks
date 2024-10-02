import { GPUser } from './user'

export interface GPProject {
	id: number
	on_chain_id: number
	image_url: string
	video_url: string
	name: string
	overview: string
	owner: GPUser
	payout_address: GPUser
	contacts: GProjectContact[]
	contracts: GProjectContract[]
	team_members: string[]
	repositories: GProjectRepository[]
	status: string
	submited_ms: number
	updated_ms: number | null
	admins: string[]
}

export interface GProjectContact {
	id: number
	name: string
	value: string
}

export interface GProjectContract {
	id: number
	name: string
	contract_address: string
}

export interface GProjectRepository {
	id: number
	label: string
	url: string
}
