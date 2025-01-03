use candid::Principal;
use crate::models::*;
use crate::traits::*;

pub struct WeightService<T: WeightRepository, B: BatchRepository, A: AccessControl, TP: TimeProvider> {
    weight_repo: T,
    batch_repo: B,
    access_control: A,
    time_provider: TP,
}

impl<T: WeightRepository, B: BatchRepository, A: AccessControl, TP: TimeProvider> WeightService<T, B, A, TP> {
    pub fn new(weight_repo: T, batch_repo: B, access_control: A, time_provider: TP) -> Self {
        Self {
            weight_repo,
            batch_repo,
            access_control,
            time_provider,
        }
    }

    pub fn create_weight(&self, request: CreateWeightRequest, caller: Principal) -> Result<String, String> {
        ic_cdk::println!("Starting create_weight process");
        ic_cdk::println!("Request details: {:?}", request);
        ic_cdk::println!("Caller: {:?}", caller);

        if request.weight <= 0.0 {
            ic_cdk::println!("Invalid weight value: {}", request.weight);
            return Err("Invalid weight value: weight must be positive".to_string());
        }

        if request.weight > 10000.0 {
            ic_cdk::println!("Weight value out of range: {}", request.weight);
            return Err("Weight value out of reasonable range".to_string());
        }

        if request.item_id.trim().is_empty() {
            ic_cdk::println!("Empty item ID provided");
            return Err("Item ID cannot be empty".to_string());
        }

        // Debug: List all available batches
        let all_batches = self.batch_repo.get_all(true);
        ic_cdk::println!("All available batches: {:?}", 
            all_batches.iter().map(|b| &b.id).collect::<Vec<_>>());

        // Get the batch to determine the true owner
        ic_cdk::println!("Fetching batch with ID: {}", request.batch_id);
        let batch = match self.batch_repo.get(&request.batch_id) {
            Some(b) => {
                ic_cdk::println!("Found batch: {:?}", b);
                b
            },
            None => {
                ic_cdk::println!("Batch not found: {}", request.batch_id);
                return Err("Invalid batch ID".to_string());
            }
        };

        // Check if caller has access
        ic_cdk::println!("Checking access for caller {} to batch {}", caller, request.batch_id);
        if !self.access_control.has_access(batch.owner, caller, Some(&request.batch_id)) {
            ic_cdk::println!("Access denied for caller {} to batch {}", caller, request.batch_id);
            return Err("Unauthorized: You don't have access to add weights to this batch".to_string());
        }

        let now = self.time_provider.get_time();
        ic_cdk::println!("Current timestamp: {}", now);

        let weight_key = WeightKey {
            owner: batch.owner,
            item_id: request.item_id.clone(),
            created_at: now,
        };
        ic_cdk::println!("Created weight key: {:?}", weight_key);
        
        let weight_entry = Weight {
            owner: batch.owner,
            batch_id: request.batch_id,
            item_id: request.item_id,
            weight: request.weight,
            created_at: now,
            updated_at: now,
            deleted_at: None,
        };
        ic_cdk::println!("Created weight entry: {:?}", weight_entry);

        match self.weight_repo.create(weight_key, weight_entry) {
            Ok(_) => {
                ic_cdk::println!("Weight successfully created");
                Ok("Weight created successfully".to_string())
            },
            Err(e) => {
                ic_cdk::println!("Error creating weight: {}", e);
                Err(e)
            }
        }
    }

    pub fn get_weights(&self, batch_id: Option<String>, include_deleted: bool, caller: Principal) -> Vec<Weight> {
        self.weight_repo.get_all(batch_id, include_deleted)
            .into_iter()
            .filter(|w| self.access_control.has_access(w.owner, caller, Some(&w.batch_id)))
            .collect()
    }

    pub fn update_weight(&self, item_id: String, created_at: u64, weight: f64, caller: Principal) -> Result<String, String> {
        let weights = self.weight_repo.get_all(None, true);
        let weight_entry = weights.iter()
            .find(|w| w.item_id == item_id && w.created_at == created_at)
            .ok_or_else(|| "Weight not found".to_string())?;

        if weight_entry.deleted_at.is_some() {
            return Err("Cannot update deleted weight".to_string());
        }

        if !self.access_control.has_access(weight_entry.owner, caller, Some(&weight_entry.batch_id)) {
            return Err("Unauthorized: You don't have permission to update this record".to_string());
        }

        let key = WeightKey {
            owner: weight_entry.owner,
            item_id,
            created_at,
        };

        self.weight_repo.update(key, weight)?;
        Ok("Weight updated successfully".to_string())
    }

