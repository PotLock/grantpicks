import { u128, u32, u64 } from '@stellar/stellar-sdk/contract'
import { Contact } from 'round-client'

export type Network = 'testnet' | 'mainnet'

export type ApplicationStatus =
	| { tag: 'Pending'; values: void }
	| { tag: 'Approved'; values: void }
	| { tag: 'Rejected'; values: void }

export interface IGetRoundsResponse {
	application_end_ms: u64
	application_start_ms: u64
	contacts: Array<Contact>
	description: string
	expected_amount: u128
	id: u128
	is_completed: boolean
	max_participants: u32
	name: string
	num_picks_per_voter: u32
	owner: string
	use_whitelist: boolean
	vault_balance: u128
	video_url: string
	voting_end_ms: u64
	voting_start_ms: u64
}

export interface IGetRoundApplicationsResponse {
	applicant: string
	application_id: u128
	project_id: u128
	review_note: string
	status: ApplicationStatus
	submited_ms: u64
	updated_ms?: u64
}
