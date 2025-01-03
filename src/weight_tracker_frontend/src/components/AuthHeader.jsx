import React from 'react';
import PropTypes from 'prop-types';

const AuthHeader = ({ isAuthenticated, principal, onLogout, onLogin, onCopyPrincipal }) => {
  return (
    <div className="d-flex justify-content-end mb-3">
      {isAuthenticated ? (
        <div className="d-flex align-items-center">
          <span 
            className="me-3 principal-text" 
            onClick={onCopyPrincipal}
            style={{ cursor: 'pointer' }}
            title="Click to copy Principal ID"
          >
            <i className="fas fa-user me-2"></i>
            {principal || 'Loading...'}
          </span>
          <button className="btn btn-outline-danger" onClick={onLogout}>
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={onLogin}>
          <i className="fas fa-sign-in-alt me-2"></i>
          Login with Internet Identity
        </button>
      )}
    </div>
  );
};

AuthHeader.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  principal: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,
  onCopyPrincipal: PropTypes.func.isRequired,
};

export default AuthHeader; 