import { describe, expect, test, vi } from 'vitest';
import axios, { AxiosResponse } from 'axios';
import { useRaceService } from '@/composables/RaceService';
import { RaceModel } from '@/models/RaceModel';

describe('useRaceService', () => {
  test('should list races', async () => {
    const response = { data: [{ name: 'Paris' }, { name: 'Tokyo' }, { name: 'Lyon' }] } as AxiosResponse<Array<RaceModel>>;
    vi.spyOn(axios, 'get').mockResolvedValue(response);

    const raceService = useRaceService();
    const races = await raceService.list();

    // It should get the pending races from the API
    expect(axios.get).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/races', { params: { status: 'PENDING' } });
    // It should return three races for the `list()` function
    expect(races).toHaveLength(3);
  });

  test('should get a race', async () => {
    const response = { data: { name: 'Paris' } } as AxiosResponse<RaceModel>;
    vi.spyOn(axios, 'get').mockResolvedValue(response);
    const raceId = 1;

    const raceService = useRaceService();
    const raceModel = await raceService.get(raceId);

    // It should get the race from the API
    expect(axios.get).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/races/1');
    // It should return the race for the `get()` function
    expect(raceModel).toBe(response.data);
  });

  test('should bet on a race', async () => {
    const response = { data: { name: 'Paris' } } as AxiosResponse<RaceModel>;
    vi.spyOn(axios, 'post').mockResolvedValue(response);
    const raceId = 1;
    const ponyId = 2;

    const raceService = useRaceService();
    const raceModel = await raceService.bet(raceId, ponyId);

    // It should post the bet
    expect(axios.post).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/races/1/bets', { ponyId });
    // It should return the race for the `bet()` function
    expect(raceModel).toBe(response.data);
  });

  test('should cancel a bet on a race', async () => {
    vi.spyOn(axios, 'delete').mockResolvedValue({} as AxiosResponse);
    const raceId = 1;

    const raceService = useRaceService();
    await raceService.cancelBet(raceId);

    // It should delete the bet
    expect(axios.delete).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/races/1/bets');
  });
});
