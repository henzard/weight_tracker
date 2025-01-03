use crate::models::*;
use crate::traits::*;
use crate::repositories::*;
use candid::Principal;

#[derive(Clone)]
struct MockTimeProvider {
    time: u64,
}

impl TimeProvider for MockTimeProvider {
    fn get_time(&self) -> u64 {
        self.time
    }
}

#[test]
fn test_batch_storage() {
    let time_provider = MockTimeProvider { time: 1000 };
    let mut storage = BatchStorageImpl::new(time_provider);
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();

    // Test Create
    let batch = Batch {
        id: "test_batch".to_string(),
        name: "Test Batch".to_string(),
        owner,
        description: Some("Test Description".to_string()),
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    let result = storage.create(batch.clone());
    assert!(result.is_ok());

    // Test Get
    let retrieved = storage.get(&batch.id);
    assert!(retrieved.is_some());
    assert_eq!(retrieved.unwrap().name, "Test Batch");

    // Test Update
    let update_result = storage.update(&batch.id, "Updated Batch".to_string(), None);
    assert!(update_result.is_ok());

    // Verify Update
    let updated = storage.get(&batch.id).unwrap();
    assert_eq!(updated.name, "Updated Batch");
    assert_eq!(updated.description, None);

    // Test Delete
    let delete_result = storage.delete(&batch.id);
    assert!(delete_result.is_ok());

    // Verify Delete (should still be retrievable but marked as deleted)
    let deleted = storage.get(&batch.id).unwrap();
    assert!(deleted.deleted_at.is_some());
}

#[test]
fn test_weight_storage() {
    let time_provider = MockTimeProvider { time: 1000 };
    let mut storage = WeightStorageImpl::new(time_provider);
    let owner = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();

    // Test Create
    let key = WeightKey {
        owner,
        animal_id: "test_animal".to_string(),
        created_at: 1000,
    };
    let weight = Weight {
        owner,
        batch_id: "test_batch".to_string(),
        animal_id: "test_animal".to_string(),
        weight: 100.0,
        created_at: 1000,
        updated_at: 1000,
        deleted_at: None,
    };
    let result = storage.create(key.clone(), weight);
    assert!(result.is_ok());

    // Test Get All
    let weights = storage.get_all(Some("test_batch".to_string()), false);
    assert_eq!(weights.len(), 1);
    assert_eq!(weights[0].weight, 100.0);

    // Test Update
    let update_result = storage.update(key.clone(), 150.0);
    assert!(update_result.is_ok());

    // Verify Update
    let updated_weights = storage.get_all(Some("test_batch".to_string()), false);
    assert_eq!(updated_weights[0].weight, 150.0);

    // Test Delete
    let delete_result = storage.delete(key);
    assert!(delete_result.is_ok());

    // Verify Delete (should not appear in non-deleted results)
    let remaining_weights = storage.get_all(Some("test_batch".to_string()), false);
    assert_eq!(remaining_weights.len(), 0);

    // But should appear in results that include deleted
    let all_weights = storage.get_all(Some("test_batch".to_string()), true);
    assert_eq!(all_weights.len(), 1);
    assert!(all_weights[0].deleted_at.is_some());
} 