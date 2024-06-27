loam build
my_address=($(soroban keys address alice))
native_token=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
lists_contract_id=($(soroban contract deploy --wasm target/loam/lists.wasm --source alice --network testnet))
registry_contract_id=($(soroban contract deploy --wasm target/loam/project_registry.wasm --source alice --network testnet))
round_contract_id=($(soroban contract deploy --wasm target/loam/round.wasm --source alice --network testnet))
factory_contract_id=($(soroban contract deploy --wasm target/loam/round.wasm --source alice --network testnet))

soroban contract bindings typescript --network testnet --contract-id $lists_contract_id --output-dir ./packages/lists-client
soroban contract bindings typescript --network testnet --contract-id $registry_contract_id --output-dir ./packages/project-registry-client
soroban contract bindings typescript --network testnet --contract-id $round_contract_id --output-dir ./packages/round-client
soroban contract bindings typescript --network testnet --contract-id $factory_contract_id --output-dir ./packages/round-factory-client