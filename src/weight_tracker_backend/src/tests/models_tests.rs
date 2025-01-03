use crate::models::*;

#[test]
fn test_batch_stats_empty() {
    let stats = BatchStats::empty();
    assert_eq!(stats.count, 0);
    assert_eq!(stats.min_weight, 0.0);
    assert_eq!(stats.max_weight, 0.0);
    assert_eq!(stats.average_weight, 0.0);
}

#[test]
fn test_batch_stats_from_weights() {
    let weights = vec![10.0, 20.0, 30.0, 40.0, 50.0];
    let stats = BatchStats::from_weights(&weights);
    assert_eq!(stats.count, 5);
    assert_eq!(stats.min_weight, 10.0);
    assert_eq!(stats.max_weight, 50.0);
    assert_eq!(stats.average_weight, 30.0);
} 