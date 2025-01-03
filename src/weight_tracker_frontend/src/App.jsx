import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import components
import AuthHeader from './components/AuthHeader';
import Jumbotron from './components/Jumbotron';
import QuickGuide from './components/QuickGuide';
import WeightForm from './components/WeightForm';
import WeightTable from './components/WeightTable';
import BatchList from './components/BatchList';
import CollaboratorList from './components/CollaboratorList';
import LoadingSpinner from './components/LoadingSpinner';
import WelcomeScreen from './components/WelcomeScreen';

// Import hooks
import { useAuth } from './hooks/useAuth';
import { useWeights } from './hooks/useWeights';
import { useBatches } from './hooks/useBatches';
import { useCollaborators } from './hooks/useCollaborators';

function App() {
  const [filterText, setFilterText] = useState('');
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchDescription, setBatchDescription] = useState('');
  const [itemId, setItemId] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  const { 
    isAuthenticated, 
    principal, 
    backendActor, 
    isInitializing: authInitializing,
    login, 
    logout 
  } = useAuth();

  const {
    batches,
    selectedBatch,
    includedDeletedBatches,
    setIncludeDeletedBatches,
    createBatch,
    deleteBatch,
    selectBatch,
    clearSelectedBatch,
    fetchBatches
  } = useBatches(backendActor);

  const {
    weights,
    editingWeight,
    includeDeleted,
    setIncludeDeleted,
    setEditingWeight,
    createWeight,
    deleteWeight,
    updateWeight,
    fetchWeights
  } = useWeights(backendActor, selectedBatch);

  const {
    collaborators,
    collaboratorId,
    sharingBatchId,
    shareableBatches,
    setCollaboratorId,
    setSharingBatchId,
    shareWithCollaborator,
    removeCollaborator,
    hasAccess,
    fetchShareableBatches
  } = useCollaborators(backendActor);

  // Add effect to handle initialization
  useEffect(() => {
    if (backendActor) {
      Promise.all([
        // Initial data fetching
      ]).finally(() => {
        setIsInitializing(false);
        setIsLoading(false);
      });
    }
  }, [backendActor]);

  const handleCopyPrincipal = async () => {
    if (principal) {
      try {
        // Use the modern clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(principal);
          notificationService.success('Principal ID copied to clipboard');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = principal;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            notificationService.success('Principal ID copied to clipboard');
          } catch (err) {
            notificationService.error('Failed to copy Principal ID');
            console.error('Copy failed:', err);
          }
          document.body.removeChild(textArea);
        }
      } catch (err) {
        notificationService.error('Failed to copy Principal ID');
        console.error('Copy failed:', err);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedBatch) return;

    const request = {
      batch_id: selectedBatch.id,
      item_id: itemId,
      weight: Number(weight),
      owner_override: []
    };

    try {
      const success = await createWeight(request);
      if (success) {
        setItemId('');
        setWeight('');
        
        // Now fetchWeights is available
        await Promise.all([
          fetchBatches(),
          fetchWeights(),
          fetchShareableBatches()
        ]);
      }
    } catch (error) {
      console.error('Error creating weight:', error);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    const success = await createBatch(batchName, batchDescription);
    if (success) {
      setBatchName('');
      setBatchDescription('');
      setShowBatchForm(false);
    }
  };

  const mainContent = () => {
    if (!isAuthenticated && !authInitializing) {
      return <WelcomeScreen onLogin={login} />;
    }

    if (authInitializing) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Initializing...</span>
          </div>
          <p className="mt-2">Initializing application...</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your data...</p>
        </div>
      );
    }

    return (
      <>
        <Jumbotron />
        <QuickGuide />
        
        <WeightForm
          selectedBatch={selectedBatch}
          itemId={itemId}
          weight={weight}
          onItemIdChange={setItemId}
          onWeightChange={setWeight}
          onSubmit={handleSubmit}
          onClearBatch={clearSelectedBatch}
        />

        <WeightTable
          weights={weights}
          onDelete={deleteWeight}
          onRowClick={setEditingWeight}
          includeDeleted={includeDeleted}
          onIncludeDeletedChange={setIncludeDeleted}
          filterText={filterText}
          onFilterTextChange={setFilterText}
          principal={principal}
          selectedBatch={selectedBatch}
          onClearBatchSelection={clearSelectedBatch}
        />

        <BatchList
          batches={batches}
          selectedBatch={selectedBatch}
          principal={principal}
          onBatchSelect={selectBatch}
          onBatchDelete={deleteBatch}
          onCreateBatchClick={() => setShowBatchForm(!showBatchForm)}
          showBatchForm={showBatchForm}
          batchName={batchName}
          batchDescription={batchDescription}
          onNameChange={setBatchName}
          onDescriptionChange={setBatchDescription}
          onSubmit={handleCreateBatch}
          onCancel={() => setShowBatchForm(false)}
        />

        <CollaboratorList
          collaborators={collaborators}
          shareableBatches={shareableBatches}
          collaboratorId={collaboratorId}
          sharingBatchId={sharingBatchId}
          onCollaboratorIdChange={setCollaboratorId}
          onSharingBatchIdChange={setSharingBatchId}
          onShare={async (e) => {
            await shareWithCollaborator(e);
            // Refresh both batches and collaborators after sharing
            await Promise.all([
              fetchBatches(),
              fetchShareableBatches()
            ]);
          }}
          onRemoveCollaborator={removeCollaborator}
          principal={principal}
          batches={batches}
          hasAccess={hasAccess}
        />
      </>
    );
  };

  return (
    <div className="container mt-4">
      <ToastContainer
        position="top-right"
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
      {(isAuthenticated || authInitializing) && (
        <AuthHeader
          isAuthenticated={isAuthenticated}
          principal={principal || "Loading..."}
          onLogout={logout}
          onLogin={login}
          onCopyPrincipal={handleCopyPrincipal}
        />
      )}
      {mainContent()}
    </div>
  );
}

export default App;
