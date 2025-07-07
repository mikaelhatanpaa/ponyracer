import { RaceModel } from '@/models/RaceModel';
import axios from 'axios';

export function useRaceService() {
  return {
    async list(status: 'PENDING' | 'RUNNING' | 'FINISHED'): Promise<Array<RaceModel>> {
      const response = await axios.get<Array<RaceModel>>('https://ponyracer.ninja-squad.com/api/races', {
        params: {
          status
        }
      });

      return response.data;
    },

    async get(raceId: number): Promise<RaceModel> {
      const response = await axios.get<RaceModel>(`https://ponyracer.ninja-squad.com/api/races/${raceId}`);
      return response.data;
    },
    async bet(raceId: number, ponyId: number): Promise<RaceModel> {
      const response = await axios.post<RaceModel>(`https://ponyracer.ninja-squad.com/api/races/${raceId}/bets`, { ponyId });
      return response.data;
    },

    async cancelBet(raceId: number): Promise<void> {
      await axios.delete(`https://ponyracer.ninja-squad.com/api/races/${raceId}/bets`);
    },

    async boost(raceId: number, ponyId: number): Promise<void> {
      await axios.post(`https://ponyracer.ninja-squad.com/api/races/${raceId}/boosts`, { ponyId });
    }
  };
}
