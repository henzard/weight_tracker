import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CollapsibleCard from './common/CollapsibleCard';

const CollaboratorList = ({
  collaborators,
  shareableBatches,
  collaboratorId,
  sharingBatchId,
  isSharing = false,
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

  const [searchTerm, setSearchTerm] = useState('');
  const filteredCollaborators = collaborators.filter(c => 
    c.toText().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CollapsibleCard 
      title="Manage Data Sharing"
      icon="fas fa-users"
      headerClassName="bg-info"
      defaultExpanded={false}
    >
      <div className="card-body">
        <form onSubmit={onShare} className="mb-4" data-testid="share-form">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="collaboratorId" className="form-label">
                Share with (Principal ID)
                <i 
                  className="fas fa-info-circle ms-1" 
                  data-bs-toggle="tooltip" 
                  title="Enter the Principal ID of the user you want to share with"
                ></i>
              </label>
              <input
                id="collaboratorId"
                className="form-control"
                value={collaboratorId}
                onChange={(e) => onCollaboratorIdChange(e.target.value)}
                placeholder="Enter collaborator's Principal ID"
                aria-describedby="collaboratorHelp"
                required
              />
              <div id="collaboratorHelp" className="form-text">
                The Principal ID can be found in the user's profile
              </div>
            </div>
            <div className="col-md-4">
              <label htmlFor="sharingBatchId" className="form-label">
                Select Batch to Share
              </label>
              <select
                className="form-select"
                value={sharingBatchId}
                id="sharingBatchId"
                onChange={(e) => onSharingBatchIdChange(e.target.value)}
                disabled={!collaboratorId}
              >
                <option value="">
                  {!collaboratorId 
                    ? "Enter collaborator ID first" 
                    : "Select a batch to share"}
                </option>
                {shareableBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSharing || !collaboratorId || !sharingBatchId}
              >
                <i className={`fas ${isSharing ? 'fa-spinner fa-spin' : 'fa-share'} me-2`}></i>
                {isSharing ? 'Sharing...' : 'Share Batch'}
              </button>
            </div>
          </div>
        </form>

        {collaborators.length > 0 && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6>Current Collaborators:</h6>
              <input
                type="search"
                className="form-control w-auto"
                placeholder="Search collaborators..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <ul className="list-group">
              {filteredCollaborators.map((c) => (
                <li key={c.toText()} className="list-group-item">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="principal-text">{c.toText()}</span>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (window.confirm(`Remove collaborator ${c.toText()}?`)) {
                          onRemoveCollaborator(c.toText())
                        }
                      }}
                      data-bs-toggle="tooltip"
                      title="Remove collaborator access"
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
                        <span
                          key={b.batch.id}
                          className="badge bg-info me-1"
                          data-testid="batch-badge"
                        >
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