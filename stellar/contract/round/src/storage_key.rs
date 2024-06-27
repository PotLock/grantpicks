use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    RoundInfo,
    WhitelistAndBlacklist,
    ProjectApplicants,
    ApprovedProjects,
    ApplicationNumber,
    TokenContract,
    ProjectContract,
    TotalFunding,
    VotingState,
    Votes,
    ProjectVotingCount,
}
