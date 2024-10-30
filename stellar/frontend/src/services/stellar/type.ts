import { GPProject } from '@/models/project'
import { GPRound } from '@/models/round'
import { GPUser } from '@/models/user'
import { Project } from 'project-registry-client'
import { RoundDetail } from 'round-client'

export function roundDetailToGPRound(round: RoundDetail) {
	const gprRound = new GPRound()
	gprRound.id = Number(round.id)
	gprRound.on_chain_id = Number(round.id)
	gprRound.factory_contract = ''
	gprRound.deployed_at = ''
	gprRound.owner = {
		id: round.owner,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser
	gprRound.admins = []
	gprRound.name = round.name
	gprRound.description = round.description
	gprRound.expected_amount = round.expected_amount.toString()
	gprRound.allow_applications = round.allow_applications
	gprRound.is_video_required = round.is_video_required
	gprRound.cooldown_end = round.cooldown_end_ms
		? new Date(Number(round.cooldown_end_ms)).toISOString()
		: null
	gprRound.cooldown_period_ms = round.cooldown_period_ms
		? Number(round.cooldown_period_ms)
		: null
	gprRound.compliance_req_desc = round.compliance_req_desc
	gprRound.compliance_period_ms = round.compliance_period_ms
		? Number(round.compliance_period_ms)
		: null
	gprRound.compliance_end = round.compliance_end_ms
		? new Date(Number(round.compliance_end_ms)).toISOString()
		: null
	gprRound.allow_remaining_dist = round.allow_remaining_dist || false
	gprRound.remaining_dist_address = {
		id: round.remaining_dist_address,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser

	gprRound.remaining_dist_memo = round.remaining_dist_memo
	gprRound.remaining_dist_at_ms = round.remaining_dist_at_ms
		? Number(round.remaining_dist_at_ms)
		: null
	gprRound.current_vault_balance = round.current_vault_balance.toString()
	gprRound.current_vault_balance_usd = ''
	gprRound.remaining_dist_by = {
		id: round.remaining_dist_by,
		total_donations_in_usd: 0,
		total_matching_pool_allocations_usd: 0,
		total_donations_out_usd: 0,
	} as GPUser

	gprRound.referrer_fee_basis_points = round.referrer_fee_basis_points || 0
	gprRound.vault_total_deposits = round.vault_total_deposits.toString()
	gprRound.vault_total_deposits_usd = ''
	gprRound.round_complete = round.round_complete_ms
		? Number(round.round_complete_ms)
		: null
	gprRound.approved_projects = []
	gprRound.application_start = round.application_start_ms
		? new Date(Number(round.application_start_ms)).toISOString()
		: null
	gprRound.application_end = round.application_end_ms
		? new Date(Number(round.application_end_ms)).toISOString()
		: null
	gprRound.voting_start = new Date(Number(round.voting_start_ms)).toISOString()
	gprRound.voting_end = new Date(Number(round.voting_end_ms)).toISOString()
	gprRound.use_whitelist = round.use_whitelist
	gprRound.use_vault = round.use_vault || false
	gprRound.num_picks_per_voter = round.num_picks_per_voter
	return gprRound
}

export function projectToGPProject(project: Project) {
	const gpProject = new GPProject()
	gpProject.id = Number(project.id)
	gpProject.on_chain_id = Number(project.id)
	gpProject.image_url = project.image_url
	gpProject.video_url = project.video_url
	gpProject.name = project.name
	gpProject.overview = project.overview
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

	gpProject.contacts = project.contacts.map((c, index) => ({
		id: index,
		name: c.name,
		value: c.value,
	}))

	gpProject.contracts = project.contracts.map((c, index) => ({
		id: index,
		name: c.name,
		contract_address: c.contract_address,
	}))

	gpProject.team_members = project.team_members.map((tm, index) => tm.value)
	gpProject.repositories = project.repositories.map((r, index) => ({
		id: index,
		label: r.label,
		url: r.url,
	}))

	gpProject.status = 'Approved'
	gpProject.submited_ms = 0
	gpProject.updated_ms = 0

	return gpProject
}
