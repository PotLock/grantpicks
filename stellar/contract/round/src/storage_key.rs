use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    ProtocolFeeRecepient, // FEE_RECIPIENT
    ProtocolFee,          // FEE
    DefaultPageSize,      // DEFAULT_PAGE_SIZE
    FactoryOwner,
    NextRoundId,
    NextPayoutId,
    NextDepositId,
    ProjectPayoutIds,
    TokenContract,
    ProjectContract,
    VotedRoundIds,
    PayoutInfo(u128),
    DepositInfo(u128),
    RoundInfo(u128),
    WhiteList(u128),
    BlackList(u128),
    ProjectApplicants(u128),
    ApprovedProjects(u128),
    FlaggedProjects(u128),
    Payouts(u128),
    PayoutChallenges(u128),
    VotingState(u128),
    Votes(u128),
    ProjectVotingCount(u128),
    Admin(u128),
    Deposit(u128),
}
