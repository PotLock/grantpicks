export default async function getRound(params, app) {
    let skip = params[0] ? parseInt(params[0]) : 0;
    let limit = params[1] ? parseInt(params[1]) : 10;
    let rounds = await app.round_contract.get_rounds({
        from_index: BigInt(skip),
        limit: BigInt(limit),
    });
    return rounds.result;
}
