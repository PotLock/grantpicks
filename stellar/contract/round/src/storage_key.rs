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
    RoundInfo(u128),
    PayoutInfo,
    DepositInfo,
    WhiteList(u128),
    BlackList(u128),
    ProjectApplicants(u128),
    ApprovedProjects(u128),
    Payouts(u128),
    PayoutChallenges(u128),
    VotingState(u128),
    Votes(u128),
    ProjectVotingCount(u128),
    Admin(u128),
    Deposit(u128),
}
