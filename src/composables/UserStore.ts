import axios from 'axios';
import UserModel from '@/models/UserModel';
import { ref } from 'vue';
import { defineStore } from 'pinia';

export function retrieveUser(): UserModel | null {
  const localStorage = window.localStorage;
  const user = localStorage.getItem('rememberMe');
  return user ? JSON.parse(user) : null;
}

function storeLoggedInUser(user: UserModel) {
  userModel.value = user;
  const localStorage = window.localStorage;
  const userToStore = JSON.stringify(userModel.value);
  localStorage.setItem('rememberMe', userToStore);
}

export const userModel = ref<UserModel | null>(retrieveUser());

export const useUserStore = defineStore('user', () => {
  return {
    async register(user: UserModel): Promise<UserModel> {
      const response = await axios.post<UserModel>('https://ponyracer.ninja-squad.com/api/users', user);
      storeLoggedInUser(response.data);
      return response.data;
    },

    async authenticate(credentials: { login: string; password: string }): Promise<UserModel> {
      const response = await axios.post('https://ponyracer.ninja-squad.com/api/users/authentication', credentials);
      userModel.value = response.data;
      storeLoggedInUser(response.data);
      return response.data;
    },
    userModel,
    logoutAndForget() {
      userModel.value = null;
      window.localStorage.removeItem('rememberMe');
    }
  };
});
