import { TSelectedRoundType } from '@/types/round'
import { create } from 'zustand'

interface IRoundState {
	selectedRoundType: TSelectedRoundType
	setSelectedRoundType: (selectedRoundType: TSelectedRoundType) => void
}

const useRoundStore = create<IRoundState>((set) => ({
	selectedRoundType: 'upcoming',
	setSelectedRoundType: (selectedRoundType: TSelectedRoundType) =>
		set(() => ({ selectedRoundType })),
}))

export default useRoundStore
