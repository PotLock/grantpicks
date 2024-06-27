use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    RoundNumber,
    Rounds,
    Admin,
    Owner,
    Wasm,
    TokenContract,
    ProjectContract,
}
