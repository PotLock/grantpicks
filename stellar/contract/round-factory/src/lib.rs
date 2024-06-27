#![no_std]

pub(crate) use loam_sdk::soroban_sdk;
extern crate alloc;

mod admin_writer;
mod data_type;
mod events;
mod internal;
mod methods;
mod project_registry_writer;
mod round_writer;
mod storage;
mod storage_key;
mod test;
mod token_writer;
mod wasm_writer;

pub use crate::internal::RoundFactory;

smartdeploy_sdk::core_riff!();
