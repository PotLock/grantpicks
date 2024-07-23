export async function addAdmin(params, app) {
    const roundContractId = params[0];
    const admin = params[1];
    const tx = await app.round_contract.add_admin({
        round_admin: admin,
        round_id: BigInt(roundContractId),
    });
    return (await tx.signAndSend()).result;
}
