use crate::{
    admin_writer::is_admin, approval_writer::{is_project_approved, read_approved_projects}, config_writer::read_config, data_type::{CreateRoundParams, RoundDetail, UpdateRoundParams}, error::{ApplicationError, Error, RoundError, VoteError}, external::{ListsClient, ProjectRegistryClient, RegistrationStatus}, round_writer::read_round_info, utils::get_ledger_second_as_millis, voter_writer::is_blacklisted, voting_writer::get_voting_state_done
};
use soroban_sdk::{panic_with_error, Address, Env, String, Vec};

pub fn validate_round_detail(env: &Env, round_detail: &CreateRoundParams) {
    if round_detail.voting_start_ms > round_detail.voting_end_ms {
        panic_with_error!(env, RoundError::VotingStartGreaterThanVotingEnd);
    }

    if round_detail.allow_applications {
      if round_detail.application_start_ms.is_some() && round_detail.application_end_ms.is_some() {
        if round_detail.application_start_ms.unwrap() > round_detail.application_end_ms.unwrap() {
          panic_with_error!(env, RoundError::ApplicationStartGreaterThanApplicationEnd);
        }
      }else{
        panic_with_error!(env, RoundError::ApplicationPeriodNotSet);
      }
    }

    if round_detail.application_end_ms.is_some(){
      if round_detail.voting_start_ms < round_detail.application_end_ms.unwrap() {
        panic_with_error!(env, RoundError::VotingStartLessThanApplicationEnd);
      }
    }

    if round_detail.expected_amount == 0 {
        panic_with_error!(env, RoundError::AmountMustBeGreaterThanZero);
    }

    if round_detail.contacts.len() >= 10 {
        panic_with_error!(env, RoundError::ContactMustBeLessThanTen);
    }

    if round_detail.use_whitelist_voting.unwrap_or(false) {
        if round_detail.voting_wl_list_id.is_none() {
            panic_with_error!(env, RoundError::WhitelistIdNotSet)
        }
    }

    if round_detail.use_whitelist_application.unwrap_or(false) {
        if round_detail.application_wl_list_id.is_none() {
            panic_with_error!(env, RoundError::WhitelistIdNotSet)
        }
    }
}

pub fn validate_round_detail_update(env: &Env, round_detail: &UpdateRoundParams) {
    if round_detail.voting_start_ms > round_detail.voting_end_ms {
        panic_with_error!(env, RoundError::VotingStartGreaterThanVotingEnd);
    }

    if round_detail.allow_applications {
      if round_detail.application_start_ms.is_some() && round_detail.application_end_ms.is_some() {
        if round_detail.application_start_ms.unwrap() > round_detail.application_end_ms.unwrap() {
          panic_with_error!(env, RoundError::ApplicationStartGreaterThanApplicationEnd);
        }
      }else{
        panic_with_error!(env, RoundError::ApplicationPeriodNotSet);
      }
    }

    if round_detail.application_end_ms.is_some(){
      if round_detail.voting_start_ms < round_detail.application_end_ms.unwrap() {
        panic_with_error!(env, RoundError::VotingStartLessThanApplicationEnd);
      }
    }

    if round_detail.expected_amount == 0 {
        panic_with_error!(env, RoundError::AmountMustBeGreaterThanZero);
    }

    if round_detail.contacts.len() >= 10 {
        panic_with_error!(env, RoundError::ContactMustBeLessThanTen);
    }
}

pub fn validate_owner_or_admin(env: &Env, admin: &Address, round: &RoundDetail) {
    if round.owner != admin.clone() {
        if !is_admin(env, round.id, admin) {
            panic_with_error!(env, Error::OwnerOrAdminOnly);
        }
    }
}

pub fn validate_can_payout(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);

    if round.voting_start_ms > current_time {
        panic_with_error!(env, VoteError::VotingPeriodNotStarted);
    }

    if round.voting_end_ms > current_time {
        panic_with_error!(env, VoteError::VotingPeriodNotEnded);
    }
}

pub fn validate_vault_fund(env: &Env, round: &RoundDetail) {
    let vault_fund = round.current_vault_balance;

    if vault_fund == 0 {
        panic_with_error!(env, RoundError::InvalidVaultBalance);
    }
}

pub fn validate_voting_period(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);

    if current_time < round.voting_start_ms {
        panic_with_error!(env, VoteError::VotingPeriodNotStarted);
    }

    if current_time > round.voting_end_ms {
        panic_with_error!(env, VoteError::VotingPeriodEnded);
    }
}

pub fn validate_application_period(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);

    if round.allow_applications {
        if current_time < round.application_start_ms.unwrap() {
            panic_with_error!(env, ApplicationError::ApplicationPeriodNotStarted);
        }

        if current_time > round.application_end_ms.unwrap() {
            panic_with_error!(env, ApplicationError::ApplicationPeriodEnded);
        }
    }else{
        panic_with_error!(env, ApplicationError::ApplicationNotAllowed);
    }
}

