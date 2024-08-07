export async function roundInfo(params, app) {
    let tx = await app.round_contract.get_round({
        round_id: BigInt(params[0])
    });
    return tx.result;
}
