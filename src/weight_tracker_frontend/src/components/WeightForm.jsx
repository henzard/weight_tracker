import React from 'react';
import PropTypes from 'prop-types';

const WeightForm = ({
  selectedBatch,
  itemId,
  weight,
  onItemIdChange,
  onWeightChange,
  onSubmit,
  onClearBatch
}) => {
  const [errors, setErrors] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!itemId.trim()) {
      newErrors.itemId = 'Item ID is required';
    }
    if (!weight || parseFloat(weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-4 shadow-sm" data-tour="weight-form">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-weight me-2"></i>
          Record New Weight
        </h5>
      </div>
      <div className="card-body">
        {!selectedBatch ? (
          <div className="alert alert-info">
            <div className="text-center py-4">
              <i className="fas fa-arrow-up fa-2x mb-3 text-info"></i>
              <h5>Select a Batch to Start</h5>
              <p className="mb-0">
                Choose a batch from the list above or create a new one to begin recording weights
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="row g-3" role="form">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                <span>
                  <i className="fas fa-folder me-2"></i>
                  Selected Batch: <strong>{selectedBatch.name}</strong>
                </span>
                <button 
                  type="button" 
                  className="btn btn-link btn-sm text-muted p-0"
                  onClick={onClearBatch}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear
                </button>
              </div>
            </div>
            
            <div className="col-md-4">
              <label htmlFor="itemId" className="form-label">
                Item ID
                <i className="fas fa-info-circle ms-2" title="Enter a unique identifier for the item"></i>
              </label>
              <input
                id="itemId"
                className={`form-control ${errors.itemId ? 'is-invalid' : ''}`}
                value={itemId}
                onChange={(e) => onItemIdChange(e.target.value)}
                type="text"
                placeholder="Enter item identifier"
                required
              />
              {errors.itemId && (
                <div className="invalid-feedback">{errors.itemId}</div>
              )}
            </div>
            <div className="col-md-4">
              <label htmlFor="weight" className="form-label">
                Weight (kg)
                <i className="fas fa-info-circle ms-2" title="Enter the weight in kilograms"></i>
              </label>
              <input
                id="weight"
                className={`form-control ${errors.weight ? 'is-invalid' : ''}`}
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
              {errors.weight && (
                <div className="invalid-feedback">{errors.weight}</div>
              )}
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Adding...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus me-2"></i>
                    Add Weight
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

WeightForm.propTypes = {
  selectedBatch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  itemId: PropTypes.string.isRequired,
  weight: PropTypes.string.isRequired,
  onItemIdChange: PropTypes.func.isRequired,
  onWeightChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onClearBatch: PropTypes.func.isRequired,
};

export default WeightForm; 