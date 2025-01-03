import { useState, useEffect } from 'react';
import weightService from '../services/WeightService';
import notificationService from '../services/NotificationService';

export function useWeights(backendActor, selectedBatch) {
  const [weights, setWeights] = useState([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [editingWeight, setEditingWeight] = useState(null);

  useEffect(() => {
    if (backendActor) {
      weightService.setActor(backendActor);
      fetchWeights();
    }
  }, [backendActor, selectedBatch?.id, includeDeleted]);

  async function fetchWeights() {
    try {
      const fetchedWeights = await weightService.fetchWeights(
        selectedBatch?.id, 
        includeDeleted
      );
      setWeights(fetchedWeights);
    } catch (error) {
      notificationService.error("Failed to fetch weights");
    }
  }

  async function createWeight(request) {
    try {
      await weightService.createWeight(request);
      notificationService.success('Weight added successfully');
      await fetchWeights();
      return true;
    } catch (error) {
      notificationService.error(`Error adding weight: ${error.message}`);
      return false;
    }
  }

  async function deleteWeight(item_id, created_at) {
    try {
      const response = await backendActor.delete_weight(item_id, created_at);
      await fetchWeights();
      notificationService.success('Weight deleted successfully');
    } catch (error) {
      notificationService.error(`Error deleting weight: ${error.message}`);
    }
  }

  async function updateWeight(item_id, created_at, weight) {
    try {
      const response = await backendActor.update_weight(item_id, created_at, weight);
      await fetchWeights();
      setEditingWeight(null);
      notificationService.success('Weight updated successfully');
    } catch (error) {
      notificationService.error(`Error updating weight: ${error.message}`);
    }
  }

  return {
    weights,
    editingWeight,
    includeDeleted,
    setIncludeDeleted,
    setEditingWeight,
    createWeight,
    deleteWeight,
    updateWeight,
    fetchWeights
  };
} 