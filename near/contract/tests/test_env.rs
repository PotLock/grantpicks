
use log::info;
use near_workspaces::{ Worker, Contract, Account, DevNetwork, types::NearToken};
use anyhow::Result;


pub async fn init(worker: &Worker<impl DevNetwork>) -> Result<(Contract, Account, Account)> {
    let grant_contract = worker
        .dev_deploy(include_bytes!("../out/main.wasm"))
        .await?;

    let res = grant_contract
        .call("new")
        .args_json((owner))
        .max_gas()
        .transact()
        .await?;
    info!("res: {:?}", res);
    assert!(res.is_success(), "Failed to call new_default_meta");

    let alice = grant_contract
        .as_account()
        .create_subaccount("alice")
        .initial_balance(NearToken::from_near(10))
        .transact()
        .await?
        .into_result()?;

    let bob = grant_contract
        .as_account()
        .create_subaccount("bob")
        .initial_balance(NearToken::from_near(10))
        .transact()
        .await?
        .into_result()?;

    return Ok((grant_contract, alice, bob));
}