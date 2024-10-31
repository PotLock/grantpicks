 cargo build --target=wasm32-unknown-unknown --release
 wasm-opt target/wasm32-unknown-unknown/release/round.wasm  -Oz -o target/wasm32-unknown-unknown/release/round_opt.wasm
 wasm-opt target/wasm32-unknown-unknown/release/lists.wasm  -Oz -o target/wasm32-unknown-unknown/release/lists_opt.wasm
 wasm-opt target/wasm32-unknown-unknown/release/project_registry.wasm  -Oz -o target/wasm32-unknown-unknown/release/project_registry_opt.wasm
 cp -rf target/wasm32-unknown-unknown/release/*.wasm contract/build