import { RaceModel } from '@/models/RaceModel';
import axios from 'axios';

export function useRaceService() {
  return {
    async list(): Promise<Array<RaceModel>> {
      try {
        const response = await axios.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', {
          params: {
            status: 'PENDING'
          }
        });

        return response.data;
      } catch {
        throw new Error('An error occurred while loading');
      }
    }
  };
}
