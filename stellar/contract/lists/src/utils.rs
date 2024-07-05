use loam_sdk::soroban_sdk::{Env, String};

pub fn unwrap_or_blank(env: &Env, text: &Option<String>) -> String {
    text.clone().unwrap_or_else(|| String::from_str(env, ""))
}
