use crate::models::*;
use candid::Principal;

pub trait WeightRepository {
    fn create(&self, key: WeightKey, weight: Weight) -> Result<(), String>;
    fn get_all(&self, batch_id: Option<String>, include_deleted: bool) -> Vec<Weight>;
    fn update(&self, key: WeightKey, new_weight: f64) -> Result<(), String>;
    fn delete(&self, key: WeightKey) -> Result<(), String>;
}

pub trait BatchRepository {
    fn create(&mut self, batch: Batch) -> Result<String, String>;
    fn get(&self, id: &str) -> Option<Batch>;
    fn get_all(&self, include_deleted: bool) -> Vec<Batch>;
    fn update(&mut self, id: &str, name: String, description: Option<String>) -> Result<(), String>;
    fn delete(&mut self, id: &str) -> Result<(), String>;
}

pub trait AccessControl {
    fn has_access(&self, data_owner: Principal, accessor: Principal, batch_id: Option<&str>) -> bool;
    fn share_access(&mut self, owner: Principal, collaborator: Principal, batch_id: String) -> Result<(), String>;
    fn remove_access(&mut self, owner: Principal, collaborator: Principal) -> Result<(), String>;
    fn get_collaborators(&self, owner: Principal) -> Vec<Principal>;
}

pub trait TimeProvider: Clone {
    fn get_time(&self) -> u64;
}

#[derive(Clone)]
pub struct CanisterTimeProvider;

impl TimeProvider for CanisterTimeProvider {
    fn get_time(&self) -> u64 {
        ic_cdk::api::time()
    }
} 