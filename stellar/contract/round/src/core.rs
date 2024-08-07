use soroban_sdk::{Address, Env, String, Vec};

use crate::data_type::{
    ApplicationStatus, Deposit, Pair, Payout, PayoutInput, PayoutsChallenge, PickedPair,
    ProjectVotingResult, RoundApplication, RoundDetail, UpdateRoundParams, VotingResult,
};

pub trait IsRound {
    fn set_cooldown_config(
        env: &Env,
        round_id: u128,
        caller: Address,
        cooldown_period_ms: Option<u64>,
    ) -> RoundDetail;
    fn set_compliance_config(
        env: &Env,
        round_id: u128,
        caller: Address,
        compliance_req_desc: Option<String>,
        compliance_period_ms: Option<u64>,
    ) -> RoundDetail;
    fn change_voting_period(env: &Env, round_id: u128, caller: Address, start_ms: u64, end_ms: u64);
    fn change_application_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        start_ms: u64,
        end_ms: u64,
    );
    fn change_number_of_votes(env: &Env, round_id: u128, caller: Address, num_picks_per_voter: u32);
    fn change_expected_amount(env: &Env, round_id: u128, caller: Address, amount: u128);
    fn close_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
    fn start_voting_period(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
    fn add_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
    fn remove_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
    fn set_admins(env: &Env, round_id: u128, round_admin: Vec<Address>);
    fn clear_admins(env: &Env, round_id: u128);
    fn transfer_round_ownership(env: &Env, round_id: u128, new_owner: Address);
    fn apply_to_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
        note: Option<String>,
        review_note: Option<String>,
    ) -> RoundApplication;
    fn review_application(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Address,
        status: ApplicationStatus,
        note: Option<String>,
    ) -> RoundApplication;
    fn deposit_to_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        amount: u128,
        memo: Option<String>,
        referrer_id: Option<Address>,
    );
    fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>);
    fn flag_voter(env: &Env, round_id: u128, caller: Address, voter: Address);
    fn unflag_voter(env: &Env, round_id: u128, caller: Address, voter: Address);
    fn add_approved_project(env: &Env, round_id: u128, caller: Address, project_ids: Vec<u128>);
    fn remove_approved_project(env: &Env, around_id: u128, caller: Address, project_ids: Vec<u128>);
    fn process_payouts(env: &Env, round_id: u128, caller: Address);
    fn set_round_complete(env: &Env, round_id: u128, caller: Address) -> RoundDetail;
    fn challenge_payouts(
        env: &Env,
        round_id: u128,
        caller: Address,
        reason: String,
    ) -> PayoutsChallenge;
    fn remove_payouts_challenge(env: &Env, round_id: u128, caller: Address);
    fn update_payouts_challenge(
        env: &Env,
        round_id: u128,
        caller: Address,
        challenger_id: Address,
        notes: Option<String>,
        resolve_challenge: Option<bool>,
    ) -> PayoutsChallenge;
    fn remove_resolved_challenges(env: &Env, round_id: u128, caller: Address);
    fn set_payouts(
        env: &Env,
        round_id: u128,
        caller: Address,
        payouts: Vec<PayoutInput>,
        clear_existing: bool,
    ) -> Vec<Payout>;
    fn redistribute_vault(env: &Env, round_id: u128, caller: Address, memo: Option<String>);
    fn unapply_from_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
    ) -> RoundApplication;
    fn update_applicant_note(
        env: &Env,
        round_id: u128,
        caller: Address,
        note: String,
    ) -> RoundApplication;
    fn change_allow_applications(
        env: &Env,
        round_id: u128,
        caller: Address,
        allow_applications: bool,
        start_ms: Option<u64>,
        end_ms: Option<u64>,
    ) -> RoundDetail;
    fn update_round(
        env: &Env,
        caller: Address,
        round_id: u128,
        round_detail: UpdateRoundParams,
    ) -> RoundDetail;
    fn delete_round(env: &Env, round_id: u128) -> RoundDetail;
    fn apply_to_round_batch(
        env: &Env,
        caller: Address,
        round_id: u128,
        review_notes: Vec<Option<String>>,
        applicants: Vec<Address>,
    ) -> Vec<RoundApplication>;
    fn add_whitelist(env: &Env, round_id: u128, caller: Address, address: Address);
    fn remove_from_whitelist(env: &Env, round_id: u128, caller: Address, address: Address);

    fn get_payouts(env: &Env, from_index: Option<u64>, limit: Option<u64>) -> Vec<Payout>;
    fn get_all_voters(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<VotingResult>;
    fn can_vote(env: &Env, round_id: u128, voter: Address) -> bool;
    fn get_round(env: &Env, round_id: u128) -> RoundDetail;
    fn is_voting_live(env: &Env, round_id: u128) -> bool;
    fn is_application_live(env: &Env, round_id: u128) -> bool;
    fn get_applications_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundApplication>;
    fn get_application(env: &Env, round_id: u128, applicant: Address) -> Option<RoundApplication>;
    fn is_payout_done(env: &Env, round_id: u128) -> bool;
    fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool;
    fn total_funding(env: &Env, round_id: u128) -> u128;
    fn get_pairs_to_vote(env: &Env, round_id: u128) -> Vec<Pair>;
    fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool;
    fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool;
    fn get_all_pairs_for_round(env: &Env, round_id: u128) -> Vec<Pair>;
    fn get_pair_by_index(env: &Env, round_id: u128, index: u32) -> Pair;
    fn admins(env: &Env, round_id: u128) -> Vec<Address>;
    fn get_payouts_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Payout>;
    fn get_payout(env: &Env, payout_id: u32) -> Payout;
    fn get_deposits_for_round(
        env: &Env,
        round_id: u128,
        from_index: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<Deposit>;
    fn get_results_for_round(env: &Env, round_id: u128) -> Vec<ProjectVotingResult>;
    fn blacklisted_voters(env: &Env, round_id: u128) -> Vec<Address>;
    fn whitelisted_voters(env: &Env, round_id: u128) -> Vec<Address>;
}
