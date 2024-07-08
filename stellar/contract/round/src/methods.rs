use crate::data_type::{
    ApplicationStatus, CreateRoundParams, Pair, PickedPair, ProjectApplication,
    ProjectVotingResult, RoundDetail, VotingResult,
};
use loam_sdk::soroban_sdk::{Address, BytesN, Env, String, Vec};

pub trait RoundTrait {
    fn initialize(
        env: &Env,
        owner: Address,
        token_address: Address,
        registry_address: Address,
        round_detail: CreateRoundParams,
    );
    fn change_voting_period(env: &Env, admin: Address, round_start_time: u64, round_end_time: u64);
    fn change_application_period(
        env: &Env,
        admin: Address,
        round_application_start_time: u64,
        round_application_end_time: u64,
    );
    fn change_number_of_votes(env: &Env, admin: Address, num_picks_per_voter: u32);
    fn change_amount(env: &Env, admin: Address, amount: u128);
    fn complete_vote(env: &Env, admin: Address);
    fn add_admin(env: &Env, admin: Address, round_admin: Address);
    fn remove_admin(env: &Env, admin: Address, round_admin: Address);
    fn transfer_ownership(env: &Env, owner: Address, new_owner: Address);
    fn apply_project(env: &Env, project_id: u128, applicant: Address) -> u128;
    fn review_application(
        env: &Env,
        admin: Address,
        application_id: u128,
        status: ApplicationStatus,
        note: Option<String>,
    );
    fn deposit(env: &Env, actor: Address, amount: u128);
    fn vote(env: &Env, voter: Address, picks: Vec<PickedPair>);
    fn flag_voter(env: &Env, admin: Address, voter: Address);
    fn unflag_voter(env: &Env, admin: Address, voter: Address);
    fn add_approved_project(env: &Env, admin: Address, project_ids: Vec<u128>);
    fn remove_approved_project(env: &Env, admin: Address, project_ids: Vec<u128>);
    fn calculate_results(env: &Env) -> Vec<ProjectVotingResult>;
    fn trigger_payouts(env: &Env, admin: Address);
    fn get_all_voters(env: &Env, skip: Option<u64>, limit: Option<u64>) -> Vec<VotingResult>;
    fn can_vote(env: &Env, voter: Address) -> bool;
    fn round_info(env: &Env) -> RoundDetail;
    fn is_voting_live(env: &Env) -> bool;
    fn is_application_live(env: &Env) -> bool;
    fn get_all_applications(
        env: &Env,
        skip: Option<u64>,
        limit: Option<u64>,
    ) -> Vec<ProjectApplication>;
    fn is_payout_done(env: &Env) -> bool;
    fn user_has_vote(env: &Env, voter: Address) -> bool;
    fn total_funding(env: &Env) -> u128;
    fn get_pair_to_vote(env: &Env) -> Vec<Pair>;
    fn add_white_list(env: &Env, admin: Address, address: Address);
    fn remove_from_white_list(env: &Env, admin: Address, address: Address);
    fn whitelist_status(env: &Env, address: Address) -> bool;
    fn blacklist_status(env: &Env, address: Address) -> bool;
    fn get_pairs(env: &Env, admin: Address) -> Vec<Pair>;
    fn get_pair_by_index(env: &Env, index: u32) -> Pair;
    fn upgrade(env: &Env, owner: Address, new_wasm_hash: BytesN<32>);
    fn admins(env: &Env) -> Vec<Address>;
}
