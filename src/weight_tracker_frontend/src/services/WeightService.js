class WeightService {
  constructor() {
    this.actor = null;
  }

  setActor(actor) {
    this.actor = actor;
  }

  async fetchWeights(selectedBatchId = null, includeDeleted = false) {
    if (!this.actor) throw new Error('Actor not initialized');

    try {
      console.log("Fetching weights with batch filter:", selectedBatchId);
      const fetchedWeights = await this.actor.get_all_weights(
        selectedBatchId ? [selectedBatchId] : [], 
        includeDeleted
      );
      console.log("Fetched weights:", {
        batchId: selectedBatchId,
        totalWeights: fetchedWeights.length,
        weights: fetchedWeights
      });
      return fetchedWeights;
    } catch (error) {
      console.error("Error fetching weights:", error);
      throw error;
    }
  }

  async createWeight(request) {
    if (!this.actor) throw new Error('Actor not initialized');
    
    // Add owner_override field with null value
    const weightRequest = {
      ...request,
      owner_override: [] // Empty array for Option<Principal> in Rust
    };

    try {
      await this.actor.create_weight(weightRequest);
      return true;
    } catch (error) {
      console.error('Error creating weight:', error);
      throw error;
    }
  }

  async updateWeight(animalId, createdAt, newWeight) {
    if (!this.actor) throw new Error('Actor not initialized');

    try {
      await this.actor.update_weight(
        animalId,
        createdAt,
        parseFloat(newWeight)
      );
      return true;
    } catch (error) {
      console.error('Error updating weight:', error);
      throw error;
    }
  }

  async deleteWeight(animalId, createdAt) {
    if (!this.actor) throw new Error('Actor not initialized');

    try {
      await this.actor.delete_weight(animalId, createdAt);
      return true;
    } catch (error) {
      console.error('Error deleting weight:', error);
      throw error;
    }
  }
}

const weightService = new WeightService();
export default weightService;