import { prettyTruncate } from '@/utils/helper'
import moment from 'moment'
import { useState } from 'react'
import { PayoutsChallenge } from 'round-client'
import IconDot from '../svgs/IconDot'
import IconChallenge from '../svgs/IconChallenge'
import InputTextArea from './InputTextArea'
import IconClose from '../svgs/IconClose'
import Image from 'next/image'
import Button from './Button'
import useAppStorage from '@/stores/zustand/useAppStorage'
import { useWallet } from '@/app/providers/WalletProvider'
import { StellarWalletsKit } from '@creit.tech/stellar-wallets-kit'
import { set } from 'date-fns'

const ChallengeItem = ({
	challenge,
	index,
}: {
	challenge: PayoutsChallenge
	index: number
}) => {
	const { stellarKit, stellarPubKey } = useWallet()
	const storage = useAppStorage()
	const [isReviewing, setIsReviewing] = useState<boolean>(false)
	const [adminNotes, setAdminNotes] = useState<string>('')
	const [errorMessage, setErrorMessage] = useState<string>('')

	const reload = async () => {
		const roundId = storage.current_round?.id
		const contracts = storage.getStellarContracts()

		if (!contracts || !roundId) {
			return
		}

		let challenges: PayoutsChallenge[] = []
		let fetch = true

		while (fetch) {
			const payoutChallenges = (
				await contracts.round_contract.get_challenges_payout({
					round_id: roundId,
					from_index: BigInt(challenges.length),
					limit: BigInt(5),
				})
			).result

			challenges = challenges.concat(payoutChallenges)

			if (payoutChallenges.length < 5) {
				fetch = false
			}
		}

		if (challenges.length > 0) {
			storage.setCurrentRoundPayoutChallenges(challenges)
		}
	}

	const resolveChallenge = async () => {
		const contract = storage.getStellarContracts()
		if (!contract) return

		if (adminNotes === '') {
			setErrorMessage('Please enter a note')
			return
		}

		try {
			const resolveTx = await contract.round_contract.update_payouts_challenge({
				round_id: storage.current_round?.id || BigInt(0),
				caller: storage.my_address || '',
				challenger_id: challenge.challenger_id,
				notes: adminNotes,
				resolve_challenge: true,
			})

			const txHash = await contract.signAndSendTx(
				stellarKit as StellarWalletsKit,
				resolveTx.toXDR(),
				stellarPubKey,
			)

			if (!txHash) {
				setErrorMessage('Error resolving challenge')
				return
			} else {
				reload()
				setIsReviewing(false)
			}
		} catch (e) {
			console.error(e)
			setErrorMessage('Error resolving challenge')
		}
	}

	return (
		<div key={index} className="w-full mt-2">
			{!challenge.resolved && (
				<div className="px-5 py-2 w-40 text-xs font-semibold flex items-center justify-center space-x-2 rounded-full text-grantpicks-black-700 bg-grantpicks-black-50">
					Unresolved Challenge
				</div>
			)}
			{challenge.resolved && (
				<div className="px-5 py-2 w-40 text-xs font-semibold flex items-center justify-center space-x-2 rounded-full text-grantpicks-green-700 bg-grantpicks-green-50">
					Resolved Challenge
				</div>
			)}
			<div className="flex items-center justify-between space-x-2 mb-2 w-full py-2">
				<div className="flex justify-center">
					<div className="bg-grantpicks-black-200 rounded-full w-10 h-10" />
				</div>
				<p className="text-sm font-semibold">
					{prettyTruncate(challenge.challenger_id, 10, 'address')}
				</p>
				<p className="text-xs font-semibold text-grantpicks-purple-600">
					Challenged Payout
				</p>
				<p className="text-xs font-normal text-grantpicks-black-950">
					{moment(new Date(Number(challenge.created_at) as number)).fromNow()}
				</p>
			</div>
			<div className="flex items-center w-full mb-2">
				<div className="w-[10%] flex items-center justify-center max-h-24">
					<div className="border border-black/10 min-h-10" />
				</div>
				<p className="text-sm font-normal text-grantpicks-black-600">
					{challenge.reason}
				</p>
			</div>
			{isReviewing && storage.isAdminRound ? (
				<div className="border border-black/10 rounded-2xl">
					<div className="pt-3 px-4 flex items-center">
						<p className="text-xs font-semibold">RESOLVE CHALLENGE</p>
					</div>
					<div className="bg-white rounded-t-2xl p-2 md:p-4">
						<div className="bg-grantpicks-black-50 rounded-full p-2 flex items-center justify-between mb-4">
							<div className="flex items-center space-x-2">
								<div className="bg-grantpicks-black-100 rounded-full w-6"></div>
								<p className="text-sm font-semibold">
									{prettyTruncate(storage.my_address || '', 10, 'address')}
								</p>
							</div>
							<IconClose
								size={24}
								className="fill-grantpicks-black-400"
								onClick={() => setIsReviewing(false)}
							/>
						</div>
						{errorMessage && (
							<div className="px-5 py-2 text-xs font-semibold  space-x-2 rounded text-grantpicks-red-600 bg-grantpicks-red-100">
								{errorMessage}
							</div>
						)}
						<InputTextArea
							className="mt-2"
							required
							onChange={(value) => setAdminNotes(value.currentTarget.value)}
						/>
						<Button
							color="alpha-50"
							className="w-full"
							onClick={resolveChallenge}
							type="submit"
						>
							SEND
						</Button>
					</div>
				</div>
			) : (
				<div className="flex items-center w-full">
					<div className="w-[10%] flex justify-center">
						<IconChallenge size={24} className="fill-grantpicks-purple-400" />
					</div>
					<div className="flex items-center space-x-2">
						{!challenge.resolved && (
							<p className="text-grantpicks-black-600">Unresolved</p>
						)}
						{storage.isAdminRound && !challenge.resolved && (
							<>
								<IconDot size={8} className="fill-grantpicks-black-600" />
								<button
									className="text-sm font-semibold text-grantpicks-black-950"
									onClick={() => setIsReviewing(true)}
								>
									Reply
								</button>
							</>
						)}

						{challenge.resolved && (
							<p>
								<span className="text-grantpicks-green-600">Resolved</span>{' '}
								<span className="text-grantpicks-black-950">By Admin </span>
							</p>
						)}
					</div>
				</div>
			)}

			{challenge.resolved && (
				<div className="flex items-center w-full mb-2">
					<div className="w-[10%] flex items-center justify-center max-h-24"></div>
					<p className="text-sm font-normal text-grantpicks-black-600">
						{challenge.admin_notes}
					</p>
				</div>
			)}
		</div>
	)
}

export default ChallengeItem
