use crate::*;

/// create round
pub(crate) fn log_create_round(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "c_round",
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
pub(crate) fn log_update_round(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "u_round",
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
pub(crate) fn log_delete_round(round_detail: &RoundDetailExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "d_round",
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
pub(crate) fn log_create_application(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "c_app",
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
pub(crate) fn log_update_application(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "u_app",
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
pub(crate) fn log_delete_application(application: &RoundApplicationExternal) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "d_app",
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
pub(crate) fn log_vote(vote: &VotingResult) {
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
                        "vote": vote,
                    }
                ]
            })
        )
        .as_ref(),
    );
}

/// set payouts
pub(crate) fn log_set_payouts(payouts: &Vec<PayoutExternal>) {
    env::log_str(
        format!(
            "{}{}",
            EVENT_JSON_PREFIX,
            json!({
                "standard": "potlock",
                "version": "1.0.0",
                "event": "set_payouts",
                "data": [
                    {
                        "payouts": payouts,
                    }
                ]
            })
        )
        .as_ref(),
    );
}
