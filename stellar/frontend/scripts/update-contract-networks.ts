/*
  Update generated client networks to include both testnet and public entries
  using values from src/configs/env-var.ts perNetworkConfig.

  Usage:
    ts-node scripts/update-contract-networks.ts
*/

import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')
const envVarPath = path.join(root, 'src', 'configs', 'env-var.ts')

type Network = 'testnet' | 'staging'

interface PerNetworkConfig {
	LISTS_CONTRACT_ID: string
	PROJECT_REGISTRY_CONTRACT_ID: string
	ROUND_CONTRACT_ID: string
	API_BASE_URL: string
}

function loadPerNetworkConfig(): Record<Network, PerNetworkConfig> {
	const content = fs.readFileSync(envVarPath, 'utf8')
	// naive extraction of the perNetworkConfig block
	const match = content.match(
		/const perNetworkConfig:[\s\S]*?=\s*\{([\s\S]*?)\}\n/,
	)
	if (!match) throw new Error('perNetworkConfig not found in env-var.ts')
	const objLiteral = '{' + match[1] + '}'
	// Quick and dirty conversion to JSON-like by quoting keys
	const normalized = objLiteral
		.replace(/(testnet|staging|mainnet)\s*:/g, '"$1":')
		.replace(
			/(LISTS_CONTRACT_ID|PROJECT_REGISTRY_CONTRACT_ID|ROUND_CONTRACT_ID|API_BASE_URL)\s*:/g,
			'"$1":',
		)

	// eslint-disable-next-line no-new-func
	const parsed = Function('return ' + normalized)() as Record<
		Network,
		PerNetworkConfig
	>
	return parsed
}

function ensureNetworksMap(filePath: string, contractId: string) {
	const content = fs.readFileSync(filePath, 'utf8')
	if (!/export const networks\s*=\s*\{/.test(content)) return

	const hasPublic =
		/public:\s*\{[\s\S]*?networkPassphrase:[\s\S]*?Public Global Stellar Network/.test(
			content,
		)

	const updated = content.replace(
		/(export const networks\s*=\s*\{[\s\S]*?testnet:[\s\S]*?\}[\s\S]*?)(\}\s*as const)/,
		(_m, p1: string, p2: string) => {
			const publicBlock = `,\n  public: {\n    networkPassphrase: "Public Global Stellar Network ; September 2015",\n    contractId: "${contractId}",\n  }\n`
			if (hasPublic) {
				// Replace existing public contractId
				return (
					p1.replace(
						/(public:\s*\{[\s\S]*?contractId:\s*")([^"]+)("[\s\S]*?\})/,
						(_m2, a, _old, c) => `${a}${contractId}${c}`,
					) + p2
				)
			} else {
				return p1.replace(/\}\n\s*as const/, publicBlock + p2)
			}
		},
	)

	fs.writeFileSync(filePath, updated)
}

function main() {
	const cfg = loadPerNetworkConfig()
	const mainnet = cfg.staging?.LISTS_CONTRACT_ID || ''
	const mainnetProject = cfg.staging?.PROJECT_REGISTRY_CONTRACT_ID || ''
	const mainnetRound = cfg.staging?.ROUND_CONTRACT_ID || ''

	const listsPath = path.join(root, 'lists-client', 'src', 'index.ts')
	const projectPath = path.join(
		root,
		'project-registry-client',
		'src',
		'index.ts',
	)
	const roundPath = path.join(root, 'round-client', 'src', 'index.ts')

	ensureNetworksMap(listsPath, mainnet)
	ensureNetworksMap(projectPath, mainnetProject)
	ensureNetworksMap(roundPath, mainnetRound)

	console.log('Updated client networks for public (mainnet).')
}

main()
