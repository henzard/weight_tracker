use candid::{CandidType, Deserialize, Principal};
use std::collections::{HashMap, HashSet};

#[derive(CandidType, Deserialize, Clone, Debug, Hash, Eq, PartialEq)]
pub struct WeightKey {
    pub owner: Principal,
    pub item_id: String,
    pub created_at: u64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Weight {
    pub owner: Principal,
    pub batch_id: String,
    pub item_id: String,
    pub weight: f64,
    pub created_at: u64,
    pub updated_at: u64,
    pub deleted_at: Option<u64>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Batch {
    pub id: String,
    pub name: String,
    pub owner: Principal,
    pub description: Option<String>,
    pub created_at: u64,
    pub updated_at: u64,
    pub deleted_at: Option<u64>,
}

// DTOs (Data Transfer Objects)
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateWeightRequest {
    pub owner_override: Option<Principal>,
    pub batch_id: String,
    pub item_id: String,
    pub weight: f64,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateBatchRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SharingPermissions {
    pub owner: Principal,
    pub shared_with: HashMap<Principal, HashSet<String>>, // Principal -> Set of batch_ids
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BatchStats {
    pub count: u64,
    pub min_weight: f64,
    pub max_weight: f64,
    pub average_weight: f64,
}

impl BatchStats {
    pub fn empty() -> Self {
        Self {
            count: 0,
            min_weight: 0.0,
            max_weight: 0.0,
            average_weight: 0.0,
        }
    }

    pub fn from_weights(weights: &[f64]) -> Self {
        let count = weights.len() as u64;
        let min_weight = weights.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let max_weight = weights.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let sum: f64 = weights.iter().sum();
        let average_weight = sum / count as f64;

        Self {
            count,
            min_weight,
            max_weight,
            average_weight,
        }
    }
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BatchWithStats {
    pub batch: Batch,
    pub stats: BatchStats,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UpdateBatchRequest {
    pub name: String,
    pub description: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ShareableBatch {
    pub id: String,
    pub name: String,
}

#[derive(candid::CandidType, candid::Deserialize, Debug)]
pub struct RemoveSharingRequest {
    pub collaborator: Principal,
}