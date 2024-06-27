#![no_std]

pub(crate) use loam_sdk::soroban_sdk;

mod application_writer;
mod approval_writer;
mod calculation;
mod data_type;
mod events;
mod funding_writer;
mod internal;
mod methods;
mod pair;
mod project_registry_writer;
mod round_writer;
mod storage;
mod storage_key;
mod test;
mod token_writer;
mod voter_writer;
mod voting_writer;

pub use crate::internal::Round;

smartdeploy_sdk::core_riff!();
