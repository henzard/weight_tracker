use crate::models::*;
use crate::traits::*;
use crate::services::*;
use candid::Principal;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::sync::Arc;

// Mock implementations
#[derive(Clone)]
struct MockAccessControl {
    permissions: Arc<RefCell<HashMap<String, SharingPermissions>>>,
}

impl MockAccessControl {
    fn new() -> Self {
        Self {
            permissions: Arc::new(RefCell::new(HashMap::new()))
        }
    }
}

impl AccessControl for MockAccessControl {
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
        
        let sharing = perms.entry(owner_key)
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
        if let Some(sharing) = perms.get_mut(&owner.to_string()) {
            sharing.shared_with.remove(&collaborator);
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

#[derive(Clone)]
struct MockWeightRepo {
    weights: RefCell<HashMap<WeightKey, Weight>>,
}

impl MockWeightRepo {
    fn new() -> Self {
        Self {
            weights: RefCell::new(HashMap::new())
        }
    }
}

impl WeightRepository for MockWeightRepo {
    fn create(&self, key: WeightKey, weight: Weight) -> Result<(), String> {
        self.weights.borrow_mut().insert(key, weight);
        Ok(())
    }

    fn get_all(&self, batch_id: Option<String>, include_deleted: bool) -> Vec<Weight> {
        self.weights.borrow()
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

    fn update(&self, key: WeightKey, weight: f64) -> Result<(), String> {
        if let Some(entry) = self.weights.borrow_mut().get_mut(&key) {
            entry.weight = weight;
            entry.updated_at = 1000;
            Ok(())
        } else {
            Err("Weight not found".to_string())
        }
    }

    fn delete(&self, key: WeightKey) -> Result<(), String> {
        if let Some(entry) = self.weights.borrow_mut().get_mut(&key) {
            entry.deleted_at = Some(1000);
            Ok(())
        } else {
            Err("Weight not found".to_string())
        }
    }
}

#[derive(Clone)]
struct MockTimeProvider {
    time: u64,
}

impl TimeProvider for MockTimeProvider {
    fn get_time(&self) -> u64 {
        self.time
    }
}

#[derive(Clone)]
struct MockBatchRepo {
    batches: RefCell<HashMap<String, Batch>>,
}

impl MockBatchRepo {
    fn new() -> Self {
        Self {
            batches: RefCell::new(HashMap::new())
        }
    }
}

impl BatchRepository for MockBatchRepo {
    fn create(&mut self, batch: Batch) -> Result<String, String> {
        let id = batch.id.clone();
        self.batches.borrow_mut().insert(id.clone(), batch);
        Ok(id)
    }

    fn get(&self, id: &str) -> Option<Batch> {
        self.batches.borrow().get(id).cloned()
    }

    fn get_all(&self, include_deleted: bool) -> Vec<Batch> {
        self.batches.borrow()
            .values()
            .filter(|b| include_deleted || b.deleted_at.is_none())
            .cloned()
            .collect()
    }

    fn update(&mut self, id: &str, name: String, description: Option<String>) -> Result<(), String> {
        if let Some(batch) = self.batches.borrow_mut().get_mut(id) {
            batch.name = name;
            batch.description = description;
            batch.updated_at = 1000;
            Ok(())
        } else {
            Err("Batch not found".to_string())
        }
    }

    fn delete(&mut self, id: &str) -> Result<(), String> {
        if let Some(batch) = self.batches.borrow_mut().get_mut(id) {
            batch.deleted_at = Some(1000);
            Ok(())
        } else {
            Err("Batch not found".to_string())
        }
    }
}

#[test]
fn test_access_control_operations() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("aaaaa-aa").unwrap();
    let mut access_control = MockAccessControl::new();

    // Test share access
    let result = access_control.share_access(owner, collaborator, "test_batch".to_string());
    assert!(result.is_ok());

    // Test has access
    assert!(access_control.has_access(owner, collaborator, Some("test_batch")));

    // Test get collaborators
    let collaborators = access_control.get_collaborators(owner);
    assert_eq!(collaborators.len(), 1);
    assert_eq!(collaborators[0], collaborator);

    // Test remove access
    let result = access_control.remove_access(owner, collaborator);
    assert!(result.is_ok());

    // Verify access removed
    assert!(!access_control.has_access(owner, collaborator, Some("test_batch")));
}

#[test]
fn test_weight_service_create() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a test batch first
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: Some("Test Description".to_string()),
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: 100.0,
    };

