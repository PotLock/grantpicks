export async function applyToRound(params, app) {
    let tx = await app.round_contract.apply_to_round_batch({
        round_id: BigInt(params[0]),
        caller: app.wallet.account.publicKey,
        review_notes: ['This is a test note'],
        applicants: [params[1]],
    });
    return (await tx.signAndSend()).result;
}
