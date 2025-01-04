#[cfg(test)]
mod integration_tests {
    use crate::models::{CreateBatchRequest, CreateWeightRequest};
    use crate::{
        create_batch,
        create_weight,
        share_with_user,
        get_batches
    };
    use candid::Principal;
    use std::cell::RefCell;

    thread_local! {
        static MOCK_CALLER: RefCell<Principal> = RefCell::new(
            Principal::from_text("2vxsx-fae").unwrap()
        );
    }

    // Mock the IC environment
    #[cfg(test)]
    mod ic_mock {
        use super::*;

        pub fn mock_caller() -> Principal {
            MOCK_CALLER.with(|caller| *caller.borrow())
        }

        pub fn set_caller(principal: Principal) {
            MOCK_CALLER.with(|caller| {
                *caller.borrow_mut() = principal;
            });
        }
    }

    // Mock the ic_cdk::caller() function
    #[no_mangle]
    extern "C" fn ic0_msg_caller_size() -> i32 {
        29 // Size of Principal
    }

    #[no_mangle]
    extern "C" fn ic0_msg_caller_copy(dst: u32, _offset: u32, _size: u32) {
        unsafe {
            let caller = ic_mock::mock_caller();
            let bytes = caller.as_slice();
            std::ptr::copy(bytes.as_ptr(), dst as *mut u8, bytes.len());
        }
    }
} 