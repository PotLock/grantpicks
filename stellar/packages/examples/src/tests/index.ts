import { Keypair } from '@stellar/stellar-sdk'
import App from '../app.js'
import CMDWallet from '../wallet.js'
import axios from 'axios'
import {
	ProjectContact,
	ProjectContract,
	ProjectFundingHistory,
	ProjectRepository,
} from 'project-registry-client'
import { Option } from '@stellar/stellar-sdk/contract'
import { RoundApplication, ApplicationStatus, PickedPair, PayoutInput } from 'round-client'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
export async function generateFakeRound() {
	let adminKeyPair = Keypair.random()
	let adminSecret = adminKeyPair.secret()
	let adminPublicKey = adminKeyPair.publicKey()
	const randomName = uniqueNamesGenerator({
		dictionaries: [adjectives, colors, animals],
		separator: ' ',
	})

	let faucet = await axios.get(`https://friendbot.stellar.org?addr=${adminKeyPair.publicKey()}`)
	let res = await faucet.data

	let cmdWallet = new CMDWallet({
		secret: adminSecret,
		network: 'testnet',
	})

	let app = new App('testnet', cmdWallet)
	//admin create a round
	let txCreate = await app.round_contract.create_round({
		caller: adminPublicKey,
		round_detail: {
			admins: [adminPublicKey],
			application_start_ms: BigInt(new Date().getTime()),
			application_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
			voting_start_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 8),
			voting_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 14),
			name: 'Round ' + randomName,
			description: 'This is a test round',
			is_video_required: false,
			allow_applications: true,
			expected_amount: BigInt(100000000000),
			max_participants: 10,
			num_picks_per_voter: 2,
			use_whitelist: false,
			contacts: [],
			owner: adminPublicKey,
			compliance_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
			compliance_period_ms: BigInt(1000 * 60 * 60 * 24 * 7),
			compliance_req_desc: 'This is a compliance requirement',
			cooldown_end_ms: BigInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
			cooldown_period_ms: BigInt(1000 * 60 * 60 * 24 * 7),
			allow_remaining_dist: false,
			remaining_dist_address: adminPublicKey,
			referrer_fee_basis_points: 0,
      use_vault: true,
		},
	})

	const createResult = (await txCreate.signAndSend()).result

	console.log('Create Result', createResult)

	const roundId = createResult.id

	let project_to_owner: any = {}

	await new Promise((resolve) => setTimeout(resolve, 1000))

	const num_of_projects = 4
	for (let i = 0; i < num_of_projects; i++) {
    const randomProjectName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: ' ',
    })
		let keypair = Keypair.random()
		let pubKey = keypair.publicKey()
		let secret = keypair.secret()

		let faucet = await axios.get(`https://friendbot.stellar.org?addr=${pubKey}`)
		let res = await faucet.data

		console.log('Generate Applicator', pubKey)

		let cmdWallet = new CMDWallet({
			secret,
			network: 'testnet',
		})

		let clientApp = new App('testnet', cmdWallet)

		const registerTx = await clientApp.project_contract.apply({
			applicant: pubKey,
			project_params: {
				name: `Project ${randomProjectName}`,
				overview: `Overview for ${randomProjectName}`,
				admins: [pubKey],
				contacts: [
					{
						name: 'Telegram',
						value: 'https://t.me/stellar',
					},
				] as ProjectContact[],
				contracts: [
					{
						name: 'NEAR Contract',
						contract_address: 'near1.example.testnet',
					},
				] as ProjectContract[],
				image_url: 'https://paras-ipfs.paras.id/bafybeievm2kozdn77e2wm6l4nzvdb4vulnu7xlyp23e6lmlu76ff2h4yb4',
				video_url: 'https://www.youtube.com/watch?v=5o-tRub-0pQ',
				payout_address: pubKey,
				repositories: [
					{
						label: 'GitHub',
						url: 'https://github.com/repo'+randomProjectName,
					},
				] as ProjectRepository[],
				fundings: [
					{
						amount: BigInt('1000'),
						denomiation: 'XLM',
						description: 'Initial funding',
						funded_ms: BigInt(Date.now()),
						source: 'Stellar Development Foundation',
					},
				] as ProjectFundingHistory[],
				team_members: [
					{
						name: 'Alice',
						value: 'Github: alice',
					},
				],
			},
		})

		await registerTx.signAndSend()

		const applyToRoundTx = await clientApp.round_contract.apply_to_round({
			round_id: BigInt(roundId),
			caller: pubKey,
			applicant: undefined as Option<string>,
			note: undefined as Option<string>,
			review_note: undefined as Option<string>,
		})

		const applyResult = (await applyToRoundTx.signAndSend()).result

		console.log('Apply Result', applyResult)

		project_to_owner[applyResult.project_id.toString()] = pubKey
	}

	//admin review applications
	cmdWallet = new CMDWallet({
		secret: adminSecret,
		network: 'testnet',
	})

	app = new App('testnet', cmdWallet)

	let listApplications = await app.round_contract.get_applications_for_round({
		round_id: BigInt(roundId),
		from_index: BigInt(0),
		limit: BigInt(5),
	})

	console.log('Review Applications', listApplications.result)

	const applications = listApplications.result

	for (let application of applications) {
		console.log('Review Application', application)
		let reviewTx = await app.round_contract.review_application({
			round_id: BigInt(roundId),
			caller: adminPublicKey,
			applicant: application.applicant_id,
			note: 'This is a test review',
			status: { tag: 'Approved' } as ApplicationStatus,
		})

		const reviewResult = (await reviewTx.signAndSend()).result

		console.log('Review Result', reviewResult)
	}

	// console.log('Start Voting')
	// //admin start voting
	// let startVotingTx = await app.round_contract.start_voting_period({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// })

	// const startVotingResult = await startVotingTx.signAndSend()
	// console.log('Start Voting Result', startVotingResult)

	// let DEPOSIT = 1000 * 10 ** 7
	// //admin deposit funds
	// console.log('Deposit Funds')
	// let depositTx = await app.round_contract.deposit_to_round({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// 	amount: BigInt(DEPOSIT),
	// 	memo: 'This is a test deposit',
	// 	referrer_id: undefined as Option<string>,
	// })

	// const depositResult = await depositTx.signAndSend()
	// console.log('Deposit Result', depositResult.result)

	// //users vote
	// let num_of_voters = 2
	// for (let i = 0; i < num_of_voters; i++) {
	// 	let keypair = Keypair.random()
	// 	let pubKey = keypair.publicKey()
	// 	let secret = keypair.secret()

	// 	let faucet = await axios.get(`https://friendbot.stellar.org?addr=${pubKey}`)
	// 	let res = await faucet.data

	// 	console.log('Generate Voter', pubKey)

	// 	let cmdWallet = new CMDWallet({
	// 		secret,
	// 		network: 'testnet',
	// 	})

	// 	let clientApp = new App('testnet', cmdWallet)

	// 	const pairToPick = await app.round_contract.get_pairs_to_vote({
	// 		round_id: BigInt(roundId),
	// 	})

	// 	console.log('Pairs to Vote', pairToPick.result)

	// 	let votedPairs: PickedPair[] = []

	// 	for (let pair of pairToPick.result) {
	// 		votedPairs.push({
	// 			pair_id: pair.pair_id,
	// 			voted_project_id: pair.projects[0],
	// 		})
	// 	}

	// 	const voteTx = await clientApp.round_contract.vote({
	// 		round_id: BigInt(roundId),
	// 		voter: pubKey,
	// 		picks: votedPairs,
	// 	})

	// 	const voteResult = (await voteTx.signAndSend()).result

	// 	console.log('Vote Result', voteResult)
	// }

	// //admin end voting
	// cmdWallet = new CMDWallet({
	// 	secret: adminSecret,
	// 	network: 'testnet',
	// })

	// app = new App('testnet', cmdWallet)
	// console.log('End Voting')
	// let endVotingTx = await app.round_contract.close_voting_period({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// })

	// const endVotingResult = await endVotingTx.signAndSend()
	// console.log('End Voting Result', endVotingResult.result)

	// const roundResult = await app.round_contract.get_voting_results_for_round({
	// 	round_id: BigInt(roundId),
	// })

	// console.log('Round Result', roundResult.result)

	// //admin set payouts
	// console.log('Set Payouts')
	// let payouts: PayoutInput[] = []

	// for (let result of roundResult.result) {
	// 	if (result.voting_count > 0) {
	// 		payouts.push({
	// 			amount: BigInt(DEPOSIT / (num_of_voters * 2)) * result.voting_count,
	// 			memo: 'This is a test payout',
	// 			recipient_id: project_to_owner[result.project_id.toString()],
	// 		})
	// 	}
	// }

	// let setPayoutTx = await app.round_contract.set_payouts({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// 	payouts: payouts,
	// 	clear_existing: false,
	// })

	// const setPayoutResult = (await setPayoutTx.signAndSend()).result

	// console.log('Set Payout Result', setPayoutResult)

	// //admin distribute payouts
	// console.log('Distribute Payouts')
	// let processPayoutTxs = await app.round_contract.process_payouts({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// })

	// const payoutResult = await processPayoutTxs.signAndSend()
	// console.log('Payout Result', payoutResult.result)

	// //admin set round completed
	// console.log('Set Round Completed')
	// let setRoundCompletedTx = await app.round_contract.set_round_complete({
	// 	round_id: BigInt(roundId),
	// 	caller: adminPublicKey,
	// })

	// const setRoundCompletedResult = await setRoundCompletedTx.signAndSend()
	// console.log('Set Round Completed Result', setRoundCompletedResult.result)
}
