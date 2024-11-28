use crate::*;

/// create round
pub(crate) fn log_round_created(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "create_round",
                "data": [
                    {
                        "round_detail": round_detail,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// update round
pub(crate) fn log_round_updated(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "round_updated",
                "data": [
                    {
                        "round_detail": round_detail,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// delete round
pub(crate) fn log_round_deleted(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "round_deleted",
                "data": [
                    {
                        "round_detail": round_detail,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// Deposit to round (vault)
pub(crate) fn log_deposit(deposit: &DepositExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "deposit",
                "data": [
                    {
                        "deposit": deposit,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// create application
pub(crate) fn log_application_created(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "application_created",
                "data": [
                    {
                        "application": application,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// update application
pub(crate) fn log_application_updated(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "application_updated",
                "data": [
                    {
                        "application": application,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// delete application
pub(crate) fn log_application_deleted(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "application_deleted",
                "data": [
                    {
                        "application": application,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// vote
pub(crate) fn log_vote(round_id: RoundId, vote: &VotingResult) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "vote",
                "data": [
                    {
                        "round_id": round_id,
                        "vote": vote,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// set payouts
pub(crate) fn log_payouts_set(round_id: &RoundId, payouts: &Vec<PayoutExternal>) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "payouts_set",
                "data": [
                    {
                        "round_id": round_id,
                        "payouts": payouts,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_payout_processed(payout: &PayoutExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "payout_processed",
                "data": [
                    {
                        "payout": payout,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_payouts_challenge_created(challenge: &PayoutsChallengeExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "payouts_challenge_created",
                "data": [
                    {
                        "challenge": challenge,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_payouts_challenge_removed(challenge: &PayoutsChallengeExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "payouts_challenge_removed",
                "data": [
                    {
                        "challenge": challenge,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_payouts_challenge_updated(challenge: &PayoutsChallengeExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "payouts_challenge_updated",
                "data": [
                    {
                        "challenge": challenge,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_vault_redistributed(
    round_id: &RoundId,
    redistribution_recipient: &AccountId,
    amount: &U128,
    memo: &Option<String>,
    redistributed_at: &TimestampMs,
    redistributed_by: &AccountId,
) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "vault_redistributed",
                "data": [
                    {
                        "round_id": round_id,
                        "redistribution_recipient": redistribution_recipient,
                        "amount": amount,
                        "memo": memo,
                        "redistributed_at": redistributed_at,
                        "redistributed_by": redistributed_by,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_protocol_fee_config_set(
    protocol_fee_recipient: &Option<AccountId>,
    protocol_fee_basis_points: &Option<u16>,
) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "protocol_fee_config_set",
                "data": [
                    {
                        "protocol_fee_recipient": protocol_fee_recipient,
                        "protocol_fee_basis_points": protocol_fee_basis_points,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

pub(crate) fn log_project_flagged(flag: &FlagDetail) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "project_flagged",
                "data": [
                    {
                        "flag": flag,
                    }
                ]
            })
        )
        .as_ref(),
    );
}