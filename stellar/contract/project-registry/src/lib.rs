#![no_std]
pub(crate) use soroban_sdk;

mod admin;
mod data_type;
mod events;
mod internal;
mod methods;
mod project_writer;
mod storage;
mod storage_key;
mod validation;
mod error;
mod test;

pub use crate::internal::ProjectRegistry;