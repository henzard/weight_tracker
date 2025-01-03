#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_weight() {
        let request = CreateWeightRequest {
            batch_id: "batch1".to_string(),
            item_id: "ITEM001".to_string(),
            weight: 75.5,
            owner_override: None,
        };
        // ... rest of test ...
    }

    #[test]
    fn test_update_weight() {
        let item_id = "ITEM001";
        let created_at = 123456789;
        let new_weight = 80.5;
        // ... rest of test ...
    }

    #[test]
    fn test_delete_weight() {
        let item_id = "ITEM001";
        let created_at = 123456789;
        // ... rest of test ...
    }
} 