import { PonyModel, PonyModelWithPositionModel } from './PonyModel';

export interface RaceModel {
  id: number | string;
  name: string;
  ponies: Array<PonyModel>;
  startInstant: string;
  betPonyId?: number | null;
  status: 'PENDING' | 'RUNNING' | 'FINISHED';
}

export interface LiveRaceModel {
  ponies: Array<PonyModelWithPositionModel>;
  status: 'PENDING' | 'RUNNING' | 'FINISHED';
}
