import { useEffect } from 'react';
import weightService from '../services/WeightService';
import batchService from '../services/BatchService';
import collaboratorService from '../services/CollaboratorService';

export function useActor(actor) {
  useEffect(() => {
    if (actor) {
      // Update the actor in all services
      weightService.setActor(actor);
      batchService.setActor(actor);
      collaboratorService.setActor(actor);
    }
  }, [actor]);
} 