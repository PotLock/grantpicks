use soroban_sdk::{panic_with_error, Address, Env, String};

use crate::{error::Error, lists_writer::{ read_lists_number, get_lists_registered_by}, upvotes_writer::read_list_upvotes};

pub fn validate_name(env: &Env,name: &String) {
    if name.is_empty() {
        panic_with_error!(env, Error::NameCannotBeEmpty);
    }
}

pub fn validate_description(env: &Env, description: &Option<String>) {
    if  description.clone().unwrap().len() > 500 {
        panic_with_error!(env, Error::DescriptionTooLong);
    }
}

pub fn validate_cover_image_url(env: &Env, cover_image_url: &Option<String>) {
    if cover_image_url.clone().unwrap().len() > 200{
        panic_with_error!(env, Error::CoverImageUrlTooLong);
    }
}

pub fn validate_valid_list_id(env: &Env, list_id: u128) {
    let current_list = read_lists_number(env);

    if list_id > current_list{
        panic_with_error!(env, Error::InvalidListId);
    }
}

pub fn validate_upvotes_status(env: &Env, voter: &Address, list_id: u128) {
    let upvotes = read_list_upvotes(env, list_id);

    if upvotes.contains(voter) {
        panic_with_error!(env, Error::AlreadyUpvoted);
    }
}

pub fn validate_has_upvoted_list(env: &Env, voter: &Address, list_id: u128) {
    let upvotes = read_list_upvotes(env, list_id);
    
    if !upvotes.contains(voter) {
        panic_with_error!(env, Error::NotUpvoted);
    }
}

pub fn validate_no_existing_registration(env: &Env, list_id: u128, registrant: &Address) {
    let registrant_lists = get_lists_registered_by(env, registrant);
    if registrant_lists.contains(list_id) {
        panic_with_error!(env, Error::AlreadyRegistered);
    }
}