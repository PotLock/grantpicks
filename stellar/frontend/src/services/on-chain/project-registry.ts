import Contracts from '@/lib/contracts'
import { u128, u64 } from '@stellar/stellar-sdk/contract'
import { Project } from 'project-registry-client'

interface GetProjectsParams {
	skip: number
	limit: number
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
