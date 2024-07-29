use crate::*;

pub type DepositId = u64;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct Deposit {
    pub round_id: RoundId,
    pub depositor_id: AccountId,
    pub total_amount: u128,
    pub protocol_fee: u128,
    pub net_amount: u128,
    pub deposited_at: TimestampMs,
    pub memo: Option<String>,
}

impl Deposit {
    pub fn to_external(&self, deposit_id: DepositId) -> DepositExternal {
        DepositExternal {
            id: deposit_id,
            round_id: self.round_id,
            depositor_id: self.depositor_id.clone(),
            total_amount: U128(self.total_amount),
            protocol_fee: U128(self.protocol_fee),
            net_amount: U128(self.net_amount),
            deposited_at: self.deposited_at,
            memo: self.memo.clone(),
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct DepositExternal {
    pub id: DepositId,
    pub round_id: RoundId,
    pub depositor_id: AccountId,
    pub total_amount: U128,
    pub protocol_fee: U128,
    pub net_amount: U128,
    pub deposited_at: TimestampMs,
    pub memo: Option<String>,
}

#[near_bindgen]
impl Contract {
    #[payable]
    pub fn deposit_to_round(&mut self, round_id: RoundId, memo: Option<String>) -> DepositExternal {
        let initial_storage_usage = env::storage_usage();
        let mut round = self
            .rounds_by_id
            .get(&round_id)
            .expect("Round not found")
            .clone();
        let caller = env::predecessor_account_id();
        let attached_deposit = env::attached_deposit();
        // create Deposit record
        let deposit_id = self.next_deposit_id;
        self.next_deposit_id += 1;

        let protocol_fee = self
            .calculate_protocol_fee(attached_deposit.as_yoctonear())
            .unwrap_or(0);
        let mut deposit = Deposit {
            round_id,
            depositor_id: caller.clone(),
            total_amount: attached_deposit.as_yoctonear(),
            protocol_fee,
            net_amount: 0, // will be updated in a moment after storage has been calculated
            deposited_at: env::block_timestamp_ms(),
            memo,
        };

        // insert into mappings
        self.deposits_by_id.insert(deposit_id, deposit.clone());
        let deposits_for_round = self
            .deposit_ids_for_round
            .get_mut(&round_id)
            .expect("Round not found");
        deposits_for_round.insert(deposit_id);

        // calculate storage & deduct to get net_amount
        let required_deposit = calculate_required_storage_deposit(initial_storage_usage);
        let net_amount = attached_deposit.as_yoctonear() - required_deposit - protocol_fee;
        deposit.net_amount = net_amount;

        self.deposits_by_id.insert(deposit_id, deposit.clone());

        // update round
        let current_vault_balance = round.current_vault_balance + net_amount;
        let vault_total_deposits = round.vault_total_deposits + attached_deposit.as_yoctonear();
        round.current_vault_balance = current_vault_balance;
        round.vault_total_deposits = vault_total_deposits;
        self.rounds_by_id.insert(round_id, round.clone());

        // clean-up
        refund_deposit(initial_storage_usage, None);
        // send protocol fee if > 0 & recipient is set
        if protocol_fee > 0 {
            if let Some(protocol_fee_recipient) = self.protocol_fee_recipient.as_ref() {
                Promise::new(protocol_fee_recipient.clone())
                    .transfer(NearToken::from_yoctonear(protocol_fee));
                log!(
                    "Protocol fee {} sent to {}",
                    protocol_fee,
                    protocol_fee_recipient
                );
            }
        }
        let deposit_external = deposit.to_external(deposit_id);
        log_deposit(&deposit_external);
        deposit_external
    }

    pub fn get_deposits_for_round(
        &self,
        round_id: RoundId,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<DepositExternal> {
        let deposits_for_round = self
            .deposit_ids_for_round
            .get(&round_id)
            .expect("Round not found");

        let from_index = from_index.unwrap_or(0);
        let limit = limit.unwrap_or(self.default_page_size);
        if from_index > deposits_for_round.len() as u64 {
            return vec![];
        }

        deposits_for_round
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .map(|deposit_id| {
                self.deposits_by_id
                    .get(deposit_id)
                    .expect("Deposit not found")
                    .to_external(deposit_id.clone())
            })
            .collect()
    }
}
