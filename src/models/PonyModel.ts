export interface PonyModel {
  id: number | string;
  name: string;
  color: string;
}

export interface PonyModelWithPositionModel extends PonyModel {
  position: number;
}
