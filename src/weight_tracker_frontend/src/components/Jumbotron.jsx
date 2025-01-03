import React from 'react';

const Jumbotron = () => {
  return (
    <div className="p-5 mb-4 bg-light rounded-3">
      <div className="container-fluid py-3">
        <h1 className="display-5 fw-bold">
          <i className="fas fa-weight me-3"></i>
          Weight Tracker
        </h1>
        <p className="col-md-8 fs-4">
          Track, manage, and analyze weights efficiently. Create batches to organize your data and share with collaborators.
        </p>
      </div>
    </div>
  );
};

export default Jumbotron; 