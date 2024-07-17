use crate::*;

pub(crate) fn validate_round_detail(round_detail: &RoundDetail) {
    assert!(
        round_detail.voting_start_ms < round_detail.voting_end_ms,
        "Round start time must be less than round end time"
    );

    assert!(
        round_detail.application_start_ms <= round_detail.application_end_ms,
        "Round application start time must be less than equal round application end time"
    );

    assert!(
        round_detail.voting_start_ms >= round_detail.application_end_ms,
        "Round start time must be greater than or equal round application end time"
    );

    assert!(
        round_detail.expected_amount.0 > 0,
        "Expected Amount must be greater than 0"
    );

    // TODO: verify whether this assertion is correct
    // assert!(
    //     round_detail.contacts.len() <= 10,
    //     "Contact must be less than 10"
    // );
}
