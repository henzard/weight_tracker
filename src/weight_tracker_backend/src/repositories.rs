use candid::Principal;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;
use crate::models::*;
use crate::traits::*;

#[derive(Clone)]
pub struct WeightStorageImpl<T: TimeProvider> {
    storage: Arc<RefCell<HashMap<WeightKey, Weight>>>,
    time_provider: T,
}

impl<T: TimeProvider> WeightStorageImpl<T> {
    pub fn new(time_provider: T) -> Self {
        Self {
            storage: Arc::new(RefCell::new(HashMap::new())),
            time_provider,
        }
    }

    pub fn with_storage(storage: Arc<RefCell<HashMap<WeightKey, Weight>>>, time_provider: T) -> Self {
        Self {
            storage,
            time_provider,
        }
    }
}

impl<T: TimeProvider> WeightRepository for WeightStorageImpl<T> {
    fn create(&self, key: WeightKey, weight: Weight) -> Result<(), String> {
        ic_cdk::println!("WeightRepository: Creating weight");
        ic_cdk::println!("Key: {:?}", key);
        ic_cdk::println!("Weight: {:?}", weight);
        
        self.storage.borrow_mut().insert(key, weight);
        Ok(())
    }

    fn get_all(&self, batch_id: Option<String>, include_deleted: bool) -> Vec<Weight> {
        self.storage.borrow()
            .values()
            .filter(|w| {
                match &batch_id {
                    Some(bid) => w.batch_id == *bid && (include_deleted || w.deleted_at.is_none()),
                    None => include_deleted || w.deleted_at.is_none()
                }
            })
            .cloned()
            .collect()
    }

    fn update(&self, key: WeightKey, new_weight: f64) -> Result<(), String> {
        if let Some(entry) = self.storage.borrow_mut().get_mut(&key) {
            entry.weight = new_weight;
            entry.updated_at = self.time_provider.get_time();
            Ok(())
        } else {
            Err("Weight not found".to_string())
        }
    }

    fn delete(&self, key: WeightKey) -> Result<(), String> {
        if let Some(entry) = self.storage.borrow_mut().get_mut(&key) {
            entry.deleted_at = Some(self.time_provider.get_time());
            Ok(())
        } else {
            Err("Weight not found".to_string())
        }
    }
}

#[derive(Clone)]
pub struct BatchStorageImpl<T: TimeProvider> {
    storage: Arc<RefCell<HashMap<String, Batch>>>,
    time_provider: T,
}

impl<T: TimeProvider> BatchStorageImpl<T> {
    pub fn new(time_provider: T) -> Self {
        Self {
            storage: Arc::new(RefCell::new(HashMap::new())),
            time_provider,
        }
    }

    pub fn with_storage(storage: Arc<RefCell<HashMap<String, Batch>>>, time_provider: T) -> Self {
        Self {
            storage,
            time_provider,
        }
    }
}

impl<T: TimeProvider> BatchRepository for BatchStorageImpl<T> {
    fn create(&mut self, batch: Batch) -> Result<String, String> {
        ic_cdk::println!("BatchRepository: Creating new batch");
        ic_cdk::println!("New batch details: {:?}", batch);
        let batch_id = batch.id.clone();
        self.storage.borrow_mut().insert(batch_id.clone(), batch);
        ic_cdk::println!("Batch created with ID: {}", batch_id);
        Ok(batch_id)
    }

    fn get(&self, id: &str) -> Option<Batch> {
        ic_cdk::println!("BatchRepository: Looking up batch with ID: {}", id);
        ic_cdk::println!("Available batches: {:?}", 
            self.storage.borrow().keys().collect::<Vec<_>>());
        let result = self.storage.borrow().get(id).cloned();
        ic_cdk::println!("Batch lookup result: {:?}", result);
        result
    }

    fn get_all(&self, include_deleted: bool) -> Vec<Batch> {
        self.storage.borrow()
            .values()
            .filter(|b| include_deleted || b.deleted_at.is_none())
            .cloned()
            .collect()
    }

    fn update(&mut self, id: &str, name: String, description: Option<String>) -> Result<(), String> {
        let mut storage = self.storage.borrow_mut();
        if let Some(batch) = storage.get_mut(id) {
            batch.name = name;
            batch.description = description;
            batch.updated_at = self.time_provider.get_time();
            Ok(())
        } else {
            Err("Batch not found".to_string())
        }
    }

    fn delete(&mut self, id: &str) -> Result<(), String> {
        let mut storage = self.storage.borrow_mut();
        if let Some(batch) = storage.get_mut(id) {
            if batch.deleted_at.is_some() {
                return Err("Batch is already deleted".to_string());
            }
            batch.deleted_at = Some(self.time_provider.get_time());
            Ok(())
        } else {
            Err("Batch not found".to_string())
        }
    }
}

#[derive(Clone)]
pub struct AccessControlImpl {
    permissions: Arc<RefCell<HashMap<String, SharingPermissions>>>
}

impl AccessControlImpl {
    pub fn new() -> Self {
        Self {
            permissions: Arc::new(RefCell::new(HashMap::new()))
        }
    }

    pub fn with_storage(storage: Arc<RefCell<HashMap<String, SharingPermissions>>>) -> Self {
        Self {
            permissions: storage
        }
    }
}

impl AccessControl for AccessControlImpl {
    fn has_access(&self, data_owner: Principal, accessor: Principal, batch_id: Option<&str>) -> bool {
        if data_owner == accessor {
            return true;
        }
        
        self.permissions.borrow()
            .get(&data_owner.to_string())
            .and_then(|p| p.shared_with.get(&accessor))
            .map(|batch_ids| {
                match batch_id {
                    Some(bid) => batch_ids.contains(bid),
                    None => !batch_ids.is_empty()
                }
            })
            .unwrap_or(false)
    }

    fn share_access(&mut self, owner: Principal, collaborator: Principal, batch_id: String) -> Result<(), String> {
        let mut perms = self.permissions.borrow_mut();
        let owner_key = owner.to_string();
        
        let sharing = perms.entry(owner_key.clone())
            .or_insert(SharingPermissions {
                owner,
                shared_with: HashMap::new(),
            });
            
        sharing.shared_with
            .entry(collaborator)
            .or_insert_with(HashSet::new)
            .insert(batch_id);
        
        Ok(())
    }

    fn remove_access(&mut self, owner: Principal, collaborator: Principal) -> Result<(), String> {
        let mut perms = self.permissions.borrow_mut();
        let owner_key = owner.to_string();
        
        if let Some(sharing) = perms.get_mut(&owner_key) {
            sharing.shared_with.remove(&collaborator);
            if sharing.shared_with.is_empty() {
                perms.remove(&owner_key);
            }
            Ok(())
        } else {
            Err("No sharing permissions found".to_string())
        }
    }

    fn get_collaborators(&self, owner: Principal) -> Vec<Principal> {
        self.permissions.borrow()
            .get(&owner.to_string())
            .map(|p| p.shared_with.keys().cloned().collect())
            .unwrap_or_else(Vec::new)
    }
}
