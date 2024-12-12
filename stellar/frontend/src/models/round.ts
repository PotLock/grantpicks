import { GPUser } from './user'

export class GPRound {
	id: number = 0
	on_chain_id: number = 0
	chain: string = ''
	factory_contract: string = ''
	deployed_at: string = ''
	owner: GPUser | null = null
	admins: string[] = []
	name: string = ''
	description: string = ''
	expected_amount: string = ''
	allow_applications: boolean = false
	is_video_required: boolean = false
	cooldown_end: null | string = null
	cooldown_period_ms: null | number = null
	compliance_req_desc: string = ''
	compliance_period_ms: null | number = null
	compliance_end: null | string = null
	allow_remaining_dist: null | boolean = null
	remaining_dist_address: GPUser | null = null
	remaining_dist_memo: string = ''
	remaining_dist_at_ms: null | number = null
	current_vault_balance: string = ''
	current_vault_balance_usd: null | string = null
	remaining_dist_by: GPUser | null = null
	referrer_fee_basis_points: number = 0
	vault_total_deposits: string = ''
	vault_total_deposits_usd: null | string = null
	round_complete: null | number = null
	approved_projects: number[] = []
	application_start: null | string = null
	application_end: null | string = null
	voting_start: string = ''
	voting_end: string = ''
	use_whitelist: null | boolean = null
	use_vault: null | boolean = null
	num_picks_per_voter: number = 0
	max_participants: number = 0
	contacts: GPRoundContact[] = []
	wl_list_id: number | null = null

	constructor() {}
}

export interface GPRoundContact {
	name: string
	value: string
}
