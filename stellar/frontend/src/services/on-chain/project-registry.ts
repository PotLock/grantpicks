import Contracts from '@/lib/contracts'
import {
	AssembledTransaction,
	Option,
	u128,
	u64,
} from '@stellar/stellar-sdk/contract'
import { Project } from 'project-registry-client'

interface GetProjectsParams {
	skip: number
	limit: number
}

interface GetProjectParams {
	project_id: bigint
}

export interface ProjectFundingHistory {
	amount: u128
	denomiation: string
	description: string
	funded_ms: u64
	source: string
}

export interface ICreateProjectParams {
	admins: string[]
	contacts: ProjectContact[]
	contracts: ProjectContract[]
	fundings: ProjectFundingHistory[]
	image_url: string
	name: string
	overview: string
	payout_address: string
	repositories: ProjectRepository[]
	team_members: ProjectTeamMember[]
	video_url: string
}

export interface IChangeProjectStatusParams {
	contract_owner: string
	project_id: u128
	new_status: ProjectStatus
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

export enum ProjectStatus {
	New = 0,
	Approved = 1,
	Rejected = 2,
	Completed = 3,
}

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

	let projects = await contract.project_contract.get_projects({
		skip: BigInt(skip),
		limit: BigInt(limit),
	})
	return projects.result
}

export const getProject: (
	params: GetProjectParams,
	contract: Contracts,
) => Promise<Option<IGetProjectsResponse>> = async (
	params: GetProjectParams,
	contract: Contracts,
) => {
	let project = await contract.project_contract.get_project_by_id({
		project_id: params.project_id,
	})
	return project.result
}

export const getProjectApplicant: (
	applicant: string,
	contract: Contracts,
) => Promise<Project | undefined> = async (
	applicant: string,
	contract: Contracts,
) => {
	let project = await contract.project_contract.get_project_from_applicant({
		applicant,
	})
	if (project) return project.result
}

export const createProject: (
	applicant: string,
	params: ICreateProjectParams,
	contract: Contracts,
) => Promise<AssembledTransaction<Project>> = async (
	applicant: string,
	params: ICreateProjectParams,
	contract: Contracts,
) => {
	let project = await contract.project_contract.apply({
		applicant,
		project_params: params,
	})
	return project
}

export const changeProjectStatus: (
	params: IChangeProjectStatusParams,
	contract: Contracts,
) => Promise<AssembledTransaction<null>> = async (
	params: IChangeProjectStatusParams,
	contract: Contracts,
) => {
	let project = await contract.project_contract.change_project_status({
		contract_owner: params.contract_owner,
		project_id: params.project_id,
		new_status: params.new_status,
	})
	return project
}
