use crate::soroban_sdk::{self, contracttype};

#[contracttype]
#[derive(Clone)]
pub enum ContractKey {
    ContractOwner,
    ListsNumber,
    Lists,
    ListAdmins,
    OwnedList,
    RegistrantList,
    RegistrationsNumber,
    Registrations,
    ListRegistration,
    RegistrationsIDs,
    Upvotes,
    UserUpvotes,
}
