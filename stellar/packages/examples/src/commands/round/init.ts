import App from '../../app.js'

export async function initRound(params: string[], app: App) {
	let tx = await app.round_contract(params[0]).initialize({
		owner: app.wallet.account.publicKey,
		token_address: process.env.NATIVE_TOKEN || '',
		registry_address: process.env.PROJECT_REGISTRY_CONTRACT_ID || '',
		round_detail: {
			id: BigInt(1),
			admins: [app.wallet.account.publicKey],
			application_start_ms: BigInt(new Date().getTime() + 1000),
			application_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
			voting_start_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
			voting_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
			name: 'Round 1',
			description: 'This is a test round',
			video_url: 'dQw4w9WgXcQ',
			expected_amount: BigInt(100000000000),
			max_participants: 10,
			num_picks_per_voter: 2,
			use_whitelist: false,
			contacts: [],
		},
	})

	return (await tx.signAndSend()).result
}
