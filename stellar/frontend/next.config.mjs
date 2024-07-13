/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NETWORK_ENV: process.env.NETWORK_ENV,
		CRYPTO_COMPARE_URL: process.env.CRYPTO_COMPARE_URL,
		NFT_STORAGE_API_KEY: process.env.NFT_STORAGE_API_KEY,
	},
}

export default nextConfig