    pub fn delete_weight(&self, item_id: String, created_at: u64, caller: Principal) -> Result<String, String> {
        let weights = self.weight_repo.get_all(None, true);
        let weight_entry = weights.iter()
            .find(|w| w.item_id == item_id && w.created_at == created_at)
            .ok_or_else(|| "Weight not found".to_string())?;

        if !self.access_control.has_access(weight_entry.owner, caller, Some(&weight_entry.batch_id)) {
            return Err("Unauthorized: You don't have permission to delete this record".to_string());
        }

        let key = WeightKey {
            owner: weight_entry.owner,
            item_id,
            created_at,
        };

        self.weight_repo.delete(key)?;
        Ok("Weight deleted successfully".to_string())
    }
}

pub struct BatchService<B: BatchRepository, W: WeightRepository, A: AccessControl, TP: TimeProvider> {
    batch_repo: B,
    weight_repo: W,
    access_control: A,
    time_provider: TP,
}

impl<B: BatchRepository, W: WeightRepository, A: AccessControl, TP: TimeProvider> BatchService<B, W, A, TP> {
    pub fn new(batch_repo: B, weight_repo: W, access_control: A, time_provider: TP) -> Self {
        Self {
            batch_repo,
            weight_repo,
            access_control,
            time_provider,
        }
    }

    pub fn calculate_batch_stats(&self, batch_id: &str) -> BatchStats {
        // If batch is deleted, return empty stats
        if let Some(batch) = self.batch_repo.get(batch_id) {
            if batch.deleted_at.is_some() {
                return BatchStats::empty();
            }
        }

        let weights: Vec<f64> = self.weight_repo
            .get_all(Some(batch_id.to_string()), false)
            .iter()
            .map(|w| w.weight)
            .collect();

        if weights.is_empty() {
            return BatchStats::empty();
        }

        BatchStats::from_weights(&weights)
    }

    pub fn get_owned_batches(&self, owner: Principal) -> Vec<BatchWithStats> {
        self.batch_repo
            .get_all(false)
            .into_iter()
            .filter(|b| b.owner == owner)
            .map(|batch| {
                let stats = self.calculate_batch_stats(&batch.id);
                BatchWithStats { batch, stats }
            })
            .collect()
    }

