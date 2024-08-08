use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
  EmptyName = 1,
  EmptyOverview = 2,
  EmptyContacts = 3,
  EmptyAdmins = 4,
  EmptyImageUrl = 5,
  AdminOrOwnerOnly = 6,
  OwnerOnly = 7,
  ContractOwnerOnly = 8,
  AlreadyApplied = 9,
}