export interface GPPayout {
	recipient: string
	amount: string
}

export class GPPayoutChallenge {
	admin_notes: string = ''
	challenger_id: string = ''
	created_at: number = 0
	reason: string = ''
	resolved: boolean = false
	resolved_by: string = ''
	round_id: number = 0
	constructor() {}
}
