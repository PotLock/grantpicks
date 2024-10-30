import { GPUser } from './user'

export class GPProject {
	id: number | null = null
	on_chain_id: number = 0
	image_url: string = ''
	video_url: string = ''
	name: string = ''
	overview: string = ''
	owner: GPUser | null = null
	payout_address: GPUser | null = null
	contacts: GProjectContact[] = []
	contracts: GProjectContract[] = []
	team_members: string[] = []
	repositories: GProjectRepository[] = []
	status: string = ''
	submited_ms: number | null = null
	updated_ms: number | null = null
	admins: string[] = []
	constructor() {}
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
