import axios, { InternalAxiosRequestConfig } from 'axios';
import UserModel, { ScoreHistoryModel } from '@/models/UserModel';
import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';
import { Connection, useWsService } from './WsService';

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

axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (userModel.value) {
    config.headers!.Authorization = `Bearer ${userModel.value.token}`;
  }

  return config;
});
let connection: Connection | null = null;

watchEffect(() => {
  if (connection?.disconnect) {
    connection.disconnect();
  }

  if (userModel.value) {
    const wsService = useWsService();
    connection = wsService.connect<UserModel>(`/player/${userModel.value.id}`, (userWithScore: UserModel) => {
      userModel.value!.money = userWithScore.money;
    });
  }
});
export const useUserStore = defineStore('user', () => {
  return {
    async register(user: UserModel): Promise<UserModel> {
      const response = await axios.post<UserModel>('https://ponyracer.ninja-squad.com/api/users', user);
      storeLoggedInUser(response.data);
      return response.data;
    },
    async getScoreHistory(): Promise<Array<ScoreHistoryModel>> {
      const response = await axios.get<Array<ScoreHistoryModel>>('https://ponyracer.ninja-squad.com/api/money/history');
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
