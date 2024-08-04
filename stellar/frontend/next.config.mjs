/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NETWORK_ENV: process.env.NETWORK_ENV,
		CRYPTO_COMPARE_URL: process.env.CRYPTO_COMPARE_URL,
		NFT_STORAGE_API_KEY: process.env.NFT_STORAGE_API_KEY,
		ADMIN_SECRET: process.env.ADMIN_SECRET,
		ADMIN: process.env.ADMIN,
		NATIVE_TOKEN: process.env.NATIVE_TOKEN,
		LIVEPEER_API_KEY: process.env.LIVEPEER_API_KEY,
		LISTS_CONTRACT_ID: process.env.LISTS_CONTRACT_ID,
		PROJECT_REGISTRY_CONTRACT_ID: process.env.PROJECT_REGISTRY_CONTRACT_ID,
		ROUND_CONTRACT_ID: process.env.ROUND_CONTRACT_ID,
		ROUND_WASM_HASH: process.env.ROUND_WASM_HASH,
	},
}

export default nextConfig
