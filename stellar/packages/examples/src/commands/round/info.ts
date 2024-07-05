import App from '../../app.js'

export async function roundInfo(params: string[], app: App) {
	let tx = await app.round_contract(params[0]).round_info()

	return tx.result
}
