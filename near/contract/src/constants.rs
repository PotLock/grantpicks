use crate::*;

pub const DEFAULT_PAGE_SIZE: u64 = 200;
pub const ONE_DAY_MS: u64 = 86_400_000;
pub const ONE_WEEK_MS: u64 = ONE_DAY_MS * 7;
pub const DEFAULT_COOLDOWN_PERIOD_MS: u64 = ONE_WEEK_MS;
pub const DEFAULT_COMPLIANCE_PERIOD_MS: u64 = ONE_WEEK_MS;
pub const TGAS: u64 = 1_000_000_000_000;
pub const XCC_GAS: Gas = Gas::from_tgas(TGAS * 5);
