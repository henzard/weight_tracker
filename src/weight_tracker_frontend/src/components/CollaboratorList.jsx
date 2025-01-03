import React from 'react';
import PropTypes from 'prop-types';
import CollapsibleCard from './common/CollapsibleCard';

const CollaboratorList = ({
  collaborators,
  shareableBatches,
  collaboratorId,
  sharingBatchId,
  onCollaboratorIdChange,
  onSharingBatchIdChange,
  onShare,
  onRemoveCollaborator,
  principal,
  batches,
  hasAccess,
}) => {
  console.log('CollaboratorList render:', {
    shareableBatches,
    collaboratorId,
    sharingBatchId
  });

  return (
    <CollapsibleCard 
      title="Manage Data Sharing"
      icon="fas fa-users"
      headerClassName="bg-info"
      defaultExpanded={false}
    >
      <div className="card-body">
        <form onSubmit={onShare} className="mb-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="collaboratorId" className="form-label">
                Share with (Principal ID)
              </label>
              <input
                id="collaboratorId"
                className="form-control"
                value={collaboratorId}
                onChange={(e) => onCollaboratorIdChange(e.target.value)}
                placeholder="Enter collaborator's Principal ID"
                required
              />
            </div>
            <div className="col-md-4">
              <label htmlFor="sharingBatchId" className="form-label">
                Select Batch to Share
              </label>
              <select
                className="form-select"
                value={sharingBatchId}
                onChange={(e) => {
                  console.log('Batch selected:', e.target.value);
                  onSharingBatchIdChange(e.target.value);
                }}
              >
                <option value="">Select a batch to share</option>
                {shareableBatches.map((batch) => {
                  console.log('Rendering batch option:', batch);
                  return (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-share me-2"></i>
                Share Batch
              </button>
            </div>
          </div>
        </form>

        {collaborators.length > 0 && (
          <div>
            <h6>Current Collaborators:</h6>
            <ul className="list-group">
              {collaborators.map((c) => (
                <li key={c.toText()} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="principal-text">{c.toText()}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemoveCollaborator(c.toText())}
                    >
                      <i className="fas fa-user-minus"></i>
                    </button>
                  </div>
                  <div className="small text-muted">
                    <strong>Shared Batches:</strong>
                    {batches
                      .filter(b => b.batch.owner.toText() === principal && 
                                !b.batch.deleted_at &&
                                hasAccess(c, b.batch.id))
                      .map(b => (
                        <span key={b.batch.id} className="badge bg-info me-1">
                          {b.batch.name}
                        </span>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

CollaboratorList.propTypes = {
  collaborators: PropTypes.array.isRequired,
  shareableBatches: PropTypes.array.isRequired,
  collaboratorId: PropTypes.string.isRequired,
  sharingBatchId: PropTypes.string.isRequired,
  onCollaboratorIdChange: PropTypes.func.isRequired,
  onSharingBatchIdChange: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onRemoveCollaborator: PropTypes.func.isRequired,
  principal: PropTypes.string.isRequired,
  batches: PropTypes.array.isRequired,
  hasAccess: PropTypes.func.isRequired,
};

export default CollaboratorList; 