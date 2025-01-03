import React from 'react';
import PropTypes from 'prop-types';
import Tour from 'reactour';

const GuidedTour = ({ isOpen, onClose }) => {
  const steps = [
    {
      selector: '[data-tour="batch-list"]',
      content: 'Start by creating a new batch to organize your weights',
    },
    {
      selector: '[data-tour="weight-form"]',
      content: 'Select a batch and add your first weight measurement',
    },
    {
      selector: '[data-tour="weight-table"]',
      content: 'View and manage all your recorded weights here',
    },
    {
      selector: '[data-tour="quick-guide"]',
      content: 'Access the quick guide anytime for help',
    },
  ];

  return (
    <Tour
      steps={steps}
      isOpen={isOpen}
      onRequestClose={onClose}
      rounded={8}
      accentColor="#0d6efd"
    />
  );
};

GuidedTour.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GuidedTour; 