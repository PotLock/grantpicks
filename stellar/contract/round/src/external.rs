use soroban_sdk::{self, contractclient, contracttype, Address, Env, String, Vec};

#[contractclient(name = "ProjectRegistryClient")]
pub trait ProjectRegistryTrait {
    fn get_precheck(env: &Env, applicant: Address) -> Option<RoundPreCheck>;
    fn get_precheck_by_id(env: &Env, project_id: u128) -> Option<RoundPreCheck>;
    fn get_total_projects(env: &Env) -> u32;
}


#[contracttype]
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RoundPreCheck {
    pub project_id: u128,
    pub has_video: bool,
    pub applicant: Address,
}

#[contractclient(name = "ListsClient")]
pub trait ListsTrait {
  // TO check KYC status of a registrant
  fn is_registered(
    env: &Env,
    list_id: Option<u128>,
    registrant_id: Address,
    required_status: Option<RegistrationStatus>, // defaults to Approved
  ) -> bool;
  // TO get a list by its ID: to confirm it exists.
  fn get_list(env: &Env, list_id: u128) -> ListExternal;
}
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
