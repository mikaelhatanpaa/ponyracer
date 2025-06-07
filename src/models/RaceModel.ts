import PonyModel from './PonyModel';

export default interface RaceModel {
  id: number | string;
  name: string;
  ponies: Array<PonyModel>;
  startInstant: string;
}
