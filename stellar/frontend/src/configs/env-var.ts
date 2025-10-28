type NetworkEnv = 'testnet' | 'staging' | 'mainnet'

// Centralized per-network configuration (fill these with your actual values)
const perNetworkConfig: Record<
	NetworkEnv,
	{
		LISTS_CONTRACT_ID: string
		PROJECT_REGISTRY_CONTRACT_ID: string
		ROUND_CONTRACT_ID: string
		API_BASE_URL: string
	}
> = {
	testnet: {
		LISTS_CONTRACT_ID:
			'CCLXSELRRF67M3K5JJYNT6HRTJN26JDJKZYKR5QTZAEZU2TSCF6OGFZT',
		PROJECT_REGISTRY_CONTRACT_ID:
			'CAI6747A7VHSYWL7KIJ3J43OJBM57IH3VC6HCAMEL4EQESEF2QFGIED7',
		ROUND_CONTRACT_ID:
			'CCIJKRYCBOJ4CNY6EGINPTMX5OJLGGRVR3OFMM42NRY2YRKRHXS4UXPI',
		API_BASE_URL: 'https://test-dev.potlock.io/api/v1',
	},
	staging: {
		LISTS_CONTRACT_ID:
			'CAIYXP5CNFB5WUBAWEPBZHIKYZGP3IEFXILFMDUT37FZBKNGFJGNJPNT',
		PROJECT_REGISTRY_CONTRACT_ID:
			'CD6X5JVK6ITAZGOMIUBVJUHFMK34YW2ZEWQ2BDLV6XFRFGNV56A4L3RC',
		ROUND_CONTRACT_ID:
			'CDCRTJQ3SP2LJEOT5EA2B6WTGUUI6BVYDJXKYRJCKRSPSYJHXV5V6X3O',
		API_BASE_URL: 'https://dev.potlock.io/api/v1',
	},
	mainnet: {
		LISTS_CONTRACT_ID: '',
		PROJECT_REGISTRY_CONTRACT_ID: '',
		ROUND_CONTRACT_ID: '',
		API_BASE_URL: '',
	},
}

const NETWORK_ENV = process.env.NETWORK_ENV as NetworkEnv
const selectedNetworkConfig = perNetworkConfig[NETWORK_ENV]

export const envVarConfigs = {
	NETWORK_ENV,
	LOCAL_STORAGE_SAVED_WALLET: 'stellar_saved_wallet' as string,
	CRYPTO_COMPARE_URL: process.env.CRYPTO_COMPARE_URL as string,
	NFT_STORAGE_API_KEY: process.env.NFT_STORAGE_API_KEY as string,
	ADMIN_SECRET: process.env.ADMIN_SECRET as string,
	ADMIN: process.env.ADMIN as string,
	NATIVE_TOKEN: process.env.NATIVE_TOKEN as string,
	LIVEPEER_API_KEY: process.env.LIVEPEER_API_KEY as string,
	// Per-network values (not required to be provided via .env)
	LISTS_CONTRACT_ID: selectedNetworkConfig.LISTS_CONTRACT_ID,
	PROJECT_REGISTRY_CONTRACT_ID:
		selectedNetworkConfig.PROJECT_REGISTRY_CONTRACT_ID,
	ROUND_CONTRACT_ID: selectedNetworkConfig.ROUND_CONTRACT_ID,
	API_BASE_URL: selectedNetworkConfig.API_BASE_URL,
	// Other values
	ROUND_WASM_HASH: process.env.ROUND_WASM_HASH as string,
	IPFS_GATEWAY_URL: process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL as string,
}

export type { NetworkEnv }
