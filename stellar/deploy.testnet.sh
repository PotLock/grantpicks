bash build.sh

my_address=($(stellar keys address potlock-testnet))
native_token=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
lists_contract_id=($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/lists.wasm --source potlock-testnet --network testnet))
registry_contract_id=($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/project_registry.wasm --source potlock-testnet --network testnet))
round_contract_id=($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/round_opt.wasm --source potlock-testnet --network testnet))

echo "lists contract id: $lists_contract_id"
echo "registry contract id: $registry_contract_id"
echo "round & factory contract id: $round_contract_id"
echo "deployer address: $my_address"

stellar contract invoke --source potlock-testnet --network testnet --id ${lists_contract_id} -- initialize --owner ${my_address} 
stellar contract invoke --source potlock-testnet --network testnet --id ${registry_contract_id} -- initialize --contract_owner ${my_address} 
stellar contract invoke --source potlock-testnet --network testnet --id ${round_contract_id} -- initialize --registry_address ${registry_contract_id} --caller ${my_address} --token_address ${native_token} --protocol_fee_basis_points 200 --protocol_fee_recipient ${my_address} --default_page_size 5

stellar contract bindings typescript --network testnet --contract-id $lists_contract_id --output-dir ./packages/lists-client --overwrite
stellar contract bindings typescript --network testnet --contract-id $registry_contract_id --output-dir ./packages/project-registry-client --overwrite
stellar contract bindings typescript --network testnet --contract-id $round_contract_id --output-dir ./packages/round-client --overwrite
