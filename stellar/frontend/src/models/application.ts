import { GPRound } from './round'
import { GPUser } from './user'
import { GPProject } from './project'

export interface GPApplication {
	id: number
	message: string
	status: string
	submitted_at: string
	project: GPProject
	round: GPRound
	applicant: GPUser
}
