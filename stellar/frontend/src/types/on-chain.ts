import {
	Horizon,
	RoundApplication,
	RoundDetail,
	SorobanRpc,
} from 'round-client'

export type Network = 'testnet' | 'mainnet'

export type ApplicationStatus =
	| { tag: 'Pending'; values: void }
	| { tag: 'Approved'; values: void }
	| { tag: 'Rejected'; values: void }

export interface IGetRoundsResponse extends RoundDetail {}

export interface IGetRoundApplicationsResponse extends RoundApplication {}

export enum ENetworkEnv {
	'TESTNET' = 'testnet',
	'MAINNET' = 'mainnet',
}

export enum Networks {
	PUBLIC = 'Public Global Stellar Network ; September 2015',
	TESTNET = 'Test SDF Network ; September 2015',
	FUTURENET = 'Test SDF Future Network ; October 2022',
	SANDBOX = 'Local Sandbox Stellar Network ; September 2022',
	STANDALONE = 'Standalone Network ; February 2017',
}

export interface SubmitTxProps {
	signedXDR: string
	networkPassphrase: string
	server: SorobanRpc.Server | Horizon.Server
}
