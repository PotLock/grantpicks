export async function roundInfo(params, app) {
    let tx = await app.round_contract(params[0]).round_info();
    return (await tx.signAndSend()).result;
}
