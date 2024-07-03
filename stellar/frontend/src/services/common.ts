import { serviceConfigs } from '@/configs/service'
import baseClient from './base'
import { envVarConfigs } from '@/configs/env-var'
import { IGetPriceCryptoResponse } from '@/types/services'

export const getPriceCrypto = async (fromPrice: string, toPrice: string) => {
	try {
		const endpoint = serviceConfigs.endpoint
		const client = baseClient(envVarConfigs.CRYPTO_COMPARE_URL)
		const res = await client.get<IGetPriceCryptoResponse>(
			endpoint.crypto_compare.price,
			{
				params: {
					fsym: fromPrice,
					tsyms: toPrice,
				},
			},
		)
		return res
	} catch (error: any) {
		console.log('error upload single file: ', error)
	}
}
