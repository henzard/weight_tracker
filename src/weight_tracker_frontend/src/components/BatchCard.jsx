import React from 'react';
import PropTypes from 'prop-types';

const BatchCard = ({
  batch,
  stats,
  isSelected,
  isOwner,
  onSelect,
  onDelete,
  disabled
}) => {
  return (
    <div 
      className={`card h-100 ${isSelected ? 'border-primary' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
          onSelect();
        }
      }}
      style={{ 
        cursor: disabled ? 'not-allowed' : 'pointer' 
      }}
      data-testid="batch-card"
    >
      <div className="card-body">
        <h5 className="card-title d-flex justify-content-between align-items-center">
          {batch.name}
          {isSelected && (
            <span className="badge bg-primary">Selected</span>
          )}
          {disabled && (
            <span className="badge bg-danger">Deleted</span>
          )}
        </h5>
        <p className="card-text text-muted small">
          {batch.description || 'No description'}
        </p>
        <div className="stats-grid mb-3">
          <div className="stat-item">
            <span className="stat-label">Count</span>
            <span className="stat-value">
              {stats ? stats.count.toString() : '0'}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average</span>
            <span className="stat-value">
              {stats && stats.average_weight ? stats.average_weight.toFixed(2) : '0.00'} kg
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Min</span>
            <span className="stat-value">
              {stats && stats.min_weight ? stats.min_weight.toFixed(2) : '0.00'} kg
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max</span>
            <span className="stat-value">
              {stats && stats.max_weight ? stats.max_weight.toFixed(2) : '0.00'} kg
            </span>
          </div>
        </div>
        <div className="btn-group w-100">
          <button 
            className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect();
            }}
            disabled={disabled}
          >
            <i className={`fas ${isSelected ? 'fa-check' : 'fa-edit'} me-2`}></i>
            {isSelected ? 'Selected' : 'Select'}
          </button>
          {isOwner && !disabled && (
            <button 
              className="btn btn-outline-danger"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
            >
              <i className="fas fa-trash me-2"></i>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

BatchCard.propTypes = {
  batch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    deleted_at: PropTypes.array,
  }).isRequired,
  stats: PropTypes.shape({
    count: PropTypes.number.isRequired,
    average_weight: PropTypes.number,
    min_weight: PropTypes.number,
    max_weight: PropTypes.number,
  }),
  isSelected: PropTypes.bool.isRequired,
  isOwner: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default BatchCard; 