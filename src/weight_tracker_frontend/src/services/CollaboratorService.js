import { Principal } from '@dfinity/principal';

class CollaboratorService {
  constructor() {
    this.actor = null;
  }

  setActor(actor) {
    this.actor = actor;
  }

  async fetchOwnedBatches() {
    if (!this.actor) throw new Error('Actor not initialized');
    try {
      console.log('Fetching owned batches...');
      const batches = await this.actor.get_owned_batches();
      console.log('Raw owned batches:', batches);
      
      // Filter out deleted batches and sort by name
      const validBatches = batches
        .filter(batchWithStats => {
          const batch = batchWithStats.batch;
          return batch && !batch.deleted_at;
        })
        .sort((a, b) => a.batch.name.localeCompare(b.batch.name));
      
      console.log('Processed owned batches:', validBatches);
      return validBatches;
    } catch (error) {
      console.error('Error fetching owned batches:', error);
      throw error;
    }
  }

  async fetchShareableBatches() {
    if (!this.actor) throw new Error('Actor not initialized');
    try {
      console.log('Fetching shareable batches...');
      const batches = await this.actor.get_shareable_batches();
      console.log('Raw shareable batches:', batches);
      
      // No need to filter, just sort
      const sortedBatches = [...batches].sort((a, b) => {
        console.log('Sorting batches:', a.name, b.name);
        return a.name.localeCompare(b.name);
      });
      
      console.log('Final shareable batches:', sortedBatches);
      return sortedBatches;
    } catch (error) {
      console.error('Error fetching shareable batches:', error);
      throw error;
    }
  }

  async fetchCollaborators() {
    if (!this.actor) throw new Error('Actor not initialized');
    try {
      console.log('Fetching collaborators...');
      const fetchedCollaborators = await this.actor.get_collaborators();
      console.log('Fetched collaborators:', fetchedCollaborators);
      return fetchedCollaborators;
    } catch (error) {
      console.error('Error fetching collaborators:', error);
      throw error;
    }
  }

  async shareWithUser(collaboratorId, batchId) {
    if (!this.actor) throw new Error('Actor not initialized');
    try {
      console.log('Sharing batch:', { collaboratorId, batchId });
      const collaboratorPrincipal = Principal.fromText(collaboratorId);
      const result = await this.actor.share_with_user(collaboratorPrincipal, batchId);
      console.log('Share result:', result);
      return result;
    } catch (error) {
      console.error('Error sharing batch:', error);
      throw error;
    }
  }

  async removeCollaborator(principalId) {
    if (!this.actor) throw new Error('Actor not initialized');
    try {
      console.log('Removing collaborator:', principalId);
      const collaboratorPrincipal = Principal.fromText(principalId);
      await this.actor.remove_sharing({ collaborator: collaboratorPrincipal });
      console.log('Collaborator removed successfully');
      return true;
    } catch (error) {
      console.error('Error removing collaborator:', error);
      throw error;
    }
  }
}

const collaboratorService = new CollaboratorService();
export default collaboratorService;