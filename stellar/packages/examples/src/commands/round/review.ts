import App from '../../app.js'
import { ApplicationStatus } from 'round-client'

export async function reviewApplicationAndApprove(params: string[], app: App) {
  let tx = await app.round_contract.review_application({
    round_id: BigInt(params[0]),
    caller: app.wallet.account.publicKey,
    applicant: params[1],
    status: {tag: "Approved"} as ApplicationStatus,
    note: 'OK'
  })

  return (await tx.signAndSend()).result
  
}