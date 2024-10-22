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
	whitelisted_voters: string[]
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
	whitelisted_voters: string[]
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
}

export type NearContracts = {
	round: RoundContract
	lists: ListsContract
}
