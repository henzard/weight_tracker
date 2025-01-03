import React from 'react';
import PropTypes from 'prop-types';
import CollapsibleCard from './common/CollapsibleCard';
import BatchCard from './BatchCard';
import BatchForm from './BatchForm';

const BatchList = ({
  batches,
  selectedBatch,
  principal,
  onBatchSelect,
  onBatchDelete,
  onCreateBatchClick,
  showBatchForm,
  batchName,
  batchDescription,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <CollapsibleCard 
      title="Weight Batches"
      icon="fas fa-layer-group"
      headerClassName="bg-primary"
      defaultExpanded={true}
      headerActions={
        <button 
          className="btn btn-light btn-sm"
          onClick={onCreateBatchClick}
        >
          <i className={`fas ${showBatchForm ? 'fa-times' : 'fa-plus'} me-2`}></i>
          {showBatchForm ? 'Cancel' : 'New Batch'}
        </button>
      }
    >
      <div className="card-body">
        {showBatchForm && (
          <BatchForm
            batchName={batchName}
            batchDescription={batchDescription}
            onNameChange={onNameChange}
            onDescriptionChange={onDescriptionChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        )}
        <div className="row g-4">
          {batches.map((batchWithStats) => {
            const { batch, stats } = batchWithStats;
            const isDeleted = Array.isArray(batch.deleted_at) && batch.deleted_at.length > 0;
            const isOwner = batch.owner.toText() === principal;

            return (
              <div key={batch.id} className="col-md-6 col-lg-4">
                <BatchCard
                  batch={batch}
                  stats={stats}
                  isSelected={selectedBatch?.id === batch.id}
                  isOwner={isOwner}
                  onSelect={() => onBatchSelect(batchWithStats)}
                  onDelete={() => onBatchDelete(batch.id)}
                  disabled={isDeleted}
                />
              </div>
            );
          })}
          {batches.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">No batches found</td>
            </tr>
          )}
        </div>
      </div>
    </CollapsibleCard>
  );
};

BatchList.propTypes = {
  batches: PropTypes.array.isRequired,
  selectedBatch: PropTypes.object,
  principal: PropTypes.string.isRequired,
  onBatchSelect: PropTypes.func.isRequired,
  onBatchDelete: PropTypes.func.isRequired,
  onCreateBatchClick: PropTypes.func.isRequired,
  showBatchForm: PropTypes.bool.isRequired,
  batchName: PropTypes.string.isRequired,
  batchDescription: PropTypes.string.isRequired,
  onNameChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default BatchList; 