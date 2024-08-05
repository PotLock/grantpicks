export type TSelectedRoundType = 'on-going' | 'upcoming' | 'ended'

export interface IRoundPeriodData {
	selected: string | null
	isOpen: boolean
	period_ms: number | null
}
