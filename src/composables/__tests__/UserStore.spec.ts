import { beforeEach, describe, expect, test, vi } from 'vitest';
import { nextTick } from 'vue';
import axios, { AxiosInterceptorManager, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { setActivePinia } from 'pinia';
import { createVitestPinia } from '@/__tests__/pinia';
import { retrieveUser, useUserStore } from '@/composables/UserStore';
import { UserModel } from '@/models/UserModel';

const mockWsService = {
  connect: vi.fn()
};
vi.mock('@/composables/WsService', () => ({
  useWsService: () => mockWsService
}));

const userModel: UserModel = {
  id: 1,
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

  test('should get the score updates', async () => {
    const connection = { disconnect: vi.fn() };
    mockWsService.connect.mockReturnValue(connection);

    const userStore = useUserStore();

    // It should not have called the WS service right away
    expect(mockWsService.connect).not.toHaveBeenCalled();

    userStore.userModel = { ...userModel, id: 2 };
    await nextTick();

    // It should have called the WS service when the userModel changes
    expect(mockWsService.connect).toHaveBeenCalledTimes(1);
    expect(mockWsService.connect).toHaveBeenCalledWith('/player/2', expect.any(Function));

    const wsCallback = mockWsService.connect.mock.calls[0][1];
    wsCallback({ money: 300 } as UserModel);

    // It should update the score when a message is received
    expect(userStore.userModel.money).toBe(300);

    userStore.userModel = null;
    await nextTick();

    // When the user logs out, the disconnect function should have been called
    expect(connection.disconnect).toHaveBeenCalled();
    expect(mockWsService.connect).toHaveBeenCalledTimes(1);

    userStore.userModel = { ...userModel, id: 3 };
    await nextTick();

    // It should have called the WS service when the userModel changes
    expect(mockWsService.connect).toHaveBeenCalledTimes(2);
    expect(mockWsService.connect).toHaveBeenCalledWith('/player/3', expect.any(Function));
  });
});
