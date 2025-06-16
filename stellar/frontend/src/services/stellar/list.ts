import Contracts from "@/lib/contracts"
import { IGetListExternalResponse } from "@/types/on-chain"
import { RegistrationInput, RegistrationStatus } from "lists-client"

export interface CreateListParams {
  name: string
  description: string
  cover_image_url?: string
  admins?: string[]
  owner: string
  default_registration_status: RegistrationStatus
  admin_only_registrations: boolean
}

interface GetListsParams {
	skip: number
	limit: number
}

interface GetListParams {
	list_id: bigint
}

export interface BatchRegisterToListParams {
	submitter: string
	list_id: bigint
	notes: string
	registrations: RegistrationInput[]
}




export const createList = async (caller: string, params: CreateListParams, contract: Contracts) => {
  const tx = await contract.lists_contract.create_list({
    owner: caller,
    name: params.name,
    default_registration_status: params.default_registration_status,
    description: params.description,
    cover_image_url: params.cover_image_url,
    admins: params.admins,
    admin_only_registrations: params.admin_only_registrations,
  })

  return tx
}

export const getLists: (
	params: GetListsParams,
	contract: Contracts,
) => Promise<any[]> = async (params: GetListsParams, contract: Contracts) => {
	let limit = params.limit ? params.limit : 10
	let skip = params.skip ? params.skip * limit : 0

	let lists = await contract.lists_contract.get_lists({
		from_index: BigInt(skip),
		limit: BigInt(limit),
	})
	return lists.result
}

export const getList: (
	params: GetListParams,
	contract: Contracts,
) => Promise<IGetListExternalResponse> = async (params: GetListParams, contract: Contracts) => {
	let list = await contract.lists_contract.get_list({
		list_id: params.list_id,
	})
	return list.result
}

export const batchRegisterToList: (
	params: BatchRegisterToListParams,
	contract: Contracts,
) => Promise<any> = async (params: BatchRegisterToListParams, contract: Contracts) => {
	let list = await contract.lists_contract.register_batch({
		submitter: params.submitter,
		list_id: params.list_id,
		notes: params.notes,
		registrations: params.registrations,
	})
	return list
}