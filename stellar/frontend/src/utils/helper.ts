import { envVarConfigs } from '@/configs/env-var'
import {
	HORIZON_RPC_URL,
	RPC_EXPLORER,
	SOROBAN_RPC_URL,
} from '@/constants/on-chain'
import { GPRound } from '@/models/round'
import { ENetworkEnv, Networks, SubmitTxProps } from '@/types/on-chain'
import axios from 'axios'
import { Horizon,  TransactionBuilder } from 'round-client'

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
	const res = (BigInt(amount as bigint) / BigInt(10 ** 7)).toString()
	return res
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
		const tx = TransactionBuilder.fromXDR(signedXDR, networkPassphrase)

		let sendResponse
		let getTx
		sendResponse = await server.sendTransaction(tx)

		if (sendResponse.status == 'ERROR' && sendResponse.errorResult) {
			throw new Error('Transaction failed', {
				cause: sendResponse.errorResult?.result(),
			})
		}

		if (sendResponse.status == 'TRY_AGAIN_LATER') {
			throw new Error('Transaction failed. Try again later')
		}

		getTx = await server.getTransaction(sendResponse.hash)

		while (sendResponse.status == 'PENDING' && getTx.status == 'NOT_FOUND') {
			getTx = await server.getTransaction(sendResponse.hash)
			await sleep(200)
		}
		
		return sendResponse.hash
		
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

export const extractChainId = (round: GPRound) => {
	if (round.chain === 'stellar') {
		return 'stellar'
	} else {
		return 'near'
	}
}
