export async function addAdmin(params, app) {
    const roundContractId = params[0];
    const admin = params[1];
    const tx = await app.round_contract(roundContractId).add_admin({
        admin: app.wallet.account.publicKey,
        round_admin: admin,
    });
    return (await tx.signAndSend()).result;
}
