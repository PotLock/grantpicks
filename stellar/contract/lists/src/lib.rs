#![no_std]

pub(crate) use loam_sdk::soroban_sdk;

mod data_type;
mod events;
mod internal;
mod lists_writer;
mod methods;
mod owner_writer;
mod registration_writer;
mod storage;
mod storage_key;
mod test;
mod upvotes_writer;

pub use crate::internal::ListsContract;

smartdeploy_sdk::core_riff!();
