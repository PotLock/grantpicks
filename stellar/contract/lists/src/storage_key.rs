use soroban_sdk::Address;

use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    ContractOwner,
    ListsNumber,
    Lists(u128),
    ListAdmins(u128),
    OwnedList(Address),
    RegistrantList(Address),
    RegistrationsNumber,
    Registrations(u128),
    ListRegistration(u128),
    RegistrationsIDs(Address),
    Upvotes(u128),
    UserUpvotes(Address),
}
