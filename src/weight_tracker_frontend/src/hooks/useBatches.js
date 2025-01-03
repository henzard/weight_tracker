import { useState, useEffect } from 'react';
import batchService from '../services/BatchService';
import notificationService from '../services/NotificationService';

export function useBatches(backendActor) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [includedDeletedBatches, setIncludeDeletedBatches] = useState(false);
  const [batchSelectionTime, setBatchSelectionTime] = useState(null);

  useEffect(() => {
    if (!backendActor) {
      setBatches([]);
      setSelectedBatch(null);
      setBatchSelectionTime(null);
    }
  }, [backendActor]);

  useEffect(() => {
    if (backendActor) {
      batchService.setActor(backendActor);
      fetchBatches();
    }
  }, [backendActor, includedDeletedBatches]);

  async function fetchBatches() {
    if (!backendActor) return;
    try {
      console.log('Fetching batches...');
      const fetchedBatches = await batchService.fetchBatches(includedDeletedBatches);
      console.log('Fetched batches:', fetchedBatches);
      setBatches(fetchedBatches);
      return fetchedBatches;
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      notificationService.error('Failed to fetch batches');
    }
  }

  async function createBatch(name, description) {
    try {
      await batchService.createBatch(name, description);
      notificationService.success('Batch created successfully');
      await fetchBatches();
      return true;
    } catch (error) {
      notificationService.error(`Error creating batch: ${error.message}`);
      return false;
    }
  }

  async function deleteBatch(batchId) {
    if (window.confirm('Are you sure? This will also mark all weights in this batch as deleted.')) {
      try {
        await batchService.deleteBatch(batchId);
        notificationService.success('Batch deleted successfully');
        await fetchBatches();
        
        if (selectedBatch?.id === batchId) {
          setSelectedBatch(null);
        }
      } catch (error) {
        notificationService.error(`Error deleting batch: ${error.message}`);
      }
    }
  }

  function selectBatch(batchWithStats) {
    try {
      const batchData = batchWithStats.batch || batchWithStats;
      
      if (!batchData || !batchData.id) {
        throw new Error('Invalid batch data');
      }

      setSelectedBatch(batchData);
      setBatchSelectionTime(Date.now());
      notificationService.info(`Selected batch: ${batchData.name}`);
    } catch (error) {
      console.error('Error in selectBatch:', error);
      notificationService.error('Failed to select batch');
    }
  }

  function clearSelectedBatch() {
    setSelectedBatch(null);
    setBatchSelectionTime(null);
    notificationService.info('Batch selection cleared');
  }

  return {
    batches,
    selectedBatch,
    includedDeletedBatches,
    setIncludeDeletedBatches,
    createBatch,
    deleteBatch,
    selectBatch,
    clearSelectedBatch,
    fetchBatches
  };
} 