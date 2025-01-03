#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_complete_workflow() {
        // Test creating a batch
        let batch_request = CreateBatchRequest {
            name: "Test Batch".to_string(),
            description: Some("Test Description".to_string()),
        };
        let batch_id = create_batch(batch_request).unwrap();

        // Test adding weights to the batch
        let weight_request = CreateWeightRequest {
            batch_id: batch_id.clone(),
            animal_id: "test_animal".to_string(),
            weight: 100.0,
            owner_override: None,
        };
        let result = create_weight(weight_request);
        assert!(result.contains("successfully"));

        // Test sharing the batch
        let collaborator = Principal::from_text("2vxsx-fae").unwrap();
        let share_result = share_with_user(collaborator, batch_id.clone());
        assert!(share_result.contains("successfully"));

        // Test retrieving shared data
        let batches = get_batches(false);
        assert_eq!(batches.len(), 1);
    }
} 