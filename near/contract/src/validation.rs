use crate::*;

pub(crate) fn validate_round_detail(round_detail: &RoundDetail) {
    if round_detail.allow_applications {
        if let Some(application_start_ms) = round_detail.application_start_ms {
            // must be less than application end time
            assert!(
                application_start_ms
                    < round_detail.application_end_ms.expect(
                        "Application end time must be provided if allow_applications is true"
                    ),
                "Application start time must be less than application end time"
            );
        } else {
            panic!("Application start time must be provided if allow_applications is true");
        }
        if let Some(application_end_ms) = round_detail.application_end_ms {
            assert!(
                round_detail.voting_start_ms >= application_end_ms,
                "Round start time must be greater than or equal round application end time"
            );
            // don't need to verify it is greater than application start time, as that is already done
        } else {
            panic!("Application end time must be provided if allow_applications is true");
        }
    } else {
        // if applications are not allowed, then application start and end times should not be provided
        assert!(
            round_detail.application_start_ms.is_none(),
            "Application start time must not be provided if allow_applications is false"
        );
        assert!(
            round_detail.application_end_ms.is_none(),
            "Application end time must not be provided if allow_applications is false"
        );
    }
    assert!(
        round_detail.voting_start_ms < round_detail.voting_end_ms,
        "Round start time must be less than round end time"
    );

    assert!(
        round_detail.expected_amount.0 > 0,
        "Expected Amount must be greater than 0"
    );

    // TODO: validate that voting hasn't already started before changing start time
    // TODO: can voting be ended early? e.g. after voting has started, can the end time be moved forward, or can it only be extended?

    // TODO: verify whether this assertion is correct
    // assert!(
    //     round_detail.contacts.len() <= 10,
    //     "Contact must be less than 10"
    // );
}
