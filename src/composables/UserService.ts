import axios from 'axios';
import UserModel from '@/models/UserModel';
import { ref } from 'vue';

export const userModel = ref<UserModel | null>(null);

export function useUserService() {
  return {
    async register(user: UserModel): Promise<UserModel> {
      const response = await axios.post<UserModel>('https://ponyracer.ninja-squad.com/api/users', user);
      return response.data;
    },

    async authenticate(credentials: { login: string; password: string }): Promise<UserModel> {
      const response = await axios.post('https://ponyracer.ninja-squad.com/api/users/authentication', credentials);
      userModel.value = response.data;
      return response.data;
    },
    userModel
  };
}
