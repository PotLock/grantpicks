import { SavedWallet } from '@/app/providers/types'
import { envVarConfigs } from '@/configs/env-var'
import {
	HORIZON_RPC_URL,
	RPC_EXPLORER,
	SOROBAN_RPC_URL,
} from '@/constants/on-chain'
import { GPRound } from '@/models/round'
import { ENetworkEnv, Networks, SubmitTxProps } from '@/types/on-chain'
import axios from 'axios'
import { Horizon, Soroban, TransactionBuilder } from 'round-client'

export const capitalizeFirstLetter = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export const prettyTruncate = (str = '', len = 8, type?: string) => {
	if (str && str.length > len) {
		if (type === 'address') {
			if (str.length !== len + 1) {
				const front = Math.ceil(len / 2)
				const back = str.length - (len - front)
				return `${str.slice(0, front)}...${str.slice(back)}`
			}
			return str
		}
		return `${str.slice(0, len)}...`
	}
	return str
}

export const formatNearAddress = (address: string | undefined) => {
	if (address) {
		if (address.includes('near') || address.includes('testnet')) {
			return address
		} else {
			return prettyTruncate(address, 10, 'address')
		}
	}

	return ''
}

export const formatStroopToXlm = (amount: bigint) => {
	const divisor = BigInt(10 ** 7)
	const integerPart = amount / divisor
	const fractionalPart = amount % divisor

	if (fractionalPart === 0n) {
		return integerPart.toString()
	}

	const fractionalStr = fractionalPart
		.toString()
		.padStart(7, '0')
		.slice(0, 2)
		.replace(/0+$/, '')

	if (!fractionalStr) {
		return integerPart.toString()
	}
	return `${integerPart}.${fractionalStr}`
}

export const parseToStroop = (amount: string) => {
	let toIntXlm = 0
	let len_of_fraction = 0
	if (amount.split('.').length > 1) {
		const amount_fraction = amount.split('.').slice(1)
		len_of_fraction = amount_fraction[0].length
		toIntXlm = Number(amount) * 10 ** len_of_fraction
	} else {
		toIntXlm = Number(amount)
	}
	const res = BigInt(toIntXlm) * BigInt(10 ** (7 - len_of_fraction))
	return res
}

// export const getSorobanServer = () => {
// 	return new Soroban(
// 		getSorobanConfig(envVarConfigs.NETWORK_ENV as string)?.rpc_url as string,
// 		{
// 			allowHttp: getSorobanConfig(
// 				envVarConfigs.NETWORK_ENV as string,
// 			)?.rpc_url.startsWith('http://'),
// 		},
// 	)
// }

export const getHorizonServer = () => {
	return new Horizon.Server(
		getHorizonConfig(envVarConfigs.NETWORK_ENV as string)?.rpc_url as string,
		{
			allowHttp: getHorizonConfig(
				envVarConfigs.NETWORK_ENV as string,
			)?.rpc_url.startsWith('http://'),
		},
	)
}

export const getHorizonConfig = (env: string) => {
	switch (env) {
		case ENetworkEnv.TESTNET:
			return {
				network: ENetworkEnv.TESTNET,
				rpc_url: HORIZON_RPC_URL.TESTNET,
				network_passphrase: Networks.TESTNET,
				explorer: RPC_EXPLORER.TESTNET,
			}
		case ENetworkEnv.MAINNET:
			return {
				network: ENetworkEnv.MAINNET,
				rpc_url: HORIZON_RPC_URL.MAINNET,
				network_passphrase: Networks.PUBLIC,
				explorer: RPC_EXPLORER.MAINNET,
			}
		case ENetworkEnv.STAGING:
			return {
				network: ENetworkEnv.MAINNET,
				rpc_url: HORIZON_RPC_URL.MAINNET,
				network_passphrase: Networks.PUBLIC,
				explorer: RPC_EXPLORER.MAINNET,
			}
	}
}

