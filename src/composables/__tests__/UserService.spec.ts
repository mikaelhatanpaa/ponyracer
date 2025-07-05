import { describe, expect, test, vi } from 'vitest';
import axios, { AxiosResponse } from 'axios';
import { useUserService } from '@/composables/UserService';
import { UserModel } from '@/models/UserModel';

const userModel: UserModel = {
  birthYear: 1986,
  login: 'cedric',
  password: '',
  money: 1000
};

describe('useUserService', () => {
  test('should register a user', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: userModel } as AxiosResponse<UserModel>);

    const formValues = {
      login: 'cedric',
      password: 'password',
      birthYear: 1986
    };

    const userService = useUserService();
    const userReceived = await userService.register(formValues);

    // It should post the user to the API
    expect(axios.post).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/users', formValues);
    // It should return a user for the `register` function
    expect(userReceived).toStrictEqual(userModel);
  });

  test('should authenticate a user and store the user returned', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: userModel } as AxiosResponse<UserModel>);

    const formValues = {
      login: 'cedric',
      password: 'password'
    };

    const userService = useUserService();
    const userReceived = await userService.authenticate(formValues);

    // It should post the user to the API
    expect(axios.post).toHaveBeenCalledWith('https://ponyracer.ninja-squad.com/api/users/authentication', formValues);
    // It should return a user for the `authenticate` function
    expect(userReceived).toStrictEqual(userModel);
    // It should store the user in the `userModel` property
    expect(userService.userModel.value).toStrictEqual(userModel);
  });
});
