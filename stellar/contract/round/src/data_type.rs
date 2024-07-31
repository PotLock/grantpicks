use loam_sdk::soroban_sdk::Env;

use crate::{
    admin_writer::is_admin,
    payout_writer::{read_payout_challenges},
    soroban_sdk::{self, contracttype, Address, String, Vec},
    utils::get_ledger_second_as_millis,
};

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub enum ApplicationStatus {
    Pending,
    Approved,
    Rejected,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Config {
    pub owner: Address,
    pub protocol_fee_recipient: Address,
    pub protocol_fee_basis_points: u32,
    pub default_page_size: u64,
}

//Note: Whitelist And Blacklist In Different Storage
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundDetailInternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub current_vault_balance: u128,
    pub vault_total_deposits: u128,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub allow_applications: bool,
    pub is_video_required: bool,
    pub cooldown_period_ms: Option<u64>,
    pub cooldown_end_ms: Option<u64>,
    pub compliance_req_desc: String, // too long on stellar
    pub compliance_period_ms: Option<u64>,
    pub compliance_end_ms: Option<u64>,
    pub allow_remaining_dist: Option<bool>,
    pub remaining_dist_address: Address,
    pub remaining_dist_at_ms: Option<u64>,
    pub remaining_dist_memo: String,
    pub remaining_dist_by: Address,
    pub referrer_fee_basis_points: Option<u32>,
    pub round_complete_ms: Option<u64>,
}



