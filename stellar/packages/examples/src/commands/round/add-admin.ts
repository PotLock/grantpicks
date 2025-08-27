import App from '../../app.js'

export async function addAdmin(params: string[], app: App) {
	const roundContractId = params[0]
	const admin = params[1]
	const tx = await app.round_contract.set_admins({
		round_admin: [admin],
		round_id: BigInt(roundContractId),
	})

	return (await tx.signAndSend()).result
}
