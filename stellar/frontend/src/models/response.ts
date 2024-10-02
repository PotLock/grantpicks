import { GPProject } from './project'
import { GPRound } from './round'

export interface GPProjectListResponse {
	count: number
	next: null | string
	previous: null | string
	results: GPProject[]
}


export interface GPRoundListResponse {  
  count: number
  next: null | string
  previous: null | string
  results: GPRound[]
}