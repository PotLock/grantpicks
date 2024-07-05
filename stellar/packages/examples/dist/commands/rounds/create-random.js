export default async function createRandomRounds(params, app) {
    let tx = await app.round_factory_contract.create_round({
        admin: app.wallet.account.publicKey,
        params: {
            admins: [],
            application_start_ms: BigInt(new Date().getTime()),
            application_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
            voting_start_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
            voting_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
            name: 'Round 1',
            description: 'This is a test round',
            video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            expected_amount: BigInt(100000000000),
            max_participants: 15,
            num_picks_per_voter: 2,
            use_whitelist: false,
            contacts: [],
        },
    });
    return await tx.signAndSend();
}
