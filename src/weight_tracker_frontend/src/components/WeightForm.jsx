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
  return (
    <div className="card mb-4 shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">
          <i className="fas fa-weight me-2"></i>
          Record New Weight
        </h5>
      </div>
      <div className="card-body">
        {!selectedBatch ? (
          <div className="alert alert-warning">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Please select a batch first to add weights
          </div>
        ) : (
          <form onSubmit={onSubmit} className="row g-3" role="form">
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
                className="form-control"
                value={itemId}
                onChange={(e) => onItemIdChange(e.target.value)}
                type="text"
                placeholder="Enter item identifier"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="weight" className="form-label">
                Weight (kg)
                <i className="fas fa-info-circle ms-2" title="Enter the weight in kilograms"></i>
              </label>
              <input
                id="weight"
                className="form-control"
                value={weight}
                onChange={(e) => onWeightChange(e.target.value)}
                type="number"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-plus me-2"></i>
                Add Weight
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