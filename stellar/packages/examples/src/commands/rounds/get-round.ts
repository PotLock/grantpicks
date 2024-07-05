import App from '../../app.js'

export default async function getRound(params: string[], app: App) {
	let skip = params[0] ? parseInt(params[0]) : 0
	let limit = params[1] ? parseInt(params[1]) : 10

	let rounds = await app.round_factory_contract.get_rounds({
		skip: BigInt(skip),
		limit: BigInt(limit),
	})

	return rounds.result
}
