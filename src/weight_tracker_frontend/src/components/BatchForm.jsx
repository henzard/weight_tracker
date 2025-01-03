import React from 'react';
import PropTypes from 'prop-types';

const BatchForm = ({
  batchName,
  batchDescription,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="mb-4" data-testid="batch-form">
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Batch Name</label>
          <input
            className="form-control"
            value={batchName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter batch name"
            required
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Description (Optional)</label>
          <input
            className="form-control"
            value={batchDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Enter batch description"
          />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-success me-2">
            <i className="fas fa-save me-2"></i>
            Create Batch
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

BatchForm.propTypes = {
  batchName: PropTypes.string.isRequired,
  batchDescription: PropTypes.string.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default BatchForm; 