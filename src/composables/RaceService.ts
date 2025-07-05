import { RaceModel } from '@/models/RaceModel';
import axios from 'axios';

export function useRaceService() {
  return {
    async list(): Promise<Array<RaceModel>> {
      const response = await axios.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', {
        params: {
          status: 'PENDING'
        }
      });

      return response.data;
    }
  };
}
