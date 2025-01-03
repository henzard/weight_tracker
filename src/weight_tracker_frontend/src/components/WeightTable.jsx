import React from 'react';
import PropTypes from 'prop-types';
import { Suspense } from 'react';
import DataTable from 'react-data-table-component';

const WeightTable = ({
  weights,
  onDelete,
  onRowClick,
  includeDeleted,
  onIncludeDeletedChange,
  filterText,
  onFilterTextChange,
  principal,
  selectedBatch,
  onClearBatchSelection
}) => {
  const columns = [
    {
      name: 'Item ID',
      selector: row => row.item_id,
      sortable: true,
    },
    {
      name: 'Weight (kg)',
      selector: row => row.weight,
      sortable: true,
      format: row => row.weight.toFixed(2),
    },
    {
      name: 'Date',
      selector: row => row.created_at,
      sortable: true,
      format: row => new Date(Number(row.created_at) / 1000000).toLocaleString(),
    },
    {
      name: 'Status',
      selector: row => row.deleted_at,
      sortable: true,
      cell: row => (
        Array.isArray(row.deleted_at) && row.deleted_at.length > 0 
          ? <span className="badge bg-danger">Deleted</span>
          : <span className="badge bg-success">Active</span>
      ),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="btn-group">
          {!(Array.isArray(row.deleted_at) && row.deleted_at.length > 0) && (
            <button
              className="btn btn-sm btn-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.item_id, row.created_at);
              }}
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      ),
    },
  ];

  const customStyles = {
    rows: {
      style: {
        cursor: 'pointer',
      },
    },
  };

  const conditionalRowStyles = [
    {
      when: row => Array.isArray(row.deleted_at) && row.deleted_at.length > 0,
      style: {
        backgroundColor: '#ffebee',
        color: '#666',
        '&:hover': {
          cursor: 'not-allowed',
        },
      },
    },
    {
      when: row => row.owner.toText() === principal,
      style: {
        backgroundColor: '#e3f2fd',
      },
    },
  ];

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <div className="row align-items-center">
          <div className="col">
            <h5 className="mb-0">
              <i className="fas fa-table me-2"></i>
              Weight History
              {selectedBatch && (
                <span className="badge bg-primary ms-2">
                  Batch: {selectedBatch.name}
                </span>
              )}
            </h5>
          </div>
          <div className="col-auto">
            <div className="d-flex align-items-center gap-3">
              <div className="legend-item">
                <span className="badge bg-secondary me-1">Your Data</span>
                <small className="text-muted">(highlighted in blue)</small>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="includeDeleted"
                  checked={includeDeleted}
                  onChange={(e) => onIncludeDeletedChange(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeDeleted">
                  Show Deleted Records
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <Suspense fallback={<div>Loading table...</div>}>
          <DataTable
            columns={columns}
            data={weights}
            pagination
            paginationPerPage={10}
            customStyles={customStyles}
            conditionalRowStyles={conditionalRowStyles}
            onRowClicked={row => 
              !(Array.isArray(row.deleted_at) && row.deleted_at.length > 0) && 
              onRowClick(row)
            }
            subHeader
            subHeaderComponent={
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="fas fa-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={filterText}
                    onChange={(e) => onFilterTextChange(e.target.value)}
                    placeholder="Filter by Item ID..."
                  />
                  {selectedBatch && (
                    <button
                      className="btn btn-outline-secondary"
                      onClick={onClearBatchSelection}
                      title="Clear batch filter"
                    >
                      <i className="fas fa-filter-circle-xmark"></i>
                    </button>
                  )}
                </div>
                {selectedBatch && (
                  <div className="small text-muted mt-1">
                    Showing weights for batch: {selectedBatch.name}
                  </div>
                )}
              </div>
            }
            striped
            highlightOnHover
            responsive
          />
        </Suspense>
      </div>
    </div>
  );
};

WeightTable.propTypes = {
  weights: PropTypes.array.isRequired,
  onDelete: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
  includeDeleted: PropTypes.bool.isRequired,
  onIncludeDeletedChange: PropTypes.func.isRequired,
  filterText: PropTypes.string.isRequired,
  onFilterTextChange: PropTypes.func.isRequired,
  principal: PropTypes.string,
  selectedBatch: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
  onClearBatchSelection: PropTypes.func.isRequired,
};

export default WeightTable; 