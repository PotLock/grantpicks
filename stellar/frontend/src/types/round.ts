export type TSelectedRoundType = 'on-going' | 'upcoming' | 'ended'

export interface IRoundPeriodData {
	selected: string | null
	isOpen: boolean
	end_ms: Date | null
}
