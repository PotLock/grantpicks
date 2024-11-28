mod test_env;

use near_sdk::{borsh::{BorshDeserialize, BorshSerialize}, json_types::U128, serde::{Deserialize, Serialize}, AccountId, NearToken};
use near_workspaces::{result::ExecutionFinalResult, sandbox, Contract};
use serde_json::json;
use log::info;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
struct Contact {
    name: String,
    value: String,
}

async fn create_rounds(
    grant_contract: &Contract,
    owner: AccountId,
    admins: Vec<AccountId>,
    name: String,
    description: String,
    contacts: Vec<Contact>,
    voting_start_ms: u64,
    voting_end_ms: u64,
    allow_applications: bool,
    application_start_ms: Option<u64>,
    application_end_ms: Option<u64>,
    application_requires_video: bool,
    expected_amount: U128,
    use_whitelist: Option<bool>,
    num_picks_per_voter: u32,
    max_participants: Option<u32>,
    use_cooldown: bool,
    cooldown_period_ms: Option<u64>,
    use_compliance: bool,
    compliance_requirement_description: Option<String>,
    compliance_period_ms: Option<u64>,
    allow_remaining_funds_redistribution: bool,
    remaining_funds_redistribution_recipient: Option<AccountId>,
    use_referrals: bool,
    referrer_fee_basis_points: Option<u16>,
) -> Result<ExecutionFinalResult, near_workspaces::error::Error> {
    let res = grant_contract
        .call("create_round")
        .args_json(json!({
            "round_detail": {
                "owner": owner,
                "admins": admins,
                "name": name,
                "description": description,
                "contacts": contacts,
                "voting_start_ms": voting_start_ms,
                "voting_end_ms": voting_end_ms,
                "allow_applications": allow_applications,
                "application_start_ms": application_start_ms,
                "application_end_ms": application_end_ms,
                "application_requires_video": application_requires_video,
                "expected_amount": expected_amount,
                "use_whitelist": use_whitelist,
                "num_picks_per_voter": num_picks_per_voter,
                "max_participants": max_participants,
                "use_cooldown": use_cooldown,
                "cooldown_period_ms": cooldown_period_ms,
                "use_compliance": use_compliance,
                "compliance_requirement_description": compliance_requirement_description,
                "compliance_period_ms": compliance_period_ms,
                "allow_remaining_funds_redistribution": allow_remaining_funds_redistribution,
                "remaining_funds_redistribution_recipient": remaining_funds_redistribution_recipient,
                "use_referrals": use_referrals,
                "referrer_fee_basis_points": referrer_fee_basis_points,
            }
        }))
        .max_gas()
        .deposit(NearToken::from_near(1))
        .transact()
        .await;
    return res;
}

#[tokio::test]
async fn test_rounds() -> anyhow::Result<()> {
    info!("Logger initialized");
    let worker = sandbox().await?;
    let (grant_contract, alice, bob) = test_env::init(&worker).await?;
    // generate random data for create_rounds

    let owner = alice.id().clone();
    let admins = vec![alice.id().clone(), bob.id().clone()];
    let name = "R1".to_string();
    let description = "description".to_string();
    let contacts = vec![Contact {
        name: "name".to_string(),
        value: "value".to_string(),
    }];
    let voting_start_ms = 1723435504000;
    let voting_end_ms = 1723435508000;
    let allow_applications = true;
    // make application start ms 6 am today 2024.
    let application_start_ms = Some(0);
    let application_end_ms = Some(0);
    let application_requires_video = true;
    let expected_amount = U128(0);
    let use_whitelist = Some(true);
    let num_picks_per_voter = 0;
    let max_participants = Some(0);
    let use_cooldown = true;
    let cooldown_period_ms = Some(0);
    let use_compliance = true;
    let compliance_requirement_description = Some("compliance_requirement_description".to_string());
    let compliance_period_ms = Some(0);
    let allow_remaining_funds_redistribution = true;
    let remaining_funds_redistribution_recipient = Some(owner.clone());
    let use_referrals = true;
    let referrer_fee_basis_points = Some(0);
    info!("Logger initialized");

    let res = create_rounds(
        &grant_contract,
        owner,
        admins,
        name,
        description,
        contacts,
        voting_start_ms,
        voting_end_ms,
        allow_applications,
        application_start_ms,
        application_end_ms,
        application_requires_video,
        expected_amount,
        use_whitelist,
        num_picks_per_voter,
        max_participants,
        use_cooldown,
        cooldown_period_ms,
        use_compliance,
        compliance_requirement_description,
        compliance_period_ms,
        allow_remaining_funds_redistribution,
        remaining_funds_redistribution_recipient,
        use_referrals,
        referrer_fee_basis_points,
    ).await?;

    println!("res after resting... {:?}", res);

    assert!(res.is_success(), "res: {:?}", res);

    Ok(())

}