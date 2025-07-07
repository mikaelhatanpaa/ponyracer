interface UserModel {
  id?: string;
  login: string;
  password: string;
  birthYear: number;
  money?: string;
  token?: string;
}

export interface ScoreHistoryModel {
  instant: string;
  money: number;
}

export default UserModel;
