import Contracts from '@/lib/contracts'
import { Option, u128, u64 } from '@stellar/stellar-sdk/contract'
import { Project } from 'project-registry-client'

interface GetProjectsParams {
	skip: number
	limit: number
}

interface GetProjectParams {
	project_id: bigint
}

export interface ProjectContact {
	name: string
	value: string
}

export interface ProjectContract {
	contract_address: string
	name: string
}

export interface ProjectRepository {
	label: string
	url: string
}

export type ProjectStatus =
	| { tag: 'New'; values: void }
	| { tag: 'Approved'; values: void }
	| { tag: 'Rejected'; values: void }
	| { tag: 'Completed'; values: void }

export interface ProjectTeamMember {
	name: string
	value: string
}

export interface IGetProjectsResponse extends Project {}

export const getProjects: (
	params: GetProjectsParams,
	contract: Contracts,
) => Promise<IGetProjectsResponse[]> = async (
	params: GetProjectsParams,
	contract: Contracts,
) => {
	let skip = params.skip ? params.skip : 0
	let limit = params.limit ? params.limit : 10

	let rounds = await contract.project_contract.get_projects({
		skip: BigInt(skip),
		limit: BigInt(limit),
	})
	return rounds.result
}

export const getProject: (
	params: GetProjectParams,
	contract: Contracts,
) => Promise<Option<IGetProjectsResponse>> = async (
	params: GetProjectParams,
	contract: Contracts,
) => {
	let round = await contract.project_contract.get_project_by_id({
		project_id: params.project_id,
	})
	return round.result
}
