export interface IAccount {
	id: string
	total_donations_in_usd: number
	total_donations_out_usd: number
	total_matching_pool_allocations_usd: number
	donors_count: number
	near_social_profile_data: INearSocialProfileData | null
}

interface INearSocialProfileData {
	name: string
	image: {
		nft: {
			media: string
			baseUri: string
			tokenId: string
			contractId: string
		}
	}
	linktree: {
		github: string
		twitter: string
		website: string
		telegram: string
	}
	description: string
	horizon_tnc: string
	backgroundImage: {
		ipfs_cid: string
	}
}
