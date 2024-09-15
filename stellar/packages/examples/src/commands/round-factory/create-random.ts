import App from '../../app.js'

export default async function createRandomRounds(params: string[], app: App) {
	let tx = await app.round_contract.create_round({
		caller: app.wallet.account.publicKey,
		round_detail: {
			admins: [app.wallet.account.publicKey],
			application_start_ms: BigInt(new Date().getTime() + 1000),
			application_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
			voting_start_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
			voting_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
			name: 'Round 1',
			description: 'This is a test round',
			is_video_required: false,
			allow_applications: true,
			expected_amount: BigInt(100000000000),
			max_participants: 10,
			num_picks_per_voter: 2,
			use_whitelist: false,
			contacts: [],
			owner: app.wallet.account.publicKey,
			compliance_period_ms: BigInt(1000 * 60 * 60 * 24 * 7),
			compliance_req_desc: 'This is a compliance requirement',
			cooldown_period_ms: BigInt(1000 * 60 * 60 * 24 * 7),
			allow_remaining_dist: false,
			remaining_dist_address: app.wallet.account.publicKey,
			referrer_fee_basis_points: 0,
			use_vault: true,
		},
	})

	return (await tx.signAndSend()).result
}
