import { Client as ListClient } from 'lists-client';
import { Client as ProjectClient } from 'project-registry-client';
import { Client as RoundFactoryClient } from 'round-factory-client';
import { Client as RoundClient } from 'round-client';
class App {
    constructor(network, wallet) {
        const config = network == 'testnet'
            ? {
                contractId: '',
                networkPassphrase: 'Test SDF Network ; September 2015',
                rpcUrl: 'https://soroban-testnet.stellar.org',
                publicKey: wallet.account.publicKey,
            }
            : {
                contractId: '',
                networkPassphrase: 'Public Global Stellar Network ; September 2015',
                rpcUrl: 'https://soroban.stellar.org',
                publicKey: wallet.account.publicKey,
            };
        config.signAuthEntry = wallet.signAuth.bind(wallet);
        config.signTransaction = wallet.signTransaction.bind(wallet);
        this._template_config = config;
        this._wallet = wallet;
        let lists_contract_id = process.env.LISTS_CONTRACT_ID || '';
        let project_registry_contract_id = process.env.PROJECT_REGISTRY_CONTRACT_ID || '';
        let round_factory_contract_id = process.env.ROUND_FACTORY_CONTRACT_ID || '';
        this._lists_contract = new ListClient({
            ...config,
            contractId: lists_contract_id,
        });
        this._project_contract = new ProjectClient({
            ...config,
            contractId: project_registry_contract_id,
        });
        this._round_factory_contract = new RoundFactoryClient({
            ...config,
            contractId: round_factory_contract_id,
        });
    }
    get lists_contract() {
        return this._lists_contract;
    }
    get project_contract() {
        return this._project_contract;
    }
    get round_factory_contract() {
        return this._round_factory_contract;
    }
    get wallet() {
        return this._wallet;
    }
    round_contract(contractId) {
        return new RoundClient({
            ...this._template_config,
            contractId,
        });
    }
}
export default App;
