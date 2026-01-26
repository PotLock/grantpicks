import { create } from 'zustand'
import { CreateRoundData } from '@/types/form'

interface CreateRoundStore {
	currentStep: number
	formData: Partial<CreateRoundData>
	setCurrentStep: (step: number) => void
	setFormData: (data: Partial<CreateRoundData>) => void
	resetStore: () => void
}

const initialFormData: Partial<CreateRoundData> = {
	title: '',
	description: '',
	vote_per_person: 1,
	contact_type: '',
	contact_address: '',
	amount: '0',
	expected_amount: '0',
	minimum_deposit: '0',
	allow_application: false,
	max_participants: 10,
	apply_duration_start: null,
	apply_duration_end: null,
	voting_duration_start: null,
	voting_duration_end: null,
	projects: [],
	admins: [],
	allow_remaining_dist: false,
	allow_compliance: false,
	allow_cooldown: false,
	compliance_req_desc: '',
	compliance_end_ms: null,
	compliance_period_ms: null,
	cooldown_end_ms: null,
	cooldown_period_ms: null,
	remaining_dist_address: '',
	referrer_fee_basis_points: 0,
	use_vault: true,
	is_video_required: false,
	use_whitelist_application: false,
	use_whitelist_voting: false,
}

const useCreateRoundStore = create<CreateRoundStore>((set) => ({
	currentStep: 1,
	formData: initialFormData,
	setCurrentStep: (step) => set({ currentStep: step }),
	setFormData: (data) =>
		set((state) => ({
			formData: { ...state.formData, ...data },
		})),
	resetStore: () => set({ currentStep: 1, formData: initialFormData }),
}))

export default useCreateRoundStore
