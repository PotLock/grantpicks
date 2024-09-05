use soroban_sdk::contracterror;


#[allow(clippy::module_name_repetitions)]
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
  NameCannotBeEmpty = 1,
  DescriptionTooLong = 2,
  CoverImageUrlTooLong = 3,
  InvalidListId = 4,
  AlreadyUpvoted = 5,
  NotUpvoted = 6,
  ContractOwnerOnly = 7,
  AdminNotFound = 8,
  ListNotFound = 9,
  AdminAlreadyExists = 10,
  AdminDoesNotExist = 11,
  NoteRequired = 12,
  RegistrationsRequired = 13,
  RegistrationNotFound = 14,
  AdminOrOwnerOnly = 15,
  AlreadyInitialized = 16,
  InvalidRegistrationId = 17,
}