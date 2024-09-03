import Contracts from '@/lib/contracts'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
} from '@/types/on-chain'
import {
	AssembledTransaction,
	u128,
	u32,
	u64,
} from '@stellar/stellar-sdk/contract'
import {
	ApplicationStatus,
	Contact,
	Pair,
	PayoutsChallenge,
	PickedPair,
	ProjectVotingResult,
	RoundApplication,
	RoundDetail,
	VotingResult,
} from 'round-client'

interface GetRoundsParams {
	skip: number
	limit: number
}

interface GetRoundApplicationsParams {
	round_id: bigint
	skip: number
	limit: number
}

interface GetRoundApplicationParams {
	round_id: bigint
	applicant: string
}

interface GetRoundAdmins {
	round_id: u128
}

interface GetRoundInfoParams {
	round_id: bigint
}

export interface CreateRoundContact {
	name: string
	value: string
}

export interface CreateRoundParams {
	admins: string[]
	allow_applications: boolean
	allow_remaining_dist: boolean
	application_end_ms?: u64
	application_start_ms?: u64
	compliance_end_ms?: u64
	compliance_period_ms?: u64
	compliance_req_desc: string
	contacts: Contact[]
	cooldown_end_ms?: u64
	cooldown_period_ms?: u64
	description: string
	expected_amount: u128
	is_video_required: boolean
	max_participants?: u32
	name: string
	num_picks_per_voter?: u32
	owner: string
	referrer_fee_basis_points?: u32
	remaining_dist_address: string
	use_whitelist?: boolean
	voting_end_ms: u64
	voting_start_ms: u64
	use_vault?: boolean
}

export interface ReviewApplicationParams {
	round_id: u128
	caller: string
	applicant: string
	status: ApplicationStatus
	note?: string
}

export interface VoteRoundParams {
	round_id: u128
	voter: string
	picks: PickedPair[]
}

export interface AvailableVoteRoundParams {
	round_id: u128
	voter: string
}

export interface HasVotedRoundParams {
	round_id: u128
	voter: string
}

export interface GetResultVoteParams {
	round_id: u128
	voter: string
}

export interface GetMyVotedRoundsParams {
	voter: string
	from_index?: number
	limit?: number
}

export interface UpdateRoundParams {
	allow_applications: boolean
	application_end_ms?: u64
	application_start_ms?: u64
	contacts: Contact[]
	description: string
	expected_amount: u128
	is_video_required: boolean
	max_participants?: u32
	name: string
	num_picks_per_voter?: u32
	use_whitelist?: boolean
	voting_end_ms: u64
	voting_start_ms: u64
	use_vault?: boolean
}

export interface DepositFundRoundParams {
	round_id: u128
	caller: string
	amount: u128
	memo?: string
	referrer_id?: string
}

export interface ApplyProjectToRoundParams {
	round_id: u128
	caller: string
	applicant?: string
	note?: string
	review_note?: string
}

export interface ChallengePayoutParams {
	round_id: u128
	caller: string
	reason: string
}

export interface UpdateChallengePayoutParams {
	round_id: u128
	caller: string
	challenger_id: string
	notes?: string
	resolve_challenge?: boolean
}

export interface SetAdminsRoundParams {
	round_id: u128
	round_admin: string[]
}

export const getRounds: (
	params: GetRoundsParams,
	contract: Contracts,
) => Promise<IGetRoundsResponse[]> = async (
	params: GetRoundsParams,
	contract: Contracts,
) => {
	let limit = params.limit ? params.limit : 10
	let skip = params.skip ? params.skip * limit : 0

	let rounds = await contract.round_contract.get_rounds({
		from_index: BigInt(skip),
		limit: BigInt(limit),
	})
	return rounds.result
}

export const getRoundAdmins: (
	params: GetRoundAdmins,
	contract: Contracts,
) => Promise<string[]> = async (
	params: GetRoundAdmins,
	contract: Contracts,
) => {
	let rounds = await contract.round_contract.admins({
		round_id: params.round_id,
	})
	return rounds.result
}

export const getRoundApplications: (
	params: GetRoundApplicationsParams,
	contract: Contracts,
) => Promise<IGetRoundApplicationsResponse[]> = async (
	params: GetRoundApplicationsParams,
	contract: Contracts,
) => {
	let limit = params.limit ? params.limit : 10
	let skip = params.skip ? params.skip * limit : 0

	let rounds = await contract.round_contract.get_applications_for_round({
		round_id: BigInt(params.round_id),
		from_index: BigInt(skip),
		limit: BigInt(limit),
	})
	return rounds.result
}