#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundDetailExternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub owner: Address,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub use_whitelist: bool,
    pub num_picks_per_voter: u32,
    pub max_participants: u32,
    pub allow_applications: bool,
    pub is_video_required: bool,
    pub cooldown_period_ms: Option<u64>,
    pub cooldown_end_ms: Option<u64>,
    pub compliance_req_desc: String, // too long on stellar
    pub compliance_period_ms: Option<u64>,
    pub compliance_end_ms: Option<u64>,
    pub round_complete_ms: Option<u64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct CreateRoundParams {
    pub owner: Address,
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub admins: Vec<Address>,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
    pub cooldown_period_ms: Option<u64>,
    pub cooldown_end_ms: Option<u64>,
    pub compliance_req_desc: String, // too long on stellar
    pub compliance_period_ms: Option<u64>,
    pub compliance_end_ms: Option<u64>,
    pub allow_remaining_dist: bool,
    pub remaining_dist_address: Address,
    pub referrer_fee_basis_points: Option<u32>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct UpdateRoundParams {
    pub name: String,
    pub description: String,
    pub contacts: Vec<Contact>,
    pub voting_start_ms: u64,
    pub voting_end_ms: u64,
    pub application_start_ms: Option<u64>,
    pub application_end_ms: Option<u64>,
    pub expected_amount: u128,
    pub use_whitelist: Option<bool>,
    pub num_picks_per_voter: Option<u32>,
    pub max_participants: Option<u32>,
    pub allow_applications: bool,
    pub is_video_required: bool,
}

//Note: use String for Option<String>. soroban SDK not allow Option<soroban_sdk::String>
#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct RoundApplicationInternal {
    pub project_id: u128,
    pub applicant_id: Address,
    pub applicant_note: String,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct RoundApplicationExternal {
    pub project_id: u128,
    pub applicant_id: Address,
    pub applicant_note: String,
    pub status: ApplicationStatus,
    pub review_note: String,
    pub submited_ms: u64,
    pub updated_ms: Option<u64>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Pair {
    pub pair_id: u32,
    pub projects: Vec<u128>,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickedPair {
    pub pair_id: u32,
    pub voted_project_id: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PickResult {
    pub pair_id: u32,
    pub project_id: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct VotingResult {
    pub voter: Address,
    pub picks: Vec<PickResult>,
    pub voted_ms: u64,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct ProjectVotingResult {
    pub project_id: u128,
    pub voting_count: u128,
    pub allocation: u128,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct Contact {
    pub name: String,
    pub value: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct PayoutInternal {
    pub id: u32,
    pub round_id: u128,
    pub recipient_id: Address,
    pub amount: i128,
    pub paid_at_ms: Option<u64>,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PayoutExternal {
    pub id: u32,
    pub round_id: u128,
    pub recipient_id: Address,
    pub amount: i128,
    pub paid_at_ms: Option<u64>,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PayoutInput {
    pub recipient_id: Address,
    pub amount: i128,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct PayoutsChallengeInternal {
    pub created_at: u64,
    pub reason: String,
    pub admin_notes: String,
    pub resolved: bool,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct PayoutsChallengeExternal {
    pub challenger_id: Address,
    pub round_id: u128,
    pub created_at: u64,
    pub reason: String,
    pub admin_notes: String,
    pub resolved: bool,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq)]
pub struct DepositInternal {
    pub round_id: u128,
    pub depositor_id: Address,
    pub total_amount: i128,
    pub protocol_fee: i128,
    pub referrer_fee: i128,
    pub net_amount: i128,
    pub deposited_at: u64,
    pub memo: String,
}

#[contracttype]
#[derive(Clone, Eq, PartialEq, Debug)]
pub struct DepositExternal {
    pub deposit_id: u128,
    pub round_id: u128,
    pub depositor_id: Address,
    pub total_amount: i128,
    pub protocol_fee: i128,
    pub referrer_fee: i128,
    pub net_amount: i128,
    pub deposited_at: u64,
    pub memo: String,
}

impl DepositInternal {
    pub fn to_external(&self, deposit_id: u128) -> DepositExternal {
        DepositExternal {
            deposit_id,
            round_id: self.round_id,
            depositor_id: self.depositor_id.clone(),
            total_amount: self.total_amount,
            protocol_fee: self.protocol_fee,
            referrer_fee: self.referrer_fee,
            net_amount: self.net_amount,
            deposited_at: self.deposited_at,
            memo: self.memo.clone(),
        }
    }
}

impl RoundDetailInternal {
    pub fn to_external(&self) -> RoundDetailExternal {
        let contacts = self.contacts.clone();
        RoundDetailExternal {
            id: self.id,
            owner: self.owner.clone(),
            name: self.name.clone(),
            description: self.description.clone(),
            contacts,
            allow_applications: self.allow_applications,
            application_start_ms: self.application_start_ms,
            application_end_ms: self.application_end_ms,
            voting_start_ms: self.voting_start_ms,
            voting_end_ms: self.voting_end_ms,
            use_whitelist: self.use_whitelist,
            expected_amount: self.expected_amount,
            num_picks_per_voter: self.num_picks_per_voter,
            max_participants: self.max_participants,
            is_video_required: self.is_video_required,
            cooldown_period_ms: self.cooldown_period_ms,
            cooldown_end_ms: self.cooldown_end_ms,
            compliance_req_desc: self.compliance_req_desc.clone(),
            compliance_period_ms: self.compliance_period_ms,
            compliance_end_ms: self.compliance_end_ms,
            round_complete_ms: self.round_complete_ms,
        }
    }

    pub fn is_caller_owner_or_admin(&self, env: &Env, caller: &Address) -> bool {
        self.owner == caller.clone() || is_admin(env, self.id, caller)
    }

    pub fn assert_cooldown_period_complete(&self, env: &Env) {
        if self.cooldown_end_ms.is_some() {
            assert!(self.cooldown_end_ms.unwrap() > get_ledger_second_as_millis(env));
        }
    }

    pub fn calculate_referrer_fee(&self, amount: u128) -> Option<u128> {
        if let Some(referrer_fee_basis_points) = self.referrer_fee_basis_points {
            let total_basis_points = 10_000u128;
            let fee_amount = (referrer_fee_basis_points as u128).saturating_mul(amount);
            // Round up
            Some(fee_amount.div_ceil(total_basis_points))
        } else {
            None
        }
    }

    pub fn assert_all_payouts_challenges_resolved(&self, env: &Env) {
        let payouts_clallenges_for_round = read_payout_challenges(env, self.id);
        if !payouts_clallenges_for_round.is_empty() {
            payouts_clallenges_for_round
                .iter()
                .for_each(|(challenger_id, data)| {
                    assert!(
                        data.resolved,
                        "Payouts challenge from challenger {:?} is not resolved",
                        challenger_id.to_string()
                    );
                });
        }
    }

    pub fn assert_cooldown_period_in_process(&self, env: &Env) {
        if self.cooldown_period_ms.is_some() {
            assert!(
                self.cooldown_end_ms.unwrap_or(0) > get_ledger_second_as_millis(env),
                "Cooldown period is not in process"
            );
        }
    }

    pub fn assert_compliance_period_complete(&self, env: &Env) {
        assert!(
            self.compliance_end_ms.unwrap_or(0) < get_ledger_second_as_millis(env),
            "Compliance period has not ended yet"
        );
    }
}

impl RoundApplicationInternal {
    pub fn to_external(&self) -> RoundApplicationExternal {
        RoundApplicationExternal {
            applicant_id: self.applicant_id.clone(),
            applicant_note: self.applicant_note.clone(),
            project_id: self.project_id,
            review_note: self.review_note.clone(),
            status: self.status.clone(),
            submited_ms: self.submited_ms,
            updated_ms: self.updated_ms,
        }
    }
}

impl PayoutInternal {
    pub fn to_external(&self) -> PayoutExternal {
        PayoutExternal {
            amount: self.amount,
            paid_at_ms: self.paid_at_ms,
            id: self.id,
            recipient_id: self.recipient_id.clone(),
            round_id: self.round_id,
            memo: self.memo.clone(),
        }
    }
}

impl PayoutsChallengeInternal {
    pub fn to_external(&self, round_id: u128, challenger_id: &Address) -> PayoutsChallengeExternal {
        PayoutsChallengeExternal {
            challenger_id: challenger_id.clone(),
            round_id,
            created_at: self.created_at,
            reason: self.reason.clone(),
            admin_notes: self.admin_notes.clone(),
            resolved: self.resolved,
        }
    }
}
