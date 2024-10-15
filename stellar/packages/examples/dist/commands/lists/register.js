export async function registerList(params, adminApp) {
    const txList = await adminApp.lists_contract.register_batch({
        submitter: adminApp.wallet.account.publicKey,
        list_id: BigInt(params[1]),
        notes: undefined,
        registrations: [
            {
                registrant: params[0],
                notes: 'ok',
                status: { tag: 'Approved' },
                submitted_ms: undefined,
                updated_ms: undefined,
            },
        ],
    });
    const tx = await txList.signAndSend();
    return tx.result;
}
