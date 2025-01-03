import { useState, useEffect } from 'react';
import collaboratorService from '../services/CollaboratorService';
import notificationService from '../services/NotificationService';

export function useCollaborators(backendActor) {
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorId, setCollaboratorId] = useState('');
  const [sharingBatchId, setSharingBatchId] = useState('');
  const [shareableBatches, setShareableBatches] = useState([]);

  useEffect(() => {
    if (backendActor) {
      collaboratorService.setActor(backendActor);
      Promise.all([
        fetchCollaborators(),
        fetchShareableBatches()
      ]).catch(error => {
        console.error('Error initializing collaborator data:', error);
        notificationService.error('Failed to initialize collaborator data');
      });
    }
  }, [backendActor]);

  async function fetchCollaborators() {
    try {
      const fetchedCollaborators = await collaboratorService.fetchCollaborators();
      setCollaborators(fetchedCollaborators);
    } catch (error) {
      notificationService.error('Failed to fetch collaborators');
    }
  }

  async function fetchShareableBatches() {
    try {
      console.log('Fetching shareable batches in hook...');
      const batches = await collaboratorService.fetchShareableBatches();
      console.log('Setting shareable batches:', batches);
      setShareableBatches(batches);
    } catch (error) {
      console.error('Failed to fetch shareable batches:', error);
      notificationService.error('Failed to fetch shareable batches');
    }
  }

  async function shareWithCollaborator(e) {
    e.preventDefault();
    try {
      if (!sharingBatchId) {
        notificationService.error('Please select a batch to share');
        return;
      }

      await collaboratorService.shareWithUser(collaboratorId, sharingBatchId);
      notificationService.success('Batch shared successfully');
      
      await Promise.all([
        fetchCollaborators(),
        fetchShareableBatches()
      ]);
      
      setCollaboratorId('');
      setSharingBatchId('');
    } catch (error) {
      notificationService.error(`Error sharing batch: ${error.message}`);
    }
  }

  async function removeCollaborator(principalId) {
    try {
      await collaboratorService.removeCollaborator(principalId);
      notificationService.success('Collaborator removed successfully');
      await fetchCollaborators();
    } catch (error) {
      notificationService.error(`Error removing collaborator: ${error.message}`);
    }
  }

  const hasAccess = (collaborator, batchId, batches) => {
    try {
      const batch = batches.find(b => b.batch.id === batchId);
      if (!batch) return false;
      
      return batch.batch.shared_with.some(
        shared => shared.toText() === collaborator.toText()
      );
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  };

  return {
    collaborators,
    collaboratorId,
    sharingBatchId,
    shareableBatches,
    setCollaboratorId,
    setSharingBatchId,
    shareWithCollaborator,
    removeCollaborator,
    hasAccess,
    fetchShareableBatches,
    fetchCollaborators
  };
} 