/** @type {import('next').NextConfig} */
const nextConfig = {
	env: {
		NETWORK_ENV: process.env.NETWORK_ENV,
		CRYPTO_COMPARE_URL: process.env.CRYPTO_COMPARE_URL,
	},
}

export default nextConfig
