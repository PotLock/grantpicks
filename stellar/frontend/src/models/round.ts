import { GPUser } from './user'

export interface GPRound {
	id: number
	on_chain_id: number
	factory_contract: string
	deployed_at: string
	owner: GPUser
	admins: string[]
	name: string
	description: string
	expected_amount: string
	allow_applications: boolean
	is_video_required: boolean
	cooldown_end: null | string
	cooldown_period_ms: null | number
	compliance_req_desc: string
	compliance_period_ms: null | number
	compliance_end: null | string
	allow_remaining_dist: null | boolean
	remaining_dist_address: GPUser
	remaining_dist_memo: string
	remaining_dist_at_ms: null | number
	current_vault_balance: string
	current_vault_balance_usd: null | string
	remaining_dist_by: GPUser
	referrer_fee_basis_points: number
	vault_total_deposits: string
	vault_total_deposits_usd: null
	round_complete: null | number
	approved_projects: number[]
	application_start: null | string
	application_end: null | string
	voting_start: string
	voting_end: string
	use_whitelist: null | boolean
	use_vault: null | boolean
	num_picks_per_voter: number
	max_participants: number
	contacts: GPRoundContact[]
}

export interface GPRoundContact {
	name: string
	value: string
}
