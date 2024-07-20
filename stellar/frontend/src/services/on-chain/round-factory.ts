import Contracts from '@/lib/contracts'
import {
	IGetRoundApplicationsResponse,
	IGetRoundsResponse,
} from '@/types/on-chain'

interface GetRoundsParams {
	skip: number
	limit: number
}

interface GetRoundApplicationsParams {
	round_id: bigint
	skip: number
	limit: number
}

interface GetRoundAdmins {
	round_id: bigint
}

export const getRounds: (
	params: GetRoundsParams,
	contract: Contracts,
) => Promise<IGetRoundsResponse[]> = async (
	params: GetRoundsParams,
	contract: Contracts,
) => {
	let skip = params.skip ? params.skip : 0
	let limit = params.limit ? params.limit : 10

	let rounds = await contract.round_contract.get_rounds({
		skip: BigInt(skip),
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
	let skip = params.skip ? params.skip : 0
	let limit = params.limit ? params.limit : 10

	let rounds = await contract.round_contract.get_all_applications({
		round_id: BigInt(params.round_id),
		skip: BigInt(skip),
		limit: BigInt(limit),
	})
	return rounds.result
}
