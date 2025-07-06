import { PonyModel } from './PonyModel';

export interface RaceModel {
  id: number | string;
  name: string;
  ponies: Array<PonyModel>;
  startInstant: string;
  betPonyId?: number | null;
}
