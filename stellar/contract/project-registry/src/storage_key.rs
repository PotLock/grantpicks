use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    NumOfProjects,
    Projects,
    Project(u128),
    RegistryAdmin,
    ApplicantToProjectID,
}
