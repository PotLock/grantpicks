bash build.sh

my_address=($(stellar keys address potlock-mainnet))
native_token=CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA
lists_contract_id=CAFRPR2FE2ASZGZDGLCGGUGPUJMBHCPWXVAGZ3GZR5ITZIFPPSAG53B6
# ($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/lists_opt.optimized.wasm --source potlock-mainnet --network mainnet))
registry_contract_id=CCSQPTVDGEGZFKJ7D53WTCHQF5CYE55YEL7NB256Y7UJUK2ZWJGS6NM3
# ($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/project_registry_opt.optimized.wasm --source potlock-mainnet --network mainnet))
round_contract_id=CAF5DB2QTOH7XBG3PRG4CCYBSSWV245PC33DASEF454DZ3HJTJCM2LWU
# ($(stellar contract deploy --wasm  target/wasm32-unknown-unknown/release/round_opt.optimized.wasm --source potlock-mainnet --network mainnet --fee 100000))

echo "lists contract id: $lists_contract_id"
echo "registry contract id: $registry_contract_id"
echo "round & factory contract id: $round_contract_id"
echo "deployer address: $my_address"

# stellar contract invoke --source potlock-mainnet --network mainnet --id ${lists_contract_id} -- initialize --owner ${my_address}
stellar contract invoke --source potlock-mainnet --network mainnet --fee 100000 --id ${lists_contract_id} -- create_list --owner ${my_address} --name "Public List" --default_registration_status Approved
# stellar contract invoke --source potlock-mainnet --network mainnet --id ${registry_contract_id} -- initialize --contract_owner ${my_address}
stellar contract invoke --source potlock-mainnet --network mainnet --id ${round_contract_id} -- initialize --registry_address ${registry_contract_id} --caller ${my_address} --token_address ${native_token} --protocol_fee_basis_points 200 --protocol_fee_recipient ${my_address} --default_page_size 5 --list_address ${lists_contract_id} --kyc_wl_list_id 1

# stellar contract bindings typescript --network mainnet --contract-id $lists_contract_id --output-dir ./packages/lists-client --overwrite
# stellar contract bindings typescript --network mainnet --contract-id $registry_contract_id --output-dir ./packages/project-registry-client --overwrite
# stellar contract bindings typescript --network mainnet --contract-id $round_contract_id --output-dir ./packages/round-client --overwrite
