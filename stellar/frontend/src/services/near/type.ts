import { NearSocial } from './near-social'
import { ListsContract } from './lists'
import { RoundContract } from './round'

export type NearConfig = {
	owner: string
	protocol_fee_recipient: string
	protocol_fee_basis_points: number
	default_page_size: number
}

export type NearCreateRoundParams = {
	owner: string
	admins: string[]
	name: string
	description: string
	contacts: NearContact[]
	voting_start_ms: number
	voting_end_ms: number
	allow_applications: boolean
	application_start_ms: number | undefined
	application_end_ms: number | undefined
	application_requires_video: boolean
	expected_amount: string
	use_whitelist: boolean | undefined
	num_picks_per_voter: number
	max_participants: number | undefined
	use_cooldown: boolean
	cooldown_period_ms: number | undefined
	use_compliance: boolean
	compliance_requirement_description: string | undefined
	compliance_period_ms: number | undefined
	allow_remaining_funds_redistribution: boolean
	remaining_funds_redistribution_recipient: string | undefined
	use_referrals: boolean
	referrer_fee_basis_points: number | string
}

export interface NearUpdateRoundParams {
	round_id: number
	admins?: string[]
	name?: string
	description?: string
	contacts?: NearContact[]
	allow_applications?: boolean
	application_start_ms?: number | undefined
	application_end_ms?: number | undefined
	application_requires_video?: boolean
	voting_start_ms?: number
	voting_end_ms?: number
	blacklisted_voters?: string[]
	whitelisted_voters?: string[]
	use_whitelist?: boolean
	expected_amount?: string
	use_referrals?: boolean
	referrer_fee_basis_points?: number | undefined
	allow_remaining_funds_redistribution?: boolean
	remaining_funds_redistribution_recipient?: string | undefined
	num_picks_per_voter?: number
	max_participants?: number
	use_cooldown?: boolean
	cooldown_period_ms?: number
	use_compliance?: boolean
	compliance_requirement_description?: string | undefined
	compliance_period_ms?: number
	wl_list_id?: bigint | undefined
}

export type NearContact = {
	value: string
	name: string
}

export type NearRound = {
	id: string
	owner: string
	admins: string[]
	name: string
	description: string
	contacts: NearContact[]
	allow_applications: boolean
	application_start_ms: number | undefined
	application_end_ms: number | undefined
	application_requires_video: boolean
	voting_start_ms: number
	voting_end_ms: number
	blacklisted_voters: string[]
	wl_list_id: string[]
	use_whitelist: boolean
	expected_amount: string
	current_vault_balance: string
	vault_total_deposits: string
	use_referrals: boolean
	referrer_fee_basis_points: number | undefined
	allow_remaining_funds_redistribution: boolean
	remaining_funds_redistribution_recipient: string | undefined
	remaining_funds_redistributed_at_ms: number | undefined
	remaining_funds_redistribution_memo: string | undefined
	remaining_funds_redistributed_by: string | undefined
	num_picks_per_voter: number
	max_participants: number
	use_cooldown: boolean
	cooldown_period_ms: number
	cooldown_end_ms: number | undefined
	use_compliance: boolean
	compliance_requirement_description: string | undefined
	compliance_period_ms: number
	compliance_end_ms: number | undefined
	round_complete: boolean
	use_vault: boolean
	is_video_required: boolean
	compliance_req_desc: string
	allow_remaining_dist: boolean
	remaining_dist_address: string
}

export type NearContracts = {
	round: RoundContract
	near_social: NearSocial
	lists: ListsContract
}

export type NearProjectApplication = {
	round_id: string
	applicant_id: string
	applicant_note: string | undefined | null
	video_url: string | undefined | null
	status: string
	review_note: string | undefined | null
	submited_ms: number
	updated_ms: number | undefined | null
}
