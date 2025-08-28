/*
  Update generated client networks to include BOTH testnet and public entries
  using values from src/configs/env-var.ts perNetworkConfig.

  Run:
    node scripts/update-contract-networks.js
*/

const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const envVarPath = path.join(root, 'src', 'configs', 'env-var.ts')

function loadPerNetworkConfig() {
	const content = fs.readFileSync(envVarPath, 'utf8')
	const match = content.match(
		/const perNetworkConfig:[\s\S]*?=\s*\{([\s\S]*?)\}\n/,
	)
	if (!match) throw new Error('perNetworkConfig not found in env-var.ts')
	const objLiteral = '{' + match[1] + '}'
	const normalized = objLiteral
		.replace(/(testnet|staging|mainnet)\s*:/g, '"$1":')
		.replace(
			/(LISTS_CONTRACT_ID|PROJECT_REGISTRY_CONTRACT_ID|ROUND_CONTRACT_ID|API_BASE_URL)\s*:/g,
			'"$1":',
		)

	// eslint-disable-next-line no-new-func
	const parsed = Function('return ' + normalized)()
	return parsed
}

function rewriteNetworksBlock(filePath, testnetContractId, publicContractId) {
	const content = fs.readFileSync(filePath, 'utf8')
	const networksBlock =
		'export const networks = {\n' +
		'  testnet: {\n' +
		'    networkPassphrase: "Test SDF Network ; September 2015",\n' +
		`    contractId: "${testnetContractId}",\n` +
		'  },\n' +
		'  public: {\n' +
		'    networkPassphrase: "Public Global Stellar Network ; September 2015",\n' +
		`    contractId: "${publicContractId}",\n` +
		'  }\n' +
		'} as const'

	const updated = content.replace(
		/export const networks\s*=\s*\{[\s\S]*?\}\s*as const/,
		networksBlock,
	)
	fs.writeFileSync(filePath, updated)
}

function main() {
	const cfg = loadPerNetworkConfig()
	const testnet = cfg.testnet || {}
	// Mainnet can be configured under 'mainnet' or 'staging' in this project
	const mainLike = cfg.mainnet || cfg.staging || {}

	const listsPath = path.join(root, 'lists-client', 'src', 'index.ts')
	const projectPath = path.join(
		root,
		'project-registry-client',
		'src',
		'index.ts',
	)
	const roundPath = path.join(root, 'round-client', 'src', 'index.ts')

	rewriteNetworksBlock(
		listsPath,
		testnet.LISTS_CONTRACT_ID || '',
		mainLike.LISTS_CONTRACT_ID || '',
	)
	rewriteNetworksBlock(
		projectPath,
		testnet.PROJECT_REGISTRY_CONTRACT_ID || '',
		mainLike.PROJECT_REGISTRY_CONTRACT_ID || '',
	)
	rewriteNetworksBlock(
		roundPath,
		testnet.ROUND_CONTRACT_ID || '',
		mainLike.ROUND_CONTRACT_ID || '',
	)

	console.log('Updated client networks (testnet + public).')
}

main()
