use loam_sdk::soroban_sdk::{self, contracttype, Address, String, Vec};

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub enum RegistrationStatus {
    Pending,
    Approved,
    Rejected,
    Graylisted,
    Blacklisted,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub struct ListInternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub cover_image_url: String,
    pub owner: Address,
    pub created_ms: u64,
    pub updated_ms: u64,
    pub default_registration_status: RegistrationStatus,
    pub admin_only_registration: bool,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub struct RegistrationInternal {
    pub id: u128,
    pub list_id: u128,
    pub registrant_id: Address,
    pub status: RegistrationStatus,
    pub submited_ms: u64,
    pub updated_ms: u64,
    pub admin_notes: String,
    pub registrant_notes: String,
    pub registered_by: Address,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub struct ListExternal {
    pub id: u128,
    pub name: String,
    pub description: String,
    pub cover_img_url: String,
    pub owner: Address,
    pub admins: Vec<Address>,
    pub created_ms: u64,
    pub updated_ms: u64,
    pub default_registration_status: RegistrationStatus,
    pub admin_only_registrations: bool,
    pub total_registrations_count: u64,
    pub total_upvotes_count: u64,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub struct RegistrationExternal {
    pub id: u128,
    pub registrant_id: Address,
    pub list_id: u128,
    pub status: RegistrationStatus,
    pub submitted_ms: u64,
    pub updated_ms: u64,
    pub admin_notes: String,
    pub registrant_notes: String,
    pub registered_by: Address,
}

#[contracttype]
#[derive(Debug, Clone, PartialEq)]
pub struct RegistrationInput {
    pub registrant: Address,
    pub status: RegistrationStatus,
    pub submitted_ms: Option<u64>,
    pub updated_ms: Option<u64>,
    pub notes: String,
}
