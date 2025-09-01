type NetworkEnv = 'testnet' | 'staging' | 'mainnet'

// Centralized per-network configuration (fill these with your actual values)
const perNetworkConfig: Record<NetworkEnv, {
  LISTS_CONTRACT_ID: string
  PROJECT_REGISTRY_CONTRACT_ID: string
  ROUND_CONTRACT_ID: string
  API_BASE_URL: string
}> = {
  testnet: {
    LISTS_CONTRACT_ID: 'CCIF26RAXONJHR42UKOJGTCPA3GVL37QCHS42PFWGM53A5WOLEFBMTYB',
    PROJECT_REGISTRY_CONTRACT_ID: 'CAUX3WSEWUR2Z7N3XKJBQXS5LBVRW62D2C7EYDOAUJXXI3T3YWCBTVMW',
    ROUND_CONTRACT_ID: 'CCT5MBDD4QGHNHG3VWSJ5AC6FL7DIZHVFQRPXW2OATBWZZRHTQMHSW4O',
    API_BASE_URL: 'https://test-dev.potlock.io/api/v1',
  },
  staging: {
    LISTS_CONTRACT_ID: 'CAFRPR2FE2ASZGZDGLCGGUGPUJMBHCPWXVAGZ3GZR5ITZIFPPSAG53B6',
    PROJECT_REGISTRY_CONTRACT_ID: 'CCSQPTVDGEGZFKJ7D53WTCHQF5CYE55YEL7NB256Y7UJUK2ZWJGS6NM3',
    ROUND_CONTRACT_ID: 'CAF5DB2QTOH7XBG3PRG4CCYBSSWV245PC33DASEF454DZ3HJTJCM2LWU',
    API_BASE_URL: 'https://dev.potlock.io/api/v1',
  },
  mainnet: {
    LISTS_CONTRACT_ID: '',
    PROJECT_REGISTRY_CONTRACT_ID: '',
    ROUND_CONTRACT_ID: '',
    API_BASE_URL: '',
  },
}

const NETWORK_ENV = (process.env.NETWORK_ENV as NetworkEnv) || 'testnet'
const selectedNetworkConfig = perNetworkConfig[NETWORK_ENV]

export const envVarConfigs = {
	NETWORK_ENV,
	CRYPTO_COMPARE_URL: process.env.CRYPTO_COMPARE_URL as string,
	NFT_STORAGE_API_KEY: process.env.NFT_STORAGE_API_KEY as string,
	ADMIN_SECRET: process.env.ADMIN_SECRET as string,
	ADMIN: process.env.ADMIN as string,
	NATIVE_TOKEN: process.env.NATIVE_TOKEN as string,
	LIVEPEER_API_KEY: process.env.LIVEPEER_API_KEY as string,
	// Per-network values (not required to be provided via .env)
	LISTS_CONTRACT_ID: selectedNetworkConfig.LISTS_CONTRACT_ID,
	PROJECT_REGISTRY_CONTRACT_ID: selectedNetworkConfig.PROJECT_REGISTRY_CONTRACT_ID,
	ROUND_CONTRACT_ID: selectedNetworkConfig.ROUND_CONTRACT_ID,
	API_BASE_URL: selectedNetworkConfig.API_BASE_URL,
	// Other values
	ROUND_WASM_HASH: process.env.ROUND_WASM_HASH as string,
	IPFS_GATEWAY_URL: process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL as string,
}

export type { NetworkEnv }
