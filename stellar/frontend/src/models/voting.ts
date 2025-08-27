export interface GPVotingResult {
	project: string
	votes: number
	flag: boolean
}

export type GPPicks = {
	pair_id: number
	voted_project: string
}
export class GPVoting {
	voter: string = ''
	voted_ms: number = new Date().getTime()
	picks: GPPicks[] = []
	constructor() {}
}