    let result = service.create_weight(request, owner);
    assert!(result.is_ok());
}

#[test]
fn test_weight_service_unauthorized() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let unauthorized_user = Principal::from_text("aaaaa-aa").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a test batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: Some("Test Description".to_string()),
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: 100.0,
    };

    // Try to create weight as unauthorized user
    let result = service.create_weight(request, unauthorized_user);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unauthorized"));
}

#[test]
fn test_weight_service_crud_operations() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create test batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: Some("Test Description".to_string()),
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    // Test Create
    let create_request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: 100.0,
    };
    let result = service.create_weight(create_request, owner);
    assert!(result.is_ok());

    // Test Read
    let weights = service.get_weights(Some("test_batch".to_string()), false, owner);
    assert_eq!(weights.len(), 1);
    assert_eq!(weights[0].weight, 100.0);

    // Test Update
    let update_result = service.update_weight(
        "test_animal".to_string(),
        now,
        150.0,
        owner
    );
    assert!(update_result.is_ok());

    // Verify Update
    let weights = service.get_weights(Some("test_batch".to_string()), false, owner);
    assert_eq!(weights[0].weight, 150.0);

    // Test Delete
    let delete_result = service.delete_weight(
        "test_animal".to_string(),
        now,
        owner
    );
    assert!(delete_result.is_ok());

    // Verify Delete
    let weights = service.get_weights(Some("test_batch".to_string()), false, owner);
    assert_eq!(weights.len(), 0);
}

#[test]
fn test_batch_service() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    // Test create batch
    let request = CreateBatchRequest {
        name: "Test Batch".to_string(),
        description: Some("Test Description".to_string()),
    };

    let result = service.create_batch(request, owner);
    assert!(result.is_ok());

    // Test get batch
    let batch_id = result.unwrap();
    let result = service.get_batch(&batch_id, owner);
    assert!(result.is_ok());
    let batch_with_stats = result.unwrap();
    assert_eq!(batch_with_stats.batch.name, "Test Batch");
}

#[test]
fn test_batch_service_crud_operations() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    // Test Create
    let create_request = CreateBatchRequest {
        name: "Test Batch".to_string(),
        description: Some("Test Description".to_string()),
    };
    let result = service.create_batch(create_request, owner);
    assert!(result.is_ok());
    let batch_id = result.unwrap();

    // Test Read
    let batches = service.get_batches(false, owner);
    assert_eq!(batches.len(), 1);
    assert_eq!(batches[0].batch.name, "Test Batch");

    // Test Update
    let update_request = UpdateBatchRequest {
        name: "Updated Batch".to_string(),
        description: None,
    };
    let update_result = service.update_batch(&batch_id, update_request, owner);
    assert!(update_result.is_ok());

    // Verify Update
    let batch = service.get_batch(&batch_id, owner).unwrap();
    assert_eq!(batch.batch.name, "Updated Batch");
    assert_eq!(batch.batch.description, None);

    // Test Delete
    let delete_result = service.delete_batch(&batch_id, owner);
    assert!(delete_result.is_ok());

    // Verify Delete
    let batches = service.get_batches(false, owner);
    assert_eq!(batches.len(), 0);
}

#[test]
fn test_batch_stats_calculation() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let mut weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();

    // Create a batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    // Add some weights
    let weights = vec![10.0, 20.0, 30.0, 40.0, 50.0];
    for (i, &weight) in weights.iter().enumerate() {
        let key = WeightKey {
            owner,
            item_id: format!("animal_{}", i),
            created_at: now + i as u64,
        };
        let weight_entry = Weight {
            owner,
            batch_id: "test_batch".to_string(),
            item_id: format!("animal_{}", i),
            weight,
            created_at: now + i as u64,
            updated_at: now + i as u64,
            deleted_at: None,
        };
        weight_repo.create(key, weight_entry).unwrap();
    }

    let service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let stats = service.calculate_batch_stats("test_batch");
    assert_eq!(stats.count, 5);
    assert_eq!(stats.min_weight, 10.0);
    assert_eq!(stats.max_weight, 50.0);
    assert_eq!(stats.average_weight, 30.0);
}

