#[cfg(test)]
mod integration_tests {
    use crate::models::{
        CreateBatchRequest,
        CreateWeightRequest,
        UpdateBatchRequest
    };
    use crate::{
        create_batch,
        create_weight,
        share_with_user,
        get_batches,
        get_batch,
        update_batch,
        delete_batch
    };
    use candid::Principal;
    use light_ic::{LightIC, Replica};

    fn setup_test_env() -> LightIC {
        LightIC::new()
    }

    #[test]
    fn test_batch_creation_and_retrieval() {
        let mut light_ic = setup_test_env();
        let test_principal = Principal::from_text("2vxsx-fae").unwrap();
        
        light_ic.set_caller(test_principal);

        light_ic.execute_ingress(|_| {
            // Create batch
            let batch_request = CreateBatchRequest {
                name: "Test Batch".to_string(),
                description: Some("Test Description".to_string()),
            };
            let batch_id = create_batch(batch_request).unwrap();

            // Retrieve batch
            let batch = get_batch(batch_id.clone()).unwrap();
            assert_eq!(batch.batch.name, "Test Batch");
            assert_eq!(batch.batch.description, Some("Test Description".to_string()));
        });
    }

    #[test]
    fn test_batch_update() {
        let mut light_ic = setup_test_env();
        let test_principal = Principal::from_text("2vxsx-fae").unwrap();
        
        light_ic.set_caller(test_principal);

        light_ic.execute_ingress(|_| {
            // Create batch
            let batch_request = CreateBatchRequest {
                name: "Original Name".to_string(),
                description: None,
            };
            let batch_id = create_batch(batch_request).unwrap();

            // Update batch
            let update_request = UpdateBatchRequest {
                name: "Updated Name".to_string(),
                description: Some("New Description".to_string()),
            };
            let result = update_batch(batch_id.clone(), update_request);
            assert!(result.is_ok());

            // Verify update
            let updated_batch = get_batch(batch_id).unwrap();
            assert_eq!(updated_batch.batch.name, "Updated Name");
            assert_eq!(updated_batch.batch.description, Some("New Description".to_string()));
        });
    }

    #[test]
    fn test_batch_deletion() {
        let mut light_ic = setup_test_env();
        let test_principal = Principal::from_text("2vxsx-fae").unwrap();
        
        light_ic.set_caller(test_principal);

        light_ic.execute_ingress(|_| {
            // Create batch
            let batch_request = CreateBatchRequest {
                name: "To Delete".to_string(),
                description: None,
            };
            let batch_id = create_batch(batch_request).unwrap();

            // Delete batch
            let result = delete_batch(batch_id.clone());
            assert!(result.is_ok());

            // Verify deletion
            let batches = get_batches(false);
            assert!(!batches.iter().any(|b| b.batch.id == batch_id));
        });
    }

    #[test]
    fn test_weight_management() {
        let mut light_ic = setup_test_env();
        let test_principal = Principal::from_text("2vxsx-fae").unwrap();
        
        light_ic.set_caller(test_principal);

        light_ic.execute_ingress(|_| {
            // Create batch
            let batch_request = CreateBatchRequest {
                name: "Weight Test".to_string(),
                description: None,
            };
            let batch_id = create_batch(batch_request).unwrap();

            // Add weight
            let weight_request = CreateWeightRequest {
                batch_id: batch_id.clone(),
                item_id: "test_item".to_string(),
                weight: 100.0,
                owner_override: None,
            };
            let result = create_weight(weight_request);
            assert!(result.contains("successfully"));

            // Verify weight in batch
            let batch = get_batch(batch_id).unwrap();
            assert_eq!(batch.stats.count, 1);
            assert_eq!(batch.stats.average_weight, 100.0);
        });
    }

    #[test]
    fn test_batch_sharing() {
        let mut light_ic = setup_test_env();
        let owner = Principal::from_text("2vxsx-fae").unwrap();
        let collaborator = Principal::from_text("rrkah-fqaaa-aaaaa-aaaaq-cai").unwrap();
        
        light_ic.set_caller(owner);

        light_ic.execute_ingress(|_| {
            // Create batch
            let batch_request = CreateBatchRequest {
                name: "Shared Batch".to_string(),
                description: None,
            };
            let batch_id = create_batch(batch_request).unwrap();

            // Share batch
            let share_result = share_with_user(collaborator, batch_id.clone());
            assert!(share_result.contains("successfully"));
        });

        // Switch to collaborator
        light_ic.set_caller(collaborator);

        light_ic.execute_ingress(|_| {
            // Verify collaborator can access batch
            let batch = get_batch(batch_id);
            assert!(batch.is_ok());
        });
    }
} 