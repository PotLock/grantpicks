use soroban_sdk::contracterror;

#[allow(clippy::module_name_repetitions)]
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    OwnerOrAdminOnly = 5,
    ContractNotInitialized = 26,
    InsufficientBalance = 31,
    IndexOutOfBound = 32,
    SameOwner = 38,
    DataNotFound = 52,
    AlreadyInitialized = 57,
}

#[allow(clippy::module_name_repetitions)]
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum RoundError {
    VotingStartGreaterThanVotingEnd = 0,
    ApplicationStartGreaterThanApplicationEnd = 1,
    VotingStartLessThanApplicationEnd = 2,
    AmountMustBeGreaterThanZero = 3,
    ContactMustBeLessThanTen = 4,
    InvalidVaultBalance = 8,
    UserBlacklisted = 19,
    UserAlreadyBlacklisted = 20,
    BlacklistNotFound = 21,
    UserNotWhitelisted = 22,
    ReviewNotTooLong = 23,
    RoundAlreadyCompleted = 27,
    AdminNotFound = 28,
    OwnerCannotBeAdmin = 29,
    AlreadyPaidOut = 34,
    NoApprovedProjects = 35,
    UserWhitelisted = 36,
    VotesAlreadyCast = 37,
    ApplicationPeriodMustBeSet = 39,
    ZeroValutBalance = 40,
    BalanceNotEmpty = 41,
    InsufficientFunds = 44,
    ChallengeNotFound = 45,
    PayoutNotFound = 46,
    RedistributionNotAllowed = 47,
    RedistributionAlreadyDone = 48,
    CompliancePeriodInProcess = 49,
    CooldownPeriodNotInProcess = 50,
    NotSolveAllPayoutChallenge = 51,
    RoundDoesNotUseVault = 53,
    ApplicationPeriodNotSet = 55,
    CoolDownPeriodNotComplete = 56,
}

#[allow(clippy::module_name_repetitions)]
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VoteError {
    VotingPeriodNotStarted = 6,
    VotingPeriodEnded = 7,
    VotingPeriodNotEnded = 9,
    VotingAlreadyStarted = 12,
    AlreadyVoted = 17,
    NotVoteAllPairs = 18,
    EmptyVote = 24,
    TooManyVotes = 25,
    ProjectNotInPair = 33,
    TooManyVotesForAvailablePairs = 60,
}

#[allow(clippy::module_name_repetitions)]
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ApplicationError {
    ApplicationPeriodNotStarted = 10,
    ApplicationPeriodEnded = 11,
    ProjectNotApproved = 13,
    ProjectAlreadyApproved = 14,
    ProjectNotFoundInRegistry = 15,
    MaxParticipantsReached = 16,
    ApplicationNotFound = 30,
    VideoUrlNotValid = 42,
    ProjectAlreadyApplied = 43,
    ApplicationNotAllowed = 54,
}
