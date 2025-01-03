class BatchService {
  constructor(backendActor) {
    this.backendActor = backendActor;
  }

  setActor(actor) {
    this.backendActor = actor;
  }

  async fetchBatches(includeDeleted = false) {
    try {
      console.log('Fetching batches...');
      const fetchedBatches = await this.backendActor.get_batches(includeDeleted);
      console.log('Fetched batches:', fetchedBatches);
      return fetchedBatches;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  }

  async createBatch(name, description = '') {
    try {
      const result = await this.backendActor.create_batch({
        name,
        description: description ? [description] : [],
      });
      if ('Ok' in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  }

  async updateBatch(batchId, name, description = '') {
    try {
      const result = await this.backendActor.update_batch(batchId, {
        name,
        description: description ? [description] : [],
      });
      if ('Ok' in result) {
        return result.Ok;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error('Error updating batch:', error);
      throw error;
    }
  }

  async deleteBatch(batchId) {
    try {
      const result = await this.backendActor.delete_batch(batchId);
      if ('Ok' in result) {
        return true;
      }
      throw new Error(result.Err);
    } catch (error) {
      console.error('Error deleting batch:', error);
      throw error;
    }
  }

  async fetchShareableBatches() {
    try {
      const fetchedBatches = await this.backendActor.get_shareable_batches();
      console.log('Fetched shareable batches:', fetchedBatches);
      return fetchedBatches;
    } catch (error) {
      console.error('Error fetching shareable batches:', error);
      throw error;
    }
  }

  async fetchOwnedBatches() {
    try {
      const fetchedBatches = await this.backendActor.get_owned_batches();
      console.log('Fetched owned batches:', fetchedBatches);
      return fetchedBatches;
    } catch (error) {
      console.error('Error fetching owned batches:', error);
      throw error;
    }
  }
}

const batchService = new BatchService(null);
export default batchService;