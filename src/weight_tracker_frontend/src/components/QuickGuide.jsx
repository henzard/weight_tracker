import React from 'react';
import CollapsibleCard from './common/CollapsibleCard';

const QuickGuide = () => {
  return (
    <CollapsibleCard 
      title="Quick Guide"
      icon="fas fa-info-circle"
      headerClassName="bg-info"
      defaultExpanded={false}
    >
      <ol className="mb-0">
        <li>Create a batch to group related weights</li>
        <li>Select a batch to start recording weights</li>
        <li>Enter the item ID and weight</li>
        <li>View and manage your recorded weights</li>
        <li>Share batches with collaborators</li>
      </ol>
    </CollapsibleCard>
  );
};

export default QuickGuide; 