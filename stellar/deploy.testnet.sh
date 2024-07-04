loam build
my_address=($(soroban keys address alice))
native_token=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
export lists_contract_id=($(soroban contract deploy --wasm target/loam/lists.wasm --source alice --network testnet))
export registry_contract_id=($(soroban contract deploy --wasm target/loam/project_registry.wasm --source alice --network testnet))
# export round_contract_id=($(soroban contract deploy --wasm target/loam/round.wasm --source alice --network testnet))
export factory_contract_id=($(soroban contract deploy --wasm target/loam/round_factory.wasm --source alice --network testnet))

echo "lists contract id: $lists_contract_id"
echo "registry contract id: $registry_contract_id"
echo "factory contract id: $factory_contract_id"
echo "deployer address: $my_address"

soroban contract invoke --source alice --network testnet --id ${lists_contract_id} -- initialize --owner ${my_address} 
soroban contract invoke --source alice --network testnet --id ${registry_contract_id} -- initialize --contract_owner ${my_address} 
soroban contract invoke --source alice --network testnet --id ${factory_contract_id} -- init --registry_address ${registry_contract_id} --owner ${my_address} --token_address $native_token 

rm -rf ./packages/*-client

soroban contract bindings typescript --network testnet --contract-id $lists_contract_id --output-dir ./packages/lists-client
soroban contract bindings typescript --network testnet --contract-id $registry_contract_id --output-dir ./packages/project-registry-client
# soroban contract bindings typescript --network testnet --contract-id $round_contract_id --output-dir ./packages/round-client
soroban contract bindings typescript --network testnet --contract-id $factory_contract_id --output-dir ./packages/round-factory-client