#[test]
fn test_empty_batch_name() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let request = CreateBatchRequest {
        name: "".to_string(),
        description: None,
    };

    let result = service.create_batch(request, owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("empty"));
}

#[test]
fn test_invalid_batch_id() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "nonexistent_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: 100.0,
    };

    let result = service.create_weight(request, owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Invalid batch ID"));
}

#[test]
fn test_update_batch_unauthorized() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let unauthorized = Principal::from_text("aaaaa-aa").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let update_request = UpdateBatchRequest {
        name: "Updated Name".to_string(),
        description: None,
    };

    let result = service.update_batch("test_batch", update_request, unauthorized);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unauthorized"));
}

#[test]
fn test_delete_batch_unauthorized() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let unauthorized = Principal::from_text("aaaaa-aa").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let result = service.delete_batch("test_batch", unauthorized);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Unauthorized"));
}

#[test]
fn test_share_with_self() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let access_control = MockAccessControl::new();
    let batch_repo = MockBatchRepo::new();
    let mut service = AccessControlService::new(access_control, batch_repo);

    let result = service.share_with_user(owner, owner, "test_batch".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Cannot share data with yourself"));
}

#[test]
fn test_get_nonexistent_batch() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    let service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let result = service.get_batch("nonexistent", owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("not found"));
}

#[test]
fn test_batch_stats_with_deleted_batch() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a deleted batch
    let mut batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: Some(now),  // Deleted batch
    };
    batch_repo.create(batch).unwrap();

    let service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let stats = service.calculate_batch_stats("test_batch");
    assert_eq!(stats.count, 0);
    assert_eq!(stats.min_weight, 0.0);
    assert_eq!(stats.max_weight, 0.0);
    assert_eq!(stats.average_weight, 0.0);
}

#[test]
fn test_negative_weight_value() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create test batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: -100.0,  // Negative weight
    };

    let result = service.create_weight(request, owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Invalid weight value"));
}

#[test]
fn test_update_deleted_weight() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let mut weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();

    // Create test batch and weight
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let key = WeightKey {
        owner,
        item_id: "test_animal".to_string(),
        created_at: now,
    };

    let weight = Weight {
        owner,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: 100.0,
        created_at: now,
        updated_at: now,
        deleted_at: Some(now),  // Deleted weight
    };
    weight_repo.create(key, weight).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let result = service.update_weight(
        "test_animal".to_string(),
        now,
        150.0,
        owner
    );
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Cannot update deleted weight"));
}

#[test]
fn test_delete_already_deleted_batch() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a deleted batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: Some(now),  // Already deleted
    };
    batch_repo.create(batch).unwrap();

    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control,
        time_provider
    );

    let result = service.delete_batch("test_batch", owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Batch is already deleted"));
}

#[test]
fn test_share_with_nonexistent_batch() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();
    let access_control = MockAccessControl::new();
    let batch_repo = MockBatchRepo::new();
    let mut service = AccessControlService::new(access_control, batch_repo);

    let result = service.share_with_user(owner, collaborator, "nonexistent_batch".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Batch not found"));
}

#[test]
fn test_extremely_large_weight() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create test batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "test_animal".to_string(),
        weight: f64::MAX,  // Extremely large weight
    };

    let result = service.create_weight(request, owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Weight value out of reasonable range"));
}

#[test]
fn test_empty_animal_id() {
    let now = 1000;
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let time_provider = MockTimeProvider { time: now };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create test batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: now,
        updated_at: now,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = WeightService::new(
        weight_repo,
        batch_repo,
        access_control,
        time_provider
    );

    let request = CreateWeightRequest {
        owner_override: None,
        batch_id: "test_batch".to_string(),
        item_id: "".to_string(),  // Empty animal ID
        weight: 100.0,
    };

    let result = service.create_weight(request, owner);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Item ID cannot be empty"));
}

