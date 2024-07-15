use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    FactoryOwner,
    RoundNumber,
    TokenContract,
    ProjectContract,
    RoundInfo(u128),
    WhitelistAndBlacklist(u128),
    ProjectApplicants(u128),
    ApprovedProjects(u128),
    ApplicationNumber(u128),
    VotingState(u128),
    Votes(u128),
    ProjectVotingCount(u128),
    Admin(u128),
}
