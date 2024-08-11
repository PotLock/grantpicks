import dotenv from 'dotenv'
import CMDWallet from './wallet.js'
import App from './app.js'
import { generateFakeRound } from './tests/index.js'
dotenv.config()

async function main() {
	await generateFakeRound()

	process.exit(0)
}

main()