#[test]
fn test_share_batch_with_deleted_batch() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();
    let mut batch_repo = MockBatchRepo::new();
    
    // Create a deleted batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: Some(1000),  // Deleted batch
    };
    batch_repo.create(batch).unwrap();

    let access_control = MockAccessControl::new();
    let mut service = AccessControlService::new(access_control, batch_repo);

    let result = service.share_with_user(owner, collaborator, "test_batch".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Cannot share deleted batch"));
}

#[test]
fn test_share_batch_as_non_owner() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let non_owner = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();  // Valid principal
    let collaborator = Principal::from_text("renrk-eyaaa-aaaaa-aaada-cai").unwrap();  // Valid principal
    let time_provider = MockTimeProvider { time: 1000 };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let access_control = MockAccessControl::new();
    
    // Create a batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,  // Different from non_owner
        description: None,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = AccessControlService::new(access_control, batch_repo);

    // Try to share as non-owner
    let result = service.share_with_user(non_owner, collaborator, "test_batch".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Only the owner can share this batch"));
}

#[test]
fn test_share_batch_multiple_times() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();
    let access_control = MockAccessControl::new();
    let mut batch_repo = MockBatchRepo::new();

    // Create a batch first
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    let mut service = AccessControlService::new(access_control, batch_repo);

    // Share first time
    let result1 = service.share_with_user(owner, collaborator, "test_batch".to_string());
    assert!(result1.is_ok());

    // Share same batch again
    let result2 = service.share_with_user(owner, collaborator, "test_batch".to_string());
    assert!(result2.is_err());
    assert!(result2.unwrap_err().contains("Batch is already shared with this user"));
}

#[test]
fn test_remove_sharing_as_non_owner() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let non_owner = Principal::from_text("ryjl3-tyaaa-aaaaa-aaaba-cai").unwrap();
    let collaborator = Principal::from_text("renrk-eyaaa-aaaaa-aaada-cai").unwrap();
    let mut access_control = MockAccessControl::new();
    let mut batch_repo = MockBatchRepo::new();

    // Create a batch owned by the original owner
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,  // Original owner
        description: None,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    // Set up initial sharing permissions in access_control
    access_control.share_access(owner, collaborator, "test_batch".to_string()).unwrap();

    let mut service = AccessControlService::new(access_control, batch_repo);

    // Try to remove sharing as non-owner
    let result = service.remove_sharing(non_owner, collaborator);
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Only the owner can remove sharing permissions"));
}

#[test]
fn test_share_with_invalid_principal() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let access_control = MockAccessControl::new();
    let batch_repo = MockBatchRepo::new();
    let mut service = AccessControlService::new(access_control, batch_repo);

    // Try to share with an invalid principal
    let result = service.share_with_user(owner, Principal::anonymous(), "test_batch".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Cannot share with anonymous principal"));
}

#[test]
fn test_share_batch_with_empty_batch_id() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("aaaaa-aa").unwrap();
    let access_control = MockAccessControl::new();
    let batch_repo = MockBatchRepo::new();
    let mut service = AccessControlService::new(access_control, batch_repo);

    let result = service.share_with_user(owner, collaborator, "".to_string());
    assert!(result.is_err());
    assert!(result.unwrap_err().contains("Batch ID cannot be empty"));
}

#[test]
fn test_access_after_sharing_removed() {
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
    let collaborator = Principal::from_text("aaaaa-aa").unwrap();
    let time_provider = MockTimeProvider { time: 1000 };
    
    let weight_repo = MockWeightRepo::new();
    let mut batch_repo = MockBatchRepo::new();
    let mut access_control = MockAccessControl::new();
    
    // Create a batch
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: None,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    batch_repo.create(batch).unwrap();

    // Clone access_control before using it
    let access_control_clone = access_control.clone();
    let mut service = BatchService::new(
        batch_repo,
        weight_repo,
        access_control_clone,
        time_provider
    );

    // Set up sharing
    access_control.share_access(owner, collaborator, "test_batch".to_string()).unwrap();

    // Verify access works
    let result1 = service.get_batch("test_batch", collaborator);
    assert!(result1.is_ok());

    // Remove sharing
    access_control.remove_access(owner, collaborator).unwrap();

    // Verify access is revoked
    let result2 = service.get_batch("test_batch", collaborator);
    assert!(result2.is_err());
    assert!(result2.unwrap_err().contains("Unauthorized access to batch"));
}