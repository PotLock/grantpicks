use loam_sdk::soroban_sdk::{Address, BytesN, Env, String, Vec};

use crate::data_type::{
    ApplicationStatus, Pair, PickedPair, ProjectVotingResult, RoundApplicationExternal, RoundDetailExternal, UpdateRoundParams, VotingResult
};

pub trait IsRound {
    fn change_voting_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        round_start_time: u64,
        round_end_time: u64,
    );
    fn change_application_period(
        env: &Env,
        round_id: u128,
        caller: Address,
        round_application_start_time: u64,
        round_application_end_time: u64,
    );
    fn change_number_of_votes(env: &Env, round_id: u128, caller: Address, num_picks_per_voter: u32);
    fn change_amount(env: &Env, round_id: u128, caller: Address, amount: u128);
    fn close_voting_period(env: &Env, round_id: u128, caller: Address)->RoundDetailExternal;
    fn add_admin(env: &Env, round_id: u128, round_admin: Address);
    fn remove_admin(env: &Env, round_id: u128, round_admin: Address);
    fn transfer_round_ownership(env: &Env, round_id: u128, new_owner: Address);
    fn apply_to_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
        note: Option<String>,
        review_note: Option<String>,
    ) -> RoundApplicationExternal;
    fn review_application(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Address,
        status: ApplicationStatus,
        note: Option<String>,
    ) -> RoundApplicationExternal;
    fn deposit(env: &Env, round_id: u128, actor: Address, amount: u128);
    fn vote(env: &Env, round_id: u128, voter: Address, picks: Vec<PickedPair>);
    fn flag_voter(env: &Env, round_id: u128, admin: Address, voter: Address);
    fn unflag_voter(env: &Env, round_id: u128, admin: Address, voter: Address);
    fn add_approved_project(env: &Env, round_id: u128, admin: Address, project_ids: Vec<u128>);
    fn remove_approved_project(env: &Env, around_id: u128, dmin: Address, project_ids: Vec<u128>);
    fn get_results_for_round(env: &Env, round_id: u128) -> Vec<ProjectVotingResult>;
    fn trigger_payouts(env: &Env, round_id: u128, admin: Address);
    fn get_all_voters(
        env: &Env,
        round_id: u128,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<VotingResult>;
    fn can_vote(env: &Env, round_id: u128, voter: Address) -> bool;
    fn get_round(env: &Env, round_id: u128) -> RoundDetailExternal;
    fn is_voting_live(env: &Env, round_id: u128) -> bool;
    fn is_application_live(env: &Env, round_id: u128) -> bool;
    fn get_applications_for_round(
        env: &Env,
        round_id: u128,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<RoundApplicationExternal>;
    fn get_application(
        env: &Env,
        round_id: u128,
        applicant: Address,
    ) -> Option<RoundApplicationExternal>;
    fn is_payout_done(env: &Env, round_id: u128) -> bool;
    fn user_has_vote(env: &Env, round_id: u128, voter: Address) -> bool;
    fn total_funding(env: &Env, round_id: u128) -> u128;
    fn get_pair_to_vote(env: &Env, round_id: u128) -> Vec<Pair>;
    fn add_white_list(env: &Env, round_id: u128, admin: Address, address: Address);
    fn remove_from_white_list(env: &Env, round_id: u128, admin: Address, address: Address);
    fn whitelist_status(env: &Env, round_id: u128, address: Address) -> bool;
    fn blacklist_status(env: &Env, round_id: u128, address: Address) -> bool;
    fn get_pairs(env: &Env, round_id: u128, admin: Address) -> Vec<Pair>;
    fn get_pair_by_index(env: &Env, round_id: u128, index: u32) -> Pair;
    fn admins(env: &Env, round_id: u128) -> Vec<Address>;
    fn unapply_from_round(
        env: &Env,
        round_id: u128,
        caller: Address,
        applicant: Option<Address>,
    ) -> RoundApplicationExternal;
    fn update_applicant_note(
        env: &Env,
        round_id: u128,
        caller: Address,
        note: String,
    ) -> RoundApplicationExternal;
    fn change_allow_applications(
        env: &Env,
        round_id: u128,
        caller: Address,
        allow_applications: bool,
        start_ms: Option<u64>,
        end_ms: Option<u64>,
    ) -> RoundDetailExternal;
    fn update_round(env: &Env, caller: Address, round_id: u128, round_detail: UpdateRoundParams)->RoundDetailExternal;
    // fn delete_round(env: &Env, round_id: u128) -> RoundDetailExternal;
    fn apply_to_round_batch(
      env: &Env,
      caller: Address,
      round_id: u128,
      review_notes: Vec<Option<String>>,
      applicants: Vec<Address>,
  ) -> Vec<RoundApplicationExternal>;
}
