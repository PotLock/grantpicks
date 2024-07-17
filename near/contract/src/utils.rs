use crate::*;

pub fn refund_deposit(initial_storage_usage: u64, refund_to: Option<AccountId>) {
    let refund_to = refund_to.unwrap_or_else(env::predecessor_account_id);
    let attached_deposit = env::attached_deposit();
    let mut refund = attached_deposit.as_yoctonear();
    if env::storage_usage() > initial_storage_usage {
        // caller should pay for the extra storage they used and be refunded for the rest
        let storage_used = env::storage_usage() - initial_storage_usage;
        log!("Storage used: {} bytes", storage_used);
        let required_cost = env::storage_byte_cost().as_yoctonear() * storage_used as u128;
        require!(
            required_cost <= attached_deposit.as_yoctonear(),
            format!(
                "Must attach {} to cover storage",
                NearToken::from_yoctonear(required_cost)
            )
        );
        refund -= required_cost;
    } else {
        // storage was freed up; caller should be refunded for what they freed up, in addition to the deposit they sent
        let storage_freed = initial_storage_usage - env::storage_usage();
        log!("Storage freed: {} bytes", storage_freed);
        let cost_freed = env::storage_byte_cost().as_yoctonear() * storage_freed as u128;
        refund += cost_freed;
    }
    if refund > 1 {
        log!(
            "Refunding {} to {}",
            NearToken::from_yoctonear(refund),
            refund_to
        );
        Promise::new(refund_to).transfer(NearToken::from_yoctonear(refund));
    }
}