    pub fn get_shareable_batches(&self, owner: Principal) -> Vec<ShareableBatch> {
        self.batch_repo
            .get_all(false)
            .into_iter()
            .filter(|b| b.owner == owner)
            .filter_map(|batch| {
                let stats = self.calculate_batch_stats(&batch.id);
                if stats.count > 0 {
                    Some(ShareableBatch {
                        id: batch.id.clone(),
                        name: batch.name.clone(),
                    })
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn get_batch_owner(&self, batch_id: &str) -> Result<Principal, String> {
        self.batch_repo
            .get(batch_id)
            .map(|batch| batch.owner)
            .ok_or_else(|| "Batch not found".to_string())
    }

    pub fn create_batch(&mut self, request: CreateBatchRequest, owner: Principal) -> Result<String, String> {
        if request.name.trim().is_empty() {
            return Err("Batch name cannot be empty".to_string());
        }

        let now = self.time_provider.get_time();
        ic_cdk::println!("Creating batch at timestamp: {}", now);
        let batch_id = format!("batch_{}", now);
        ic_cdk::println!("Generated batch ID: {}", batch_id);

        let batch = Batch {
            id: batch_id.clone(),
            name: request.name,
            owner,
            description: request.description,
            created_at: now,
            updated_at: now,
            deleted_at: None,
        };
        ic_cdk::println!("Created batch object: {:?}", batch);

        self.batch_repo.create(batch)
    }

    pub fn get_batches(&self, include_deleted: bool, caller: Principal) -> Vec<BatchWithStats> {
        self.batch_repo
            .get_all(include_deleted)
            .into_iter()
            .filter(|b| self.access_control.has_access(b.owner, caller, Some(&b.id)))
            .map(|batch| {
                let stats = self.calculate_batch_stats(&batch.id);
                BatchWithStats { batch, stats }
            })
            .collect()
    }

    pub fn get_batch(&self, batch_id: &str, caller: Principal) -> Result<BatchWithStats, String> {
        let batch = self.batch_repo.get(batch_id)
            .ok_or_else(|| "Batch not found".to_string())?;

        if !self.access_control.has_access(batch.owner, caller, Some(batch_id)) {
            return Err("Unauthorized access to batch".to_string());
        }

        let stats = self.calculate_batch_stats(batch_id);
        Ok(BatchWithStats { batch, stats })
    }

    pub fn update_batch(&mut self, batch_id: &str, request: UpdateBatchRequest, caller: Principal) -> Result<(), String> {
        let batch = self.batch_repo.get(batch_id)
            .ok_or_else(|| "Batch not found".to_string())?;

        if batch.owner != caller {
            return Err("Unauthorized: Only the owner can update batch details".to_string());
        }

        self.batch_repo.update(batch_id, request.name, request.description)
    }

    pub fn delete_batch(&mut self, batch_id: &str, caller: Principal) -> Result<(), String> {
        let batch = self.batch_repo.get(batch_id)
            .ok_or_else(|| "Batch not found".to_string())?;

        if batch.owner != caller {
            return Err("Unauthorized: Only the owner can delete this batch".to_string());
        }

        if batch.deleted_at.is_some() {
            return Err("Batch is already deleted".to_string());
        }

        self.batch_repo.delete(batch_id)?;

        // Mark all associated weights as deleted
        let weights = self.weight_repo.get_all(Some(batch_id.to_string()), false);
        for weight in weights {
            let key = WeightKey {
                owner: weight.owner,
                item_id: weight.item_id,
                created_at: weight.created_at,
            };
            self.weight_repo.delete(key)?;
        }

        Ok(())
    }
}

pub struct AccessControlService<A: AccessControl, B: BatchRepository> {
    access_control: A,
    batch_repo: B,
}

impl<A: AccessControl, B: BatchRepository> AccessControlService<A, B> {
    pub fn new(access_control: A, batch_repo: B) -> Self {
        Self { 
            access_control,
            batch_repo,
        }
    }

    pub fn share_with_user(&mut self, owner: Principal, collaborator: Principal, batch_id: String) -> Result<String, String> {
        if owner == collaborator {
            return Err("Cannot share data with yourself".to_string());
        }

        if collaborator == Principal::anonymous() {
            return Err("Cannot share with anonymous principal".to_string());
        }

        if batch_id.trim().is_empty() {
            return Err("Batch ID cannot be empty".to_string());
        }

        // Check if batch exists (we'll need to add BatchRepository as a dependency)
        match self.batch_repo.get(&batch_id) {
            None => return Err("Batch not found".to_string()),
            Some(batch) => {
                if batch.owner != owner {
                    return Err("Only the owner can share this batch".to_string());
                }
                if batch.deleted_at.is_some() {
                    return Err("Cannot share deleted batch".to_string());
                }
            }
        }

        // Check if already shared
        if self.access_control.has_access(owner, collaborator, Some(&batch_id)) {
            return Err("Batch is already shared with this user".to_string());
        }

        self.access_control.share_access(owner, collaborator, batch_id)?;
        Ok("Successfully shared batch with collaborator".to_string())
    }

    pub fn remove_sharing(&mut self, caller: Principal, collaborator: Principal) -> Result<String, String> {
        // Get all batches owned by the caller
        let all_batches = self.batch_repo.get_all(false)
            .into_iter()
            .filter(|b| b.owner == caller)
            .collect::<Vec<_>>();

        if all_batches.is_empty() {
            return Err("Only the owner can remove sharing permissions".to_string());
        }

        // Get all shared batches with this collaborator
        let shared_batches = self.access_control.get_collaborators(caller);
        if !shared_batches.contains(&collaborator) {
            return Err("No sharing permissions found with this collaborator".to_string());
        }

        // Remove access for all batches
        let mut removed_count = 0;
        for batch in all_batches {
            if self.access_control.has_access(caller, collaborator, Some(&batch.id)) {
                self.access_control.remove_access(caller, collaborator)?;
                removed_count += 1;
            }
        }

        if removed_count == 0 {
            Ok("No shared batches found to remove".to_string())
        } else {
            Ok(format!("Successfully removed sharing permissions for {} batches", removed_count))
        }
    }

    pub fn get_collaborators(&self, owner: Principal) -> Vec<Principal> {
        self.access_control.get_collaborators(owner)
    }
}
