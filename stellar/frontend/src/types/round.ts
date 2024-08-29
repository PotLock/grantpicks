export type TSelectedRoundType =
	| 'on-going'
	| 'upcoming'
	| 'upcoming-open'
	| 'upcoming-closed'
	| 'ended'

export interface IRoundPeriodData {
	selected: string | null
	isOpen: boolean
	period_ms: number | null
}
