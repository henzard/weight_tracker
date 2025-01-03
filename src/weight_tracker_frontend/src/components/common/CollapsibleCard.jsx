import React, { useState } from 'react';
import PropTypes from 'prop-types';

const CollapsibleCard = ({ 
  title, 
  icon, 
  children, 
  headerClassName = "bg-primary",
  defaultExpanded = true,
  headerActions
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="card mb-4 shadow-sm">
      <div className={`card-header ${headerClassName} text-white`}>
        <div className="d-flex justify-content-between align-items-center">
          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="d-flex align-items-center"
            role="button"
          >
            <h5 className="mb-0">
              <i className={`${icon} me-2`}></i>
              {title}
            </h5>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ms-2`}></i>
          </div>
          {headerActions && (
            <div onClick={e => e.stopPropagation()}>
              {headerActions}
            </div>
          )}
        </div>
      </div>
      <div className={`collapse ${isExpanded ? 'show' : ''}`}>
        <div className="card-body">
          {children}
        </div>
      </div>
    </div>
  );
};

CollapsibleCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  headerClassName: PropTypes.string,
  defaultExpanded: PropTypes.bool,
  headerActions: PropTypes.node
};

export default CollapsibleCard; 