export const getRoundApplication: (
	params: GetRoundApplicationParams,
	contract: Contracts,
) => Promise<RoundApplication> = async (
	params: GetRoundApplicationParams,
	contract: Contracts,
) => {
	let rounds = await contract.round_contract.get_application({
		round_id: BigInt(params.round_id),
		applicant: params.applicant,
	})
	return rounds.result
}

export const getRoundInfo: (
	params: GetRoundInfoParams,
	contract: Contracts,
) => Promise<IGetRoundsResponse> = async (
	params: GetRoundInfoParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.get_round({
		round_id: params.round_id,
	})
	return round.result
}

export const createRound: (
	caller: string,
	params: CreateRoundParams,
	contract: Contracts,
) => Promise<AssembledTransaction<RoundDetail>> = async (
	caller: string,
	params: CreateRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.create_round({
		caller,
		round_detail: {
			name: params.name,
			owner: params.owner,
			remaining_dist_address: params.remaining_dist_address,
			voting_end_ms: params.voting_end_ms,
			voting_start_ms: params.voting_start_ms,
			admins: params.admins,
			allow_applications: params.allow_applications,
			allow_remaining_dist: params.allow_remaining_dist,
			contacts: params.contacts,
			description: params.description,
			expected_amount: params.expected_amount,
			is_video_required: params.is_video_required,
			application_end_ms: params.application_end_ms || undefined,
			application_start_ms: params.application_start_ms || undefined,
			cooldown_period_ms: params.cooldown_period_ms || undefined,
			cooldown_end_ms: params.cooldown_end_ms || undefined,
			compliance_end_ms: params.compliance_end_ms || undefined,
			compliance_period_ms: params.compliance_period_ms || undefined,
			compliance_req_desc: params.compliance_req_desc,
			max_participants: params.max_participants || undefined,
			num_picks_per_voter: params.num_picks_per_voter || undefined,
			use_whitelist: params.use_whitelist || undefined,
			referrer_fee_basis_points: params.referrer_fee_basis_points as number,
			use_vault: params.use_vault || false,
		},
	})
	return round
}

export const editRound: (
	caller: string,
	round_id: bigint,
	params: UpdateRoundParams,
	contract: Contracts,
) => Promise<AssembledTransaction<RoundDetail>> = async (
	caller: string,
	round_id: bigint,
	params: UpdateRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.update_round({
		caller,
		round_id,
		round_detail: {
			allow_applications: params.allow_applications,
			application_end_ms: params.application_end_ms || undefined,
			application_start_ms: params.application_start_ms || undefined,
			contacts: params.contacts,
			description: params.description,
			expected_amount: params.expected_amount,
			is_video_required: params.is_video_required,
			max_participants: params.max_participants || undefined,
			name: params.name,
			num_picks_per_voter: params.num_picks_per_voter || undefined,
			use_whitelist: params.use_whitelist || undefined,
			voting_end_ms: params.voting_end_ms,
			voting_start_ms: params.voting_start_ms,
			use_vault: params.use_vault || undefined,
		},
	})
	return round
}

export const setAdminRound: (
	round_id: bigint,
	round_admin: string[],
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	round_id: bigint,
	round_admin: string[],
	contract: Contracts,
) => {
	let round = await contract.round_contract.set_admins({
		round_id,
		round_admin,
	})
	return round
}

export const addProjectsRound: (
	round_id: u128,
	admin: string,
	projects_ids: u128[],
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	round_id: u128,
	admin: string,
	project_ids: u128[],
	contract: Contracts,
) => {
	let round = await contract.round_contract.add_approved_project(
		{
			round_id,
			admin,
			project_ids,
		},
		{ simulate: true },
	)
	return round
}

export const depositFundRound: (
	params: DepositFundRoundParams,
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	params: DepositFundRoundParams,
	contract: Contracts,
) => {
	let res = await contract.round_contract.deposit_to_round({
		round_id: params.round_id,
		caller: params.caller,
		amount: params.amount,
		memo: params.memo,
		referrer_id: params.referrer_id,
	})
	return res
}

