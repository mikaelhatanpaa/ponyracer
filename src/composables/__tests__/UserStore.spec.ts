import { beforeEach, describe, expect, test, vi } from 'vitest';
import axios, { AxiosInterceptorManager, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { setActivePinia } from 'pinia';
import { createVitestPinia } from '@/__tests__/pinia';
import { retrieveUser, useUserStore } from '@/composables/UserStore';
import { UserModel } from '@/models/UserModel';

const userModel: UserModel = {
  birthYear: 1986,
  login: 'cedric',
  password: '',
  money: 1000
};

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createVitestPinia({ stubActions: false }));
  });

  test('should register a user', async () => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(axios, 'post').mockResolvedValue({ data: userModel } as AxiosResponse<UserModel>);

    const formValues = {
      login: 'cedric',
      password: 'password',
      birthYear: 1986
    };

    const userStore = useUserStore();
    const userReceived = await userStore.register(formValues);

    // It should post the user to the API
    expect(axios.post).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/users', formValues);
    // It should return a user for the `register` function
    expect(userReceived).toStrictEqual(userModel);
    // It should store the user with the `storeLoggedInUser` function
    expect(userStore.userModel).toStrictEqual(userModel);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('rememberMe', JSON.stringify(userModel));
  });

  test('should authenticate a user and store the user returned', async () => {
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(axios, 'post').mockResolvedValue({ data: userModel } as AxiosResponse<UserModel>);

    const formValues = {
      login: 'cedric',
      password: 'password'
    };

    const userStore = useUserStore();
    const userReceived = await userStore.authenticate(formValues);

    // It should post the user to the API
    expect(axios.post).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/users/authentication', formValues);
    // It should return a user for the `authenticate` function
    expect(userReceived).toStrictEqual(userModel);
    // It should store the user with the `storeLoggedInUser` function
    expect(userStore.userModel).toStrictEqual(userModel);
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('rememberMe', JSON.stringify(userModel));
  });

  test('should retrieve a user if one is stored', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(userModel));

    const userRetrieved = retrieveUser();

    expect(Storage.prototype.getItem).toHaveBeenCalledWith('rememberMe');
    expect(userRetrieved).toStrictEqual(userModel);
  });

  test('should retrieve no user if none stored', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

    const userRetrieved = retrieveUser();

    expect(Storage.prototype.getItem).toHaveBeenCalledWith('rememberMe');
    expect(userRetrieved).toBeNull();
  });

  test('should logout the user', () => {
    vi.spyOn(Storage.prototype, 'removeItem');
    const userStore = useUserStore();
    userStore.userModel = userModel;

    userStore.logoutAndForget();

    expect(userStore.userModel).toBeNull();
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith('rememberMe');
  });

  test('should register an axios interceptor to handle the Authorization header', () => {
    const userStore = useUserStore();
    type RequestInterceptor = AxiosInterceptorManager<InternalAxiosRequestConfig> & {
      handlers: Array<{ fulfilled: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>;
    };
    const interceptors = axios.interceptors.request as RequestInterceptor;

    // You must register an interceptor in the constructor with `axios.interceptors.request.use()`
    expect(interceptors.handlers).toHaveLength(1);

    const interceptor = interceptors.handlers[0];
    const config = { headers: {} } as InternalAxiosRequestConfig;

    userStore.userModel = null;

    // The interceptor should not add an `Authorization` header if there is no user logged in
    expect(interceptor.fulfilled(config).headers).toStrictEqual({});

    userStore.userModel = userModel;

    // The interceptor should add an `Authorization` header with the value `Bearer ${token}`
    expect(interceptor.fulfilled(config).headers).toStrictEqual({ Authorization: `Bearer ${userModel.token}` });
  });
});
