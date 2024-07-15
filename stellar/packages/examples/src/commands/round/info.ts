import App from '../../app.js'

export async function roundInfo(params: string[], app: App) {
	let tx = await app.round_contract.round_info({
    round_id: BigInt(params[0])
  })

	return tx.result
}
