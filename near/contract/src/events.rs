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
pub(crate) fn log_deposit(round: &RoundDetailExternal, attached_deposit: U128, caller: &AccountId) {
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
                        "round": round,
                        "attached_deposit": attached_deposit,
                        "caller": caller,
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
