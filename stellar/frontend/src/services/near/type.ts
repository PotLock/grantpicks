import { NearSocial } from './near-social'
import { ListsContract } from './lists'
import { RoundContract } from './round'
import { GPRound } from '@/models/round'
import { GPUser } from '@/models/user'
import { GPProject } from '@/models/project'
import { GPVoting } from '@/models/voting'
import { GPPayoutChallenge } from '@/models/payout'

export type NearSocialGPProject = {
	name: string
	overview: string
	video_url: string
	image_url: string
	owner: string
	payout_address: string
	contacts: NearProjectContact[]
	contracts: NearProjectContract[]
	team_members: string[]
	repositories: NearProjectRepository[]
	fundings: NearProjectFundingHistory[]
}

export type NearProjectContact = {
	name: string
	value: string
}

export type NearProjectContract = {
	name: string
	contract_address: string
}

export type NearProjectRepository = {
	label: string
	url: string
}

export type NearSocialGPUser = {
	id: number
	name: string
	email: string
	avatar: string
	bio: string
}

export type NearProjectFundingHistory = {
	amount: string
	denomination: string
	description: string
	funded_ms: number
	source: string
}

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
	wl_list_id: bigint | undefined
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

export type NearPair = {
	id: number
	projects: string[]
}

export type NearPick = {
	pair_id: number
	voted_project: string
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

export type NearProjectVotingResult = {
	project: string
	voting_count: number
	is_flagged: boolean
}

export type NearPayoutInput = {
	recipient_id: string
	amount: string
	memo: string | undefined
}

export type NearPayout = {
	id: string
	round_id: string
	recipient_id: string
	amount: string
	paid_at: number | null
	memo: string | undefined
}

export type NearVotingResult = {
	voter: string
	picks: NearPick[]
	voted_ms: number
}

export function nearRoundToGPRound(round: NearRound) {
	const gprRound = new GPRound()

	gprRound.id = parseInt(round.id)
	gprRound.on_chain_id = parseInt(round.id)
	gprRound.name = round.name
	gprRound.description = round.description
	gprRound.factory_contract = process.env.NEAR_ROUND_CONTRACT_ID || ''
	gprRound.owner = {
		id: round.owner,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser
	gprRound.admins = round.admins
	gprRound.contacts = round.contacts
	gprRound.allow_applications = round.allow_applications
	gprRound.application_start = round.application_start_ms
		? new Date(round.application_start_ms).toISOString()
		: null
	gprRound.application_end = round.application_end_ms
		? new Date(round.application_end_ms).toISOString()
		: null
	gprRound.voting_end = new Date(round.voting_end_ms).toISOString()
	gprRound.voting_start = new Date(round.voting_start_ms).toISOString()
	gprRound.use_whitelist = round.use_whitelist
	gprRound.is_video_required = round.application_requires_video
	gprRound.voting_start = new Date(round.voting_start_ms).toISOString()
	gprRound.voting_end = new Date(round.voting_end_ms).toISOString()
	gprRound.use_whitelist = round.use_whitelist
	gprRound.expected_amount = round.expected_amount
	gprRound.current_vault_balance = round.current_vault_balance
	gprRound.vault_total_deposits = round.vault_total_deposits
	gprRound.referrer_fee_basis_points = round.referrer_fee_basis_points || 0
	gprRound.allow_remaining_dist = round.allow_remaining_funds_redistribution
	gprRound.remaining_dist_address = {
		id: round.remaining_funds_redistribution_recipient,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser

	gprRound.remaining_dist_memo = round.remaining_funds_redistribution_memo || ''
	gprRound.remaining_dist_at_ms =
		round.remaining_funds_redistributed_at_ms || null
	gprRound.remaining_dist_by = {
		id: round.remaining_funds_redistributed_by,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser
	gprRound.num_picks_per_voter = round.num_picks_per_voter
	gprRound.max_participants = round.max_participants
	gprRound.cooldown_period_ms = round.cooldown_period_ms
	gprRound.cooldown_end = round.cooldown_end_ms
		? new Date(round.cooldown_end_ms).toISOString()
		: null
	gprRound.compliance_end = round.compliance_end_ms
		? new Date(round.compliance_end_ms).toISOString()
		: null
	gprRound.compliance_period_ms = round.compliance_period_ms
	gprRound.vault_total_deposits = round.vault_total_deposits
	gprRound.compliance_req_desc = round.compliance_requirement_description || ''
	return gprRound
}

export function nearProjectToGPProject(project: NearSocialGPProject) {
	const gpProject = new GPProject()
	gpProject.name = project.name
	gpProject.overview = project.overview
	gpProject.video_url = project.video_url
	gpProject.image_url = project.image_url
	gpProject.owner = {
		id: project.owner,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser
	gpProject.payout_address = {
		id: project.payout_address,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser

	gpProject.contacts = project.contacts.map((c, i) => ({
		id: i,
		name: c.name,
		value: c.value,
	}))

	gpProject.contracts = project.contracts.map((c, i) => ({
		id: i,
		name: c.name,
		contract_address: c.contract_address,
	}))

	gpProject.repositories = project.repositories.map((r, i) => ({
		id: i,
		label: r.label,
		url: r.url,
	}))

	gpProject.team_members = project.team_members

	gpProject.status = 'Approved'
	gpProject.submited_ms = 0
	gpProject.updated_ms = 0
	return gpProject
}

export function nearVotingResultToGPVoting(votingResult: NearVotingResult) {
	const gpVoting = new GPVoting()
	gpVoting.voter = votingResult.voter
	gpVoting.voted_ms = votingResult.voted_ms
	gpVoting.picks = votingResult.picks.map((pick) => ({
		pair_id: pick.pair_id,
		voted_project: pick.voted_project,
	}))
	return gpVoting
}

export type NearPayoutChallenge = {
	challenger_id: string
	round_id: number
	created_at: number
	reason: string
	admin_notes: string | undefined
	resolved: boolean
}

export function nearPayoutChallengeToGPPayoutChallenge(
	challenge: NearPayoutChallenge,
) {
	const gpPayoutChallenge = new GPPayoutChallenge()

	gpPayoutChallenge.challenger_id = challenge.challenger_id
	gpPayoutChallenge.round_id = challenge.round_id
	gpPayoutChallenge.created_at = challenge.created_at
	gpPayoutChallenge.reason = challenge.reason
	gpPayoutChallenge.admin_notes = challenge.admin_notes || ''
	gpPayoutChallenge.resolved = challenge.resolved

	return gpPayoutChallenge
}
