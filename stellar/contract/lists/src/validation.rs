use loam_sdk::soroban_sdk::{Address, Env, String};

use crate::{lists_writer::read_lists_number, upvotes_writer::read_list_upvotes};

pub fn validate_name(name: &String) {
    assert!(!name.is_empty(), "Name cannot be empty");
}

pub fn validate_description(description: &Option<String>) {
    assert!(
        description.clone().unwrap().len() < 500,
        "Description too long. max 500 characters"
    );
}

pub fn validate_cover_image_url(cover_image_url: &Option<String>) {
    assert!(
        cover_image_url.clone().unwrap().len() < 200,
        "Cover image url too long. max 200 characters"
    );
}

pub fn validate_valid_list_id(env: &Env, list_id: u128) {
    let current_list = read_lists_number(env);
    assert!(list_id <= current_list, "Invalid List ID");
}

pub fn validate_upvotes_status(env: &Env, voter: &Address, list_id: u128) {
    let upvotes = read_list_upvotes(env, list_id);
    assert!(!upvotes.contains(voter), "Already upvoted");
}

pub fn validate_has_upvoted_list(env: &Env, voter: &Address, list_id: u128) {
    let upvotes = read_list_upvotes(env, list_id);
    assert!(upvotes.contains(voter), "Not upvoted");
}