export const applyProjectToRound: (
	params: ApplyProjectToRoundParams,
	is_owner_round: boolean,
	contract: Contracts,
) => Promise<AssembledTransaction<RoundApplication>> = async (
	params: ApplyProjectToRoundParams,
	is_owner_round: boolean,
	contract: Contracts,
) => {
	let res = await contract.round_contract.apply_to_round({
		round_id: params.round_id,
		caller: params.caller,
		applicant: is_owner_round ? undefined : params.applicant,
		note: params.note,
		review_note: params.review_note,
	})
	return res
}

export const reviewApplicationRound: (
	params: ReviewApplicationParams,
	contract: Contracts,
) => Promise<AssembledTransaction<RoundApplication>> = async (
	params: ReviewApplicationParams,
	contract: Contracts,
) => {
	let res = await contract.round_contract.review_application({
		round_id: params.round_id,
		caller: params.caller,
		applicant: params.applicant,
		note: params.note,
		status: params.status,
	})
	return res
}

export const voteRound: (
	params: VoteRoundParams,
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	params: VoteRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.vote({
		round_id: params.round_id,
		voter: params.voter,
		picks: params.picks,
	})
	return round
}

export const getPairsRound: (
	round_id: u128,
	contract: Contracts,
) => Promise<Array<Pair>> = async (round_id: u128, contract: Contracts) => {
	console.log('debug', round_id)
	let round = await contract.round_contract.get_all_pairs_for_round({
		round_id,
	})
	return round.result
}

export const isAvailableVoteRound: (
	params: AvailableVoteRoundParams,
	contract: Contracts,
) => Promise<boolean> = async (
	params: AvailableVoteRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.can_vote({
		round_id: params.round_id,
		voter: params.voter,
	})
	return round.result
}

export const isHasVotedRound: (
	params: HasVotedRoundParams,
	contract: Contracts,
) => Promise<boolean> = async (
	params: HasVotedRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.user_has_vote({
		round_id: params.round_id,
		voter: params.voter,
	})
	return round.result
}

export const getResultVoteRound: (
	params: GetResultVoteParams,
	contract: Contracts,
) => Promise<VotingResult> = async (
	params: GetResultVoteParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.get_my_vote_for_round({
		round_id: params.round_id,
		voter: params.voter,
	})
	return round.result
}

export const getMyVotedRounds: (
	params: GetMyVotedRoundsParams,
	contract: Contracts,
) => Promise<Array<RoundDetail>> = async (
	params: GetMyVotedRoundsParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.get_voted_rounds({
		from_index: BigInt(params.from_index || 0),
		limit: BigInt(params.limit || 10),
		voter: params.voter,
	})
	return round.result
}

export const getVotingResultsRound: (
	round_id: u128,
	contract: Contracts,
) => Promise<Array<ProjectVotingResult>> = async (
	round_id: u128,
	contract: Contracts,
) => {
	let round = await contract.round_contract.get_voting_results_for_round({
		round_id,
	})
	return round.result
}

export const challengePayoutRound: (
	params: ChallengePayoutParams,
	contract: Contracts,
) => Promise<AssembledTransaction<PayoutsChallenge>> = async (
	params: ChallengePayoutParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.challenge_payouts({
		round_id: params.round_id,
		caller: params.caller,
		reason: params.reason,
	})
	return round
}

export const updateChallengePayoutRound: (
	params: UpdateChallengePayoutParams,
	contract: Contracts,
) => Promise<AssembledTransaction<PayoutsChallenge>> = async (
	params: UpdateChallengePayoutParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.update_payouts_challenge({
		round_id: params.round_id,
		caller: params.caller,
		challenger_id: params.challenger_id,
		notes: params.notes,
		resolve_challenge: params.resolve_challenge,
	})
	return round
}

export const setAdminsRound: (
	params: SetAdminsRoundParams,
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	params: SetAdminsRoundParams,
	contract: Contracts,
) => {
	let round = await contract.round_contract.set_admins({
		round_id: params.round_id,
		round_admin: params.round_admin,
	})
	return round
}

// export const getChallengePayoutRound: (
// 	params: UpdateChallengePayoutParams,
// 	contract: Contracts,
// ) => Promise<AssembledTransaction<PayoutsChallenge>> = async (
// 	params: UpdateChallengePayoutParams,
// 	contract: Contracts,
// ) => {
// 	let round = await contract.round_contract.get_payouts({
// 		round_id: params.round_id,
// 		caller: params.caller,
// 		challenger_id: params.challenger_id,
// 		notes: params.notes,
// 		resolve_challenge: params.resolve_challenge,
// 	})
// 	return round
// }
