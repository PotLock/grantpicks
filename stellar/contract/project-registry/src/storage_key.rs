use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    NumOfProjects,
    Projects,
    RegistryAdmin,
}
