interface UserModel {
  id?: string;
  login: string;
  password: string;
  birthYear: number;
  money?: string;
  token?: string;
}

export default UserModel;
