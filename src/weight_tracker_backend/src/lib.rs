mod models;
mod traits;
mod repositories;
mod services;

use candid::Principal;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::Arc;
use models::*;
use services::*;
use repositories::*;
use traits::CanisterTimeProvider;

#[cfg(test)]
mod tests;

thread_local! {
    static STORAGE: (
        Arc<RefCell<HashMap<WeightKey, Weight>>>,
        Arc<RefCell<HashMap<String, Batch>>>,
        Arc<RefCell<HashMap<String, SharingPermissions>>>
    ) = (
        Arc::new(RefCell::new(HashMap::new())),
        Arc::new(RefCell::new(HashMap::new())),
        Arc::new(RefCell::new(HashMap::new()))
    );

    static SERVICES: RefCell<(
        WeightService<WeightStorageImpl<CanisterTimeProvider>, BatchStorageImpl<CanisterTimeProvider>, AccessControlImpl, CanisterTimeProvider>,
        BatchService<BatchStorageImpl<CanisterTimeProvider>, WeightStorageImpl<CanisterTimeProvider>, AccessControlImpl, CanisterTimeProvider>,
        AccessControlService<AccessControlImpl, BatchStorageImpl<CanisterTimeProvider>>
    )> = {
        STORAGE.with(|storage| {
            let weight_store = WeightStorageImpl::with_storage(storage.0.clone(), CanisterTimeProvider);
            let batch_store = BatchStorageImpl::with_storage(storage.1.clone(), CanisterTimeProvider);
            let access_control = AccessControlImpl::with_storage(storage.2.clone());

            RefCell::new((
                WeightService::new(
                    weight_store.clone(),
                    batch_store.clone(),
                    access_control.clone(),
                    CanisterTimeProvider
                ),
                BatchService::new(
                    batch_store.clone(),
                    weight_store.clone(),
                    access_control.clone(),
                    CanisterTimeProvider
                ),
                AccessControlService::new(
                    access_control,
                    batch_store
                )
            ))
        })
    };
}

fn is_anonymous() -> bool {
    ic_cdk::caller() == Principal::anonymous()
}

// Weight Management
#[ic_cdk::update]
fn create_weight(request: CreateWeightRequest) -> String {
    if is_anonymous() {
        return "Please login with Internet Identity to create weights".to_string();
    }
    
    SERVICES.with(|services| {
        let (weight_service, _, _) = &mut *services.borrow_mut();
        weight_service.create_weight(request, ic_cdk::caller())
            .unwrap_or_else(|e| e)
    })
}

#[ic_cdk::query]
fn get_all_weights(batch_id: Option<String>, include_deleted: bool) -> Vec<Weight> {
    if is_anonymous() {
        return Vec::new();
    }
    
    SERVICES.with(|services| {
        let (weight_service, _, _) = &mut *services.borrow_mut();
        weight_service.get_weights(batch_id, include_deleted, ic_cdk::caller())
    })
}

#[ic_cdk::update]
fn update_weight(item_id: String, created_at: u64, weight: f64) -> String {
    if is_anonymous() {
        return "Please login with Internet Identity to update weights".to_string();
    }
    
    SERVICES.with(|services| {
        let (weight_service, _, _) = &mut *services.borrow_mut();
        weight_service.update_weight(item_id, created_at, weight, ic_cdk::caller())
            .unwrap_or_else(|e| e)
    })
}

#[ic_cdk::update]
fn delete_weight(item_id: String, created_at: u64) -> String {
    if is_anonymous() {
        return "Please login with Internet Identity to delete weights".to_string();
    }
    
    SERVICES.with(|services| {
        let (weight_service, _, _) = &mut *services.borrow_mut();
        weight_service.delete_weight(item_id, created_at, ic_cdk::caller())
            .unwrap_or_else(|e| e)
    })
}

// Batch Management
#[ic_cdk::update]
fn create_batch(request: CreateBatchRequest) -> Result<String, String> {
    if is_anonymous() {
        ic_cdk::println!("Anonymous user attempted to create batch");
        return Err("Please login to create batches".to_string());
    }

    ic_cdk::println!("Creating batch with name: {}", request.name);
    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        ic_cdk::println!("Got batch service, creating batch");
        batch_service.create_batch(request, ic_cdk::caller())
    })
}

#[ic_cdk::query]
fn get_batches(include_deleted: bool) -> Vec<BatchWithStats> {
    if is_anonymous() {
        return Vec::new();
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.get_batches(include_deleted, ic_cdk::caller())
    })
}

#[ic_cdk::query]
fn get_batch(batch_id: String) -> Result<BatchWithStats, String> {
    if is_anonymous() {
        return Err("Please login to view batches".to_string());
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.get_batch(&batch_id, ic_cdk::caller())
    })
}

#[ic_cdk::update]
fn update_batch(batch_id: String, request: UpdateBatchRequest) -> Result<(), String> {
    if is_anonymous() {
        return Err("Please login to update batches".to_string());
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.update_batch(&batch_id, request, ic_cdk::caller())
    })
}

#[ic_cdk::update]
fn delete_batch(batch_id: String) -> Result<(), String> {
    if is_anonymous() {
        return Err("Please login to delete batches".to_string());
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.delete_batch(&batch_id, ic_cdk::caller())
    })
}

// Access Control
#[ic_cdk::update]
fn share_with_user(collaborator_principal: Principal, batch_id: String) -> String {
    if is_anonymous() {
        return "Please login with Internet Identity to share data".to_string();
    }

    SERVICES.with(|services| {
        let (_, _, access_service) = &mut *services.borrow_mut();
        access_service.share_with_user(ic_cdk::caller(), collaborator_principal, batch_id)
            .unwrap_or_else(|e| e)
    })
}

#[ic_cdk::update]
fn remove_sharing(request: RemoveSharingRequest) -> String {
    if is_anonymous() {
        return "Please login with Internet Identity to remove sharing".to_string();
    }

    SERVICES.with(|services| {
        let (_, _, access_service) = &mut *services.borrow_mut();
        access_service.remove_sharing(ic_cdk::caller(), request.collaborator)
            .unwrap_or_else(|e| e)
    })
}

#[ic_cdk::query]
fn get_collaborators() -> Vec<Principal> {
    SERVICES.with(|services| {
        let (_, _, access_service) = &mut *services.borrow_mut();
        access_service.get_collaborators(ic_cdk::caller())
    })
}

#[ic_cdk::query]
fn whoami() -> Principal {
    ic_cdk::caller()
}

// Additional batch queries
#[ic_cdk::query]
fn get_owned_batches() -> Vec<BatchWithStats> {
    if is_anonymous() {
        return Vec::new();
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.get_owned_batches(ic_cdk::caller())
    })
}

#[ic_cdk::query]
fn get_shareable_batches() -> Vec<ShareableBatch> {
    if is_anonymous() {
        return Vec::new();
    }

    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.get_shareable_batches(ic_cdk::caller())
    })
}

#[ic_cdk::query]
fn get_batch_owner(batch_id: String) -> Result<Principal, String> {
    SERVICES.with(|services| {
        let (_, batch_service, _) = &mut *services.borrow_mut();
        batch_service.get_batch_owner(&batch_id)
    })
}
