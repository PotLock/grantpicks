import { RoundApplicationExternal, RoundDetailExternal } from 'round-client'

export type Network = 'testnet' | 'mainnet'

export type ApplicationStatus =
	| { tag: 'Pending'; values: void }
	| { tag: 'Approved'; values: void }
	| { tag: 'Rejected'; values: void }

export interface IGetRoundsResponse extends RoundDetailExternal {}

export interface IGetRoundApplicationsResponse
	extends RoundApplicationExternal {}
