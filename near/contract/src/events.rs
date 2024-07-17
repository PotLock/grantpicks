use crate::*;

/// create round
pub(crate) fn log_create_round(round_detail: &RoundDetail) {
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
pub(crate) fn log_update_round(round_detail: &RoundDetail) {
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