export const getSorobanConfig = (env: string) => {
	switch (env) {
		case ENetworkEnv.TESTNET:
			return {
				network: ENetworkEnv.TESTNET,
				rpc_url: SOROBAN_RPC_URL.TESTNET,
				network_passphrase: Networks.TESTNET,
				explorer: RPC_EXPLORER.TESTNET,
			}
		case ENetworkEnv.MAINNET:
			return {
				network: ENetworkEnv.MAINNET,
				rpc_url: SOROBAN_RPC_URL.MAINNET,
				network_passphrase: Networks.PUBLIC,
				explorer: RPC_EXPLORER.MAINNET,
			}
		case ENetworkEnv.STAGING:
			return {
				network: ENetworkEnv.MAINNET,
				rpc_url: SOROBAN_RPC_URL.MAINNET,
				network_passphrase: Networks.PUBLIC,
				explorer: RPC_EXPLORER.MAINNET,
			}
	}
}

export const submitTx = async ({
	signedXDR,
	networkPassphrase,
	server,
}: SubmitTxProps) => {
	if (server instanceof Horizon.Server) {
		const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase)
		const sendResponse = await server.submitTransaction(tx)

		return sendResponse.hash
	} else {
		// const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase)

		// let sendResponse
		// let getTx
		// sendResponse = await server.sendTransaction(tx)

		// if (sendResponse.status == 'ERROR' && sendResponse.errorResult) {
		// 	throw new Error('Transaction failed', {
		// 		cause: sendResponse.errorResult?.result(),
		// 	})
		// }

		// if (sendResponse.status == 'TRY_AGAIN_LATER') {
		// 	throw new Error('Transaction failed. Try again later')
		// }

		// getTx = await server.getTransaction(sendResponse.hash)

		// while (sendResponse.status == 'PENDING' && getTx.status == 'NOT_FOUND') {
		// 	getTx = await server.getTransaction(sendResponse.hash)
		// 	await sleep(200)
		// }

		// return sendResponse.hash
		throw new Error('You are using the wrong server')
	}
}

export const onFetchingBlobToFile = async (url: string, filename: string) => {
	try {
		const res = await axios.get(url, { responseType: 'blob' })
		const newFile = new File([res.data], filename)
		return newFile
	} catch (error: any) {}
}

