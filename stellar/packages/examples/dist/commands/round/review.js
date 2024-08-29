export async function reviewApplicationAndApprove(params, app) {
    let tx = await app.round_contract.review_application({
        round_id: BigInt(params[0]),
        caller: app.wallet.account.publicKey,
        applicant: params[1],
        status: { tag: "Approved" },
        note: 'OK'
    });
    return (await tx.signAndSend()).result;
}
