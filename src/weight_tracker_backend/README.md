# ⚖️ Weight Tracker Backend 

Welcome to the Weight Tracker Backend! This canister helps you track weights of any items efficiently and securely on the Internet Computer.

## 🎯 What Can It Do?

### 🎨 Batch Management
```candid
// Create a new batch (group your weight records)
create_batch: (CreateBatchRequest) -> (Result<Text, Text>)
// Example:
create_batch({
    name = "Gym Progress 2024";
    description = opt "Weekly weight tracking"
})

// Get all your batches (with detailed stats!)
get_batches: (include_deleted: bool) -> (Vec<BatchWithStats>)

// Update a batch details
update_batch: (batch_id: Text, UpdateBatchRequest) -> (Result<(), Text>)

// Delete a batch
delete_batch: (batch_id: Text) -> (Result<(), Text>)
```

### ⚖️ Weight Management
```candid
// Add a new weight record
create_weight: (CreateWeightRequest) -> (Text)
// Example:
create_weight({
    batch_id = "batch_123";
    item_id = "ITEM_001";
    weight = 75.5;  // in kilograms
})

// Get all weights
get_all_weights: (opt batch_id: Text, include_deleted: bool) -> (Vec<Weight>)

// Update a weight record
update_weight: (item_id: Text, created_at: Nat64, weight: Float64) -> (Text)

// Delete a weight record
delete_weight: (item_id: Text, created_at: Nat64) -> (Text)
```

### 🤝 Collaboration Features
```candid
// Share with other users
share_with_user: (collaborator: Principal, batch_id: Text) -> (Text)

// Remove sharing permissions
remove_sharing: (request: RemoveSharingRequest) -> (Text)

// View your collaborators
get_collaborators: () -> (Vec<Principal>)
```

### 🔍 Utility Functions
```candid
// Get your principal ID
whoami: () -> (Principal)

// Get batch owner
get_batch_owner: (batch_id: Text) -> (Result<Principal, Text>)
```

## 🎭 Error Messages You Might See

- "Cannot share data with yourself"
- "Weight value out of reasonable range"
- "Item ID cannot be empty"
- "Only the owner can update batch details"
- "Batch not found"

## 🔒 Security Features

- Authentication required (no anonymous access)
- Owner-based access control
- Secure sharing permissions
- Data isolation between users

## 🎈 Pro Tips

1. Always check if a batch exists before adding weights
2. Keep your item IDs consistent and meaningful
3. Use descriptive batch names for better organization
4. Share responsibly with trusted collaborators
5. Regular backups of important data recommended

## 🤔 Need Help?

Check the logs! We provide detailed logging for all operations. If something goes wrong, you'll get clear error messages explaining what happened.

## 📊 Use Cases

- Personal fitness tracking
- Inventory management
- Scientific measurements
- Production line monitoring
- Logistics and shipping
- Agricultural yields
- And much more!

## 📝 License

Feel free to use this canister for all your weight-tracking needs. Whether you're tracking fitness progress, inventory, or scientific measurements - we've got you covered! 

Made with ❤️ by your friendly neighborhood developers.