export const fetchYoutubeIframe = async (
	linkUrl: string,
	width: number,
	height?: number,
) => {
	const ytRes = await axios.get(
		`https://www.youtube.com/oembed?url=${linkUrl}&format=json&maxwidth=${width}&maxheight=${Math.floor(height || (9 / 6) * width)}`,
	)
	return ytRes?.data
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const DAY_MS = 24 * 60 * 60 * 1000
const MIN_START_OFFSET_MS = 10 * 60 * 1000
const END_PAD_MS = 30 * 60 * 1000

const isSameCalendarDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

const isDateOnlyMidnight = (d: Date) =>
	d.getHours() === 0 &&
	d.getMinutes() === 0 &&
	d.getSeconds() === 0 &&
	d.getMilliseconds() === 0

const setTimeOfDayFrom = (target: Date, source: Date) => {
	target.setHours(
		source.getHours(),
		source.getMinutes(),
		source.getSeconds(),
		source.getMilliseconds(),
	)
}

export type CreateRoundTimingInput = {
	now?: Date
	allowApplications: boolean
	applicationStart?: Date | null
	applicationEnd?: Date | null
	votingStart?: Date | null
	votingEnd?: Date | null
}

export type CreateRoundTimingOutput = {
	applicationStartMs?: number
	applicationEndMs?: number
	votingStartMs: number
	votingEndMs: number
}

/**
 * Normalizes application + voting windows for round creation.
 *
 * Rules (as agreed in UI):
 * - If a start date is today, it must be at least 10 minutes from "now".
 * - If an end is selected as a date-only value (midnight), align its time-of-day to the corresponding start.
 * - If application end is "tomorrow" (date-only), make it exactly start + 24h + 30m.
 * - Enforce a minimum 24h gap between application end and voting start (when both exist).
 * - Enforce voting duration >= 24h, then add 30m padding.
 */
export const normalizeCreateRoundTimings = ({
	now: nowInput,
	allowApplications,
	applicationStart,
	applicationEnd,
	votingStart,
	votingEnd,
}: CreateRoundTimingInput): CreateRoundTimingOutput => {
	const now = nowInput ? new Date(nowInput) : new Date()
	const tenMinutesFromNow = now.getTime() + MIN_START_OFFSET_MS

	// --- Application ---
	let applicationStartMs: number | undefined
	let applicationEndMs: number | undefined

	if (allowApplications) {
		const providedApplicationStart = applicationStart
			? new Date(applicationStart)
			: new Date(now)

		const applicationStartBaseMs = providedApplicationStart.getTime()
		const applicationStartEffectiveMs = isSameCalendarDay(providedApplicationStart, now)
			? Math.max(applicationStartBaseMs, tenMinutesFromNow)
			: applicationStartBaseMs

		const applicationStartEffectiveDate = new Date(applicationStartEffectiveMs)
		applicationStartMs = applicationStartEffectiveMs

		if (applicationEnd) {
			let providedApplicationEnd = new Date(applicationEnd)

			if (isDateOnlyMidnight(providedApplicationEnd)) {
				const tomorrowFromStart = new Date(applicationStartEffectiveMs + DAY_MS)
				const isTomorrowFromStart =
					providedApplicationEnd.getFullYear() === tomorrowFromStart.getFullYear() &&
					providedApplicationEnd.getMonth() === tomorrowFromStart.getMonth() &&
					providedApplicationEnd.getDate() === tomorrowFromStart.getDate()

				if (isTomorrowFromStart) {
					providedApplicationEnd = new Date(applicationStartEffectiveMs + DAY_MS + END_PAD_MS)
				} else {
					setTimeOfDayFrom(providedApplicationEnd, applicationStartEffectiveDate)
				}
			}

			applicationEndMs = providedApplicationEnd.getTime()
		}
	}

	// --- Voting start ---
	const providedVotingStart = votingStart ? new Date(votingStart) : new Date(now)
	const votingStartBaseMs = providedVotingStart.getTime()
	let votingStartEffectiveMs = isSameCalendarDay(providedVotingStart, now)
		? Math.max(votingStartBaseMs, tenMinutesFromNow)
		: votingStartBaseMs

	// Enforce minimum 24h gap between application end and voting start.
	if (allowApplications && typeof applicationEndMs === 'number') {
		const minVotingStartMs = applicationEndMs + DAY_MS
		if (votingStartEffectiveMs < minVotingStartMs) {
			votingStartEffectiveMs = minVotingStartMs
		}
	}

	const votingStartEffectiveDate = new Date(votingStartEffectiveMs)

	// --- Voting end ---
	const providedVotingEnd = votingEnd
		? new Date(votingEnd)
		: new Date(votingStartEffectiveMs + DAY_MS)

	if (isDateOnlyMidnight(providedVotingEnd)) {
		setTimeOfDayFrom(providedVotingEnd, votingStartEffectiveDate)
	}

	// Minimum 24h duration, then add 30m padding.
	const minVotingEndMs = votingStartEffectiveMs + DAY_MS
	if (providedVotingEnd.getTime() < minVotingEndMs) {
		providedVotingEnd.setTime(minVotingEndMs + END_PAD_MS)
	} else {
		providedVotingEnd.setTime(providedVotingEnd.getTime() + END_PAD_MS)
	}

	return {
		applicationStartMs,
		applicationEndMs,
		votingStartMs: votingStartEffectiveMs,
		votingEndMs: providedVotingEnd.getTime(),
	}
}

export const extractChainId = (round: GPRound) => {
	if (round.chain === 'stellar') {
		return 'stellar'
	} else {
		return 'near'
	}
}

export const localStorageSavedWallet = {
  get: () => {
    if (typeof window === 'undefined') return null;
    try {
      const savedWalletString = window.localStorage.getItem(
        envVarConfigs.LOCAL_STORAGE_SAVED_WALLET,
      );
      return savedWalletString
        ? (JSON.parse(savedWalletString) as SavedWallet)
        : null;
    } catch {
      return null;
    }
  },
  set: (savedWallet: SavedWallet) => {
    if (typeof window === 'undefined') return;
    try {
      return window.localStorage.setItem(
        envVarConfigs.LOCAL_STORAGE_SAVED_WALLET,
        JSON.stringify(savedWallet),
      );
    } catch {}
  },
  remove: () => {
    if (typeof window === 'undefined') return;
    try {
      return window.localStorage.removeItem(
        envVarConfigs.LOCAL_STORAGE_SAVED_WALLET,
      );
    } catch {}
  },
};