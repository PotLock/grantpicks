import { GPRound } from './round'
import { GPUser } from './user'

export interface GPApplication {
	id: number
	message: string
	status: string
	submitted_at: string
	round: GPRound
	applicant: GPUser
}