pub fn validate_voting_not_started(env: &Env, round: &RoundDetail) {
    let current_time = get_ledger_second_as_millis(env);

    if current_time >= round.voting_start_ms {
        panic_with_error!(env, VoteError::VotingAlreadyStarted);
    }
}

pub fn validate_approved_projects(env: &Env, round_id: u128, project_id: u128) {
    let already_approved = is_project_approved(env, round_id, project_id);

    if !already_approved {
        panic_with_error!(env, ApplicationError::ProjectNotApproved);
    }
}

pub fn validate_not_approved_projects(env: &Env, round_id: u128, project_id: u128) {
    let already_approved = is_project_approved(env, round_id, project_id);

    if already_approved {
        panic_with_error!(env, ApplicationError::ProjectAlreadyApproved);
    }
}

pub fn validate_project_to_approve(env: &Env, round_id: u128, project_ids: &Vec<u128>) {
    let project_contract = read_config(env).project_contract;
    let project_client = ProjectRegistryClient::new(env, &project_contract);
    let total_projects: u128 = project_client.get_total_projects().into();

    project_ids.iter().for_each(|project_id| {
        if project_id > total_projects {
            panic_with_error!(env, ApplicationError::ProjectNotFoundInRegistry);
        }

        validate_not_approved_projects(env, round_id, project_id);
    });
}

pub fn validate_max_participants(env: &Env, round: &RoundDetail, project_ids: &Vec<u128>) {
    let approved_project = read_approved_projects(env, round.id);

    if approved_project.len() + project_ids.len() > round.max_participants {
        panic_with_error!(env, ApplicationError::MaxParticipantsReached);
    }
}

pub fn validate_max_participant(env: &Env, round: &RoundDetail) {
    let approved_project = read_approved_projects(env, round.id);

    if approved_project.len() >= round.max_participants {
        panic_with_error!(env, ApplicationError::MaxParticipantsReached);
    }
}

pub fn validate_has_voted(env: &Env, round_id: u128, voter: &Address) {
    let state = get_voting_state_done(env, round_id, voter.clone());

    if state {
        panic_with_error!(env, VoteError::AlreadyVoted);
    }
}

pub fn validate_number_of_votes(env: &Env, required: u32, voted: u32) {
    if required != voted {
        panic_with_error!(env, VoteError::NotVoteAllPairs);
    }
}

pub fn validate_blacklist(env: &Env, round_id: u128, voter: &Address) {
    let is_blacklisted = is_blacklisted(env, round_id, voter.clone());

    if is_blacklisted {
        panic_with_error!(env, RoundError::UserBlacklisted);
    }
}

pub fn validate_not_blacklist(env: &Env, round_id: u128, voter: &Address) {
    let is_blacklisted = is_blacklisted(env, round_id, voter.clone());

    if !is_blacklisted {
        panic_with_error!(env, RoundError::BlacklistNotFound);
    }
}

pub fn validate_voting_whitelist(env: &Env, round_id: u128, voter: &Address) {
    let round = read_round_info(env, round_id);
    let list_id = round.voting_wl_list_id.unwrap();
    let list_contract = read_config(env).list_contract;
    let list_client = ListsClient::new(env, &list_contract);
    let is_whitelisted = list_client.is_registered(&Some(list_id), &voter, &Some(RegistrationStatus::Approved));
    if !is_whitelisted {
        panic_with_error!(env, RoundError::UserNotWhitelisted);
    }
}

pub fn validate_application_whitelist(env: &Env, round_id: u128, applicant: &Address) {
    let round = read_round_info(env, round_id);
    let list_id = round.application_wl_list_id.unwrap();
    let list_contract = read_config(env).list_contract;
    let list_client = ListsClient::new(env, &list_contract);
    let is_whitelisted = list_client.is_registered(&Some(list_id), &applicant, &Some(RegistrationStatus::Approved));
    if !is_whitelisted {
        panic_with_error!(env, RoundError::UserNotWhitelisted);
    }
}

pub fn validate_review_notes(env: &Env, notes: &String) {
    if notes.len() > 300 {
        panic_with_error!(env, RoundError::ReviewNotTooLong);
    }
}

pub fn validate_pick_per_votes(env: &Env, num_picks_per_voter: u32) {
    if num_picks_per_voter < 1 {
        panic_with_error!(env, VoteError::EmptyVote);
    }

    if num_picks_per_voter > 10 {
        panic_with_error!(env, VoteError::TooManyVotes);
    }
}

pub fn validate_specify_applicant(env: &Env, is_owner_or_admin: bool) {
    if !is_owner_or_admin {
        panic_with_error!(env, Error::OwnerOrAdminOnly);
    }
}
