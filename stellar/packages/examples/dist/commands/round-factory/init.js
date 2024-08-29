export default async function initRoundF(params, app) {
    let tx = await app.round_factory_contract.initialize({
        owner: app.wallet.account.publicKey,
        registry_address: process.env.PROJECT_REGISTRY_CONTRACT_ID || '',
        token_address: process.env.NATIVE_TOKEN || '',
        wasm_hash: Buffer.from(process.env.ROUND_WASM_HASH || '', 'hex'),
    });
    return (await tx.signAndSend()).result;
}
